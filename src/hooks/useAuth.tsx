
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed (AuthProvider):", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        console.log("Initial session check (AuthProvider success):", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Initial session check (AuthProvider error):", error.message);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out (AuthProvider)...");
      
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
        console.error('Error logging out (AuthProvider):', error.message);
        toast({
          title: "Logout Error",
          description: "There was an error logging out. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
      
      setUser(null);
      setSession(null);
      
      console.log("Logout successful (AuthProvider)");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed (AuthProvider):", error);
      // Not re-throwing here to avoid unhandled promise rejection if caller doesn't catch
    }
  };

  const value = { 
    user, 
    session, 
    loading, 
    isLoading: loading, 
    logout 
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
