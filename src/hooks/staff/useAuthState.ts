
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthStateProps {
  redirectUnauthorized?: boolean;
  redirectPath?: string;
}

export interface StaffAuthState {
  staffName: string;
  isAdmin: boolean;
  isLoading: boolean;
  userRole: string;
  isAuthenticated: boolean;
}

export const useAuthState = ({ 
  redirectUnauthorized = true, 
  redirectPath = "/staff/login" 
}: AuthStateProps = {}) => {
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
        console.log("Checking staff authentication...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.log("No session found, not authenticated");
          // If not already on login page and redirectUnauthorized is true, redirect to it
          if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
            console.log(`Redirecting to ${redirectPath}`);
            navigate(redirectPath);
          }
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
          return;
        }
        
        console.log("Session found, fetching staff data...");
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          console.error("Error fetching staff data or staff not found:", staffError);
          await supabase.auth.signOut();
          if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
            navigate(redirectPath);
          }
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
          return;
        }
        
        console.log("Staff data retrieved:", staffData);
        
        // Check if this is DJEpidemik user - they should be Super Admin
        const isDJEpidemik = staffData.email.toLowerCase().includes("djepide") || 
                           staffData.email.toLowerCase().includes("dj_epide");
        
        // Set the userRole based on whether this is DJEpidemik
        const userRole = isDJEpidemik ? "super_admin" : staffData.role;
        
        console.log("Setting user role:", userRole);
        
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
        if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
          navigate(redirectPath);
        }
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      }
    };
    
    checkAuth();
    
    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_OUT") {
        if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
          navigate(redirectPath);
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
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, toast, redirectUnauthorized, redirectPath]);

  const makeUserSuperAdmin = async (userId: string) => {
    try {
      console.log("Making user super admin:", userId);
      const { error } = await supabase
        .from("staff")
        .update({ role: "super_admin" })
        .eq("id", userId);

      if (error) {
        console.error("Error making user super admin:", error);
        throw error;
      }
      
      console.log("User successfully made super admin");
      setState(prev => ({ ...prev, isAdmin: true, userRole: "super_admin" }));
      toast({
        title: "Super Admin Access Granted",
        description: "You have been granted Super Admin access.",
      });
    } catch (error) {
      console.error("Error making user super admin:", error);
    }
  };

  return state;
};
