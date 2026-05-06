import type { CSSProperties } from "react";
import { Disc3, Music2 } from "lucide-react";

import { cn } from "../lib/utils";
import type { Track } from "../types";
import CoverImage from "./ui/CoverImage";

type HeroArtProps = {
  track: Track | null;
  isPlaying: boolean;
  className?: string;
};

export default function HeroArt({ track, isPlaying, className }: HeroArtProps) {
  return (
    <div
      className={cn(
        "relative aspect-square w-44 shrink-0 sm:w-52 lg:w-60",
        className,
      )}
      style={{ "--cover-color": track?.color ?? "#1ed760" } as CSSProperties}
    >
      <div
        className={cn(
          "absolute -right-7 bottom-7 hidden aspect-square w-32 rounded-full border border-white/10 bg-black shadow-2xl sm:block",
          isPlaying && "animate-spin",
        )}
        style={{ animationDuration: "8s" }}
      >
        <div className="absolute inset-3 rounded-full border border-white/10 bg-[conic-gradient(from_0deg,#151515,#2a2a2a,#111,#333,#151515)]" />
        <div className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-zinc-950 text-zinc-500">
          <Disc3 className="size-4" />
        </div>
      </div>

      <div className="relative z-10 h-full overflow-hidden rounded-lg bg-[var(--cover-color)] shadow-[0_22px_70px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
        <CoverImage
          src={track?.cover}
          alt={`${track?.title ?? ""} borító`}
          fallback={
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-zinc-500">
              <Music2 className="size-14" />
            </div>
          }
        />
      </div>
    </div>
  );
}
