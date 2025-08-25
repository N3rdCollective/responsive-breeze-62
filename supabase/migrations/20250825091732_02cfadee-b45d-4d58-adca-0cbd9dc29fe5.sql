-- Fix remaining security issues

-- 1. Drop and recreate the view without any security properties
DROP VIEW IF EXISTS public.safe_public_profiles;

-- Create a simple, secure view without any special properties
CREATE VIEW public.safe_public_profiles AS
SELECT 
  id,
  username,
  display_name,
  profile_picture,
  bio,
  created_at,
  forum_post_count,
  social_links
FROM public.profiles
WHERE COALESCE(is_public, false) = true;

-- 2. Identify and fix any remaining functions with mutable search paths
-- Let's check if any of our older functions need the search_path fix

-- Update any older profile-related functions that might not have search_path set
CREATE OR REPLACE FUNCTION public.update_profile_forum_post_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.profiles
    SET forum_post_count = forum_post_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    -- Check if user_id exists in profiles before decrementing
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = OLD.user_id) THEN
      UPDATE public.profiles
      SET forum_post_count = GREATEST(0, forum_post_count - 1) -- Ensure count doesn't go below 0
      WHERE id = OLD.user_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL; -- Should not happen
END;
$$;

-- Update audit_profile_changes function if it exists and needs search_path
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  -- Log profile changes
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.log_profile_access_secure(
      NEW.id,
      'profile_updated',
      'Profile data modified',
      ARRAY['updated_at']
    );
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM public.log_profile_access_secure(
      NEW.id,
      'profile_created',
      'New profile created',
      ARRAY['all_fields']
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;