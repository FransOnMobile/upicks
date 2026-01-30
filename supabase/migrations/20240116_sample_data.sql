DO $$
DECLARE
  dept_cs UUID;
  dept_math UUID;
  dept_phys UUID;
  prof1 UUID;
  prof2 UUID;
  prof3 UUID;
  prof4 UUID;
  prof5 UUID;
  course1 UUID;
  course2 UUID;
  course3 UUID;
  course4 UUID;
  tag_clear UUID;
  tag_tough UUID;
  tag_engaging UUID;
  tag_organized UUID;
  tag_helpful UUID;
  rating1 UUID;
  rating2 UUID;
  rating3 UUID;
  rating4 UUID;
  rating5 UUID;
BEGIN
  SELECT id INTO dept_cs FROM departments WHERE code = 'CS';
  SELECT id INTO dept_math FROM departments WHERE code = 'MATH';
  SELECT id INTO dept_phys FROM departments WHERE code = 'PHYS';

  INSERT INTO professors (name, department_id) VALUES
    ('Dr. Maria Santos', dept_cs) RETURNING id INTO prof1;
  INSERT INTO professors (name, department_id) VALUES
    ('Prof. Juan Dela Cruz', dept_cs) RETURNING id INTO prof2;
  INSERT INTO professors (name, department_id) VALUES
    ('Dr. Ana Garcia', dept_math) RETURNING id INTO prof3;
  INSERT INTO professors (name, department_id) VALUES
    ('Prof. Ricardo Reyes', dept_phys) RETURNING id INTO prof4;
  INSERT INTO professors (name, department_id) VALUES
    ('Dr. Elena Rodriguez', dept_math) RETURNING id INTO prof5;

  INSERT INTO courses (code, name, level, department_id) VALUES
    ('CS 101', 'Introduction to Computer Science', 'undergraduate', dept_cs) RETURNING id INTO course1;
  INSERT INTO courses (code, name, level, department_id) VALUES
    ('CS 201', 'Data Structures and Algorithms', 'undergraduate', dept_cs) RETURNING id INTO course2;
  INSERT INTO courses (code, name, level, department_id) VALUES
    ('MATH 101', 'Calculus I', 'undergraduate', dept_math) RETURNING id INTO course3;
  INSERT INTO courses (code, name, level, department_id) VALUES
    ('PHYS 101', 'Physics I', 'undergraduate', dept_phys) RETURNING id INTO course4;

  INSERT INTO professor_courses (professor_id, course_id) VALUES
    (prof1, course1),
    (prof1, course2),
    (prof2, course1),
    (prof3, course3),
    (prof4, course4),
    (prof5, course3);

  SELECT id INTO tag_clear FROM rating_tags WHERE name = 'Clear Lectures';
  SELECT id INTO tag_tough FROM rating_tags WHERE name = 'Tough Grader';
  SELECT id INTO tag_engaging FROM rating_tags WHERE name = 'Engaging';
  SELECT id INTO tag_organized FROM rating_tags WHERE name = 'Organized';
  SELECT id INTO tag_helpful FROM rating_tags WHERE name = 'Helpful Feedback';

  INSERT INTO ratings (professor_id, course_id, teaching_quality, fairness, clarity, review_text, would_take_again, is_anonymous, helpful_count)
  VALUES (prof1, course1, 5, 5, 5, 'Dr. Santos is an excellent professor! Her lectures are very clear and she explains complex concepts in an easy-to-understand way. Highly recommended for anyone taking CS 101.', true, true, 15)
  RETURNING id INTO rating1;

  INSERT INTO ratings (professor_id, course_id, teaching_quality, fairness, clarity, review_text, would_take_again, is_anonymous, helpful_count)
  VALUES (prof1, course2, 4, 4, 5, 'Great professor for data structures. The course is challenging but she provides excellent resources and is always available during office hours.', true, true, 8)
  RETURNING id INTO rating2;

  INSERT INTO ratings (professor_id, course_id, teaching_quality, fairness, clarity, review_text, would_take_again, is_anonymous, helpful_count)
  VALUES (prof2, course1, 3, 4, 3, 'Decent professor. The material is interesting but lectures can be a bit dry. Grading is fair though.', false, true, 3)
  RETURNING id INTO rating3;

  INSERT INTO ratings (professor_id, course_id, teaching_quality, fairness, clarity, review_text, would_take_again, is_anonymous, helpful_count)
  VALUES (prof3, course3, 5, 5, 4, 'Dr. Garcia makes calculus enjoyable! She is patient and really cares about student understanding. Her office hours are super helpful.', true, true, 12)
  RETURNING id INTO rating4;

  INSERT INTO ratings (professor_id, course_id, teaching_quality, fairness, clarity, review_text, would_take_again, is_anonymous, helpful_count)
  VALUES (prof4, course4, 4, 3, 4, 'Prof. Reyes knows his stuff. Physics is tough but he tries his best to help students understand. Exams can be tricky though.', true, true, 5)
  RETURNING id INTO rating5;

  INSERT INTO rating_tag_associations (rating_id, tag_id) VALUES
    (rating1, tag_clear),
    (rating1, tag_engaging),
    (rating1, tag_organized),
    (rating2, tag_clear),
    (rating2, tag_helpful),
    (rating3, tag_organized),
    (rating4, tag_clear),
    (rating4, tag_engaging),
    (rating4, tag_helpful),
    (rating5, tag_tough);

END $$;
