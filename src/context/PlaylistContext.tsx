import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import initialTracks from "../data/tracks";
import type { NewTrackInput, Track } from "../types";

type PlaylistContextValue = {
  tracks: Track[];
  loading: boolean;
  addTrack: (track: NewTrackInput) => Promise<void>;
  removeTrack: (id: number) => Promise<void>;
  updateTrack: (id: number, changes: Partial<Track>) => void;
};

const PlaylistContext = createContext<PlaylistContextValue | undefined>(
  undefined,
);

function dbRowToTrack(row: Record<string, unknown>): Track {
  return {
    id: row.id as number,
    title: (row.title as string) || "Ismeretlen cím",
    artist: (row.artist as string) || "Ismeretlen előadó",
    genre: (row.genre as string) || "Egyéb",
    mp3: (row.mp3_url as string | null) ?? null,
    cover: (row.cover_url as string | null) ?? null,
    color: (row.color as string) || "#1ed760",
    durationSeconds:
      typeof row.duration_seconds === "number"
        ? row.duration_seconds
        : undefined,
    isCustom: true,
  };
}

function getStoragePathFromPublicUrl(url: string | null | undefined, bucket: string) {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = parsedUrl.pathname.indexOf(marker);

    if (markerIndex < 0) {
      return null;
    }

    return decodeURIComponent(
      parsedUrl.pathname.slice(markerIndex + marker.length),
    );
  } catch {
    return null;
  }
}

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTracks() {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error || !data || data.length === 0) {
        // Fallback to local tracks if Supabase has none or errors
        setTracks(initialTracks);
      } else {
        setTracks(data.map(dbRowToTrack));
      }
      setLoading(false);
    }

    loadTracks();
  }, []);

  async function addTrack(newTrack: NewTrackInput) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    let mp3Url: string | null = null;
    let coverUrl: string | null = null;

    // Upload MP3
    if (newTrack.mp3File instanceof File) {
      const ext = newTrack.mp3File.name.split(".").pop();
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("tracks")
        .upload(path, newTrack.mp3File);
      if (!error) {
        const { data } = supabase.storage.from("tracks").getPublicUrl(path);
        mp3Url = data.publicUrl;
      }
    } else if (typeof newTrack.mp3 === "string") {
      mp3Url = newTrack.mp3;
    }

    // Upload cover
    if (newTrack.coverFile instanceof File) {
      const ext = newTrack.coverFile.name.split(".").pop();
      const path = `${session.user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("covers")
        .upload(path, newTrack.coverFile);
      if (!error) {
        const { data } = supabase.storage.from("covers").getPublicUrl(path);
        coverUrl = data.publicUrl;
      }
    } else if (typeof newTrack.cover === "string") {
      coverUrl = newTrack.cover;
    }

    const insertPayload: Record<string, unknown> = {
      user_id: session.user.id,
      title: newTrack.title?.trim() || "Ismeretlen cím",
      artist: newTrack.artist?.trim() || "Ismeretlen előadó",
      genre: newTrack.genre?.trim() || "Egyéb",
      mp3_url: mp3Url,
      cover_url: coverUrl,
      color: newTrack.color || "#1ed760",
    };

    if (
      typeof newTrack.durationSeconds === "number" &&
      Number.isFinite(newTrack.durationSeconds) &&
      newTrack.durationSeconds > 0
    ) {
      insertPayload.duration_seconds = Math.round(newTrack.durationSeconds);
    }

    let result = await supabase
      .from("tracks")
      .insert(insertPayload)
      .select()
      .single();

    if (
      result.error &&
      "duration_seconds" in insertPayload &&
      result.error.message.toLowerCase().includes("duration_seconds")
    ) {
      delete insertPayload.duration_seconds;
      result = await supabase
        .from("tracks")
        .insert(insertPayload)
        .select()
        .single();
    }

    if (!result.error && result.data) {
      setTracks((prev) => [...prev, dbRowToTrack(result.data)]);
    }
  }

  async function removeTrack(id: number) {
    const track = tracks.find((item) => item.id === id);
    const mp3Path = getStoragePathFromPublicUrl(track?.mp3, "tracks");
    const coverPath = getStoragePathFromPublicUrl(track?.cover, "covers");

    const { error } = await supabase.from("tracks").delete().eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    if (mp3Path) {
      const { error: storageError } = await supabase.storage
        .from("tracks")
        .remove([mp3Path]);

      if (storageError) {
        console.error(storageError);
      }
    }

    if (coverPath) {
      const { error: storageError } = await supabase.storage
        .from("covers")
        .remove([coverPath]);

      if (storageError) {
        console.error(storageError);
      }
    }

    setTracks((prev) => prev.filter((track) => track.id !== id));
  }

  function updateTrack(id: number, changes: Partial<Track>) {
    setTracks((prev) =>
      prev.map((track) => (track.id === id ? { ...track, ...changes } : track)),
    );
  }

  return (
    <PlaylistContext.Provider
      value={{ tracks, loading, addTrack, removeTrack, updateTrack }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) throw new Error("usePlaylist must be used within PlaylistProvider");
  return context;
}
