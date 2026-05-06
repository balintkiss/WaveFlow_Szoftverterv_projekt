-- =============================================================
-- WaveFlow – Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- =============================================================


-- =============================================================
-- 1. PROFILES
--    Automatically created for every new auth user via trigger
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username    TEXT        UNIQUE,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: insert a profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- =============================================================
-- 2. TRACKS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.tracks (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  artist      TEXT        NOT NULL DEFAULT 'Ismeretlen előadó',
  genre       TEXT        NOT NULL DEFAULT 'Egyéb',
  mp3_url     TEXT,                        -- Supabase Storage public URL
  cover_url   TEXT,                        -- Supabase Storage public URL
  color       TEXT        NOT NULL DEFAULT '#1ed760',
  duration_seconds INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tracks
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

CREATE INDEX IF NOT EXISTS tracks_user_id_idx ON public.tracks (user_id);


-- =============================================================
-- 3. FAVORITES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id          BIGSERIAL   PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  track_id    BIGINT      NOT NULL REFERENCES public.tracks (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, track_id)
);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON public.favorites (user_id);


-- =============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- tracks
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tracks"
  ON public.tracks FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert their own tracks"
  ON public.tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks"
  ON public.tracks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks"
  ON public.tracks FOR DELETE
  USING (auth.uid() = user_id);


-- favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================
-- 5. STORAGE BUCKETS
--    Run these separately in SQL Editor — or create manually
--    in Supabase Dashboard → Storage
-- =============================================================

-- MP3 files bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks', 'tracks', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Cover art bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies — tracks bucket
CREATE POLICY "Anyone can read track files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tracks');

CREATE POLICY "Auth users can upload track files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tracks' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own track files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tracks' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- Storage policies — covers bucket
CREATE POLICY "Anyone can read cover files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');

CREATE POLICY "Auth users can upload cover files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own cover files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'covers' AND auth.uid()::TEXT = (storage.foldername(name))[1]);


-- =============================================================
-- 6. HELPER VIEW (optional — convenient for the app)
-- =============================================================
CREATE OR REPLACE VIEW public.tracks_with_favorites AS
SELECT
  t.*,
  EXISTS (
    SELECT 1 FROM public.favorites f
    WHERE f.track_id = t.id AND f.user_id = auth.uid()
  ) AS is_favorite
FROM public.tracks t;


-- =============================================================
-- 7. GRANTS
--    Szükséges hogy a service_role, authenticated és anon
--    szerepkörök hozzáférjenek a táblákhoz.
--    Ha a táblákat manuálisan hoztad létre, ezeket is futtatni kell!
-- =============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON public.tracks   TO anon, authenticated, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;
GRANT ALL ON public.favorites TO anon, authenticated, service_role;

-- Sequence-ek (BIGSERIAL auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;


-- =============================================================
-- 7. ADMIN SUPPORT
--    Run this patch after the initial schema if you want
--    to restrict track uploads to admins only.
-- =============================================================

-- Add is_admin column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- Helper function: returns TRUE if the calling user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

-- Drop the old "any authenticated user can insert" policy
DROP POLICY IF EXISTS "Users can insert their own tracks" ON public.tracks;

-- New policy: only admins can insert tracks
CREATE POLICY "Only admins can insert tracks"
  ON public.tracks FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update / delete any track
DROP POLICY IF EXISTS "Users can update their own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can delete their own tracks" ON public.tracks;

CREATE POLICY "Only admins can update tracks"
  ON public.tracks FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Only admins can delete tracks"
  ON public.tracks FOR DELETE
  USING (public.is_admin());

-- Storage: only admins can upload files
DROP POLICY IF EXISTS "Auth users can upload track files"  ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload cover files"  ON storage.objects;

CREATE POLICY "Only admins can upload track files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'tracks' AND public.is_admin());

CREATE POLICY "Only admins can upload cover files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'covers' AND public.is_admin());

DROP POLICY IF EXISTS "Only admins can delete track files" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete cover files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own track files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own cover files" ON storage.objects;

CREATE POLICY "Only admins can delete track files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'tracks' AND public.is_admin());

CREATE POLICY "Only admins can delete cover files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'covers' AND public.is_admin());

-- =============================================================
-- HOW TO SET AN ADMIN USER
-- Run this in SQL Editor (replace the email):
--
--   UPDATE public.profiles
--   SET is_admin = TRUE
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'te@email.com');
-- =============================================================
