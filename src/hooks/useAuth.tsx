
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

  // Check if user is staff member
  const checkStaffStatus = async () => {
    if (!user) {
      setIsStaff(false);
      setStaffRole(null);
      return;
    }

    try {
      console.log('🔐 [CLEAN] Checking staff status after RLS cleanup for user:', user.id);
      
      const { data, error } = await supabase
        .from('staff')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.log('🔐 [INFO] User is not staff member after RLS cleanup:', user.id);
        setIsStaff(false);
        setStaffRole(null);
      } else {
        console.log('🔐 [SUCCESS] Staff status confirmed after RLS cleanup:', { userId: user.id, role: data.role });
        setIsStaff(true);
        setStaffRole(data.role);
      }
    } catch (error) {
      console.error('🔐 [ERROR] Error checking staff status after RLS cleanup:', error);
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
        
        // Check staff status when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('staff')
                .select('role')
                .eq('id', session.user.id)
                .single();

              if (error || !data) {
                console.log('🔐 [INFO] User is not staff member after RLS cleanup:', session.user.id);
                setIsStaff(false);
                setStaffRole(null);
              } else {
                console.log('🔐 [SUCCESS] Staff status confirmed after RLS cleanup:', { userId: session.user.id, role: data.role });
                setIsStaff(true);
                setStaffRole(data.role);
              }
            } catch (error) {
              console.error('🔐 [ERROR] Error checking staff status after RLS cleanup:', error);
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
        
        if (currentSession?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('staff')
                .select('role')
                .eq('id', currentSession.user.id)
                .single();

              if (error || !data) {
                console.log('🔐 [INFO] User is not staff member after RLS cleanup:', currentSession.user.id);
                setIsStaff(false);
                setStaffRole(null);
              } else {
                console.log('🔐 [SUCCESS] Staff status confirmed after RLS cleanup:', { userId: currentSession.user.id, role: data.role });
                setIsStaff(true);
                setStaffRole(data.role);
              }
            } catch (error) {
              console.error('🔐 [ERROR] Error checking staff status after RLS cleanup:', error);
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
