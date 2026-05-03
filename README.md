# 🎵 WaveFlow Player

Spotify-szerű zenelejátszó React-ban, egyedi dizájnnal.

## Indítás

```bash
npm install
npm start
```

## Zenék hozzáadása (kódból)

1. Másold az MP3 fájlt az `src/assets/music/` mappába
2. Másold a borítóképet az `src/assets/covers/` mappába
3. Nyisd meg az `src/data/tracks.js` fájlt
4. Add hozzá az új objektumot, és vedd ki a `//` kommenteket:

```js
{
  id: 20,
  title: "Szám neve",
  artist: "Előadó",
  genre: "Műfaj",
  mp3: require('../assets/music/fajlnev.mp3'),
  cover: require('../assets/covers/fajlnev.png'),
  color: "#1a2a3a",
},
```

## Zenék hozzáadása (playerből)

A sidebar tetején lévő **+ Hozzáadás** gombra kattintva:
- Válassz MP3 fájlt
- Adj meg nevet, előadót, műfajt
- Opcionálisan adj meg borítóképet

## Projekt struktúra

```
src/
├── components/
│   ├── HeroArt.jsx       ← Albumkép + vinyl animáció
│   ├── Player.jsx        ← Vezérlők, progress, hangerő
│   ├── Playlist.jsx      ← Oldalsáv lejátszási lista
│   └── AddTrackModal.jsx ← Új szám hozzáadása
├── hooks/
│   └── useAudioPlayer.js ← Teljes audio logika
├── context/
│   └── PlaylistContext.jsx ← Globális state (lista kezelés)
├── data/
│   └── tracks.js         ← Alapértelmezett zenék
├── assets/
│   ├── music/            ← .mp3 fájlok ide
│   └── covers/           ← Borítóképek ide
├── App.jsx
└── index.js
```

## Funkciók

- ▶️ Play / Pause
- ⏮ Előző / ⏭ Következő
- ⇌ Shuffle (keverés)
- ↻ Repeat (ismétlés)
- 📊 Waveform vizualizáció
- 🔈 Hangerőszabályzó
- ➕ Új szám hozzáadása menet közben
- 💾 Lista mentése localStorage-ban
