-- Fix: Ensure user_id is nullable (for anon ratings) and RLS allows public inserts.

-- 1. Make user_id nullable
ALTER TABLE public.campus_ratings ALTER COLUMN user_id DROP NOT NULL;

-- 2. Ensure RLS allows public inserts
DROP POLICY IF EXISTS "Authenticated insert campus ratings" ON public.campus_ratings;
DROP POLICY IF EXISTS "Public insert campus ratings" ON public.campus_ratings;

CREATE POLICY "Public insert campus ratings" ON public.campus_ratings FOR INSERT WITH CHECK (true);
