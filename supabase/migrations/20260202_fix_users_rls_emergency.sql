-- EMERGENCY FIX: Run this in Supabase SQL Editor to restore moderator panel access
-- This fixes the recursive policy issue

-- Step 1: Drop ALL conflicting SELECT policies on users table
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Moderators can view all users" ON public.users;
DROP POLICY IF EXISTS "Users and moderators can read users" ON public.users;
DROP POLICY IF EXISTS "Users can read users" ON public.users;

-- Step 2: Create helper function to check moderator status (avoids recursion)
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    );
$$;

-- Step 3: Create the fixed policy using the function
CREATE POLICY "Users can read users" ON public.users
FOR SELECT USING (
    auth.uid() = id OR public.is_moderator()
);

-- Verify: After running this, try accessing the moderator panel again
