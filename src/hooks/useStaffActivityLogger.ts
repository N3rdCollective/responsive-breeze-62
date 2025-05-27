
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type EntityType = 
  | 'post' 
  | 'staff' 
  | 'settings' 
  | 'video' 
  | 'sponsor' 
  | 'personality' 
  | 'show' 
  | 'artist' 
  | 'forum_category' 
  | 'forum_topic'
  | 'user' // Added 'user'
  | 'content_report' // Added 'content_report'
  | 'homepage_content'; // Added for homepage text content

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
  | 'update_homepage_content' // Added for homepage text content
  | 'update_homepage_settings' // Added for homepage section visibility
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
  | 'create_forum_category'
  | 'update_forum_category'
  | 'delete_forum_category'
  | 'sticky_forum_topic'
  | 'unsticky_forum_topic'
  | 'lock_forum_topic'
  | 'unlock_forum_topic'
  | 'delete_forum_topic'
  | 'delete_forum_post' // Added
  | 'warn_user' // Added
  | 'mark_content_for_edit' // Added
  | 'mark_topic_for_move' // Added
  | 'dismiss_report' // Added from previous changes
  | 'reopen_report' // Added from previous changes
  | string;

export const useStaffActivityLogger = () => {
  const { toast } = useToast();
  const { logActivity: originalLogActivity } = useAuthActivityLogger(); // Use the renamed original hook

  const logActivity = useCallback(async (
    actionType: ActionType, 
    description: string, 
    entityType?: EntityType,
    entityId?: string | number, // Allow number for homepage_content id
    details?: any
  ) => {
    // Use originalLogActivity or the direct implementation as needed
    // For now, assuming a direct implementation similar to what was here
    try {
      console.log("Logging staff activity:", { actionType, description, entityType, entityId, details });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("Cannot log activity: No authenticated user");
        // Potentially show a toast, but be mindful of logActivity being called in various contexts
        return null;
      }
      
      const { data, error } = await supabase.rpc("create_activity_log", {
        p_staff_id: session.user.id,
        p_action_type: actionType as string, // Cast to string as RPC expects text
        p_description: description,
        p_entity_type: entityType || null,
        // Ensure p_entity_id is string or null for RPC
        p_entity_id: entityId ? String(entityId) : null, 
        p_details: details ? JSON.stringify(details) : null
      });

      if (error) {
        console.error("Error logging staff activity:", error);
        toast({
          title: "Error Logging Activity",
          description: `Failed to log activity: ${error.message}. Please ensure you have 'create_activity_log' permissions.`,
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Staff activity logged successfully:", data);
      return data;
    } catch (error) {
      console.error("Failed to log staff activity (catch block):", error);
      toast({
        title: "Logging Error",
        description: "An unexpected error occurred while trying to log staff activity.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]); // Removed originalLogActivity from deps if not used directly here
  
  return { logActivity };
};

// Assuming useAuthActivityLogger is a pre-existing hook for general auth logging
// If it's meant to be the same as this, then this file should be useAuthActivityLogger
// For now, let's create a placeholder if it doesn't exist.
// This is a common pattern if refactoring occurred.
const useAuthActivityLogger = () => {
    const logActivity = useCallback(async (
        actionType: string, 
        description: string, 
        entityType?: string,
        entityId?: string | number,
        details?: any
      ) => {
        console.log("Auth activity logger called (placeholder):", 
          { actionType, description, entityType, entityId, details }
        );
        // Placeholder: In a real scenario, this would interact with Supabase
        return Promise.resolve(null);
    }, []);
    return { logActivity };
};


export default useStaffActivityLogger;
