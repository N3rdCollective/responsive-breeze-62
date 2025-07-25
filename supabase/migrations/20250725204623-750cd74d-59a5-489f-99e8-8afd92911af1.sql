-- Fix database function security by adding SET search_path TO '' to all functions that don't have it

-- 1. Fix get_user_role_simple function
CREATE OR REPLACE FUNCTION public.get_user_role_simple(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT role FROM public.profiles WHERE id = user_id LIMIT 1;
$function$;

-- 2. Fix is_user_staff_simple function
CREATE OR REPLACE FUNCTION public.is_user_staff_simple(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.staff WHERE id = user_id);
$function$;

-- 3. Fix check_user_role function
CREATE OR REPLACE FUNCTION public.check_user_role(required_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = required_role
  );
$function$;

-- 4. Fix is_user_staff_member function
CREATE OR REPLACE FUNCTION public.is_user_staff_member(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  -- Direct query without RLS to avoid any recursion
  SELECT EXISTS (
    SELECT 1 FROM public.staff 
    WHERE id = user_id
  );
$function$;

-- 5. Fix get_user_staff_role function
CREATE OR REPLACE FUNCTION public.get_user_staff_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  -- Direct query without RLS to avoid any recursion
  SELECT role FROM public.staff 
  WHERE id = user_id
  LIMIT 1;
$function$;

-- 6. Fix check_rate_limit function
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_email text, p_attempt_type text, p_time_window interval DEFAULT '00:15:00'::interval, p_max_attempts integer DEFAULT 5)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  attempt_count integer;
BEGIN
  SELECT COUNT(*) INTO attempt_count
  FROM public.auth_attempts
  WHERE email = p_email
    AND attempt_type = p_attempt_type
    AND attempted_at > now() - p_time_window;
    
  RETURN attempt_count < p_max_attempts;
END;
$function$;