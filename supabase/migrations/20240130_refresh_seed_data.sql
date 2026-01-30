-- Clear existing data (Cascade will handle dependent tables like ratings, professor_courses)
TRUNCATE TABLE public.professors CASCADE;
TRUNCATE TABLE public.courses CASCADE;
TRUNCATE TABLE public.departments CASCADE;

-- Insert Departments (Common & Campus Specific)
INSERT INTO public.departments (name, code) VALUES
  ('Institute of Computer Science', 'ICS'),
  ('Department of Mathematics, Physics, and Computer Science', 'DMPCS'), -- Mindanao
  ('Department of Humanities and Social Sciences', 'DHSS'), -- Mindanao
  ('College of Science', 'CS'), -- Diliman Generic
  ('College of Engineering', 'COE'),
  ('School of Management', 'SOM')
ON CONFLICT (name) DO UPDATE SET code = EXCLUDED.code;

-- Insert Professors (UP Diliman)
INSERT INTO public.professors (name, department_id, campus)
SELECT 'Dr. Juan Dela Cruz', id, 'diliman' FROM public.departments WHERE code = 'ICS'
UNION ALL
SELECT 'Prof. Maria Santos', id, 'diliman' FROM public.departments WHERE code = 'CS'
UNION ALL
SELECT 'Dr. Antonio Reyes', id, 'diliman' FROM public.departments WHERE code = 'COE'
UNION ALL
SELECT 'Prof. Elena Garcia', id, 'diliman' FROM public.departments WHERE code = 'ICS'
UNION ALL
SELECT 'Dr. Ricardo Lim', id, 'diliman' FROM public.departments WHERE code = 'COE';

-- Insert Professors (UP Mindanao)
INSERT INTO public.professors (name, department_id, campus)
SELECT 'Prof. Annalyn Almazan', id, 'mindanao' FROM public.departments WHERE code = 'DMPCS'
UNION ALL
SELECT 'Dr. Vicente Calag', id, 'mindanao' FROM public.departments WHERE code = 'DMPCS'
UNION ALL
SELECT 'Prof. Karen Cayamanda', id, 'mindanao' FROM public.departments WHERE code = 'DHSS'
UNION ALL
SELECT 'Dr. Vladimer Kobayashi', id, 'mindanao' FROM public.departments WHERE code = 'DMPCS'
UNION ALL
SELECT 'Prof. Nilo Oponda', id, 'mindanao' FROM public.departments WHERE code = 'SOM';

-- Insert Courses
INSERT INTO public.courses (code, name, level, department_id)
SELECT 'CMSC 11', 'Introduction to Computer Science', 'undergraduate', id FROM public.departments WHERE code = 'ICS'
UNION ALL
SELECT 'CMSC 128', 'Software Engineering', 'undergraduate', id FROM public.departments WHERE code = 'DMPCS'
UNION ALL
SELECT 'MATH 21', 'Elementary Analysis I', 'undergraduate', id FROM public.departments WHERE code = 'DMPCS'
UNION ALL
SELECT 'COMM 10', 'Critical Perspectives in Communication', 'undergraduate', id FROM public.departments WHERE code = 'DHSS';
