-- Fix RLS for tags tables to ensure they are visible to everyone
-- Check if tables exist first to avoid errors (though IF EXISTS filters handles it)

ALTER TABLE IF EXISTS public.rating_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read rating_tags" ON public.rating_tags;
CREATE POLICY "Public read rating_tags" ON public.rating_tags FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.rating_tag_associations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read rating_tag_associations" ON public.rating_tag_associations;
CREATE POLICY "Public read rating_tag_associations" ON public.rating_tag_associations FOR SELECT USING (true);

-- Allow authenticated users to link tags (Insert)
DROP POLICY IF EXISTS "Authenticated insert rating_tag_associations" ON public.rating_tag_associations;
CREATE POLICY "Authenticated insert rating_tag_associations" ON public.rating_tag_associations FOR INSERT WITH CHECK (auth.role() = 'authenticated');
