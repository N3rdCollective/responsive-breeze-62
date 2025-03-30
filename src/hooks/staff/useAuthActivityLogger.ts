
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAuthActivityLogger = () => {
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

  return { logAuthActivity };
};
