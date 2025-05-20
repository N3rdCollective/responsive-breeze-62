import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";

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
  
  const [socialLinks, setSocialLinks] = useState<UserProfile['social_links']>({ instagram: '', twitter: '', website: '' });
  const [theme, setTheme] = useState<string>('default');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setIsLoading(false);
      setProfile(null);
      setDisplayName("");
      setUsername("");
      setBio("");
      setSelectedGenres([]);
      setSelectedRole("user");
      setSocialLinks({ instagram: '', twitter: '', website: '' });
      setTheme('default');
      setIsPublic(true);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching profile for user:", user.id);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (fetchError) throw fetchError;
      
      console.log("Profile data returned:", data);
      
      if (data) {
        const userProfile: UserProfile = {
          id: data.id,
          username: data.username || "",
          display_name: data.display_name || "",
          bio: data.bio || "",
          favorite_genres: data.favorite_genres || [],
          avatar_url: data.profile_picture, 
          role: (data.role as UserProfile['role']) || "user",
          social_links: data.social_links || { instagram: '', twitter: '', website: '' },
          theme: data.theme || 'default',
          is_public: data.is_public === null ? true : data.is_public,
        };
        
        setProfile(userProfile);
        setDisplayName(userProfile.display_name || "");
        setUsername(userProfile.username || "");
        setBio(userProfile.bio || "");
        setSelectedGenres(userProfile.favorite_genres || []);
        setSelectedRole(userProfile.role);
        setSocialLinks(userProfile.social_links || { instagram: '', twitter: '', website: '' });
        setTheme(userProfile.theme || 'default');
        setIsPublic(userProfile.is_public === null ? true : userProfile.is_public);
      } else {
        console.log("No profile found, will use default values or create one when saving");
        const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') || "";
        setUsername(defaultUsername);
        setDisplayName("New User");
        setSocialLinks({ instagram: '', twitter: '', website: '' });
        setTheme('default');
        setIsPublic(true);
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err.message);
      setError("Failed to load profile. Please try again.");
      toast({ title: "Error", description: "Failed to load profile.", variant: "destructive" });
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
      const profileDataToSave = {
        username,
        display_name: displayName,
        bio,
        favorite_genres: selectedGenres,
        role: selectedRole,
        social_links: socialLinks,
        theme: theme,
        is_public: isPublic,
        updated_at: new Date().toISOString()
      };
      console.log("Profile data to save:", profileDataToSave);
      
      if (username !== profile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking username:", checkError.message);
        } else if (existingUser) {
          throw new Error("Username is already taken. Please choose another one.");
        }
      }
      
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error("Error checking existing profile:", selectError.message);
        throw selectError;
      }
      
      let result;
      
      if (existingProfile) {
        result = await supabase
          .from('profiles')
          .update(profileDataToSave)
          .eq('id', user.id)
          .select()
          .single(); 
      } else {
        result = await supabase
          .from('profiles')
          .insert({
            ...profileDataToSave,
            id: user.id,
            created_at: new Date().toISOString()
          })
          .select()
          .single();
      }
      
      if (result.error) {
        console.error("Error from Supabase:", result.error);
        throw result.error;
      }
      
      console.log("Profile saved successfully", result.data);
      if (result.data) {
        const updatedProfile: UserProfile = {
          id: result.data.id,
          username: result.data.username || "",
          display_name: result.data.display_name || "",
          bio: result.data.bio || "",
          favorite_genres: result.data.favorite_genres || [],
          avatar_url: result.data.profile_picture, 
          role: (result.data.role as UserProfile['role']) || "user",
          social_links: result.data.social_links || { instagram: '', twitter: '', website: '' },
          theme: result.data.theme || 'default',
          is_public: result.data.is_public === null ? true : result.data.is_public,
        };
        setProfile(updatedProfile);
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Error updating profile:", error.message);
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
    profile,
    isLoading,
    isSaving,
    error,
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
