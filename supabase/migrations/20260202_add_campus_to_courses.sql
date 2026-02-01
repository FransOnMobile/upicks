-- Add campus column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS campus text;

-- Add index for performance on filtering
CREATE INDEX IF NOT EXISTS idx_courses_campus ON public.courses(campus);

-- Optional: Update existing courses to generic or based on submitter if possible
-- For now, we leave them NULL to indicate "legacy/unknown" which our UI handles (or strict filters out)
