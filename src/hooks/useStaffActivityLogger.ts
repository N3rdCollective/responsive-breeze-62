
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type EntityType = 'post' | 'staff' | 'settings' | 'video' | 'sponsor' | 'personality' | 'show' | 'artist';
type ActionType = 
  | 'login' 
  | 'logout'
  | 'create_post' 
  | 'update_post' 
  | 'delete_post'
  | 'publish_post'
  | 'unpublish_post'
  | 'create_staff'
  | 'update_staff'
  | 'delete_staff'
  | 'approve_staff'
  | 'reject_staff'
  | 'update_settings'
  | 'create_video'
  | 'update_video'
  | 'delete_video'
  | 'create_sponsor'
  | 'update_sponsor'
  | 'delete_sponsor'
  | 'create_personality'
  | 'update_personality'
  | 'delete_personality'
  | 'create_show'
  | 'update_show'
  | 'delete_show'
  | 'create_artist'
  | 'update_artist'
  | 'delete_artist'
  | string;

export const useStaffActivityLogger = () => {
  const logActivity = useCallback(async (
    actionType: ActionType, 
    description: string, 
    entityType?: EntityType,
    entityId?: string,
    details?: any
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;
      
      const { data, error } = await supabase.rpc("create_activity_log", {
        p_staff_id: session.user.id,
        p_action_type: actionType,
        p_description: description,
        p_entity_type: entityType || null,
        p_entity_id: entityId || null,
        p_details: details ? JSON.stringify(details) : null
      });

      if (error) {
        console.error("Error logging activity:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Failed to log staff activity:", error);
      return null;
    }
  }, []);
  
  return { logActivity };
};

export default useStaffActivityLogger;
