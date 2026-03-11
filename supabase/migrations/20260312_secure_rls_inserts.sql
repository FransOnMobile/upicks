-- Security Fix: Prevent RLS Privilege Escalation
-- Ensures users can only insert ratings and reports under their own user_id

-- 1. Fix Campus Ratings Insert Policy
DROP POLICY IF EXISTS "Authenticated insert campus ratings" ON public.campus_ratings;
CREATE POLICY "Authenticated insert campus ratings" ON public.campus_ratings
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        auth.uid() = user_id
    );

-- 2. Fix Reports Insert Policy
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        auth.uid() = reporter_id
    );
