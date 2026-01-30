-- Add campus column to departments
ALTER TABLE public.departments 
ADD COLUMN IF NOT EXISTS campus text;

-- Drop old global unique constraints
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_code_key;

-- Add new composite unique constraints (scoped to campus)
-- We name them explicitly to allow future modifications
ALTER TABLE public.departments ADD CONSTRAINT departments_name_campus_key UNIQUE (name, campus);
ALTER TABLE public.departments ADD CONSTRAINT departments_code_campus_key UNIQUE (code, campus);

-- Clear existing generic departments
DELETE FROM public.departments;

-- Seed Data: Colleges per Campus
INSERT INTO public.departments (name, code, campus) VALUES
  -- UP Mindanao
  ('College of Humanities and Social Sciences', 'CHSS', 'mindanao'),
  ('College of Science and Mathematics', 'CSM', 'mindanao'),
  ('School of Management', 'SOM', 'mindanao'),

  -- UP Diliman (Selected Major Colleges)
  ('College of Science', 'CS', 'diliman'),
  ('College of Social Sciences and Philosophy', 'CSSP', 'diliman'),
  ('College of Arts and Letters', 'CAL', 'diliman'),
  ('College of Engineering', 'ENGG', 'diliman'),
  ('College of Business Administration', 'CBA', 'diliman'),
  ('School of Economics', 'SE', 'diliman'),
  ('College of Fine Arts', 'CFA', 'diliman'),
  ('College of Human Kinetics', 'CHK', 'diliman'),
  ('College of Law', 'LAW', 'diliman'),

  -- UP Los Baños
  ('College of Agriculture and Food Science', 'CAFS', 'los-banos'),
  ('College of Arts and Sciences', 'CAS-LB', 'los-banos'),
  ('College of Engineering and Agro-Industrial Technology', 'CEAT', 'los-banos'),
  ('College of Forestry and Natural Resources', 'CFNR', 'los-banos'),
  ('College of Human Ecology', 'CHE', 'los-banos'),
  ('College of Veterinary Medicine', 'CVM', 'los-banos'),

  -- UP Manila
  ('College of Medicine', 'CM', 'manila'),
  ('College of Nursing', 'CN', 'manila'),
  ('College of Pharmacy', 'CP', 'manila'),
  ('College of Dentistry', 'CD', 'manila'),
  ('College of Public Health', 'CPH', 'manila'),
  ('College of Arts and Sciences', 'CAS-M', 'manila'),

  -- UP Visayas
  ('College of Arts and Sciences', 'CAS-V', 'visayas'),
  ('College of Fisheries and Ocean Sciences', 'CFOS', 'visayas'),
  ('School of Technology', 'SOTECH', 'visayas'),
  ('College of Management', 'CM-V', 'visayas'),

  -- UP Baguio
  ('College of Science', 'CS-B', 'baguio'),
  ('College of Social Sciences', 'CSS', 'baguio'),
  ('College of Arts and Communication', 'CAC', 'baguio'),

  -- UP Cebu
  ('College of Science', 'CS-C', 'cebu'),
  ('College of Communication, Art, and Design', 'CCAD', 'cebu'),
  ('School of Management', 'SoM-C', 'cebu'),
  ('College of Social Sciences', 'CSS-C', 'cebu'),

  -- UP Open University
  ('Faculty of Information and Communication Studies', 'FICS', 'ou'),
  ('Faculty of Education', 'FEd', 'ou'),
  ('Faculty of Management and Development Studies', 'FMDS', 'ou')
ON CONFLICT DO NOTHING;
