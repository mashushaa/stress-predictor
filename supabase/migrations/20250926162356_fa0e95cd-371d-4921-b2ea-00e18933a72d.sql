-- Add a separate recommendations column to questionnaire_responses table
ALTER TABLE public.questionnaire_responses 
ADD COLUMN recommendations TEXT;