
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";
import { saveUserProfileData } from "@/services/profileService";

export interface ProfileDataToSave {
  username: string;
  displayName: string;
  bio: string;
  selectedGenres: string[];
  selectedRole: UserProfile['role'];
  socialLinks: UserProfile['social_links'];
  theme: string;
  isPublic: boolean;
}

export const useProfileSave = (user: User | null, currentUsernameFromProfile: string | undefined) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<UserProfile | null>(null);

  const handleSaveProfile = async (dataToSave: ProfileDataToSave): Promise<UserProfile | null> => {
    if (!user) {
      setError("User not authenticated. Cannot save profile.");
      toast({ title: "Authentication Error", description: "You must be logged in to save your profile.", variant: "destructive" });
      return null;
    }
    
    setIsSaving(true);
    setError(null);
    setSavedProfile(null);
    
    try {
      const updatedProfile = await saveUserProfileData(user, dataToSave, currentUsernameFromProfile);
      setSavedProfile(updatedProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      return updatedProfile;
    } catch (err: any) {
      console.error("Error updating profile:", err.message);
      setError(err.message);
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive"
      });
      throw err; // Re-throw to be caught by page if needed
    } finally {
      setIsSaving(false);
    }
  };

  return {
    handleSaveProfile,
    isSaving,
    error, // This is saveError
    savedProfile,
  };
};
