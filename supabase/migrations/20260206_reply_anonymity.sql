-- Add is_anonymous column to reply tables
ALTER TABLE public.rating_replies 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

ALTER TABLE public.campus_rating_replies 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false;

-- Update notification logic to handle anonymity
-- We need to update the trigger functions to check is_anonymous
-- However, the existing trigger just sends "Someone", OR "Nickname". 
-- If anonymous, we should just ensure it says "Someone".

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
    
    -- Get replier nickname IF NOT ANONYMOUS
    IF NEW.is_anonymous THEN
        replier_nickname := 'Someone';
    ELSE
        SELECT nickname INTO replier_nickname FROM public.users WHERE id = NEW.user_id;
    END IF;
    
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
    
     -- Get replier nickname IF NOT ANONYMOUS
    IF NEW.is_anonymous THEN
        replier_nickname := 'Someone';
    ELSE
        SELECT nickname INTO replier_nickname FROM public.users WHERE id = NEW.user_id;
    END IF;
    
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
