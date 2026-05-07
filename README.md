# WaveFlow

WaveFlow egy Spotify-szerű zenelejátszó webalkalmazás, amely Next.js, TypeScript, Tailwind CSS és Supabase alapon készült szoftvertervezés projekthez. Az alkalmazásban dalokat és podcastokat lehet böngészni, keresni, lejátszani, kedvencekhez adni, valamint saját listákba rendezni.

## Főbb funkciók

- Spotify-szerű, teljes képernyős felület sticky felső navigációval
- Univerzális alsó zenelejátszó
- Dalok és podcastok lejátszása
- Automatikus következő számra ugrás lejátszás végén
- Keresés dalokra, podcastokra, előadókra, albumokra és műfajokra
- Kedvencek kezelése
- Felhasználói listák létrehozása, törlése és dalok hozzáadása
- Mobilra optimalizált nézet
- Bejelentkezés és regisztráció Supabase Auth-tal
- Admin felület dalok és podcastok feltöltéséhez, listázásához és törléséhez
- Supabase Storage használata borítóképekhez és audio fájlokhoz

## Technológiák

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui alapú komponens-szemlélet
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Lucide React ikonok

## Projekt struktúra

```text
src/
  app/                 Next.js app router fájlok
  components/          Újrahasználható UI komponensek
  context/             Lejátszási és track állapot
  data/                Helyi fallback adatok
  hooks/               Egyedi React hookok
  lib/                 Supabase kliens és segédfüggvények
  App.tsx              Fő alkalmazás komponens
  index.css            Globális stílusok

public/                Statikus fájlok
supabase/schema.sql    Adatbázis és RLS séma
docs/                  Projekt dokumentáció
```

## Telepítés

1. Klónozd a projektet:

```bash
git clone https://github.com/balintkiss/WaveFlow_Szoftverterv_projekt.git
cd WaveFlow_Szoftverterv_projekt
```

2. Telepítsd a csomagokat:

```bash
npm install
```

3. Hozz létre egy `.env.local` fájlt a projekt gyökerében:

```env
NEXT_PUBLIC_SUPABASE_URL=sajat_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sajat_supabase_anon_key
```

4. Indítsd el fejlesztői módban:

```bash
npm run dev
```

Az alkalmazás alapértelmezetten itt érhető el:

```text
http://localhost:3000
```

## Supabase beállítás

1. Hozz létre egy Supabase projektet.
2. A Supabase Dashboardban nyisd meg az SQL Editort.
3. Futtasd le a `supabase/schema.sql` fájlt.
4. Hozd létre vagy ellenőrizd a Storage bucketeket:
   - `tracks`
   - `covers`
5. Állítsd be a Supabase projekt URL-t és anon kulcsot a `.env.local` fájlban.

A séma tartalmazza a `profiles`, `tracks` és `favorites` táblák alapbeállításait, valamint a Row Level Security szabályokat.

## Admin felület

Az admin felület csak admin jogosultságú felhasználó bejelentkezése után jelenik meg. Itt lehet:

- dalokat feltölteni,
- podcastokat feltölteni,
- feltöltött tartalmakat külön kezelni,
- elemeket törölni az adatbázisból és a Supabase Storage-ból.

A tanári teszteléshez szükséges admin belépési adatok a projekt dokumentációjában találhatók.

## Használat

- A főoldalon a felkapott dalok, albumok, előadók és podcastok jelennek meg.
- A keresőben külön szűrhetőek a dalok, podcastok, listák, albumok és előadók.
- Bejelentkezett felhasználók saját listákat hozhatnak létre.
- A kedvenc gombbal dalok és podcastok is elmenthetők.
- A lejátszó minden oldalon elérhető, ezért a zene navigálás közben sem áll le.

## Build

Production build készítése:

```bash
npm run build
```

Production mód futtatása:

```bash
npm run start
```

## Deploy

A projekt Vercelre egyszerűen feltölthető:

1. Töltsd fel a kódot GitHubra.
2. Importáld a repót Vercelben.
3. Add meg a következő Environment Variable értékeket:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Indítsd el a deployt.

## Biztonsági megjegyzés

A `.env.local` fájlt nem szabad feltölteni GitHubra. A projekt `.gitignore` fájlja ezt alapból tiltja. Ha nyilvános repóba kerül a projekt, ne kerüljenek bele jelszavak, privát kulcsok vagy éles Supabase service role kulcsok.

## Dokumentáció

A részletes projekt dokumentáció itt található:

```text
docs/WaveFlow_projekt_dokumentacio.docx
```

## Licenc

Ez a projekt oktatási célra készült.
