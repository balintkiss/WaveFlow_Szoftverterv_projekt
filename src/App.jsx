import React, { useState } from 'react';
import './App.css';
import { PlaylistProvider, usePlaylist } from './context/PlaylistContext';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import HeroArt from './components/HeroArt';
import Player from './components/Player';
import Playlist from './components/Playlist';
import AddTrackModal from './components/AddTrackModal';

function WaveFlow() {
  const { tracks, addTrack } = usePlaylist();
  const [showModal, setShowModal] = useState(false);

  const {
    currentTrack, currentIndex, isPlaying,
    progress, currentTime, duration,
    volume, isShuffle, isRepeat,
    togglePlay, next, prev, seek,
    goToTrack, setVolume,
    toggleShuffle, toggleRepeat,
  } = useAudioPlayer(tracks);

  return (
    <div className="app">
      {/* Animált háttér-blob */}
      <div
        className="app__blob"
        style={{ '--blob-color': currentTrack?.color || '#1a2a3a' }}
      />

      {/* Header */}
      <header className="app__header">
        <div className="app__logo">WAVE<span>FLOW</span></div>
        <div className="app__tag">{tracks.length} szám</div>
      </header>

      {/* Bal oldal: albumkép + vezérlők */}
      <main className="app__main">
        <HeroArt track={currentTrack} isPlaying={isPlaying} />
        <Player
          isPlaying={isPlaying}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isShuffle={isShuffle}
          isRepeat={isRepeat}
          onTogglePlay={togglePlay}
          onNext={next}
          onPrev={prev}
          onSeek={seek}
          onVolumeChange={setVolume}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
        />
      </main>

      {/* Jobb oldal: lejátszási lista */}
      <aside className="app__sidebar">
        <Playlist
          tracks={tracks}
          currentIndex={currentIndex}
          isPlaying={isPlaying}
          onSelect={goToTrack}
          onAddTrack={() => setShowModal(true)}
        />
      </aside>

      {/* Modal: új szám hozzáadása */}
      {showModal && (
        <AddTrackModal
          onAdd={addTrack}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PlaylistProvider>
      <WaveFlow />
    </PlaylistProvider>
  );
}
