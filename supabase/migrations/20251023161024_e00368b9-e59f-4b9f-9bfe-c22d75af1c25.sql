-- Fix the handle_new_user function to match the actual profiles table structure
-- The profiles table only has: id, email, created_at, updated_at

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (
    new.id,
    new.email
  );
  RETURN new;
END;
$function$;