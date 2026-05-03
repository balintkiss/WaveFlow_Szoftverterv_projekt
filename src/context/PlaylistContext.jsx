import React, { createContext, useContext, useState, useEffect } from 'react';
import initialTracks from '../data/tracks';

const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
  // Betöltés: localStorage-ból ha van mentett lista, egyébként az alapértelmezett
  const [tracks, setTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('waveflow_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Csak a metaadatokat mentjük, az mp3/cover URL-eket újra kell adni
        return parsed;
      }
    } catch (e) {}
    return initialTracks;
  });

  // Mentés localStorage-ba minden változáskor
  // (mp3 és cover blob URL-eket nem mentünk, csak a metaadatokat)
  useEffect(() => {
    const toSave = tracks.map(t => ({
      ...t,
      mp3: typeof t.mp3 === 'string' && t.mp3.startsWith('blob:') ? null : t.mp3,
      cover: typeof t.cover === 'string' && t.cover.startsWith('blob:') ? null : t.cover,
    }));
    localStorage.setItem('waveflow_tracks', JSON.stringify(toSave));
  }, [tracks]);

  // Új szám hozzáadása (fájl feltöltésből)
  function addTrack(newTrack) {
    setTracks(prev => [
      ...prev,
      {
        id: Date.now(),
        title: newTrack.title || 'Ismeretlen cím',
        artist: newTrack.artist || 'Ismeretlen előadó',
        genre: newTrack.genre || '',
        mp3: newTrack.mp3 || null,
        cover: newTrack.cover || null,
        color: newTrack.color || '#1a2a3a',
      }
    ]);
  }

  // Szám törlése
  function removeTrack(id) {
    setTracks(prev => prev.filter(t => t.id !== id));
  }

  // Szám szerkesztése
  function updateTrack(id, changes) {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t));
  }

  return (
    <PlaylistContext.Provider value={{ tracks, addTrack, removeTrack, updateTrack }}>
      {children}
    </PlaylistContext.Provider>
  );
}

// Custom hook a könnyű használathoz
export function usePlaylist() {
  return useContext(PlaylistContext);
}
