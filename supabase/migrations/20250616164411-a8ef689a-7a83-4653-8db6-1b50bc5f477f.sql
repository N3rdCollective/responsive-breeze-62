
-- Create the forum topic with post function to handle atomic creation
CREATE OR REPLACE FUNCTION create_forum_topic_with_post(
  p_category_id UUID,
  p_title TEXT,
  p_slug TEXT,
  p_content TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;
