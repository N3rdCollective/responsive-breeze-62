-- Fix linter warning: ensure immutable search_path for SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.create_forum_topic_with_post(
  p_category_id uuid,
  p_title text,
  p_slug text,
  p_content text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_topic_id UUID;
  v_post_id UUID;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Insert topic
  INSERT INTO forum_topics (
    category_id, 
    user_id, 
    title, 
    slug, 
    last_post_at, 
    last_post_user_id
  ) VALUES (
    p_category_id,
    v_user_id,
    p_title,
    p_slug,
    NOW(),
    v_user_id
  ) RETURNING id INTO v_topic_id;

  -- Insert post
  INSERT INTO forum_posts (
    topic_id,
    user_id,
    content
  ) VALUES (
    v_topic_id,
    v_user_id,
    p_content
  ) RETURNING id INTO v_post_id;

  -- Return the IDs
  RETURN json_build_object(
    'topic_id', v_topic_id,
    'post_id', v_post_id
  );
END;
$function$;