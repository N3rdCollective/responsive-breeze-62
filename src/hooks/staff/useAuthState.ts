import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface StaffAuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  staffName: string | null;
  staffRole: string | null;
  user: {
    id: string;
    email: string;
    display_name?: string | null;
    profile_picture?: string | null;
  } | null;
}

interface UseAuthStateProps {
  redirectUnauthorized?: boolean;
  redirectPath?: string;
}

export const useAuthState = (props: UseAuthStateProps = {}): StaffAuthState => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [staffName, setStaffName] = useState<string | null>(null);
  const [staffRole, setStaffRole] = useState<string | null>(null);
  const [user, setUser] = useState<StaffAuthState['user']>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        if (session) {
          setIsLoggedIn(true);
          const user = session.user;

          // Fetch staff details
          const { data: staffData, error: staffError } = await supabase
            .from('staff')
            .select('*')
            .eq('id', user.id)
            .single();

          if (staffError) {
            console.error("Error fetching staff data:", staffError);
            setIsLoading(false);
            return;
          }

          if (staffData) {
            setStaffName(staffData.display_name || staffData.first_name || staffData.email);
            setStaffRole(staffData.role || null);
            setUser({
              id: staffData.id,
              email: staffData.email,
              display_name: staffData.display_name,
              profile_picture: staffData.profile_picture,
            });
          } else {
            // Handle case where staff data is not found
            console.warn("No staff data found for user ID:", user.id);
            setIsLoggedIn(false);
            setUser(null);
            if (props.redirectUnauthorized) {
              navigate(props.redirectPath || '/staff/login');
            }
          }
        } else {
          setIsLoggedIn(false);
          setUser(null);
          if (props.redirectUnauthorized) {
            navigate(props.redirectPath || '/staff/login');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        checkSession();
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setStaffName(null);
        setStaffRole(null);
        setUser(null);
        if (props.redirectUnauthorized) {
          navigate(props.redirectPath || '/staff/login');
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, props.redirectUnauthorized, props.redirectPath]);

  return {
    isLoading,
    isLoggedIn,
    staffName,
    staffRole,
    user,
  };
};
