import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";
import { fetchUserProfileData, saveUserProfileData } from "@/services/profileService"; // Import new service functions

export const useProfile = (user: User | null) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>("user");
  
  const initialSocialLinks: UserProfile['social_links'] = { instagram: null, twitter: null, website: null };
  const [socialLinks, setSocialLinks] = useState<UserProfile['social_links']>(initialSocialLinks);
  const [theme, setTheme] = useState<string>('default');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const resetProfileStates = useCallback(() => {
    setProfile(null);
    setDisplayName("");
    setUsername("");
    setBio("");
    setSelectedGenres([]);
    setSelectedRole("user");
    setSocialLinks(initialSocialLinks);
    setTheme('default');
    setIsPublic(true);
    setError("");
  }, []); // Removed initialSocialLinks from dependency array as it's constant within scope

  const applyProfileData = useCallback((userProfile: UserProfile) => {
    setProfile(userProfile);
    setDisplayName(userProfile.display_name || "");
    setUsername(userProfile.username || "");
    setBio(userProfile.bio || "");
    setSelectedGenres(userProfile.favorite_genres || []);
    setSelectedRole(userProfile.role);
    setSocialLinks(userProfile.social_links || initialSocialLinks);
    setTheme(userProfile.theme || 'default');
    setIsPublic(userProfile.is_public ?? true);
  }, []); // Removed initialSocialLinks from dependency array

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        resetProfileStates();
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError("");
      try {
        const fetchedData = await fetchUserProfileData(user, initialSocialLinks);
        if ('isNewUser' in fetchedData) {
          // Handle new user: set defaults
          console.log("No profile found, setting up for new user with default username:", fetchedData.defaultUsername);
          setUsername(fetchedData.defaultUsername);
          setDisplayName(user.email?.split('@')[0] || "New User"); // Or some other default display name
          // Keep other fields as their initial defaults
          setSocialLinks(initialSocialLinks);
          setTheme('default');
          setIsPublic(true);
          setProfile(null); // Explicitly null for a new, unsaved profile
        } else {
          applyProfileData(fetchedData);
        }
      } catch (err: any) {
        console.error("Error fetching profile in hook:", err.message);
        setError("Failed to load profile. Please try again.");
        toast({ title: "Error", description: "Failed to load profile.", variant: "destructive" });
        resetProfileStates(); // Reset to defaults on error
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, resetProfileStates, applyProfileData]); // initialSocialLinks removed as it's stable

  const handleSaveProfile = async () => {
    if (!user) {
      setError("User not authenticated. Cannot save profile.");
      toast({ title: "Authentication Error", description: "You must be logged in to save your profile.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    setError("");
    
    try {
      const profileDataToSave = {
        username,
        displayName,
        bio,
        selectedGenres,
        selectedRole,
        socialLinks,
        theme,
        isPublic,
      };
      
      const updatedProfile = await saveUserProfileData(user, profileDataToSave, profile?.username);
      applyProfileData(updatedProfile); // Update local state with the saved and processed data
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile in hook:", error.message);
      setError(error.message);
      
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
      throw error; 
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile, // This is the UserProfile object from DB, or null if new/not loaded
    isLoading,
    isSaving,
    error,
    // Individual state setters for form fields
    displayName, setDisplayName,
    username, setUsername,
    bio, setBio,
    selectedGenres, setSelectedGenres,
    selectedRole, setSelectedRole,
    socialLinks, setSocialLinks,
    theme, setTheme,
    isPublic, setIsPublic,
    handleSaveProfile
  };
};
