  -- 1. Add nickname column to users table
  ALTER TABLE users ADD COLUMN IF NOT EXISTS nickname TEXT;

  -- 2. Add New Rating Tags (Funny, Negative, Catchy)
  INSERT INTO rating_tags (name, category) VALUES
      ('Walking Meme', 'funny'),
      ('Fashion Icon', 'funny'),
      ('Ghoster', 'negative'),
      ('Terror', 'negative'),
      ('Grade Deflation', 'negative'),
      ('Plot Twist Exams', 'funny'),
      ('Sleep Inducing', 'negative'),
      ('Healing Inner Child', 'positive'),
      ('Monologue Master', 'neutral'),
      ('Main Character Energy', 'funny')
  ON CONFLICT (name) DO NOTHING;

  -- 3. Robust Upvoting Functions
  -- Ensure helpful_count never goes below 0

  CREATE OR REPLACE FUNCTION increment_helpful_count(row_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    UPDATE ratings
    SET helpful_count = helpful_count + 1
    WHERE id = row_id;
  END;
  $$;

  CREATE OR REPLACE FUNCTION decrement_helpful_count(row_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    UPDATE ratings
    SET helpful_count = GREATEST(0, helpful_count - 1)
    WHERE id = row_id;
  END;
  $$;

  -- Grant execute permissions
  GRANT EXECUTE ON FUNCTION increment_helpful_count TO authenticated, anon, service_role;
  GRANT EXECUTE ON FUNCTION decrement_helpful_count TO authenticated, anon, service_role;

  -- 4. Campus Rating Votes
  CREATE TABLE IF NOT EXISTS campus_rating_votes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id uuid REFERENCES campus_ratings(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(rating_id, user_id)
  );

  ALTER TABLE campus_ratings ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

  CREATE OR REPLACE FUNCTION increment_campus_helpful_count(row_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    UPDATE campus_ratings
    SET helpful_count = helpful_count + 1
    WHERE id = row_id;
  END;
  $$;

  CREATE OR REPLACE FUNCTION decrement_campus_helpful_count(row_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    UPDATE campus_ratings
    SET helpful_count = GREATEST(0, helpful_count - 1)
    WHERE id = row_id;
  END;
  $$;

  GRANT EXECUTE ON FUNCTION increment_campus_helpful_count TO authenticated, anon, service_role;
  GRANT EXECUTE ON FUNCTION decrement_campus_helpful_count TO authenticated, anon, service_role;
  ALTER TABLE campus_rating_votes ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "Users can vote once" ON campus_rating_votes;
  CREATE POLICY "Users can vote once" ON campus_rating_votes
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can see votes" ON campus_rating_votes;
  CREATE POLICY "Users can see votes" ON campus_rating_votes
    FOR SELECT TO authenticated, anon
    USING (true);

  DROP POLICY IF EXISTS "Users can delete own votes" ON campus_rating_votes;
  CREATE POLICY "Users can delete own votes" ON campus_rating_votes
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

