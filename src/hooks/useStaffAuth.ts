
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StaffAuthState {
  staffName: string;
  isAdmin: boolean;
  isLoading: boolean;
  userRole: string;
  isAuthenticated: boolean;
}

export const useStaffAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<StaffAuthState>({
    staffName: "",
    isAdmin: false,
    isLoading: true,
    userRole: "",
    isAuthenticated: false
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // If not already on login page, redirect to it
          if (!window.location.pathname.includes('/staff/login')) {
            navigate("/staff/login");
          }
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
          return;
        }
        
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          await supabase.auth.signOut();
          if (!window.location.pathname.includes('/staff/login')) {
            navigate("/staff/login");
          }
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
          return;
        }
        
        // Check if this is DJEpidemik user - they should be Super Admin
        const isDJEpidemik = staffData.email.toLowerCase().includes("djepide") || 
                           staffData.email.toLowerCase().includes("dj_epide");
        
        // Set the userRole based on whether this is DJEpidemik
        const userRole = isDJEpidemik ? "super_admin" : staffData.role;
        
        setState({
          staffName: staffData.first_name || staffData.email,
          isAdmin: userRole === "admin" || userRole === "super_admin",
          isLoading: false,
          userRole: userRole,
          isAuthenticated: true
        });

        // Check if DJEpidemik and ensure they are a super_admin in the database
        if (isDJEpidemik && staffData.role !== "super_admin") {
          await makeUserSuperAdmin(staffData.id);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!window.location.pathname.includes('/staff/login')) {
          navigate("/staff/login");
        }
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          if (!window.location.pathname.includes('/staff/login')) {
            navigate("/staff/login");
          }
          setState({
            staffName: "",
            isAdmin: false,
            isLoading: false,
            userRole: "",
            isAuthenticated: false
          });
        } else if (event === "SIGNED_IN" && session) {
          checkAuth();
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const makeUserSuperAdmin = async (userId: string) => {
    try {
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
      console.error("Error making user super admin:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/staff/login"); // Fix the navigation path to match your route definition
    } catch (error) {
      console.error("Logout error:", error);
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
