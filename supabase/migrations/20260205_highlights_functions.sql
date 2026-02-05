-- Function to get trending professors with time range
CREATE OR REPLACE FUNCTION get_trending_professors(time_range interval DEFAULT '7 days'::interval)
RETURNS TABLE (
  id uuid,
  name text,
  department text, -- Keeping 'department' as key for frontend compatibility, though it maps to 'department' in DB
  rating_count bigint,
  avg_rating numeric,
  campus text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    d.name as department,
    COUNT(r.id) as rating_count,
    ROUND(AVG(r.overall_rating)::numeric, 1) as avg_rating,
    MAX(d.campus) as campus -- explicit campus selection
  FROM
    professors p
  JOIN
    departments d ON p.department_id = d.id
  JOIN
    ratings r ON p.id = r.professor_id
  WHERE
    r.created_at >= (now() - time_range)
  GROUP BY
    p.id, p.name, d.name, d.code
  ORDER BY
    rating_count DESC,
    avg_rating DESC
  LIMIT 3;
END;
$$;

-- Function to get the top rated campus in a time range
CREATE OR REPLACE FUNCTION get_top_campus(time_range interval DEFAULT '7 days'::interval)
RETURNS TABLE (
  campus_id text,
  rating_count bigint,
  avg_rating numeric,
  campus_name text -- Pretty name if needed, or mapped on frontend
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cr.campus_id,
    COUNT(cr.id) as rating_count,
    ROUND(AVG(cr.overall_rating)::numeric, 1) as avg_rating,
    cr.campus_id as campus_name -- Just returning ID for now, frontend maps it
  FROM
    campus_ratings cr
  WHERE
    cr.created_at >= (now() - time_range)
  GROUP BY
    cr.campus_id
  HAVING
    COUNT(cr.id) >= 1
  ORDER BY
    avg_rating DESC,
    rating_count DESC
  LIMIT 1;
END;
$$;

-- Function to get the top helpful comment in a time range
CREATE OR REPLACE FUNCTION get_top_helpful_comment(time_range interval DEFAULT '7 days'::interval)
RETURNS TABLE (
  id uuid,
  professor_name text,
  professor_id uuid,
  user_nickname text,
  review_text text,
  helpful_count integer,
  created_at timestamptz,
  course_code text,
  overall_rating numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    p.name as professor_name,
    p.id as professor_id,
    CASE WHEN r.is_anonymous THEN 'Anonymous Student' ELSE COALESCE(u.nickname, 'Anonymous Student') END as user_nickname,
    r.review_text,
    r.helpful_count,
    r.created_at,
    c.code as course_code,
    r.overall_rating
  FROM
    ratings r
  JOIN
    professors p ON r.professor_id = p.id
  LEFT JOIN
    users u ON r.user_id = u.id
  LEFT JOIN
    courses c ON r.course_id = c.id
  WHERE
    r.created_at >= (now() - time_range)
    AND r.review_text IS NOT NULL
    AND length(r.review_text) > 10
  ORDER BY
    r.helpful_count DESC,
    r.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get the trending department/college
CREATE OR REPLACE FUNCTION get_trending_department(time_range interval DEFAULT '7 days'::interval)
RETURNS TABLE (
  department_id uuid,
  department_name text,
  rating_count bigint,
  avg_rating numeric,
  campus text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    COUNT(r.id) as rating_count,
    ROUND(AVG(r.overall_rating)::numeric, 1) as avg_rating,
    d.campus
  FROM
    departments d
  JOIN
    professors p ON d.id = p.department_id
  JOIN
    ratings r ON p.id = r.professor_id
  WHERE
    r.created_at >= (now() - time_range)
  GROUP BY
    d.id, d.name, d.campus
  ORDER BY
    rating_count DESC,
    avg_rating DESC
  LIMIT 1;
END;
$$;