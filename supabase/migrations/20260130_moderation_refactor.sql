-- 1. Add roles to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Seed moderator (handle case where user might not exist yet, though they should based on prompt)
UPDATE public.users SET role = 'moderator' WHERE email = 'fjmorales@up.edu.ph';

-- 3. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL, -- ID of the reported item (professor, rating, etc.)
  target_type TEXT NOT NULL CHECK (target_type IN ('professor', 'rating', 'department')),
  reason TEXT NOT NULL,
  details TEXT, -- Extra details provided by user
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.users(id)
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for Reports
DROP POLICY IF EXISTS "Authenticated users can report" ON public.reports;
CREATE POLICY "Authenticated users can report" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Moderators can view reports" ON public.reports;
CREATE POLICY "Moderators can view reports" ON public.reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;
CREATE POLICY "Moderators can update reports" ON public.reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

-- 4. Open visibility for Professors (Community Moderation)
-- Remove the restriction that hides unverified professors
DROP POLICY IF EXISTS "Public read professors" ON public.professors;
CREATE POLICY "Public read professors" ON public.professors FOR SELECT USING (true);

-- 5. Moderator Permissions on Professors
DROP POLICY IF EXISTS "Moderators can update professors" ON public.professors;
CREATE POLICY "Moderators can update professors" ON public.professors FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

DROP POLICY IF EXISTS "Moderators can delete professors" ON public.professors;
CREATE POLICY "Moderators can delete professors" ON public.professors FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

-- 6. Moderator Permissions on Departments (if needed)
DROP POLICY IF EXISTS "Moderators can update departments" ON public.departments;
CREATE POLICY "Moderators can update departments" ON public.departments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

DROP POLICY IF EXISTS "Moderators can delete departments" ON public.departments;
CREATE POLICY "Moderators can delete departments" ON public.departments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

-- 7. Add RLS policy for users to read roles (needed for frontend check)
-- Users can read their own role
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
-- Recreating strict policy
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
