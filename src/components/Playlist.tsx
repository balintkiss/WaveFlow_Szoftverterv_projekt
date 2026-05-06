import { Clock3, Heart, Music2, Plus } from "lucide-react";
import CoverImage from "./ui/CoverImage";

import { cn } from "../lib/utils";
import type { Track } from "../types";
import { Button } from "./ui/button";

type PlaylistProps = {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  favoriteIds: number[];
  isAdmin: boolean;
  onSelect: (index: number) => void;
  onAddTrack: () => void;
  onToggleFavorite: (trackId: number) => void;
};

function ActiveBars() {
  return (
    <div className="flex h-5 w-5 items-end justify-center gap-[2px] text-primary">
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className="eq-bar w-[3px] rounded-full bg-primary"
          style={{ animationDelay: `${bar * 0.12}s` }}
        />
      ))}
    </div>
  );
}

export default function Playlist({
  tracks,
  currentIndex,
  isPlaying,
  favoriteIds,
  isAdmin,
  onSelect,
  onAddTrack,
  onToggleFavorite,
}: PlaylistProps) {
  return (
    <section className="flex h-full min-h-0 flex-col px-4 pb-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Lejátszási lista
          </p>
          <h2 className="mt-1 text-xl font-bold text-white">Könyvtárad</h2>
        </div>

        {isAdmin && (
          <Button
            className="rounded-full bg-white text-black hover:bg-zinc-200"
            size="sm"
            type="button"
            onClick={onAddTrack}
          >
            <Plus className="size-4" />
            Hozzáadás
          </Button>
        )}
      </div>

      <div className="hidden grid-cols-[48px_minmax(0,1.4fr)_minmax(120px,0.8fr)_64px_72px] items-center border-b border-white/10 px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-500 md:grid">
        <span>#</span>
        <span>Cím</span>
        <span>Műfaj</span>
        <Heart className="mx-auto size-4" />
        <Clock3 className="ml-auto size-4" />
      </div>

      <ul className="spotify-scrollbar min-h-0 flex-1 overflow-y-auto py-2">
        {tracks.map((track, index) => {
          const active = index === currentIndex;
          const favorite = favoriteIds.includes(track.id);

          return (
            <li key={track.id}>
              <button
                className={cn(
                  "grid w-full grid-cols-[38px_minmax(0,1fr)_44px_auto] items-center gap-3 rounded-md px-2 py-2 text-left transition md:grid-cols-[48px_minmax(0,1.4fr)_minmax(120px,0.8fr)_64px_72px] md:px-3",
                  active
                    ? "bg-white/10 text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white",
                )}
                type="button"
                onClick={() => onSelect(index)}
              >
                <span
                  className={cn(
                    "flex items-center justify-center text-sm text-zinc-500",
                    active && "text-primary",
                  )}
                >
                  {active && isPlaying ? <ActiveBars /> : index + 1}
                </span>

                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-800"
                    style={{ backgroundColor: track.cover ? undefined : track.color }}
                  >
                    <CoverImage
                      src={track.cover}
                      alt={`${track.title} borító`}
                      fallback={<Music2 className="size-5 text-zinc-500" />}
                    />
                  </span>

                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block truncate text-sm font-semibold",
                        active && "text-primary",
                      )}
                    >
                      {track.title}
                    </span>
                    <span className="block truncate text-xs text-zinc-500">
                      {track.artist}
                    </span>
                  </span>
                </span>

                <span className="hidden truncate text-sm text-zinc-500 md:block">
                  {track.genre || "Saját"}
                </span>

                <span className="flex justify-center">
                  <span
                    aria-label={
                      favorite
                        ? "Eltávolítás a kedvencekből"
                        : "Hozzáadás a kedvencekhez"
                    }
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/10 hover:text-white",
                      favorite && "text-primary hover:text-primary",
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleFavorite(track.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onToggleFavorite(track.id);
                      }
                    }}
                  >
                    <Heart className={cn("size-4", favorite && "fill-primary")} />
                  </span>
                </span>

                <span className="justify-self-end text-xs text-zinc-500">
                  {active && isPlaying ? "Most" : "Zene"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
