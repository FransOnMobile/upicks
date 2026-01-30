CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('undergraduate', 'graduate')),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professor_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID REFERENCES public.professors(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professor_id, course_id)
);

CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.professors(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  teaching_quality INTEGER NOT NULL CHECK (teaching_quality >= 1 AND teaching_quality <= 5),
  fairness INTEGER NOT NULL CHECK (fairness >= 1 AND fairness <= 5),
  clarity INTEGER NOT NULL CHECK (clarity >= 1 AND clarity <= 5),
  overall_rating DECIMAL(2,1) GENERATED ALWAYS AS ((teaching_quality + fairness + clarity)::decimal / 3) STORED,
  review_text TEXT,
  would_take_again BOOLEAN,
  is_anonymous BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rating_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rating_tag_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID REFERENCES public.ratings(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.rating_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rating_id, tag_id)
);

CREATE TABLE IF NOT EXISTS public.rating_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID REFERENCES public.ratings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rating_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.rating_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_id UUID REFERENCES public.ratings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professors_department ON public.professors(department_id);
CREATE INDEX IF NOT EXISTS idx_ratings_professor ON public.ratings(professor_id);
CREATE INDEX IF NOT EXISTS idx_ratings_course ON public.ratings(course_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON public.ratings(created_at DESC);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_tag_associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read departments" ON public.departments;
CREATE POLICY "Public read departments" ON public.departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read professors" ON public.professors;
CREATE POLICY "Public read professors" ON public.professors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read courses" ON public.courses;
CREATE POLICY "Public read courses" ON public.courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read professor_courses" ON public.professor_courses;
CREATE POLICY "Public read professor_courses" ON public.professor_courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read ratings" ON public.ratings;
CREATE POLICY "Public read ratings" ON public.ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users create ratings" ON public.ratings;
CREATE POLICY "Authenticated users create ratings" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own ratings" ON public.ratings;
CREATE POLICY "Users update own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read tags" ON public.rating_tags;
CREATE POLICY "Public read tags" ON public.rating_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read tag associations" ON public.rating_tag_associations;
CREATE POLICY "Public read tag associations" ON public.rating_tag_associations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users vote" ON public.rating_helpful_votes;
CREATE POLICY "Authenticated users vote" ON public.rating_helpful_votes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users flag" ON public.rating_flags;
CREATE POLICY "Authenticated users flag" ON public.rating_flags FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.departments REPLICA IDENTITY FULL;
ALTER TABLE public.professors REPLICA IDENTITY FULL;
ALTER TABLE public.courses REPLICA IDENTITY FULL;
ALTER TABLE public.professor_courses REPLICA IDENTITY FULL;
ALTER TABLE public.ratings REPLICA IDENTITY FULL;
ALTER TABLE public.rating_tags REPLICA IDENTITY FULL;
ALTER TABLE public.rating_tag_associations REPLICA IDENTITY FULL;
ALTER TABLE public.rating_helpful_votes REPLICA IDENTITY FULL;

INSERT INTO public.rating_tags (name, category) VALUES
  ('Clear Lectures', 'teaching'),
  ('Tough Grader', 'grading'),
  ('Accessible', 'availability'),
  ('Engaging', 'teaching'),
  ('Fair Exams', 'grading'),
  ('Helpful Feedback', 'feedback'),
  ('Inspirational', 'personality'),
  ('Organized', 'teaching'),
  ('Responsive', 'availability'),
  ('Heavy Workload', 'workload'),
  ('Light Workload', 'workload'),
  ('Attendance Matters', 'policy'),
  ('Flexible Deadlines', 'policy')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.departments (name, code) VALUES
  ('Computer Science', 'CS'),
  ('Mathematics', 'MATH'),
  ('Physics', 'PHYS'),
  ('Chemistry', 'CHEM'),
  ('Biology', 'BIO'),
  ('English', 'ENG'),
  ('History', 'HIST'),
  ('Psychology', 'PSYCH'),
  ('Economics', 'ECON'),
  ('Political Science', 'POLSCI')
ON CONFLICT (name) DO NOTHING;
