import { useCallback, useEffect, useRef, useState } from "react";

import type { Track } from "../types";

export function useAudioPlayer(tracks: Track[]) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayOnTrackChangeRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [lastVolume, setLastVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const currentTrack = tracks[currentIndex] ?? null;

  const getAudio = useCallback(() => {
    if (!audioRef.current && typeof Audio !== "undefined") {
      audioRef.current = new Audio();
    }

    return audioRef.current;
  }, []);

  useEffect(() => {
    if (tracks.length > 0 && currentIndex >= tracks.length) {
      setCurrentIndex(tracks.length - 1);
    }
  }, [currentIndex, tracks.length]);

  const goToTrack = useCallback(
    (index: number, options?: { autoplay?: boolean }) => {
      if (index < 0 || index >= tracks.length) {
        return;
      }

      const shouldAutoplay = options?.autoplay ?? isPlaying;
      setCurrentIndex(index);

      if (shouldAutoplay) {
        autoplayOnTrackChangeRef.current = true;
        setIsPlaying(true);
      }
    },
    [isPlaying, tracks.length],
  );

  const playTrack = useCallback(
    (index: number) => {
      const track = tracks[index];

      if (!track?.mp3) {
        return;
      }

      const audio = getAudio();

      if (!audio) {
        return;
      }

      setCurrentIndex(index);

      if (audio.getAttribute("src") !== track.mp3) {
        audio.setAttribute("src", track.mp3);
        audio.load();
        setProgress(0);
        setCurrentTime(0);
        setDuration(0);
      }

      audio.play().catch(console.error);
    },
    [getAudio, tracks],
  );

  const next = useCallback((options?: { autoplay?: boolean }) => {
    if (tracks.length === 0) {
      return;
    }

    let nextIndex = (currentIndex + 1) % tracks.length;

    if (isShuffle && tracks.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex);
    }

    goToTrack(nextIndex, options);
  }, [currentIndex, goToTrack, isShuffle, tracks.length]);

  const prev = useCallback(() => {
    if (tracks.length === 0) {
      return;
    }

    if (currentTime > 3) {
      const audio = getAudio();

      if (audio) {
        audio.currentTime = 0;
      }
      return;
    }

    goToTrack((currentIndex - 1 + tracks.length) % tracks.length);
  }, [currentIndex, currentTime, getAudio, goToTrack, tracks.length]);

  useEffect(() => {
    const audio = getAudio();

    if (!audio) {
      return;
    }

    const onTimeUpdate = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setCurrentTime(audio.currentTime);
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
        return;
      }

      next({ autoplay: true });
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [getAudio, isRepeat, next]);

  useEffect(() => {
    const audio = getAudio();

    if (!audio) {
      return;
    }

    if (!currentTrack?.mp3) {
      audio.pause();
      audio.removeAttribute("src");
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    if (audio.getAttribute("src") !== currentTrack.mp3) {
      audio.setAttribute("src", currentTrack.mp3);
      audio.load();
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    }

    if (autoplayOnTrackChangeRef.current) {
      autoplayOnTrackChangeRef.current = false;
      audio.play().catch(console.error);
    }
  }, [currentTrack?.mp3, getAudio]);

  useEffect(() => {
    const audio = getAudio();

    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [getAudio, isMuted, volume]);

  const togglePlay = useCallback(() => {
    const audio = getAudio();

    if (!audio || !currentTrack?.mp3) {
      return;
    }

    if (audio.paused) {
      audio.play().catch(console.error);
      return;
    }

    audio.pause();
  }, [currentTrack?.mp3, getAudio]);

  const seek = useCallback((pct: number) => {
    const audio = getAudio();
    const nextPosition = Math.max(0, Math.min(1, pct));

    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = nextPosition * audio.duration;
    }
  }, [getAudio]);

  const setVolume = useCallback((val: number) => {
    const nextVolume = Math.max(0, Math.min(1, val));
    setVolumeState(nextVolume);

    if (nextVolume > 0) {
      setLastVolume(nextVolume);
      setIsMuted(false);
    } else {
      setIsMuted(true);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      if (muted) {
        setVolumeState((currentVolume) => currentVolume || lastVolume || 0.75);
        return false;
      }

      if (volume > 0) {
        setLastVolume(volume);
      }

      return true;
    });
  }, [lastVolume, volume]);

  return {
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    next,
    prev,
    seek,
    goToTrack,
    playTrack,
    setVolume,
    toggleMute,
    toggleShuffle: () => setIsShuffle((state) => !state),
    toggleRepeat: () => setIsRepeat((state) => !state),
  };
}
