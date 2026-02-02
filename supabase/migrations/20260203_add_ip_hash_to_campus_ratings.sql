-- Add ip_hash column to campus_ratings for anonymous rate limiting
ALTER TABLE public.campus_ratings ADD COLUMN IF NOT EXISTS ip_hash TEXT;
