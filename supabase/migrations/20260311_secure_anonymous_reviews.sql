-- Security Fix: Prevent Leakage of Anonymous User IDs
-- Adds hidden author_id column to track ownership without exposing it to the API
-- Uses triggers to automatically NULLify user_id on anonymous posts

-- --------------------------------------------------------
-- Part 1: Add Hidden author_id columns
-- --------------------------------------------------------

-- 1A: Ratings Table
ALTER TABLE public.ratings 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 1B: Campus Ratings Table
ALTER TABLE public.campus_ratings 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- 1C: Rating Replies Table
ALTER TABLE public.rating_replies 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- 1D: Campus Rating Replies Table
ALTER TABLE public.campus_rating_replies 
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- --------------------------------------------------------
-- Part 2: Securely Migrate Existing Data
-- --------------------------------------------------------

-- Copy existing user_ids to author_id
UPDATE public.ratings SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;
UPDATE public.campus_ratings SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;
UPDATE public.rating_replies SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;
UPDATE public.campus_rating_replies SET author_id = user_id WHERE author_id IS NULL AND user_id IS NOT NULL;

-- --------------------------------------------------------
-- Part 3: Deploy Database Triggers 
-- --------------------------------------------------------

-- Function to handle insertions and updates for reviews
CREATE OR REPLACE FUNCTION public.secure_anonymous_review()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Always ensure author_id tracks the true owner.
    -- If user_id is provided, force author_id to match it
    IF NEW.user_id IS NOT NULL THEN
        NEW.author_id := NEW.user_id;
    END IF;

    -- NOTE: Replies do not have an is_anonymous column, so we ONLY wipe user_ids for ratings
    -- For ratings & campus ratings we wipe:
    IF TG_TABLE_NAME = 'ratings' OR TG_TABLE_NAME = 'campus_ratings' THEN
        IF NEW.is_anonymous = true THEN
            NEW.user_id := NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Trigger for Ratings
DROP TRIGGER IF EXISTS trg_secure_ratings ON public.ratings;
CREATE TRIGGER trg_secure_ratings
    BEFORE INSERT OR UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_anonymous_review();

-- Trigger for Campus Ratings
DROP TRIGGER IF EXISTS trg_secure_campus_ratings ON public.campus_ratings;
CREATE TRIGGER trg_secure_campus_ratings
    BEFORE INSERT OR UPDATE ON public.campus_ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_anonymous_review();

-- Trigger for Rating Replies
DROP TRIGGER IF EXISTS trg_secure_rating_replies ON public.rating_replies;
CREATE TRIGGER trg_secure_rating_replies
    BEFORE INSERT OR UPDATE ON public.rating_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_anonymous_review();

-- Trigger for Campus Rating Replies
DROP TRIGGER IF EXISTS trg_secure_campus_rating_replies ON public.campus_rating_replies;
CREATE TRIGGER trg_secure_campus_rating_replies
    BEFORE INSERT OR UPDATE ON public.campus_rating_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_anonymous_review();


-- --------------------------------------------------------
-- Part 4: Nullify Existing Anonymous Reviews
-- --------------------------------------------------------

-- Scrub existing data so the leak is instantly plugged
UPDATE public.ratings 
SET user_id = NULL 
WHERE is_anonymous = true AND user_id IS NOT NULL AND author_id IS NOT NULL;

UPDATE public.campus_ratings 
SET user_id = NULL 
WHERE is_anonymous = true AND user_id IS NOT NULL AND author_id IS NOT NULL;


-- --------------------------------------------------------
-- Part 5: Update RLS Policies to use author_id
-- --------------------------------------------------------

-- Update ratings update policy to check author_id
DROP POLICY IF EXISTS "Users update own ratings" ON public.ratings;
CREATE POLICY "Users update own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = author_id);

-- Update campus ratings update policy
DROP POLICY IF EXISTS "Users update own campus ratings" ON public.campus_ratings;
CREATE POLICY "Users update own campus ratings" 
ON public.campus_ratings 
FOR UPDATE 
USING (auth.uid() = author_id);

-- Update rating replies update/delete policies
DROP POLICY IF EXISTS "Users delete own replies within 24h" ON public.rating_replies;
CREATE POLICY "Users delete own replies within 24h" 
ON public.rating_replies 
FOR DELETE 
USING (auth.uid() = author_id AND created_at > (now() - interval '24 hours'));

-- Update campus rating replies update/delete policies
DROP POLICY IF EXISTS "Users can delete own campus replies within 24h" ON public.campus_rating_replies;
CREATE POLICY "Users can delete own campus replies within 24h" 
ON public.campus_rating_replies 
FOR DELETE 
USING (auth.uid() = author_id AND created_at > (now() - interval '24 hours'));
