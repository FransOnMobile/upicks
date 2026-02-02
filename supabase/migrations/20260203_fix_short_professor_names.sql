-- Fix short professor names and prevent future occurrences

-- 1. Identify and "soft delete" or rename professors with names shorter than 2 characters
-- Strategy: Append "(Invalid Name)" to them so they are visible but clearly marked, 
-- or delete them if they have no ratings? 
-- Safer: Rename them.
UPDATE public.professors
SET name = 'Invalid Name ' || id
WHERE length(name) < 2;

-- 2. Add Constraint to prevent future inserts
ALTER TABLE public.professors
ADD CONSTRAINT professors_name_length_check CHECK (length(name) >= 2);
