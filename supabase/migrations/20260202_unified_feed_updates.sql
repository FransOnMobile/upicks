-- Drop view first to allow column structural changes
DROP VIEW IF EXISTS public.unified_ratings_feed CASCADE;

CREATE OR REPLACE VIEW public.unified_ratings_feed AS
SELECT
    r.id,
    r.created_at,
    r.overall_rating,
    r.review_text,
    r.helpful_count,
    'professor'::text as rating_type,
    r.professor_id,
    p.campus as campus_filter,
    p.name as title,
    c.code as course_code,
    c.name as course_name,
    -- Detailed Stats
    r.clarity,
    r.fairness,
    r.teaching_quality,
    r.would_take_again,
    r.textbook_used,
    r.mandatory_attendance,
    r.grade_received,
    -- Aggregate Tags
    (
        SELECT array_agg(rt.name)
        FROM rating_tag_associations rta
        JOIN rating_tags rt ON rt.id = rta.tag_id
        WHERE rta.rating_id = r.id
    ) as tags,
    NULL::numeric as facilities_rating,
    NULL::numeric as safety_rating,
    NULL::numeric as location_rating,
    NULL::numeric as student_life_rating
FROM ratings r
JOIN professors p ON r.professor_id = p.id
LEFT JOIN courses c ON r.course_id = c.id

UNION ALL

SELECT
    cr.id,
    cr.created_at,
    cr.overall_rating,
    cr.review_text,
    cr.helpful_count,
    'campus'::text as rating_type,
    NULL::uuid as professor_id,
    cr.campus_id as campus_filter,
    CASE
        WHEN cr.campus_id = 'diliman' THEN 'UP Diliman'
        WHEN cr.campus_id = 'mindanao' THEN 'UP Mindanao'
        ELSE cr.campus_id
    END as title,
    NULL::text as course_code,
    NULL::text as course_name,
    NULL::numeric as clarity,
    NULL::numeric as fairness,
    NULL::numeric as teaching_quality,
    NULL::boolean as would_take_again,
    NULL::boolean as textbook_used,
    NULL::boolean as mandatory_attendance,
    NULL::text as grade_received,
    NULL::text[] as tags,
    cr.facilities_rating,
    cr.safety_rating,
    cr.location_rating,
    cr.student_life_rating
FROM campus_ratings cr;
