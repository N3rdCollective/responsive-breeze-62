
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  display_name: string | null;
  role: string | null;
  profile_picture: string | null;
}

interface MemberAuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export function useMemberAuth() {
  const [authState, setAuthState] = useState<MemberAuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isLoggedIn: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prevState => ({
          ...prevState,
          session,
          user: session?.user ?? null,
          isLoggedIn: !!session,
        }));
        
        // If session exists, fetch profile data
        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
                
              if (!profileError && profileData) {
                setAuthState(prevState => ({
                  ...prevState,
                  profile: profileData,
                }));
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        setAuthState(prevState => ({
          ...prevState,
          session,
          user: session?.user ?? null,
          isLoggedIn: !!session,
        }));
        
        // If session exists, fetch profile data
        if (session?.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!profileError && profileData) {
            setAuthState(prevState => ({
              ...prevState,
              profile: profileData,
            }));
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setAuthState(prevState => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    }
    return { error };
  };

  const signup = async (email: string, password: string, userData: object) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
  };

  return {
    ...authState,
    login,
    logout,
    signup,
  };
}
