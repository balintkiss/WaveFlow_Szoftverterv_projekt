import React from 'react';
import './Playlist.css';

export default function Playlist({ tracks, currentIndex, isPlaying, onSelect, onAddTrack }) {
  return (
    <div className="playlist">
      <div className="playlist__header">
        <span>Lejátszási lista</span>
        <button className="playlist__add-btn" onClick={onAddTrack} title="Szám hozzáadása">
          + Hozzáadás
        </button>
      </div>

      <ul className="playlist__list">
        {tracks.map((track, i) => (
          <li
            key={track.id}
            className={`playlist__item ${i === currentIndex ? 'playlist__item--active' : ''}`}
            onClick={() => onSelect(i)}
          >
            {/* Szám sorszám / animált dot */}
            <div className="playlist__num">
              {i === currentIndex && isPlaying
                ? <div className="playlist__dot" />
                : i + 1
              }
            </div>

            {/* Albumkép bélyegkép */}
            <div
              className="playlist__thumb"
              style={{ background: track.cover ? 'transparent' : track.color }}
            >
              {track.cover && (
                <img src={track.cover} alt={track.title} />
              )}
            </div>

            {/* Dal info */}
            <div className="playlist__info">
              <span className="playlist__title">{track.title}</span>
              <span className="playlist__artist">{track.artist}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* EQ animáció */}
      <div className="playlist__eq">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className={`playlist__eq-bar ${isPlaying ? 'playlist__eq-bar--active' : ''}`}
            style={{ animationDelay: `${i * 0.07}s` }}
          />
        ))}
      </div>
    </div>
  );
}
