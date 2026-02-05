-- Migration: Review Replies System
-- Adds tables for replies to professor and campus reviews with notification triggers

-- 1. Update notifications type constraint to include 'reply'
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('upvote', 'report_update', 'mod_alert', 'system', 'reply'));

-- 2. Create rating_replies table (for professor reviews)
CREATE TABLE IF NOT EXISTS public.rating_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID REFERENCES public.ratings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 500 AND char_length(content) >= 1),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Enforce max 3 replies per user per review
    CONSTRAINT unique_user_reply_limit UNIQUE (rating_id, user_id, created_at)
);

-- 3. Create campus_rating_replies table (for campus reviews)
CREATE TABLE IF NOT EXISTS public.campus_rating_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rating_id UUID REFERENCES public.campus_ratings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (char_length(content) <= 500 AND char_length(content) >= 1),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.rating_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_rating_replies ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for rating_replies
CREATE POLICY "Anyone can read replies" ON public.rating_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert replies" ON public.rating_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies within 24h" ON public.rating_replies
    FOR DELETE USING (
        auth.uid() = user_id 
        AND created_at > (now() - interval '24 hours')
    );

-- 6. RLS Policies for campus_rating_replies
CREATE POLICY "Anyone can read campus replies" ON public.campus_rating_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert campus replies" ON public.campus_rating_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campus replies within 24h" ON public.campus_rating_replies
    FOR DELETE USING (
        auth.uid() = user_id 
        AND created_at > (now() - interval '24 hours')
    );

-- 7. Function to check reply limit (max 3 per user per review)
CREATE OR REPLACE FUNCTION public.check_reply_limit()
RETURNS TRIGGER AS $$
DECLARE
    reply_count INTEGER;
BEGIN
    -- Count existing replies by this user on this rating
    SELECT COUNT(*) INTO reply_count
    FROM public.rating_replies
    WHERE rating_id = NEW.rating_id AND user_id = NEW.user_id;
    
    IF reply_count >= 3 THEN
        RAISE EXCEPTION 'You can only post up to 3 replies per review';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.check_campus_reply_limit()
RETURNS TRIGGER AS $$
DECLARE
    reply_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO reply_count
    FROM public.campus_rating_replies
    WHERE rating_id = NEW.rating_id AND user_id = NEW.user_id;
    
    IF reply_count >= 3 THEN
        RAISE EXCEPTION 'You can only post up to 3 replies per review';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Triggers for reply limit
DROP TRIGGER IF EXISTS enforce_reply_limit ON public.rating_replies;
CREATE TRIGGER enforce_reply_limit
    BEFORE INSERT ON public.rating_replies
    FOR EACH ROW EXECUTE FUNCTION public.check_reply_limit();

DROP TRIGGER IF EXISTS enforce_campus_reply_limit ON public.campus_rating_replies;
CREATE TRIGGER enforce_campus_reply_limit
    BEFORE INSERT ON public.campus_rating_replies
    FOR EACH ROW EXECUTE FUNCTION public.check_campus_reply_limit();

-- 9. Notification trigger for professor review replies
CREATE OR REPLACE FUNCTION public.handle_new_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    prof_id UUID;
    v_message TEXT;
    v_link TEXT;
    replier_nickname TEXT;
BEGIN
    -- Get the author of the rating and the professor_id
    SELECT r.user_id, r.professor_id INTO target_user_id, prof_id 
    FROM public.ratings r WHERE r.id = NEW.rating_id;
    
    -- Get replier nickname
    SELECT nickname INTO replier_nickname FROM public.users WHERE id = NEW.user_id;
    
    -- If author exists and is NOT the replier
    IF target_user_id IS NOT NULL AND target_user_id != NEW.user_id THEN
        v_message := COALESCE(replier_nickname, 'Someone') || ' replied to your professor review!';
        v_link := '/rate/professor/' || prof_id || '?reviewId=' || NEW.rating_id;
        
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (target_user_id, 'reply', v_message, v_link);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Notification trigger for campus review replies
CREATE OR REPLACE FUNCTION public.handle_new_campus_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    campus_id_val TEXT;
    v_message TEXT;
    v_link TEXT;
    replier_nickname TEXT;
BEGIN
    -- Get the author of the rating and the campus_id
    SELECT cr.user_id, cr.campus_id INTO target_user_id, campus_id_val 
    FROM public.campus_ratings cr WHERE cr.id = NEW.rating_id;
    
    -- Get replier nickname
    SELECT nickname INTO replier_nickname FROM public.users WHERE id = NEW.user_id;
    
    -- If author exists and is NOT the replier
    IF target_user_id IS NOT NULL AND target_user_id != NEW.user_id THEN
        v_message := COALESCE(replier_nickname, 'Someone') || ' replied to your campus review!';
        v_link := '/rate/campus/' || campus_id_val || '?reviewId=' || NEW.rating_id;
        
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (target_user_id, 'reply', v_message, v_link);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create notification triggers
DROP TRIGGER IF EXISTS on_prof_review_reply ON public.rating_replies;
CREATE TRIGGER on_prof_review_reply
    AFTER INSERT ON public.rating_replies
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_reply_notification();

DROP TRIGGER IF EXISTS on_campus_review_reply ON public.campus_rating_replies;
CREATE TRIGGER on_campus_review_reply
    AFTER INSERT ON public.campus_rating_replies
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_campus_reply_notification();

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rating_replies_rating_id ON public.rating_replies(rating_id);
CREATE INDEX IF NOT EXISTS idx_rating_replies_user_id ON public.rating_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_campus_rating_replies_rating_id ON public.campus_rating_replies(rating_id);
CREATE INDEX IF NOT EXISTS idx_campus_rating_replies_user_id ON public.campus_rating_replies(user_id);
