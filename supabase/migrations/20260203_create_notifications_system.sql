-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('upvote', 'report_update', 'mod_alert', 'system')),
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users see their own
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Start with a separate policy for updates (marking as read)
CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- System/Triggers inserts (usually bypassed if using service role, but for client-side we prevent manual inserts generally)
-- Only service_role or triggers should insert most notifications.

-- Trigger for Upvotes (Professor Ratings)
CREATE OR REPLACE FUNCTION public.handle_new_rating_upvote()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    v_message TEXT;
    v_link TEXT;
BEGIN
    -- Get the author of the rating
    SELECT user_id INTO target_user_id FROM public.ratings WHERE id = NEW.rating_id;

    -- If author exists and is NOT the upvoter
    IF target_user_id IS NOT NULL AND target_user_id != NEW.user_id THEN
        v_message := 'Someone found your professor review helpful!';
        v_link := '/rate'; -- Could be specific link if we had separate page for rating or anchor
        
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (target_user_id, 'upvote', v_message, v_link);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Upvotes (Campus Ratings)
CREATE OR REPLACE FUNCTION public.handle_new_campus_upvote()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    v_message TEXT;
    v_link TEXT;
BEGIN
    -- Get the author of the rating
    SELECT user_id INTO target_user_id FROM public.campus_ratings WHERE id = NEW.rating_id;

    -- If author exists and is NOT the upvoter
    IF target_user_id IS NOT NULL AND target_user_id != NEW.user_id THEN
        v_message := 'Someone found your campus review helpful!';
        v_link := '/rate/campus/' || (SELECT campus_id FROM public.campus_ratings WHERE id = NEW.rating_id);
        
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (target_user_id, 'upvote', v_message, v_link);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers (using existing tables `rating_helpful_votes` and `campus_rating_votes`)
DROP TRIGGER IF EXISTS on_prof_rating_upvote ON public.rating_helpful_votes;
CREATE TRIGGER on_prof_rating_upvote
    AFTER INSERT ON public.rating_helpful_votes
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_rating_upvote();

DROP TRIGGER IF EXISTS on_campus_rating_upvote ON public.campus_rating_votes;
CREATE TRIGGER on_campus_rating_upvote
    AFTER INSERT ON public.campus_rating_votes
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_campus_upvote();

-- Note: Report updates and mod alerts might be handled via application logic or further triggers if statuses change via SQL. 
-- For now, upvotes are the most "trigger-based" event. Modules can insert directly too.
