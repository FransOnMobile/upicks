-- Enable RLS on users table (just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profile
-- This is needed for the first time setup in Onboarding
CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
WITH CHECK (auth.uid()::text = id::text);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid()::text = id::text);

-- Select policy already exists ("Users can view own data"), but ensuring it covers the id check
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" 
ON public.users 
FOR SELECT 
USING (auth.uid()::text = id::text);
