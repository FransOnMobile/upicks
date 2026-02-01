-- Create rating_votes table to track user votes
CREATE TABLE IF NOT EXISTS public.rating_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID NOT NULL REFERENCES public.ratings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')) DEFAULT 'up',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(rating_id, user_id)
);

-- RLS for rating_votes
ALTER TABLE public.rating_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read votes" ON public.rating_votes;
CREATE POLICY "Public read votes" ON public.rating_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert votes" ON public.rating_votes;
CREATE POLICY "Authenticated users can insert votes" ON public.rating_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can delete own votes" ON public.rating_votes;
CREATE POLICY "Authenticated users can delete own votes" ON public.rating_votes FOR DELETE USING (auth.uid() = user_id);

-- Add unique constraint to ratings to prevent duplicate reviews per course per professor
CREATE UNIQUE INDEX IF NOT EXISTS ratings_user_prof_course_idx ON public.ratings (user_id, professor_id, course_id);
