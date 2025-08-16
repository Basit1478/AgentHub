-- Example: Creating a new table with common patterns
-- This shows the proper syntax for CREATE TABLE commands

-- Create a voice_settings table for storing user voice preferences
CREATE TABLE public.voice_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferred_voice TEXT DEFAULT 'en-US',
  voice_speed DECIMAL(3,1) DEFAULT 0.9 CHECK (voice_speed >= 0.1 AND voice_speed <= 2.0),
  voice_pitch DECIMAL(3,1) DEFAULT 1.0 CHECK (voice_pitch >= 0.1 AND voice_pitch <= 2.0),
  auto_speak BOOLEAN DEFAULT false,
  language_code TEXT DEFAULT 'en-US',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own voice settings" 
ON public.voice_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice settings" 
ON public.voice_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice settings" 
ON public.voice_settings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice settings" 
ON public.voice_settings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_voice_settings_updated_at
BEFORE UPDATE ON public.voice_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to ensure one setting per user
ALTER TABLE public.voice_settings 
ADD CONSTRAINT unique_user_voice_settings UNIQUE (user_id);