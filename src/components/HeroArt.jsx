import React from 'react';
import './HeroArt.css';

export default function HeroArt({ track, isPlaying }) {
  return (
    <div className="hero" style={{ '--track-color': track?.color || '#1a2a3a' }}>
      {/* Albumkép */}
      {track?.cover ? (
        <img className="hero__img" src={track.cover} alt={track.title} />
      ) : (
        <div className="hero__placeholder" />
      )}

      {/* Overlay gradient */}
      <div className="hero__overlay" />

      {/* Forgó vinyl */}
      <div className={`hero__vinyl ${isPlaying ? 'hero__vinyl--playing' : ''}`} />

      {/* Dal info */}
      <div className="hero__info">
        <h1 className="hero__title">{track?.title || 'Válassz egy zenét'}</h1>
        <p className="hero__artist">{track?.artist || '—'}</p>
        {track?.genre && <span className="hero__genre">{track.genre}</span>}
      </div>
    </div>
  );
}
