-- Fix incorrect links in existing notifications
UPDATE public.notifications
SET link = '/moderator'
WHERE link = '/admin';

-- Update Trigger Functions to use correct link

-- Trigger Function: New Report
CREATE OR REPLACE FUNCTION public.handle_new_report_notification()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.notify_moderators_fn(
        'mod_alert', 
        'New Report Filed: ' || NEW.reason, 
        '/moderator'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: New Nickname
CREATE OR REPLACE FUNCTION public.handle_new_nickname_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pending' THEN
        PERFORM public.notify_moderators_fn(
            'mod_alert', 
            'New Nickname Pending: ' || NEW.nickname, 
            '/moderator'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: New Professor
CREATE OR REPLACE FUNCTION public.handle_new_professor_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_verified = false THEN
        PERFORM public.notify_moderators_fn(
            'mod_alert', 
            'New Professor Submitted: ' || NEW.name, 
            '/moderator'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
