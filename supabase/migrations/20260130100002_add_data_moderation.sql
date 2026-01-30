-- 1. Updates for Departments Table
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 2. Updates for Courses Table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 3. RLS Policies for Departments
-- Public can only see verified departments
DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read verified departments" ON public.departments 
FOR SELECT USING (
  is_verified = true OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

-- Authenticated users can insert departments
DROP POLICY IF EXISTS "Authenticated users can insert departments" ON public.departments;
CREATE POLICY "Authenticated users can insert departments" ON public.departments 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Moderators can update/delete (update already exists check if we need to refine)
-- We ensure moderators have full access
DROP POLICY IF EXISTS "Moderators can update departments" ON public.departments;
CREATE POLICY "Moderators can update departments" ON public.departments 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);
DROP POLICY IF EXISTS "Moderators can delete departments" ON public.departments;
CREATE POLICY "Moderators can delete departments" ON public.departments 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);


-- 4. RLS Policies for Courses
-- Public can only see verified courses
DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read verified courses" ON public.courses 
FOR SELECT USING (
  is_verified = true OR 
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

-- Authenticated users can insert courses
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON public.courses;
CREATE POLICY "Authenticated users can insert courses" ON public.courses 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Moderators can update/delete
DROP POLICY IF EXISTS "Moderators can update courses" ON public.courses;
CREATE POLICY "Moderators can update courses" ON public.courses 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);
DROP POLICY IF EXISTS "Moderators can delete courses" ON public.courses;
CREATE POLICY "Moderators can delete courses" ON public.courses 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

-- 5. Set default verification for existing data (optional but good practice)
-- Assuming all existing data is verified
UPDATE public.departments SET is_verified = true WHERE is_verified IS FALSE;
UPDATE public.courses SET is_verified = true WHERE is_verified IS FALSE;
