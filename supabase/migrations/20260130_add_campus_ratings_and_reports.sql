-- 1. Create Campus Ratings Table
CREATE TABLE IF NOT EXISTS public.campus_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campus_id TEXT NOT NULL, -- e.g. 'diliman', 'los-banos'
    user_id UUID REFERENCES public.users(id) NOT NULL,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5) NOT NULL,
    facilities_rating INTEGER CHECK (facilities_rating >= 1 AND facilities_rating <= 5),
    safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
    location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
    student_life_rating INTEGER CHECK (student_life_rating >= 1 AND student_life_rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    ip_hash TEXT -- Anonymized IP for rate limiting
);

-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.users(id) NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('professor_rating', 'campus_rating', 'professor', 'other')),
    target_id UUID NOT NULL, -- ID of the rating or item being reported
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS for Campus Ratings
ALTER TABLE public.campus_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read campus ratings" ON public.campus_ratings;
CREATE POLICY "Public read campus ratings" ON public.campus_ratings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert campus ratings" ON public.campus_ratings;
CREATE POLICY "Authenticated insert campus ratings" ON public.campus_ratings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own campus ratings" ON public.campus_ratings;
CREATE POLICY "Users can update own campus ratings" ON public.campus_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. RLS for Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reporters can view their own reports
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
CREATE POLICY "Users can view own reports" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Reporters can create reports
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Moderators can view all reports (assuming moderator role exists from previous context)
DROP POLICY IF EXISTS "Moderators can view all reports" ON public.reports;
CREATE POLICY "Moderators can view all reports" ON public.reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
    );

-- Moderators can update reports
DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;
CREATE POLICY "Moderators can update reports" ON public.reports
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
    );

-- 5. Helper function for helpful count (reuse or create new if not generic)
-- Assuming 'increment_helpful_count' exists for ratings, we might need one for campus_ratings or make a generic one.
-- Creating specific one for safety.
CREATE OR REPLACE FUNCTION increment_campus_rating_helpful(rating_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.campus_ratings
  SET helpful_count = helpful_count + 1
  WHERE id = rating_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
