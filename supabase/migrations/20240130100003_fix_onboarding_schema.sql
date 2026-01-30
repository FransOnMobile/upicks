-- Add missing columns for onboarding
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS campus text,
ADD COLUMN IF NOT EXISTS degree_program text,
ADD COLUMN IF NOT EXISTS year_level text,
ADD COLUMN IF NOT EXISTS student_number text;

-- Drop the trigger that automatically creates users on sign up
-- This allows us to defer user creation until they are verified and complete onboarding
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
