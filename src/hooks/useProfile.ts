
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Create a properly typed UserProfile object from the database data
        const userProfile: UserProfile = {
          id: data.id,
          username: data.username || "",
          display_name: data.display_name,
          bio: data.bio,
          favorite_genres: data.favorite_genres || [],
          avatar_url: data.profile_picture,
          role: (data.role as UserProfile['role']) || "user"
        };
        
        setProfile(userProfile);
        setDisplayName(userProfile.display_name || "");
        setUsername(userProfile.username);
        setBio(userProfile.bio || "");
        setSelectedGenres(userProfile.favorite_genres || []);
        setSelectedRole(userProfile.role);
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
      // Check if username is already taken
      if (username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();
          
        if (!checkError && existingUser) {
          throw new Error("Username is already taken. Please choose another one.");
        }
      }
      
      // Update profile in database
      const { error } = await supabase
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
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
      setError(error.message);
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
