-- 1. Create Campus Tags Table
CREATE TABLE IF NOT EXISTS public.campus_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT CHECK (category IN ('positive', 'negative', 'neutral')) DEFAULT 'neutral',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Campus Rating Tag Associations
CREATE TABLE IF NOT EXISTS public.campus_rating_tag_associations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID REFERENCES public.campus_ratings(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.campus_tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(rating_id, tag_id)
);

-- 3. RLS for Tags (Public Read, Admin Write)
ALTER TABLE public.campus_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read campus tags" ON public.campus_tags;
CREATE POLICY "Public read campus tags" ON public.campus_tags FOR SELECT USING (true);

-- 4. RLS for Associations
ALTER TABLE public.campus_rating_tag_associations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read campus associations" ON public.campus_rating_tag_associations;
CREATE POLICY "Public read campus associations" ON public.campus_rating_tag_associations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert campus associations" ON public.campus_rating_tag_associations;
CREATE POLICY "Public insert campus associations" ON public.campus_rating_tag_associations FOR INSERT WITH CHECK (true);

-- 5. Update Campus Ratings RLS for Public Insert
DROP POLICY IF EXISTS "Authenticated insert campus ratings" ON public.campus_ratings;
-- Allow ANYONE to insert (Public)
CREATE POLICY "Public insert campus ratings" ON public.campus_ratings FOR INSERT WITH CHECK (true);

-- Allow modifying user_id column to be nullable? 
-- Current schema: user_id UUID REFERENCES users(id) NOT NULL.
-- If public users rate, user_id must be NULLABLE or we use a "guest" user ID?
-- Better to make it NULLABLE.
ALTER TABLE public.campus_ratings ALTER COLUMN user_id DROP NOT NULL;

-- 6. Add "vote" support for campus ratings if not exists
-- reusing rating_votes? No, rating_votes references `ratings(id)`.
-- We need `campus_rating_votes`.
CREATE TABLE IF NOT EXISTS public.campus_rating_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID REFERENCES public.campus_ratings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id), -- Nullable for anon votes? Or strict? 
    -- If we allow Public votes on ratings, how do we track uniqueness?
    -- LocalStorage + maybe IP? For DB, we can allow nullable user_id but maybe just track vote?
    -- For now, let's keep votes authenticated-only OR just store count?
    -- The user wants "Public users able to rate campuses". They didn't explicitly ask for "Public users able to LIKE ratings".
    -- But consistent parity suggests yes.
    -- To keep it simple, let's allow nullable user_id but uniqueness is hard.
    -- Let's stick to AUTHENTICATED votes for consistency with Professor ratings for now, unless specific request.
    -- The user request "public users are able to rate campuses".
    -- I will focus on the Rating itself being public.
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.campus_rating_votes ENABLE ROW LEVEL SECURITY;

-- 7. Seed Data
INSERT INTO public.campus_tags (name, category) VALUES
    ('Walkable', 'positive'),
    ('Safe at Night', 'positive'),
    ('Good Food Options', 'positive'),
    ('Active Culture', 'positive'),
    ('Student Friendly', 'positive'),
    ('Green Spaces', 'positive'),
    ('Affordable', 'positive'),
    ('Accessible Transport', 'positive'),
    ('Crowded', 'negative'),
    ('Expensive', 'negative'),
    ('Isolated', 'negative'),
    ('Unsafe Areas', 'negative'),
    ('Poor Facilities', 'negative'),
    ('Difficult Enrollment', 'negative'),
    ('Heavy Traffic', 'negative')
ON CONFLICT (name) DO NOTHING;
