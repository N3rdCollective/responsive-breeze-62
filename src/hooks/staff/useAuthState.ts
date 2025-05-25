
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthStateProps {
  redirectUnauthorized?: boolean;
  redirectPath?: string;
}

export interface StaffAuthState {
  staffName: string | null; // Allow null for default state
  isAdmin: boolean;
  isLoading: boolean;
  userRole: string | null; // Allow null for default state
  isAuthenticated: boolean;
  staffId: string | null;
  permissions: Record<string, boolean>; // Added permissions
}

export const useAuthState = ({ 
  redirectUnauthorized = true, 
  redirectPath = "/staff/login" 
}: AuthStateProps = {}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<StaffAuthState>({
    staffName: null,
    isAdmin: false,
    isLoading: true,
    userRole: null,
    isAuthenticated: false,
    staffId: null,
    permissions: {}, // Initialize permissions
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
          if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
            console.log(`Redirecting to ${redirectPath}`);
            navigate(redirectPath);
          }
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, staffId: null, staffName: null, userRole: null, permissions: {} })); // Reset state
          return;
        }
        
        console.log("Session found, fetching staff data for user ID:", session.user.id);
        // Ensure 'permissions' column is selected if it exists in the 'staff' table
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*, permissions") // Attempt to select permissions
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          console.error("Error fetching staff data or staff not found for user ID:", session.user.id, staffError);
          await supabase.auth.signOut();
          if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
            navigate(redirectPath);
          }
          setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, staffId: null, staffName: null, userRole: null, permissions: {} })); // Reset state
          return;
        }
        
        console.log("Staff data retrieved:", staffData);
        
        const userRole = staffData.role;
        // Assuming permissions are stored in a column named 'permissions' of type JSONB or similar
        // and structured as Record<string, boolean>. If not, adjust accordingly.
        const permissions = staffData.permissions || {}; 
        
        console.log("Setting user role:", userRole, "and staff ID:", staffData.id, "and permissions:", permissions);
        
        setState({
          staffName: staffData.first_name || staffData.email || "Staff Member",
          isAdmin: userRole === "admin" || userRole === "super_admin",
          isLoading: false,
          userRole: userRole,
          isAuthenticated: true,
          staffId: staffData.id,
          permissions: permissions, // Set permissions
        });
      } catch (error) {
        console.error("Auth check error:", error);
        if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
          navigate(redirectPath);
        }
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, staffId: null, staffName: null, userRole: null, permissions: {} })); // Reset state
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_OUT") {
        if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
          navigate(redirectPath);
        }
        setState({
          staffName: null,
          isAdmin: false,
          isLoading: false,
          userRole: null,
          isAuthenticated: false,
          staffId: null,
          permissions: {}, // Reset permissions
        });
      } else if (event === "SIGNED_IN" && session) {
        checkAuth();
      } else if (event === "USER_UPDATED" && session) {
        checkAuth();
      }
    });
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, toast, redirectUnauthorized, redirectPath]);

  return state;
};
