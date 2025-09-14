-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create questionnaire_responses table
CREATE TABLE public.questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anxiety_level INTEGER,
  self_esteem INTEGER,
  mental_health_history INTEGER,
  depression INTEGER,
  headache INTEGER,
  blood_pressure INTEGER,
  sleep_quality INTEGER,
  breathing_problem INTEGER,
  noise_level INTEGER,
  living_conditions INTEGER,
  safety INTEGER,
  basic_needs INTEGER,
  academic_performance INTEGER,
  study_load INTEGER,
  teacher_student_relationship INTEGER,
  future_career_concerns INTEGER,
  social_support INTEGER,
  peer_pressure INTEGER,
  extracurricular_activities INTEGER,
  bullying INTEGER,
  stress_level INTEGER,
  probabilities JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on questionnaire_responses
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for questionnaire_responses
CREATE POLICY "Users can view their own responses" 
ON public.questionnaire_responses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" 
ON public.questionnaire_responses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses" 
ON public.questionnaire_responses 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questionnaire_responses_updated_at
BEFORE UPDATE ON public.questionnaire_responses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();