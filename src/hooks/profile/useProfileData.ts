
import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";
import { fetchUserProfileData } from "@/services/profileService";
import { useToast } from "@/hooks/use-toast";

// Consider moving this to a shared constants file if used in multiple places
const initialSocialLinksForHook: UserProfile['social_links'] = { instagram: null, twitter: null, website: null };

export const useProfileData = (user: User | null) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [defaultUsernameForNewUser, setDefaultUsernameForNewUser] = useState<string | undefined>(undefined);
  const [isNewUserMode, setIsNewUserMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      setDefaultUsernameForNewUser(undefined);
      setIsNewUserMode(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedResult = await fetchUserProfileData(currentUser, initialSocialLinksForHook);
      if ('isNewUser' in fetchedResult) {
        setProfile(null); 
        setDefaultUsernameForNewUser(fetchedResult.defaultUsername);
        setIsNewUserMode(true);
      } else {
        setProfile(fetchedResult);
        setDefaultUsernameForNewUser(undefined);
        setIsNewUserMode(false);
      }
    } catch (err: any) {
      console.error("Error fetching profile data:", err.message);
      setError("Failed to load profile. Please try again.");
      toast({ title: "Error", description: "Failed to load profile.", variant: "destructive" });
      setProfile(null);
      setDefaultUsernameForNewUser(undefined);
      setIsNewUserMode(false);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Only depend on user.id to prevent infinite loops
    if (user?.id) {
      setIsLoading(true); 
      loadProfile(user);
    } else {
      setIsLoading(false); // No user, so not loading profile data
      loadProfile(null);
    }
  }, [user?.id, loadProfile]); // Only depend on user.id, not the full user object

  const refetchProfile = useCallback(() => {
    if (user) {
      loadProfile(user);
    }
  }, [user, loadProfile]);

  return {
    profile,
    defaultUsernameForNewUser,
    isNewUserMode,
    isLoading,
    error,
    refetchProfile,
  };
};
