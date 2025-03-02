
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StaffAuthState {
  staffName: string;
  isAdmin: boolean;
  isLoading: boolean;
  userRole: string;
}

export const useStaffAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<StaffAuthState>({
    staffName: "",
    isAdmin: false,
    isLoading: true,
    userRole: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("useStaffAuth: Checking authentication...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("useStaffAuth: No session found");
          // If not already on login page, redirect to it
          if (!window.location.pathname.includes('/staff-login')) {
            navigate("/staff-login");
          }
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        console.log("useStaffAuth: Session found, user ID:", session.user.id);
        
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          console.error("useStaffAuth: Staff data error:", staffError);
          console.log("useStaffAuth: Staff data not found, signing out");
          await supabase.auth.signOut();
          if (!window.location.pathname.includes('/staff-login')) {
            navigate("/staff-login");
          }
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
        
        console.log("useStaffAuth: Staff data found:", staffData);
        
        // Check if this is DJEpidemik user - they should be Super Admin
        const isDJEpidemik = staffData.email.toLowerCase().includes("djepide") || 
                           staffData.email.toLowerCase().includes("dj_epide");
        
        // Set the userRole based on whether this is DJEpidemik
        const userRole = isDJEpidemik ? "super_admin" : staffData.role;
        
        console.log("useStaffAuth: Determined user role:", userRole);
        console.log("useStaffAuth: Is DJEpidemik?", isDJEpidemik);
        
        setState({
          staffName: staffData.first_name || staffData.email,
          isAdmin: userRole === "admin" || userRole === "super_admin",
          isLoading: false,
          userRole: userRole
        });

        // Check if DJEpidemik and ensure they are a super_admin in the database
        if (isDJEpidemik && staffData.role !== "super_admin") {
          console.log("useStaffAuth: Upgrading DJEpidemik user to super_admin");
          await makeUserSuperAdmin(staffData.id);
        }
      } catch (error) {
        console.error("useStaffAuth: Auth check error:", error);
        if (!window.location.pathname.includes('/staff-login')) {
          navigate("/staff-login");
        }
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("useStaffAuth: Auth state changed:", event);
        if (event === "SIGNED_OUT") {
          console.log("useStaffAuth: User signed out");
          if (!window.location.pathname.includes('/staff-login')) {
            navigate("/staff-login");
          }
          setState({
            staffName: "",
            isAdmin: false,
            isLoading: false,
            userRole: ""
          });
        } else if (event === "SIGNED_IN" && session) {
          console.log("useStaffAuth: User signed in");
          checkAuth();
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, toast]);

  const makeUserSuperAdmin = async (userId: string) => {
    try {
      console.log("useStaffAuth: Making user super admin:", userId);
      const { error } = await supabase
        .from("staff")
        .update({ role: "super_admin" })
        .eq("id", userId);

      if (error) throw error;
      
      setState(prev => ({ ...prev, isAdmin: true, userRole: "super_admin" }));
      toast({
        title: "Super Admin Access Granted",
        description: "You have been granted Super Admin access.",
      });
    } catch (error) {
      console.error("useStaffAuth: Error making user super admin:", error);
    }
  };

  const handleLogout = async () => {
    try {
      console.log("useStaffAuth: Logging out user");
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/staff-login");
    } catch (error) {
      console.error("useStaffAuth: Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    ...state,
    handleLogout
  };
};
