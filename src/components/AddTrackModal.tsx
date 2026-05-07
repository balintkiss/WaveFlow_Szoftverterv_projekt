import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { ImagePlus, Mic2, Music2, Upload, X } from "lucide-react";

import type { NewTrackInput } from "../types";
import { Button } from "./ui/button";

type AddTrackModalProps = {
  onAdd: (track: NewTrackInput) => Promise<void>;
  onClose: () => void;
};

export default function AddTrackModal({ onAdd, onClose }: AddTrackModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [genre, setGenre] = useState("");
  const [mediaType, setMediaType] = useState<"song" | "podcast">("song");
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function readAudioFileDuration(file: File) {
    if (typeof Audio === "undefined") {
      return null;
    }

    return new Promise<number | null>((resolve) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);

      function cleanup() {
        URL.revokeObjectURL(url);
        audio.removeAttribute("src");
      }

      audio.preload = "metadata";
      audio.onloadedmetadata = () => {
        const seconds = Number.isFinite(audio.duration)
          ? Math.round(audio.duration)
          : null;
        cleanup();
        resolve(seconds && seconds > 0 ? seconds : null);
      };
      audio.onerror = () => {
        cleanup();
        resolve(null);
      };
      audio.src = url;
    });
  }

  async function handleMp3(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMp3File(file);
    setDurationSeconds(null);
    if (!title) {
      setTitle(file.name.replace(/\.mp3$/i, "").replace(/_/g, " "));
    }
    setDurationSeconds(await readAudioFileDuration(file));
  }

  function handleCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !mp3File) return;
    setLoading(true);
    await onAdd({
      title,
      artist,
      genre: mediaType === "podcast" ? "Podcast" : genre,
      mp3File: mp3File ?? undefined,
      coverFile: coverFile ?? undefined,
      durationSeconds: durationSeconds ?? undefined,
      color: "#1ed760",
    });
    setLoading(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <form
        className="w-full max-w-xl overflow-hidden rounded-lg border border-white/10 bg-[#181818] text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Saját tartalom
            </p>
            <h2 className="mt-1 text-xl font-bold">Új feltöltés</h2>
          </div>

          <Button
            aria-label="Bezárás"
            className="rounded-full text-zinc-400 hover:text-white"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-[140px_minmax(0,1fr)]">
          <label className="group flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-white/20 bg-white/5 text-zinc-400 transition hover:border-primary hover:text-primary">
            {coverPreview ? (
              <img
                className="h-full w-full select-none object-cover"
                src={coverPreview}
                alt="Borító előnézet"
                draggable={false}
                onDragStart={(event) => event.preventDefault()}
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm">
                <ImagePlus className="size-8" />
                Borító
              </span>
            )}
            <input
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handleCover}
            />
          </label>

          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2 rounded-md bg-black/25 p-1">
              <button
                className={`flex h-9 items-center justify-center gap-2 rounded px-3 text-sm font-bold transition ${
                  mediaType === "song"
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
                type="button"
                onClick={() => setMediaType("song")}
              >
                <Music2 className="size-4" />
                Dal
              </button>
              <button
                className={`flex h-9 items-center justify-center gap-2 rounded px-3 text-sm font-bold transition ${
                  mediaType === "podcast"
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
                type="button"
                onClick={() => setMediaType("podcast")}
              >
                <Mic2 className="size-4" />
                Podcast
              </button>
            </div>

            <input
              className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-primary"
              placeholder={mediaType === "podcast" ? "Podcast címe *" : "Dal címe *"}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <input
              className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-primary"
              placeholder={mediaType === "podcast" ? "Készítő" : "Előadó"}
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
            />
            {mediaType === "song" ? (
              <input
                className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-primary"
                placeholder="Műfaj"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
              />
            ) : (
              <div className="flex h-10 items-center rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-400">
                Kategória: Podcast
              </div>
            )}

            <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-white/20 bg-white/5 px-3 text-sm font-semibold text-zinc-300 transition hover:border-primary hover:text-primary">
              {mp3File ? (
                <>
                  <Music2 className="size-4" />
                  MP3 betöltve
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  MP3 fájl kiválasztása *
                </>
              )}
              <input
                accept=".mp3,audio/*"
                className="hidden"
                type="file"
                onChange={handleMp3}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Mégse
          </Button>
          <Button
            className="bg-primary text-black hover:bg-primary/90"
            disabled={!title.trim() || !mp3File || loading}
            type="submit"
          >
            {loading ? "Feltöltés..." : "Hozzáadás"}
          </Button>
        </div>
      </form>
    </div>
  );
}
