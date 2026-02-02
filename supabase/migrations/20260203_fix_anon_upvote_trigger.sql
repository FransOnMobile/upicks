-- Fix Trigger for Upvotes (Professor Ratings) to handle anonymous (NULL) upvoters
CREATE OR REPLACE FUNCTION public.handle_new_rating_upvote()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
    v_message TEXT;
    v_link TEXT;
BEGIN
    -- Get the author of the rating
    SELECT user_id INTO target_user_id FROM public.ratings WHERE id = NEW.rating_id;

    -- If author exists and is NOT the upvoter (Handle NULLs with IS DISTINCT FROM)
    -- NEW.user_id is NULL for anonymous votes, so != would return NULL (false).
    IF target_user_id IS NOT NULL AND target_user_id IS DISTINCT FROM NEW.user_id THEN
        v_message := 'Someone found your professor review helpful!';
        v_link := '/rate'; 
        
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (target_user_id, 'upvote', v_message, v_link);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix Trigger for Upvotes (Campus Ratings) to handle anonymous (NULL) upvoters
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
    IF target_user_id IS NOT NULL AND target_user_id IS DISTINCT FROM NEW.user_id THEN
        v_message := 'Someone found your campus review helpful!';
        v_link := '/rate/campus/' || (SELECT campus_id FROM public.campus_ratings WHERE id = NEW.rating_id);
        
        INSERT INTO public.notifications (user_id, type, message, link)
        VALUES (target_user_id, 'upvote', v_message, v_link);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
