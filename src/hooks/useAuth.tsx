
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
      console.log('🔐 [FIXED] Checking staff status after RLS fix for user:', user.id);
      
      const { data, error } = await supabase
        .from('staff')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        console.log('🔐 [INFO] User is not staff member after RLS fix:', user.id);
        setIsStaff(false);
        setStaffRole(null);
      } else {
        console.log('🔐 [SUCCESS] Staff status confirmed after RLS fix:', { userId: user.id, role: data.role });
        setIsStaff(true);
        setStaffRole(data.role);
      }
    } catch (error) {
      console.error('🔐 [ERROR] Error checking staff status after RLS fix:', error);
      setIsStaff(false);
      setStaffRole(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔐 [FIXED] Auth state changed after RLS fix:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check staff status when user signs in
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            await checkStaffStatus();
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
        console.log("🔐 [FIXED] Initial session check after RLS fix:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        if (currentSession?.user) {
          checkStaffStatus();
        }
      })
      .catch((error) => {
        console.error("🔐 [ERROR] Initial session check error after RLS fix:", error.message);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [user]);

  const logout = async () => {
    try {
      console.log("🔐 [FIXED] Logging out after RLS fix...");
      
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
        console.error('🔐 [ERROR] Error logging out after RLS fix:', error.message);
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
      
      console.log("🔐 [SUCCESS] Logout successful after RLS fix");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      window.location.href = "/";
    } catch (error) {
      console.error("🔐 [ERROR] Logout failed after RLS fix:", error);
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
