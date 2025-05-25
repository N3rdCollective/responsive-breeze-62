
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
  permissions: Record<string, boolean>; // Kept in state, defaults to empty
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
    permissions: {}, // Initialize permissions as empty
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
          setState(prev => ({ ...prev, staffName: null, isAdmin: false, isLoading: false, userRole: null, isAuthenticated: false, staffId: null, permissions: {} })); // Reset state
          return;
        }
        
        console.log("Session found, fetching staff data for user ID:", session.user.id);
        // Removed 'permissions' from select as it does not exist in the staff table schema
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*") // Select all existing columns
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          console.error("Error fetching staff data or staff not found for user ID:", session.user.id, staffError);
          await supabase.auth.signOut();
          if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
            navigate(redirectPath);
          }
          setState(prev => ({ ...prev, staffName: null, isAdmin: false, isLoading: false, userRole: null, isAuthenticated: false, staffId: null, permissions: {} })); // Reset state
          return;
        }
        
        console.log("Staff data retrieved:", staffData);
        
        const userRole = staffData.role;
        // Permissions will default to an empty object as it's not fetched from DB
        const permissions = {}; // Default to empty
        
        console.log("Setting user role:", userRole, "and staff ID:", staffData.id);
        
        setState({
          staffName: staffData.first_name || staffData.email || "Staff Member",
          isAdmin: userRole === "admin" || userRole === "super_admin",
          isLoading: false,
          userRole: userRole,
          isAuthenticated: true,
          staffId: staffData.id,
          permissions: permissions, // Set permissions (empty object)
        });
      } catch (error) {
        console.error("Auth check error:", error);
        if (redirectUnauthorized && !window.location.pathname.includes(redirectPath)) {
          navigate(redirectPath);
        }
        setState(prev => ({ ...prev, staffName: null, isAdmin: false, isLoading: false, userRole: null, isAuthenticated: false, staffId: null, permissions: {} })); // Reset state
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

