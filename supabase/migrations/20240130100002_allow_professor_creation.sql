-- Allow authenticated users to create professors
DROP POLICY IF EXISTS "Authenticated users create professors" ON public.professors;
CREATE POLICY "Authenticated users create professors" ON public.professors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
