
-- Drop and recreate the get_conversations_with_unread_status function with properly qualified table names
DROP FUNCTION IF EXISTS public.get_conversations_with_unread_status(uuid);

CREATE OR REPLACE FUNCTION public.get_conversations_with_unread_status(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(conv_data.conversation_json), '[]'::json)
    FROM (
      SELECT
        json_build_object(
          'id', c.id,
          'participant1_id', c.participant1_id,
          'participant2_id', c.participant2_id,
          'last_message_timestamp', c.last_message_timestamp,
          'otherParticipantProfile', CASE
            WHEN c.participant1_id = p_user_id THEN json_build_object(
                'id', p2.id, 'username', p2.username, 'display_name', p2.display_name, 'avatar_url', p2.profile_picture
            )
            ELSE json_build_object(
                'id', p1.id, 'username', p1.username, 'display_name', p1.display_name, 'avatar_url', p1.profile_picture
            )
          END,
          'lastMessage', (
            SELECT json_build_object(
              'content', lm.content,
              'sender_id', lm.sender_id,
              'timestamp', lm.timestamp,
              'sender_display_name', COALESCE(
                                        sender_profile.display_name, 
                                        sender_profile.username, 
                                        (CASE WHEN lm.sender_id = p_user_id THEN 'You' 
                                              ELSE (
                                                CASE 
                                                  WHEN c.participant1_id = p_user_id THEN COALESCE(p2.display_name, p2.username, 'User')
                                                  ELSE COALESCE(p1.display_name, p1.username, 'User')
                                                END
                                              )
                                        END)
                                     )
            )
            FROM public.messages lm
            LEFT JOIN public.profiles sender_profile ON lm.sender_id = sender_profile.id
            WHERE lm.conversation_id = c.id
            ORDER BY lm.timestamp DESC
            LIMIT 1
          ),
          'unread_count', (
            SELECT COUNT(*)::INT
            FROM public.messages m
            WHERE m.conversation_id = c.id
              AND m.sender_id != p_user_id
              AND m.timestamp > COALESCE(
                (SELECT ucrs.last_read_timestamp
                 FROM public.user_conversation_read_status ucrs
                 WHERE ucrs.user_id = p_user_id AND ucrs.conversation_id = c.id),
                '1970-01-01T00:00:00Z'::timestamptz 
              )
          )
        ) as conversation_json
      FROM
        public.conversations c
        LEFT JOIN public.profiles p1 ON c.participant1_id = p1.id
        LEFT JOIN public.profiles p2 ON c.participant2_id = p2.id
      WHERE
        c.participant1_id = p_user_id OR c.participant2_id = p_user_id
      ORDER BY
        c.last_message_timestamp DESC
    ) AS conv_data
  );
END;
$function$
