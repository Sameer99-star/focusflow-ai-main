-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create roadmaps table
CREATE TABLE public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    source_url TEXT,
    daily_limit INTEGER DEFAULT 60,
    start_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on roadmaps
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- Roadmaps policies
CREATE POLICY "Users can view their own roadmaps" 
ON public.roadmaps FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps" 
ON public.roadmaps FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps" 
ON public.roadmaps FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps" 
ON public.roadmaps FOR DELETE 
USING (auth.uid() = user_id);

-- Create roadmap_days table
CREATE TABLE public.roadmap_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on roadmap_days
ALTER TABLE public.roadmap_days ENABLE ROW LEVEL SECURITY;

-- Roadmap days policies (access through roadmap ownership)
CREATE POLICY "Users can view days of their roadmaps" 
ON public.roadmap_days FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.roadmaps 
    WHERE roadmaps.id = roadmap_days.roadmap_id 
    AND roadmaps.user_id = auth.uid()
));

CREATE POLICY "Users can create days for their roadmaps" 
ON public.roadmap_days FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.roadmaps 
    WHERE roadmaps.id = roadmap_days.roadmap_id 
    AND roadmaps.user_id = auth.uid()
));

CREATE POLICY "Users can update days of their roadmaps" 
ON public.roadmap_days FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.roadmaps 
    WHERE roadmaps.id = roadmap_days.roadmap_id 
    AND roadmaps.user_id = auth.uid()
));

CREATE POLICY "Users can delete days of their roadmaps" 
ON public.roadmap_days FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.roadmaps 
    WHERE roadmaps.id = roadmap_days.roadmap_id 
    AND roadmaps.user_id = auth.uid()
));

-- Create sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID NOT NULL REFERENCES public.roadmap_days(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    youtube_video_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies (access through roadmap ownership)
CREATE POLICY "Users can view sessions of their roadmaps" 
ON public.sessions FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.roadmap_days 
    JOIN public.roadmaps ON roadmaps.id = roadmap_days.roadmap_id
    WHERE roadmap_days.id = sessions.day_id 
    AND roadmaps.user_id = auth.uid()
));

CREATE POLICY "Users can create sessions for their roadmaps" 
ON public.sessions FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.roadmap_days 
    JOIN public.roadmaps ON roadmaps.id = roadmap_days.roadmap_id
    WHERE roadmap_days.id = sessions.day_id 
    AND roadmaps.user_id = auth.uid()
));

CREATE POLICY "Users can update sessions of their roadmaps" 
ON public.sessions FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.roadmap_days 
    JOIN public.roadmaps ON roadmaps.id = roadmap_days.roadmap_id
    WHERE roadmap_days.id = sessions.day_id 
    AND roadmaps.user_id = auth.uid()
));

CREATE POLICY "Users can delete sessions of their roadmaps" 
ON public.sessions FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.roadmap_days 
    JOIN public.roadmaps ON roadmaps.id = roadmap_days.roadmap_id
    WHERE roadmap_days.id = sessions.day_id 
    AND roadmaps.user_id = auth.uid()
));

-- Create notification_settings table
CREATE TABLE public.notification_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT false,
    reminder_time TIME DEFAULT '09:00:00',
    reminder_minutes_before INTEGER DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification_settings
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Notification settings policies
CREATE POLICY "Users can view their notification settings" 
ON public.notification_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their notification settings" 
ON public.notification_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notification settings" 
ON public.notification_settings FOR UPDATE 
USING (auth.uid() = user_id);

-- Create scheduled_reminders table
CREATE TABLE public.scheduled_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on scheduled_reminders
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Scheduled reminders policies
CREATE POLICY "Users can view their reminders" 
ON public.scheduled_reminders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their reminders" 
ON public.scheduled_reminders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their reminders" 
ON public.scheduled_reminders FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their reminders" 
ON public.scheduled_reminders FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
    BEFORE UPDATE ON public.roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger function to auto-create profile and notification settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
    
    INSERT INTO public.notification_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();