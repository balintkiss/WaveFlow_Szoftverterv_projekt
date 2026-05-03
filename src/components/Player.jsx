import React, { useRef } from 'react';
import './Player.css';

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function Player({
  isPlaying, progress, currentTime, duration,
  volume, isShuffle, isRepeat,
  onTogglePlay, onNext, onPrev, onSeek,
  onVolumeChange, onToggleShuffle, onToggleRepeat,
}) {
  // Waveform bárok (csak vizuális)
  const bars = useRef(
    Array.from({ length: 55 }, () => 6 + Math.random() * 28)
  );
  const activeBars = Math.floor(progress * bars.current.length);

  return (
    <div className="player">
      {/* Waveform */}
      <div className="player__waveform" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek((e.clientX - rect.left) / rect.width);
      }}>
        {bars.current.map((h, i) => (
          <div
            key={i}
            className={`player__wbar ${i < activeBars ? 'player__wbar--active' : ''}`}
            style={{ height: h + 'px' }}
          />
        ))}
      </div>

      {/* Progress sáv */}
      <div className="player__progress-wrap" onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek((e.clientX - rect.left) / rect.width);
      }}>
        <div className="player__progress-fill" style={{ width: (progress * 100) + '%' }} />
      </div>
      <div className="player__time-row">
        <span>{fmt(currentTime)}</span>
        <span>{fmt(duration)}</span>
      </div>

      {/* Vezérlők */}
      <div className="player__controls">
        <button
          className={`player__btn ${isShuffle ? 'player__btn--active' : ''}`}
          onClick={onToggleShuffle}
          title="Keverés"
        >⇌</button>

        <button className="player__btn" onClick={onPrev} title="Előző">⏮</button>

        <button className="player__btn player__btn--play" onClick={onTogglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button className="player__btn" onClick={onNext} title="Következő">⏭</button>

        <button
          className={`player__btn ${isRepeat ? 'player__btn--active' : ''}`}
          onClick={onToggleRepeat}
          title="Ismétlés"
        >↻</button>
      </div>

      {/* Hangerő */}
      <div className="player__volume">
        <span>🔈</span>
        <input
          type="range"
          min="0" max="1" step="0.01"
          value={volume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          style={{ '--vol': (volume * 100) + '%' }}
        />
        <span className="player__vol-label">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  );
}
