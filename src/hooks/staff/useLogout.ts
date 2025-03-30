
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthActivityLogger } from "./useAuthActivityLogger";

export const useLogout = (staffName: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logAuthActivity } = useAuthActivityLogger();

  const handleLogout = useCallback(async () => {
    try {
      console.log("Logging out user");
      
      // Log the logout action before signing out
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await logAuthActivity(
            session.user.id,
            staffName,
            "logout",
            `${staffName} logged out`
          );
        }
      } catch (error) {
        console.error("Failed to log logout activity:", error);
      }
      
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/staff/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error during logout. Please try again.",
        variant: "destructive",
      });
    }
  }, [navigate, toast, staffName, logAuthActivity]);

  return handleLogout;
};
