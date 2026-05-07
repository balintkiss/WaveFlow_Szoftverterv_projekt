import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import CoverImage from "./ui/CoverImage";
import {
  Heart,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { cn } from "../lib/utils";
import type { Track } from "../types";
import { Button } from "./ui/button";

type PlayerProps = {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (pct: number) => void;
  onVolumeChange: (value: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleFavorite: () => void;
  onShowPlaylist: () => void;
};

function formatTime(sec: number) {
  if (!Number.isFinite(sec)) {
    return "0:00";
  }

  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function getPointerPercent(event: MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const raw = (event.clientX - rect.left) / rect.width;
  return Math.max(0, Math.min(1, raw));
}

export default function Player({
  currentTrack,
  isPlaying,
  progress,
  currentTime,
  duration,
  volume,
  isMuted,
  isShuffle,
  isRepeat,
  isFavorite,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite,
  onShowPlaylist,
}: PlayerProps) {
  const titleWrapRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const volumeTimerRef = useRef<number | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showVolumeHint, setShowVolumeHint] = useState(false);
  const volumePercent = Math.round((isMuted ? 0 : volume) * 100);

  function flashVolumeHint() {
    setShowVolumeHint(true);

    if (volumeTimerRef.current) {
      window.clearTimeout(volumeTimerRef.current);
    }

    volumeTimerRef.current = window.setTimeout(() => {
      setShowVolumeHint(false);
      volumeTimerRef.current = null;
    }, 1100);
  }

  function handleToggleMute() {
    onToggleMute();
    flashVolumeHint();
  }

  function handleVolumeChange(value: number) {
    onVolumeChange(value);
    flashVolumeHint();
  }

  useEffect(() => {
    const probe = probeRef.current;
    const wrap = titleWrapRef.current;
    if (!probe || !wrap) return;
    setIsOverflowing(probe.getBoundingClientRect().width > wrap.clientWidth + 1);
  }, [currentTrack?.title]);

  useEffect(() => {
    return () => {
      if (volumeTimerRef.current) {
        window.clearTimeout(volumeTimerRef.current);
      }
    };
  }, []);

  return (
    <footer className="wave-player flex h-full min-h-0 max-w-full flex-col overflow-hidden bg-black text-white md:grid md:grid-cols-[minmax(0,1fr)_minmax(300px,1.65fr)_minmax(170px,1fr)] md:items-center md:gap-3 md:px-4 md:py-2">

      {/* Mobile progress bar — thin strip at the very top of the player */}
      <button
        aria-label="Lejátszás pozíció"
        className="wave-player-progress group w-full md:hidden"
        type="button"
        onClick={(event) => onSeek(getPointerPercent(event))}
      >
        <span className="block h-[3px] w-full bg-white/10">
          <span
            className="block h-full bg-primary transition-[width]"
            style={{ width: `${progress * 100}%` }}
          />
        </span>
      </button>

      <div className="wave-player-time flex items-center justify-between px-3 pt-1 text-[11px] font-semibold tabular-nums text-zinc-500 md:hidden">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Desktop left col / Mobile row 1: album art + title/artist + heart */}
      <div className="wave-player-info flex min-w-0 items-center gap-3 px-3 pb-1 pt-1 md:min-w-0 md:px-0 md:py-0">
        <div
          className="wave-player-cover flex size-11 shrink-0 items-center justify-center overflow-hidden rounded bg-zinc-800 ring-2 ring-white/20 md:size-14"
          style={{ backgroundColor: currentTrack?.cover ? undefined : currentTrack?.color }}
        >
          <CoverImage
            src={currentTrack?.cover}
            alt={`${currentTrack?.title ?? ""} borító`}
            fallback={<Music2 className="size-5 text-zinc-500 md:size-6" />}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1">
            <div ref={titleWrapRef} className="relative min-w-0 shrink overflow-hidden md:hidden">
              <span
                ref={probeRef}
                aria-hidden="true"
                className="pointer-events-none absolute whitespace-nowrap text-sm font-semibold opacity-0"
              >
                {currentTrack?.title ?? "Válassz egy zenét"}
              </span>
              {isOverflowing ? (
                <div className="marquee-track">
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {currentTrack?.title ?? "Válassz egy zenét"}
                  </span>
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {currentTrack?.title ?? "Válassz egy zenét"}
                  </span>
                </div>
              ) : (
                <p className="truncate text-sm font-semibold">
                  {currentTrack?.title ?? "Válassz egy zenét"}
                </p>
              )}
            </div>
            {/* Desktop: title + heart inline */}
            <p className="hidden min-w-0 shrink truncate text-sm font-semibold md:block">
              {currentTrack?.title ?? "Válassz egy zenét"}
            </p>
            <Button
              aria-label={isFavorite ? "Eltávolítás a kedvencekből" : "Hozzáadás a kedvencekhez"}
              className={cn(
                "hidden size-6 shrink-0 rounded-full text-zinc-500 hover:text-white md:inline-flex",
                isFavorite && "text-primary hover:text-primary",
              )}
              disabled={!currentTrack}
              size="icon"
              type="button"
              variant="ghost"
              onClick={onToggleFavorite}
            >
              <Heart className={cn("size-3.5", isFavorite && "fill-primary")} />
            </Button>
          </div>
          <p className="truncate text-xs text-zinc-500">
            {currentTrack?.artist ?? "WaveFlow"}
          </p>
        </div>

        {/* Mobile only: heart at end of row 1 */}
        <Button
          aria-label={isFavorite ? "Eltávolítás a kedvencekből" : "Hozzáadás a kedvencekhez"}
          className={cn(
            "shrink-0 rounded-full text-zinc-500 hover:text-white md:hidden",
            isFavorite && "text-primary hover:text-primary",
          )}
          disabled={!currentTrack}
          size="icon"
          type="button"
          variant="ghost"
          onClick={onToggleFavorite}
        >
          <Heart className={cn("size-4", isFavorite && "fill-primary")} />
        </Button>
      </div>

      {/* Mobile row 2: all 5 controls centered */}
      <div className="wave-player-controls flex items-center justify-center gap-1 pb-2 md:hidden">
        <Button
          aria-label="Keverés"
          className={cn(
            "rounded-full text-zinc-400 hover:text-white",
            isShuffle && "text-primary hover:text-primary",
          )}
          size="icon"
          type="button"
          variant="ghost"
          onClick={onToggleShuffle}
        >
          <Shuffle className="size-4" />
        </Button>
        <Button
          aria-label="Előző"
          className="rounded-full text-zinc-300 hover:text-white"
          size="icon"
          type="button"
          variant="ghost"
          onClick={onPrev}
        >
          <SkipBack className="size-5" />
        </Button>
        <Button
          aria-label={isPlaying ? "Szünet" : "Lejátszás"}
          className="size-10 rounded-full bg-white text-black hover:scale-105 hover:bg-white"
          size="icon"
          type="button"
          onClick={onTogglePlay}
        >
          {isPlaying ? (
            <Pause className="size-5 fill-black" />
          ) : (
            <Play className="ml-0.5 size-5 fill-black" />
          )}
        </Button>
        <Button
          aria-label="Következő"
          className="rounded-full text-zinc-300 hover:text-white"
          size="icon"
          type="button"
          variant="ghost"
          onClick={onNext}
        >
          <SkipForward className="size-5" />
        </Button>
        <Button
          aria-label="Ismétlés"
          className={cn(
            "rounded-full text-zinc-400 hover:text-white",
            isRepeat && "text-primary hover:text-primary",
          )}
          size="icon"
          type="button"
          variant="ghost"
          onClick={onToggleRepeat}
        >
          <Repeat2 className="size-4" />
        </Button>
      </div>

      {/* Desktop center: full controls + seekbar */}
      <div className="hidden min-w-0 flex-col items-center gap-2 md:flex">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <Button
            aria-label="Keverés"
            className={cn(
              "rounded-full text-zinc-400 hover:text-white",
              isShuffle && "text-primary hover:text-primary",
            )}
            size="icon"
            type="button"
            variant="ghost"
            onClick={onToggleShuffle}
          >
            <Shuffle className="size-4" />
          </Button>

          <Button
            aria-label="Előző"
            className="rounded-full text-zinc-300 hover:text-white"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onPrev}
          >
            <SkipBack className="size-5" />
          </Button>

          <Button
            aria-label={isPlaying ? "Szünet" : "Lejátszás"}
            className="size-10 rounded-full bg-white text-black hover:scale-105 hover:bg-white"
            size="icon"
            type="button"
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause className="size-5 fill-black" />
            ) : (
              <Play className="ml-0.5 size-5 fill-black" />
            )}
          </Button>

          <Button
            aria-label="Következő"
            className="rounded-full text-zinc-300 hover:text-white"
            size="icon"
            type="button"
            variant="ghost"
            onClick={onNext}
          >
            <SkipForward className="size-5" />
          </Button>

          <Button
            aria-label="Ismétlés"
            className={cn(
              "rounded-full text-zinc-400 hover:text-white",
              isRepeat && "text-primary hover:text-primary",
            )}
            size="icon"
            type="button"
            variant="ghost"
            onClick={onToggleRepeat}
          >
            <Repeat2 className="size-4" />
          </Button>
        </div>

        <div className="flex w-full max-w-2xl items-center gap-2">
          <span className="w-10 text-right text-[11px] text-zinc-500">
            {formatTime(currentTime)}
          </span>
          <button
            aria-label="Lejátszás pozíció"
            className="group h-4 flex-1 py-[6px]"
            type="button"
            onClick={(event) => onSeek(getPointerPercent(event))}
          >
            <span className="block h-1 overflow-hidden rounded-full bg-white/15">
              <span
                className="block h-full rounded-full bg-white transition-[width] group-hover:bg-primary"
                style={{ width: `${progress * 100}%` }}
              />
            </span>
          </button>
          <span className="w-10 text-[11px] text-zinc-500">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Desktop right: playlist + volume */}
      <div className="hidden min-w-0 items-center justify-end gap-2 md:flex">
        <button
          aria-label="Lejátszási lista megjelenítése"
          className="rounded-full text-zinc-400 transition hover:text-white"
          type="button"
          onClick={onShowPlaylist}
        >
          <ListMusic className="size-4" />
        </button>
        <button
          aria-label={isMuted ? "Hang visszakapcsolása" : "Némítás"}
          className="rounded-full text-zinc-400 transition hover:text-white"
          type="button"
          onClick={handleToggleMute}
        >
          {isMuted ? (
            <VolumeX className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>
        <div className="relative flex items-center">
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#2a2a2a]/95 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl transition duration-200 ${
              showVolumeHint
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            }`}
          >
            {volumePercent}%
          </div>
          <input
            aria-label="Hangerő"
            className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-[linear-gradient(to_right,#1ed760_var(--volume),rgba(255,255,255,0.18)_var(--volume))] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            max="1"
            min="0"
            step="0.01"
            style={{ "--volume": `${volumePercent}%` } as CSSProperties}
            type="range"
            value={isMuted ? 0 : volume}
            onChange={(event) => handleVolumeChange(Number(event.target.value))}
            onPointerDown={flashVolumeHint}
            onKeyDown={flashVolumeHint}
          />
        </div>
      </div>
    </footer>
  );
}
