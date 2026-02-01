-- 1. DROP old unique constraint on code
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_code_key;

-- 2. ADD new unique constraint on (code, campus)
-- This allows "MATH 10" in Diliman and "MATH 10" in Los Baños to coexist
-- Drop first if exists to make this idempotent
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_code_campus_key;
ALTER TABLE public.courses ADD CONSTRAINT courses_code_campus_key UNIQUE (code, campus);

-- 3. CLEANUP: Remove courses with NULL campus (as requested by user)
DELETE FROM public.courses WHERE campus IS NULL;

-- 4. SEED DATA for UP Diliman, UP Manila, UP Los Baños

INSERT INTO public.courses (code, name, campus, is_verified) VALUES
-- UP Diliman (General Education & Common)
('ARTS 1', 'Critical Perspectives in the Arts', 'diliman', true),
('COMM 10', 'Critical Perspectives in Communication', 'diliman', true),
('ENG 13', 'Writing as Thinking', 'diliman', true),
('ETHICS 1', 'Ethics and Moral Reasoning in Everyday Life', 'diliman', true),
('FIL 40', 'Wika, Kultura, at Lipunan', 'diliman', true),
('KAS 1', 'Kasaysayan ng Pilipinas', 'diliman', true),
('MATH 2', 'Mathematics in Everyday Life', 'diliman', true),
('MATH 10', 'Mathematics, Culture, and Society', 'diliman', true),
('MATH 21', 'Elementary Analysis I', 'diliman', true),
('MATH 22', 'Elementary Analysis II', 'diliman', true),
('PHILO 1', 'Philosophical Analysis', 'diliman', true),
('PHYS 10', 'Physics and Astronomy for Pedestrians', 'diliman', true),
('SOC SCI 1', 'Foundations of Behavioral Sciences', 'diliman', true),
('SOC SCI 2', 'Social, Economic, and Political Thought', 'diliman', true),
('SPEECH 30', 'Public Speaking and Persuasion', 'diliman', true),
('STS 1', 'Science, Technology and Society', 'diliman', true),
('CS 11', 'Introduction to Computer Science', 'diliman', true),
('CS 12', 'Computer Programming', 'diliman', true),
('CS 30', 'Discrete Mathematics for Computer Science', 'diliman', true),

-- UP Los Baños
('BIO 1', 'Contemporary Topics in Biology', 'los-banos', true),
('CHEM 1', 'Chemistry: Science that Matters', 'los-banos', true),
('CMSC 11', 'Introduction to Computer Science', 'los-banos', true),
('MATH 27', 'Analytic Geometry and Calculus I', 'los-banos', true),
('MATH 28', 'Analytic Geometry and Calculus II', 'los-banos', true),
('STAT 1', 'Elementary Statistics', 'los-banos', true),
('AGRI 1', 'Agriculture & Society', 'los-banos', true),
('ETHICS 1', 'Ethics and Moral Reasoning (UPLB)', 'los-banos', true),
('STS 1', 'Science, Technology and Society (UPLB)', 'los-banos', true),

-- UP Manila
('NURSING 301', 'Nursing Theory I', 'manila', true),
('NURSING 302', 'Nursing Theory II', 'manila', true),
('PHARM 101', 'Introduction to Pharmacy', 'manila', true),
('BIOCHEM 310', 'Biochemical Genetics', 'manila', true),
('BIOSTAT 301', 'Biostatistics II', 'manila', true),
('COM ARTS 101', 'Communication Arts I', 'manila', true),
('PH 101', 'Public Health Perspectives', 'manila', true),

-- UP Visayas
('FISH 101', 'Introduction to Fisheries', 'visayas', true),
('FISH 102', 'Aquaculture', 'visayas', true),
('CHEM 1', 'General Chemistry', 'visayas', true),
('BIO 1', 'General Biology', 'visayas', true),
('MATH 17', 'Algebra and Trigonometry', 'visayas', true),
('STAT 1', 'Elementary Statistics', 'visayas', true),
('CS 11', 'Introduction to Computer Science', 'visayas', true),
('ECON 11', 'Introduction to Economics', 'visayas', true),
('COMM 101', 'Communication and Media Studies', 'visayas', true),
('POLSCI 1', 'Introduction to Political Science', 'visayas', true),
('PSYCH 1', 'General Psychology', 'visayas', true),
('SOCIO 1', 'Introductory Sociology', 'visayas', true),

-- UP Baguio
('BIO 11', 'Introduction to Biology', 'baguio', true),
('CHEM 16', 'General Chemistry I', 'baguio', true),
('CHEM 17', 'General Chemistry II', 'baguio', true),
('CS 11', 'Introduction to Computer Science', 'baguio', true),
('MATH 17', 'Algebra and Trigonometry', 'baguio', true),
('PHYS 10', 'Fundamental Physics', 'baguio', true),
('ENG 1', 'College English', 'baguio', true),
('FIL 14', 'Filipino sa Ibat-ibang Disiplina', 'baguio', true),
('COMM 101', 'Communication Arts', 'baguio', true),
('ECON 11', 'Basic Economics', 'baguio', true),
('ARTS 11', 'Introduction to Fine Arts', 'baguio', true),

-- UP Cebu
('BIO 112', 'Elementary Genetics', 'cebu', true),
('BIO 113', 'Molecular Biology and Its Applications', 'cebu', true),
('BIO 114', 'Cell Biology', 'cebu', true),
('CHEM 26.1', 'Analytical Chemistry Laboratory', 'cebu', true),
('CS 11', 'Introduction to Computer Science', 'cebu', true),
('MATH 17', 'Algebra and Trigonometry', 'cebu', true),
('ETHICS 1', 'Ethics and Moral Reasoning in Everyday Life', 'cebu', true),
('KAS 1', 'Kasaysayan ng Pilipinas', 'cebu', true),
('PHILO 30', 'Philosophy of Technology', 'cebu', true),
('GEOG 1', 'Elements of Geography', 'cebu', true),
('PSYCH 101', 'General Psychology', 'cebu', true),
('PSYCH 171', 'Child Psychology', 'cebu', true),
('POLSCI 1', 'Introduction to Political Science', 'cebu', true),

-- UP Mindanao
('AMAT 131', 'Statistical Methods and Experimental Design', 'mindanao', true),
('DS 62', 'Applied Matrix Analysis', 'mindanao', true),
('DS 187', 'Database Management for Data Science', 'mindanao', true),
('CS 11', 'Introduction to Computer Science', 'mindanao', true),
('BIO 11', 'General Biology', 'mindanao', true),
('MATH 17', 'Algebra and Trigonometry', 'mindanao', true),
('ARCH 11', 'Introduction to Architecture', 'mindanao', true),
('COMM 101', 'Communication and Media Arts', 'mindanao', true),
('ANTHRO 1', 'Introduction to Anthropology', 'mindanao', true),
('FOOD 101', 'Introduction to Food Technology', 'mindanao', true),
('AGRI 101', 'Agribusiness Economics', 'mindanao', true),

-- UP Open University
('MMS 100', 'Introduction to Multimedia Studies', 'ou', true),
('MMS 101', 'Introduction to Information Technology', 'ou', true),
('MMS 102', 'Theories in Multimedia', 'ou', true),
('MMS 111', 'Gender and Multimedia', 'ou', true),
('MMS 112', 'Multimedia and Society', 'ou', true),
('EDS 101', 'Philosophy of Education', 'ou', true),
('EDS 102', 'Social Foundations of Education', 'ou', true),
('EDS 103', 'Theories of Learning', 'ou', true),
('EDDE 201', 'Foundations of Distance Education', 'ou', true),
('EDDE 202', 'Learning Theories and Instructional Design', 'ou', true)

ON CONFLICT (code, campus) DO UPDATE SET name = EXCLUDED.name;
