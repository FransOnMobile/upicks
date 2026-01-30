-- 1. Add verification_notes column to professors table
ALTER TABLE public.professors 
ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- 2. Update Public Read Policy for Professors
-- Previously we allowed all public read. Now we restrict to verified only.
DROP POLICY IF EXISTS "Public read professors" ON public.professors;

CREATE POLICY "Public read professors" ON public.professors 
FOR SELECT USING (
  is_verified = true
);

-- 3. Ensure Moderators can still see EVERYTHING
-- (The existing policy "Moderators can update professors" handles updates, but we need a SELECT policy specifically for moderators if the public one excludes unverified)
-- However, typically RLS policies are OR-ed.
-- So if we have "Public read verified" AND "Moderators read all", it works.
-- Let's check if we have a specific "Moderators read all" policy. 
-- In previous migration we didn't add one because "Public read professors" covered everything.
-- Now we need one.

DROP POLICY IF EXISTS "Moderators can view all professors" ON public.professors;
CREATE POLICY "Moderators can view all professors" ON public.professors 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator')
);

-- 4. User Submission Policy (unchanged, but good to verify)
-- Users should be able to view the professor they JUST inserted? 
-- Sometimes helpful, but if they are unverified, they disappear immediately. 
-- That is the desired behavior ("Pre-Moderation").
-- So we don't need a special policy for "My submitted professors" unless requested.
