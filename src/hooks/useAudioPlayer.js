import { useState, useRef, useEffect, useCallback } from 'react';

export function useAudioPlayer(tracks) {
  const audioRef = useRef(new Audio());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);       // 0-1 között
  const [currentTime, setCurrentTime] = useState(0); // másodpercben
  const [duration, setDuration] = useState(0);        // másodpercben
  const [volume, setVolumeState] = useState(0.75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const currentTrack = tracks[currentIndex] || null;

  // Audio eseménykezelők
  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setCurrentTime(audio.currentTime);
        setProgress(audio.currentTime / audio.duration);
      }
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [isRepeat, isShuffle]);

  // Szám betöltése
  useEffect(() => {
    const audio = audioRef.current;
    if (currentTrack?.mp3) {
      audio.src = currentTrack.mp3;
      audio.load();
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentIndex]);

  // Hangerő beállítása
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  // Play / Pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!currentTrack?.mp3) return;
    if (audio.paused) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  // Ugrás a listában
  const goToTrack = useCallback((index) => {
    const wasPlaying = isPlaying;
    setCurrentIndex(index);
    if (wasPlaying) {
      setTimeout(() => audioRef.current.play().catch(console.error), 100);
    }
  }, [isPlaying]);

  // Következő szám
  const next = useCallback(() => {
    let nextIndex;
    if (isShuffle) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } while (nextIndex === currentIndex && tracks.length > 1);
    } else {
      nextIndex = (currentIndex + 1) % tracks.length;
    }
    goToTrack(nextIndex);
  }, [currentIndex, isShuffle, tracks.length, goToTrack]);

  // Előző szám
  const prev = useCallback(() => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      goToTrack((currentIndex - 1 + tracks.length) % tracks.length);
    }
  }, [currentIndex, currentTime, tracks.length, goToTrack]);

  // Seek (ugrás adott időre)
  const seek = useCallback((pct) => {
    const audio = audioRef.current;
    if (audio.duration) {
      audio.currentTime = pct * audio.duration;
    }
  }, []);

  // Hangerő
  const setVolume = useCallback((val) => {
    setVolumeState(val);
  }, []);

  return {
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isShuffle,
    isRepeat,
    togglePlay,
    next,
    prev,
    seek,
    goToTrack,
    setVolume,
    toggleShuffle: () => setIsShuffle(s => !s),
    toggleRepeat: () => setIsRepeat(r => !r),
  };
}
