-- Create a function to get user count that bypasses RLS
-- This is safe because it only returns a count, no personal data
CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INTEGER FROM public.users);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to all (including anonymous)
GRANT EXECUTE ON FUNCTION public.get_user_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_count() TO authenticated;
