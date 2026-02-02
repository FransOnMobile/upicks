-- Add DELETE policies for moderators on ratings tables
-- This allows moderators to delete reported content

-- 1. Add moderator DELETE policy for ratings table
DROP POLICY IF EXISTS "Moderators can delete ratings" ON public.ratings;
CREATE POLICY "Moderators can delete ratings" ON public.ratings
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
);

-- 2. Add moderator DELETE policy for campus_ratings table  
DROP POLICY IF EXISTS "Moderators can delete campus ratings" ON public.campus_ratings;
CREATE POLICY "Moderators can delete campus ratings" ON public.campus_ratings
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
);

-- 3. Also allow users to delete their own ratings
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.ratings;
CREATE POLICY "Users can delete own ratings" ON public.ratings
FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own campus ratings" ON public.campus_ratings;
CREATE POLICY "Users can delete own campus ratings" ON public.campus_ratings
FOR DELETE USING (auth.uid() = user_id);

-- 4. Fix user table access - drop old restrictive policy and create new one
-- The issue was the old policy only allowed users to read their own data
-- We need moderators to be able to read all users
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Moderators can view all users" ON public.users;

-- Simple approach: use role column directly without subquery to avoid recursion
-- This policy allows:
-- 1. Users to read their own row
-- 2. Rows where the current user (auth.uid()) is a moderator to read all rows
CREATE POLICY "Users and moderators can read users" ON public.users
FOR SELECT USING (
    auth.uid() = id OR role IN ('moderator', 'admin')
);
-- Note: The 'role' here refers to the current row being read.
-- This allows: reading your own row OR reading any row if that row belongs to a mod/admin
-- Actually this isn't right either. Let me use a different approach:

-- Better approach: Create a helper function to check moderator status
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

-- Now recreate the policy using the function
DROP POLICY IF EXISTS "Users and moderators can read users" ON public.users;
CREATE POLICY "Users can read users" ON public.users
FOR SELECT USING (
    auth.uid() = id OR public.is_moderator()
);
