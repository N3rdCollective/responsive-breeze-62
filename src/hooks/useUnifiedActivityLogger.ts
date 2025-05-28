
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BaseActivityData {
  [key: string]: any;
}

export const useUnifiedActivityLogger = () => {
  const logActivity = useCallback(async (
    actionType: string,
    description: string,
    entityType?: string,
    entityId?: string,
    metadata?: BaseActivityData
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get staff ID from staff table
      const { data: staffData } = await supabase
        .from("staff")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!staffData) return;

      await supabase.rpc("create_activity_log", {
        p_staff_id: staffData.id,
        p_action_type: actionType,
        p_description: description,
        p_entity_type: entityType || null,
        p_entity_id: entityId || null,
        p_details: metadata || null // Changed from p_metadata to p_details
      });

      console.log("[useUnifiedActivityLogger] Activity logged:", {
        actionType,
        description,
        entityType,
        entityId
      });
    } catch (error) {
      console.error(`Failed to log ${actionType} activity:`, error);
    }
  }, []);

  const logAuthActivity = useCallback(async (
    staffId: string | undefined,
    staffName: string,
    actionType: "login" | "logout",
    description: string
  ) => {
    if (!staffId) return;
    
    try {
      await supabase.rpc("create_activity_log", {
        p_staff_id: staffId,
        p_action_type: actionType,
        p_description: description
      });
    } catch (error) {
      console.error(`Failed to log ${actionType} activity:`, error);
    }
  }, []);

  const logNewsActivity = useCallback(async (
    action: 'create_post' | 'update_post' | 'publish_post',
    data: {
      id: string;
      title: string;
      category?: string;
      status: string;
      hasImage: boolean;
    }
  ) => {
    const { id, title, category, status, hasImage } = data;
    
    // Determine description based on action
    let description = '';
    if (action === 'create_post') {
      description = `Created new post: ${title}`;
    } else if (action === 'update_post') {
      description = `Updated post: ${title}`;
    } else if (action === 'publish_post') {
      description = `Published post: ${title}`;
    }
    
    await logActivity(
      action,
      description,
      'post',
      id,
      {
        title,
        category,
        status,
        hasImage
      }
    );
  }, [logActivity]);

  return { 
    logActivity, 
    logAuthActivity, 
    logNewsActivity 
  };
};
