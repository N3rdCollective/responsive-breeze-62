import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";

export const useProfile = (user: User | null) => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      console.log("Fetching profile for user:", user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) throw error;
      
      console.log("Profile data returned:", data);
      
      if (data) {
        // Create a properly typed UserProfile object from the database data
        const userProfile: UserProfile = {
          id: data.id,
          username: data.username || "",
          display_name: data.display_name || "",
          bio: data.bio || "",
          favorite_genres: data.favorite_genres || [],
          avatar_url: data.profile_picture, // Map profile_picture to avatar_url
          role: (data.role as UserProfile['role']) || "user"
        };
        
        setProfile(userProfile);
        setDisplayName(userProfile.display_name || "");
        setUsername(userProfile.username || "");
        setBio(userProfile.bio || "");
        setSelectedGenres(userProfile.favorite_genres || []);
        setSelectedRole(userProfile.role);
      } else {
        console.log("No profile found, will create one when saving");
        // Set default values even when no profile is found
        setUsername(user.email?.split('@')[0] || "");
        setDisplayName("New User");
        // Other fields remain with their default empty values
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error.message);
      setError("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setError("");
    
    try {
      console.log("Saving profile for user:", user.id);
      console.log("Profile data to save:", {
        id: user.id, // Make sure we're specifying the user ID
        username,
        display_name: displayName,
        bio,
        favorite_genres: selectedGenres,
        role: selectedRole,
        updated_at: new Date().toISOString()
      });
      
      // Check if username is already taken
      if (username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .maybeSingle();
          
        if (!checkError && existingUser) {
          throw new Error("Username is already taken. Please choose another one.");
        }
      }
      
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      let result;
      
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update({
            username,
            display_name: displayName,
            bio,
            favorite_genres: selectedGenres,
            role: selectedRole,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } else {
        // Insert new profile if it doesn't exist
        result = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username,
            display_name: displayName,
            bio,
            favorite_genres: selectedGenres,
            role: selectedRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        console.error("Error from Supabase:", result.error);
        throw result.error;
      }
      
      console.log("Profile saved successfully", result);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
      
      // Refresh profile data after saving
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
      
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    error,
    displayName,
    username,
    bio,
    selectedGenres,
    selectedRole,
    setDisplayName,
    setUsername,
    setBio,
    setSelectedGenres,
    setSelectedRole,
    handleSaveProfile
  };
};
