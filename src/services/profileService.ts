
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types/profile";
import { User } from "@supabase/supabase-js";

const initialSocialLinksService: UserProfile['social_links'] = { instagram: null, twitter: null, website: null };

// New function to upload avatar
export const uploadAvatar = async (user: User, file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`; // Store at the root of 'avatars' bucket

  console.log(`Service: Uploading avatar ${filePath} for user ${user.id}`);

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600', // Cache for 1 hour
      upsert: true, // Replace if exists, useful for re-uploads
    });

  if (uploadError) {
    console.error("Service: Error uploading avatar:", uploadError.message);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    console.error("Service: Could not get public URL for avatar.");
    throw new Error('Failed to get public URL for avatar.');
  }
  
  // Append a timestamp to bust cache for the new image
  const newAvatarUrlWithCacheBuster = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
  console.log("Service: Avatar uploaded, public URL:", newAvatarUrlWithCacheBuster);
  return newAvatarUrlWithCacheBuster;
};


export const fetchUserProfileData = async (
  user: User,
  initialSocialLinks: UserProfile['social_links']
): Promise<UserProfile | { isNewUser: true, defaultUsername: string }> => {
  console.log("Service: Fetching profile for user:", user.id);
  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) {
    console.error("Service: Error fetching profile:", fetchError.message);
    throw fetchError;
  }

  console.log("Service: Profile data returned:", data);

  if (data) {
    const rawSocialLinks = data.social_links;
    const processedSocialLinks: UserProfile['social_links'] =
      (typeof rawSocialLinks === 'object' && rawSocialLinks !== null && !Array.isArray(rawSocialLinks))
        ? {
          instagram: (rawSocialLinks as any).instagram || null,
          twitter: (rawSocialLinks as any).twitter || null,
          website: (rawSocialLinks as any).website || null,
        }
        : initialSocialLinks;

    return {
      id: data.id,
      username: data.username || "",
      display_name: data.display_name || "",
      bio: data.bio || "",
      favorite_genres: data.favorite_genres || [],
      // The database column is 'profile_picture', we map it to 'avatar_url' in the type
      avatar_url: data.profile_picture, 
      role: (data.role as UserProfile['role']) || "user",
      social_links: processedSocialLinks,
      theme: data.theme || 'default',
      is_public: data.is_public ?? true,
    };
  } else {
    console.log("Service: No profile found, indicating new user setup.");
    const defaultUsername = user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') || `user${Date.now()}`;
    return { isNewUser: true, defaultUsername };
  }
};

export const saveUserProfileData = async (
  user: User,
  profileData: {
    username: string;
    displayName: string;
    bio: string;
    selectedGenres: string[];
    selectedRole: UserProfile['role'];
    socialLinks: UserProfile['social_links'];
    theme: string;
    isPublic: boolean;
    avatarUrl?: string | null; // Added avatarUrl
  },
  currentUsername: string | undefined
): Promise<UserProfile> => {
  console.log("Service: Saving profile for user:", user.id);
  
  const dataToSave: any = { // Use 'any' temporarily for flexibility or define a more specific type
    username: profileData.username,
    display_name: profileData.displayName,
    bio: profileData.bio,
    favorite_genres: profileData.selectedGenres,
    role: profileData.selectedRole,
    social_links: profileData.socialLinks,
    theme: profileData.theme,
    is_public: profileData.isPublic,
    updated_at: new Date().toISOString()
  };

  // Only include profile_picture if avatarUrl is provided
  if (profileData.avatarUrl !== undefined) {
    // Ensure we remove cache buster before saving to DB if it exists
    dataToSave.profile_picture = profileData.avatarUrl ? profileData.avatarUrl.split('?t=')[0] : null;
  }
  
  console.log("Service: Profile data to save:", dataToSave);

  if (profileData.username !== currentUsername) {
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', profileData.username)
      .neq('id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error("Service: Error checking username:", checkError.message);
      // Potentially throw or handle as appropriate for the hook
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
    console.error("Service: Error checking existing profile:", selectError.message);
    throw selectError;
  }

  let result;
  if (existingProfile) {
    result = await supabase
      .from('profiles')
      .update(dataToSave)
      .eq('id', user.id)
      .select()
      .single();
  } else {
    result = await supabase
      .from('profiles')
      .insert({
        ...dataToSave,
        id: user.id,
        created_at: new Date().toISOString() // Ensure created_at is set for new profiles
      })
      .select()
      .single();
  }

  if (result.error) {
    console.error("Service: Error from Supabase on save:", result.error);
    throw result.error;
  }

  console.log("Service: Profile saved successfully", result.data);
  
  const rawSocialLinksSaved = result.data.social_links;
  const processedSocialLinksSaved: UserProfile['social_links'] =
    (typeof rawSocialLinksSaved === 'object' && rawSocialLinksSaved !== null && !Array.isArray(rawSocialLinksSaved))
      ? {
        instagram: (rawSocialLinksSaved as any).instagram || null,
        twitter: (rawSocialLinksSaved as any).twitter || null,
        website: (rawSocialLinksSaved as any).website || null,
      }
      : initialSocialLinksService; 

  return {
    id: result.data.id,
    username: result.data.username || "",
    display_name: result.data.display_name || "",
    bio: result.data.bio || "",
    favorite_genres: result.data.favorite_genres || [],
    avatar_url: result.data.profile_picture, // Mapped from profile_picture
    role: (result.data.role as UserProfile['role']) || "user",
    social_links: processedSocialLinksSaved,
    theme: result.data.theme || 'default',
    is_public: result.data.is_public ?? true,
  };
};

