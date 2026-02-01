-- Fix reports table schema - add missing columns for moderation workflow
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.users(id);

-- Also ensure the status check constraint allows all needed values
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_status_check 
    CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'));

-- Ensure target_type allows 'rating' as well (used in moderator page)
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_target_type_check;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_type_check 
    CHECK (target_type IN ('professor', 'rating', 'professor_rating', 'campus_rating', 'department', 'other'));
