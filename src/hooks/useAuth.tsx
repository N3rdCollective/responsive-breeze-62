import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed (useAuth):", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => { // Renamed to currentSession to avoid conflict in logs
        console.log("Initial session check (useAuth success):", currentSession?.user?.email);
        // It's possible onAuthStateChange fired an INITIAL_SESSION event already.
        // Setting state here ensures we cover cases where getSession resolves first or provides the initial state.
        // If onAuthStateChange has already set a more current state, React handles batching.
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Initial session check (useAuth error):", error.message);
        // Session and user will remain null or as set by any prior onAuthStateChange event.
        // Crucially, ensure loading is set to false so the UI doesn't hang.
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      console.log("Logging out...");
      
      // First, attempt to clean up any local storage tokens to avoid auth limbo states
      const cleanupAuthState = () => {
        // Remove standard auth tokens
        localStorage.removeItem('supabase.auth.token');
        // Remove all Supabase auth keys from localStorage
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
        // Remove from sessionStorage if in use
        Object.keys(sessionStorage || {}).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            sessionStorage.removeItem(key);
          }
        });
      };
      
      // Clean up auth state
      cleanupAuthState();
      
      // Perform the actual logout
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Error logging out:', error.message);
        toast({
          title: "Logout Error",
          description: "There was an error logging out. Please try again.",
          variant: "destructive"
        });
        throw error;
      }
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      console.log("Logout successful");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      
      // Redirect to homepage instead of /auth
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  return {
    user,
    session,
    loading,
    logout
  };
};

export default useAuth;
