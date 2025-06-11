
-- First, let's update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    -- Use username from metadata, fallback to a generated one from email if not provided
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    -- Use display_name from metadata, fallback to full name, then username, then 'New User'
    COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        TRIM(NULLIF(CONCAT(NEW.raw_user_meta_data->>'first_name', ' ', NEW.raw_user_meta_data->>'last_name'), ' ')), -- Handle case where both are null/empty
        NEW.raw_user_meta_data->>'username', -- Use username if display_name and full name are not available
        split_part(NEW.email, '@', 1), -- Fallback to email prefix
        'New User' -- Final fallback
    ),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email, -- Add the email from auth.users
    -- Use user_role from metadata, fallback to 'user'
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'user')
  )
  -- If a profile record somehow already exists (e.g. race condition or manual insert), do nothing to prevent error.
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create a function to sync existing users' emails from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_user_emails()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update profiles table with emails from auth.users for users who don't have emails set
  UPDATE public.profiles 
  SET email = auth_users.email,
      updated_at = NOW()
  FROM auth.users AS auth_users
  WHERE profiles.id = auth_users.id 
    AND (profiles.email IS NULL OR profiles.email = '');
  
  -- Get the number of updated rows
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  -- Log how many records were updated
  RAISE NOTICE 'Email sync completed. Updated % profile records.', updated_count;
  
  RETURN updated_count;
END;
$$;

-- Run the sync function to populate existing users
SELECT public.sync_user_emails();

-- Clean up the sync function since it's only needed once
DROP FUNCTION public.sync_user_emails();
