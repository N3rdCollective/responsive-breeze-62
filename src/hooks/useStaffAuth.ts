
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/staff-login");
          return;
        }
        
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          await supabase.auth.signOut();
          navigate("/staff-login");
          return;
        }
        
        setState({
          staffName: staffData.first_name || staffData.email,
          isAdmin: staffData.role === "admin",
          isLoading: false,
          userRole: staffData.role
        });

        // Check if the staff member is Yungdigz and not already an admin
        if (staffData.email.toLowerCase().includes("yungdigz") && staffData.role !== "admin") {
          await makeUserAdmin(staffData.id);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/staff-login");
      } finally {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/staff-login");
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const makeUserAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("staff")
        .update({ role: "admin" })
        .eq("id", userId);

      if (error) throw error;
      
      setState(prev => ({ ...prev, isAdmin: true, userRole: "admin" }));
      toast({
        title: "Admin Access Granted",
        description: "You have been promoted to administrator.",
      });
    } catch (error) {
      console.error("Error making user admin:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/staff-login");
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
