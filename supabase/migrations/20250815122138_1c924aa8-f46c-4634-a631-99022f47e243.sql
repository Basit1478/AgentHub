-- Update profiles table to track conversation usage
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS conversations_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_reset_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create admin users table for Clerk integration
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users
CREATE POLICY "Admin users can manage admin_users" ON public.admin_users
FOR ALL
USING (true)
WITH CHECK (true);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on survey responses
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for survey responses
CREATE POLICY "Users can insert their own survey responses" ON public.survey_responses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own survey responses" ON public.survey_responses
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to reset monthly conversation counts
CREATE OR REPLACE FUNCTION public.reset_monthly_conversations()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET conversations_used = 0, last_reset_date = CURRENT_DATE
  WHERE last_reset_date < DATE_TRUNC('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check and increment conversation count
CREATE OR REPLACE FUNCTION public.check_and_increment_conversation(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
  user_profile RECORD;
  can_send BOOLEAN := false;
  message TEXT := '';
BEGIN
  -- First reset conversations if it's a new month
  PERFORM public.reset_monthly_conversations();
  
  -- Get user profile with current subscription
  SELECT p.*, s.plan_name, s.status
  INTO user_profile
  FROM public.profiles p
  LEFT JOIN public.subscriptions s ON p.user_id = s.user_id AND s.status = 'active'
  WHERE p.user_id = user_id_param;
  
  -- Check conversation limits based on plan
  IF user_profile.plan = 'free' OR user_profile.plan IS NULL OR user_profile.plan_name IS NULL THEN
    -- Free user - limit to 100 conversations per month
    IF user_profile.conversations_used < 100 THEN
      can_send := true;
      -- Increment conversation count
      UPDATE public.profiles 
      SET conversations_used = conversations_used + 1
      WHERE user_id = user_id_param;
    ELSE
      can_send := false;
      message := 'You have reached your monthly limit of 100 conversations. Upgrade your plan or wait until next month.';
    END IF;
  ELSE
    -- Premium/Enterprise users have unlimited conversations
    can_send := true;
    -- Still increment for tracking purposes
    UPDATE public.profiles 
    SET conversations_used = conversations_used + 1
    WHERE user_id = user_id_param;
  END IF;
  
  RETURN jsonb_build_object(
    'can_send', can_send,
    'message', message,
    'conversations_used', COALESCE(user_profile.conversations_used, 0) + (CASE WHEN can_send THEN 1 ELSE 0 END),
    'plan', COALESCE(user_profile.plan_name, user_profile.plan, 'free')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;