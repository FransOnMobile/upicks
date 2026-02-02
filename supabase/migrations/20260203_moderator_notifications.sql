-- Function to notify all moderators
CREATE OR REPLACE FUNCTION public.notify_moderators_fn(
    p_type TEXT, 
    p_message TEXT, 
    p_link TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.notifications (user_id, type, message, link, is_read)
    SELECT id, p_type, p_message, p_link, false
    FROM public.users
    WHERE role IN ('moderator', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger Function: New Report
CREATE OR REPLACE FUNCTION public.handle_new_report_notification()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM public.notify_moderators_fn(
        'mod_alert', 
        'New Report Filed: ' || NEW.reason, 
        '/admin'
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
            '/admin' -- or specific tab link if available
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
            '/admin'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Triggers

-- Reports
DROP TRIGGER IF EXISTS on_new_report_notify ON public.reports;
CREATE TRIGGER on_new_report_notify
    AFTER INSERT ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_report_notification();

-- Nicknames
DROP TRIGGER IF EXISTS on_new_nickname_notify ON public.professor_nicknames;
CREATE TRIGGER on_new_nickname_notify
    AFTER INSERT ON public.professor_nicknames
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_nickname_notification();

-- Professors
DROP TRIGGER IF EXISTS on_new_professor_notify ON public.professors;
CREATE TRIGGER on_new_professor_notify
    AFTER INSERT ON public.professors
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_professor_notification();
