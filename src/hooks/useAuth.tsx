
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isStaff: boolean;
  staffRole: string | null;
  logout: () => Promise<void>;
  checkStaffStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [staffRole, setStaffRole] = useState<string | null>(null);

  // Check if user is staff member using secure RPC functions
  const checkStaffStatus = async () => {
    if (!user || !user.id) {
      console.log('🔐 [DEBUG] No user found, setting staff status to false');
      setIsStaff(false);
      setStaffRole(null);
      return;
    }

    try {
      console.log('🔐 [DEBUG] Checking staff status using RPC functions for user:', user.id);
      
      // Use the new security definer functions to avoid RLS recursion
      const { data: isStaffResult, error: staffCheckError } = await supabase
        .rpc('is_user_staff_member', { user_id: user.id });

      if (staffCheckError) {
        console.error('🔐 [ERROR] Staff check function error:', staffCheckError);
        setIsStaff(false);
        setStaffRole(null);
        return;
      }

      const isStaff = isStaffResult || false;
      console.log('🔐 [DEBUG] Staff check result:', isStaff);

      if (!isStaff) {
        console.log('🔐 [INFO] User is not a staff member:', user.id);
        setIsStaff(false);
        setStaffRole(null);
        return;
      }

      // Get user's role if they are staff
      const { data: roleResult, error: roleError } = await supabase
        .rpc('get_user_staff_role', { user_id: user.id });

      if (roleError) {
        console.error('🔐 [ERROR] Role check function error:', roleError);
        setIsStaff(false);
        setStaffRole(null);
        return;
      }

      const role = roleResult || null;
      console.log('🔐 [SUCCESS] Staff status confirmed:', { userId: user.id, role: role });
      setIsStaff(true);
      setStaffRole(role);
      
    } catch (error) {
      console.error('🔐 [ERROR] Unexpected error checking staff status:', error);
      setIsStaff(false);
      setStaffRole(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔐 [CLEAN] Auth state changed after RLS cleanup:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check staff status when user signs in using secure functions
        if (event === 'SIGNED_IN' && session?.user?.id) {
          setTimeout(async () => {
            try {
              console.log('🔐 [DEBUG] Auth state SIGNED_IN - checking staff status for:', session.user.id);
              
              const { data: isStaffResult, error: staffCheckError } = await supabase
                .rpc('is_user_staff_member', { user_id: session.user.id });

              if (staffCheckError) {
                console.error('🔐 [ERROR] Staff check function error:', staffCheckError);
                setIsStaff(false);
                setStaffRole(null);
                return;
              }

              const isStaff = isStaffResult || false;
              console.log('🔐 [DEBUG] Staff check result on signin:', isStaff);

              if (!isStaff) {
                console.log('🔐 [INFO] User is not a staff member on signin:', session.user.id);
                setIsStaff(false);
                setStaffRole(null);
                return;
              }

              // Get user's role if they are staff
              const { data: roleResult, error: roleError } = await supabase
                .rpc('get_user_staff_role', { user_id: session.user.id });

              if (roleError) {
                console.error('🔐 [ERROR] Role check function error:', roleError);
                setIsStaff(false);
                setStaffRole(null);
                return;
              }

              const role = roleResult || null;
              console.log('🔐 [SUCCESS] Staff status confirmed on signin:', { userId: session.user.id, role: role });
              setIsStaff(true);
              setStaffRole(role);
              
            } catch (error) {
              console.error('🔐 [ERROR] Unexpected error checking staff status on signin:', error);
              setIsStaff(false);
              setStaffRole(null);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setIsStaff(false);
          setStaffRole(null);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        console.log("🔐 [CLEAN] Initial session check after RLS cleanup:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        if (currentSession?.user?.id) {
          setTimeout(async () => {
            try {
              console.log('🔐 [DEBUG] Initial session check - checking staff status for:', currentSession.user.id);
              
              const { data: isStaffResult, error: staffCheckError } = await supabase
                .rpc('is_user_staff_member', { user_id: currentSession.user.id });

              if (staffCheckError) {
                console.error('🔐 [ERROR] Initial staff check function error:', staffCheckError);
                setIsStaff(false);
                setStaffRole(null);
                return;
              }

              const isStaff = isStaffResult || false;
              console.log('🔐 [DEBUG] Initial staff check result:', isStaff);

              if (!isStaff) {
                console.log('🔐 [INFO] User is not a staff member on initial check:', currentSession.user.id);
                setIsStaff(false);
                setStaffRole(null);
                return;
              }

              // Get user's role if they are staff
              const { data: roleResult, error: roleError } = await supabase
                .rpc('get_user_staff_role', { user_id: currentSession.user.id });

              if (roleError) {
                console.error('🔐 [ERROR] Initial role check function error:', roleError);
                setIsStaff(false);
                setStaffRole(null);
                return;
              }

              const role = roleResult || null;
              console.log('🔐 [SUCCESS] Staff status confirmed on initial check:', { userId: currentSession.user.id, role: role });
              setIsStaff(true);
              setStaffRole(role);
              
            } catch (error) {
              console.error('🔐 [ERROR] Unexpected error during initial staff status check:', error);
              setIsStaff(false);
              setStaffRole(null);
            }
          }, 0);
        }
      })
      .catch((error) => {
        console.error("🔐 [ERROR] Initial session check error after RLS cleanup:", error.message);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []); // Clean dependencies to prevent infinite loop

  const logout = async () => {
    try {
      console.log("🔐 [CLEAN] Logging out after RLS cleanup...");
      
      // Clean up auth state
      const cleanupAuthState = () => {
        localStorage.removeItem('supabase.auth.token');
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        Object.keys(sessionStorage || {}).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      };
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('🔐 [ERROR] Error logging out after RLS cleanup:', error.message);
        toast({
          title: "Logout Error",
          description: "There was an error logging out. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
      
      setUser(null);
      setSession(null);
      setIsStaff(false);
      setStaffRole(null);
      
      console.log("🔐 [SUCCESS] Logout successful after RLS cleanup");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      window.location.href = "/";
    } catch (error) {
      console.error("🔐 [ERROR] Logout failed after RLS cleanup:", error);
    }
  };

  const value = { 
    user, 
    session, 
    loading, 
    isLoading: loading, 
    isStaff,
    staffRole,
    logout,
    checkStaffStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider };
export default AuthProvider;
