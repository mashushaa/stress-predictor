-- Update questionnaire_responses table to include all columns
ALTER TABLE public.questionnaire_responses
ADD COLUMN IF NOT EXISTS mental_health_history INTEGER,
ADD COLUMN IF NOT EXISTS depression INTEGER,
ADD COLUMN IF NOT EXISTS headache INTEGER,
ADD COLUMN IF NOT EXISTS blood_pressure INTEGER,
ADD COLUMN IF NOT EXISTS breathing_problem INTEGER,
ADD COLUMN IF NOT EXISTS noise_level INTEGER,
ADD COLUMN IF NOT EXISTS living_conditions INTEGER,
ADD COLUMN IF NOT EXISTS safety INTEGER,
ADD COLUMN IF NOT EXISTS basic_needs INTEGER,
ADD COLUMN IF NOT EXISTS academic_performance INTEGER,
ADD COLUMN IF NOT EXISTS teacher_student_relationship INTEGER,
ADD COLUMN IF NOT EXISTS future_career_concerns INTEGER,
ADD COLUMN IF NOT EXISTS peer_pressure INTEGER,
ADD COLUMN IF NOT EXISTS extracurricular_activities INTEGER,
ADD COLUMN IF NOT EXISTS bullying INTEGER,
ADD COLUMN IF NOT EXISTS stress_level INTEGER;

-- Create profiles table for registered users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for updating profiles timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance on profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);