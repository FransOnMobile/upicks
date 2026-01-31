-- Fix circular RLS dependency for moderator checks
-- Create a security definer function that bypasses RLS to check moderator status

CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'moderator'
    );
$$;

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Moderators can read all users" ON public.users;
DROP POLICY IF EXISTS "Moderators can update users" ON public.users;

-- Recreate policies using the function
CREATE POLICY "Users can read own data" ON public.users 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Moderators can read all users" ON public.users 
FOR SELECT USING (public.is_moderator());

CREATE POLICY "Moderators can update users" ON public.users 
FOR UPDATE USING (public.is_moderator());
