-- Function to get top 3 professors by rating count in the last 7 days
CREATE OR REPLACE FUNCTION public.get_weekly_top_professors()
RETURNS TABLE (
    id UUID,
    name TEXT,
    department TEXT, -- Now visually "College"
    rating_count BIGINT,
    avg_rating NUMERIC,
    campus TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        d.name as department,
        COUNT(r.id) as rating_count,
        AVG(r.overall_rating) as avg_rating,
        p.campus
    FROM 
        public.professors p
    JOIN 
        public.ratings r ON p.id = r.professor_id
    LEFT JOIN
        public.departments d ON p.department_id = d.id
    WHERE 
        r.created_at >= now() - interval '7 days'
    GROUP BY 
        p.id, p.name, d.name, p.campus
    ORDER BY 
        rating_count DESC,
        avg_rating DESC
    LIMIT 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
