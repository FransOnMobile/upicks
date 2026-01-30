-- Fix: Allow authenticated users to insert new professors
-- This was likely missing or accidentally removed during refactors.

DROP POLICY IF EXISTS "Authenticated users can insert professors" ON public.professors;

CREATE POLICY "Authenticated users can insert professors" ON public.professors 
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND 
  (submitted_by = auth.uid() OR submitted_by IS NULL)
);
