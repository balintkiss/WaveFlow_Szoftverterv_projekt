import React, { useState } from 'react';
import './AddTrackModal.css';

export default function AddTrackModal({ onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [mp3File, setMp3File] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  function handleMp3(e) {
    const file = e.target.files[0];
    if (!file) return;
    setMp3File(URL.createObjectURL(file));
    // Fájlnévből próbáljuk kitalálni a címet ha üres
    if (!title) {
      const name = file.name.replace('.mp3', '').replace(/_/g, ' ');
      setTitle(name);
    }
  }

  function handleCover(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCoverFile(url);
    setCoverPreview(url);
  }

  function handleSubmit() {
    if (!title || !mp3File) return;
    onAdd({
      title,
      artist,
      genre,
      mp3: mp3File,
      cover: coverFile,
      color: '#1a2a3a',
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <h2>Új szám hozzáadása</h2>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          {/* Cover előnézet */}
          <label className="modal__cover-pick">
            {coverPreview
              ? <img src={coverPreview} alt="cover" />
              : <div className="modal__cover-placeholder">📷 Borítókép</div>
            }
            <input type="file" accept="image/*" onChange={handleCover} hidden />
          </label>

          <div className="modal__fields">
            <input
              className="modal__input"
              placeholder="Dal címe *"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              className="modal__input"
              placeholder="Előadó"
              value={artist}
              onChange={e => setArtist(e.target.value)}
            />
            <input
              className="modal__input"
              placeholder="Műfaj (pl. Rock)"
              value={genre}
              onChange={e => setGenre(e.target.value)}
            />

            <label className={`modal__file-btn ${mp3File ? 'modal__file-btn--ok' : ''}`}>
              {mp3File ? '✅ MP3 betöltve' : '🎵 MP3 fájl kiválasztása *'}
              <input type="file" accept=".mp3,audio/*" onChange={handleMp3} hidden />
            </label>
          </div>
        </div>

        <div className="modal__footer">
          <button className="modal__cancel" onClick={onClose}>Mégse</button>
          <button
            className="modal__submit"
            onClick={handleSubmit}
            disabled={!title || !mp3File}
          >
            Hozzáadás
          </button>
        </div>
      </div>
    </div>
  );
}
