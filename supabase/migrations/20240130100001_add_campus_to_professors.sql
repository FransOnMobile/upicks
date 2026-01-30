ALTER TABLE public.professors 
ADD COLUMN IF NOT EXISTS campus text CHECK (campus IN ('diliman', 'mindanao'));

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_professors_campus ON public.professors(campus);
