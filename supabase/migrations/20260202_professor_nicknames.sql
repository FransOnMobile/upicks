-- Professor Nicknames Feature
-- This migration adds a table for professor nicknames with moderation workflow

-- Create the professor_nicknames table
CREATE TABLE IF NOT EXISTS public.professor_nicknames (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
    nickname VARCHAR(100) NOT NULL,
    submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate nicknames for the same professor
    UNIQUE(professor_id, nickname)
);

-- Force update foreign keys to point to public.users (in case table already existed with auth.users reference)
DO $$
BEGIN
    -- Drop old constraints if they exist (names might vary, but standard naming is table_column_fkey)
    -- We try to drop generic ones or specific ones if we knew the name. 
    -- Best effort: assume standard naming or just replace if we can. 
    -- Since we can't easily guess the exact name if it was auto-generated differently, let's try standard.
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'professor_nicknames_submitted_by_fkey') THEN
        ALTER TABLE public.professor_nicknames DROP CONSTRAINT professor_nicknames_submitted_by_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'professor_nicknames_reviewed_by_fkey') THEN
        ALTER TABLE public.professor_nicknames DROP CONSTRAINT professor_nicknames_reviewed_by_fkey;
    END IF;

    -- Add new constraints referencing public.users
    ALTER TABLE public.professor_nicknames
    ADD CONSTRAINT professor_nicknames_submitted_by_fkey
    FOREIGN KEY (submitted_by) REFERENCES public.users(id) ON DELETE SET NULL;

    ALTER TABLE public.professor_nicknames
    ADD CONSTRAINT professor_nicknames_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN 
        NULL; -- Constraint already exists
    WHEN others THEN
        RAISE NOTICE 'Error updating constraints: %', SQLERRM;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_professor_nicknames_professor_id ON public.professor_nicknames(professor_id);
CREATE INDEX IF NOT EXISTS idx_professor_nicknames_status ON public.professor_nicknames(status);
CREATE INDEX IF NOT EXISTS idx_professor_nicknames_submitted_by ON public.professor_nicknames(submitted_by);

-- Enable Row Level Security
ALTER TABLE public.professor_nicknames ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view approved nicknames
DROP POLICY IF EXISTS "Anyone can view approved nicknames" ON public.professor_nicknames;
CREATE POLICY "Anyone can view approved nicknames"
ON public.professor_nicknames
FOR SELECT
USING (status = 'approved');

-- Authenticated users can view their own pending/rejected submissions
DROP POLICY IF EXISTS "Users can view own submissions" ON public.professor_nicknames;
CREATE POLICY "Users can view own submissions"
ON public.professor_nicknames
FOR SELECT
USING (auth.uid() = submitted_by);

-- Moderators can view all nicknames
DROP POLICY IF EXISTS "Moderators can view all nicknames" ON public.professor_nicknames;
CREATE POLICY "Moderators can view all nicknames"
ON public.professor_nicknames
FOR SELECT
USING (public.is_moderator());

-- Authenticated users can insert nicknames
DROP POLICY IF EXISTS "Authenticated users can submit nicknames" ON public.professor_nicknames;
CREATE POLICY "Authenticated users can submit nicknames"
ON public.professor_nicknames
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = submitted_by);

-- Moderators can update nicknames (approve/reject)
DROP POLICY IF EXISTS "Moderators can update nicknames" ON public.professor_nicknames;
CREATE POLICY "Moderators can update nicknames"
ON public.professor_nicknames
FOR UPDATE
USING (public.is_moderator());

-- Moderators can delete nicknames
DROP POLICY IF EXISTS "Moderators can delete nicknames" ON public.professor_nicknames;
CREATE POLICY "Moderators can delete nicknames"
ON public.professor_nicknames
FOR DELETE
USING (public.is_moderator());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_professor_nicknames_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_professor_nicknames_updated_at ON public.professor_nicknames;
CREATE TRIGGER trigger_update_professor_nicknames_updated_at
    BEFORE UPDATE ON public.professor_nicknames
    FOR EACH ROW
    EXECUTE FUNCTION update_professor_nicknames_updated_at();

-- Create a view for easier search querying (includes approved nicknames)
DROP VIEW IF EXISTS public.professor_search_view;
CREATE OR REPLACE VIEW public.professor_search_view AS
SELECT 
    p.id,
    p.name,
    p.department_id,
    p.campus,
    d.name as department_name,
    COALESCE(
        array_agg(DISTINCT pn.nickname) FILTER (WHERE pn.nickname IS NOT NULL AND pn.status = 'approved'),
        ARRAY[]::VARCHAR[]
    ) as nicknames,
    p.is_verified,
    p.created_at
FROM public.professors p
LEFT JOIN public.departments d ON p.department_id = d.id
LEFT JOIN public.professor_nicknames pn ON p.id = pn.professor_id AND pn.status = 'approved'
WHERE p.is_verified = true
GROUP BY p.id, p.name, p.department_id, p.campus, d.name, p.is_verified, p.created_at;

-- Grant access to the view
GRANT SELECT ON public.professor_search_view TO authenticated, anon;
