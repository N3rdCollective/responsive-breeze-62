
import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/types/profile";

const initialSocialLinksState: UserProfile['social_links'] = { instagram: null, twitter: null, website: null };

interface UseProfileFormFieldsProps {
  profileData: UserProfile | null;
  defaultUsernameForNewUser?: string;
  isNewUserMode: boolean;
  userEmail?: string | null; 
}

export const useProfileFormFields = ({
  profileData,
  defaultUsernameForNewUser,
  isNewUserMode,
  userEmail,
}: UseProfileFormFieldsProps) => {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>("user");
  const [socialLinks, setSocialLinks] = useState<UserProfile['social_links']>(initialSocialLinksState);
  const [theme, setTheme] = useState<string>('default');
  const [isPublic, setIsPublic] = useState<boolean>(true);

  const populateFormFields = useCallback(() => {
    if (profileData) {
      setDisplayName(profileData.display_name || "");
      setUsername(profileData.username || "");
      setBio(profileData.bio || "");
      setSelectedGenres(profileData.favorite_genres || []);
      setSelectedRole(profileData.role || "user");
      setSocialLinks(profileData.social_links || initialSocialLinksState);
      setTheme(profileData.theme || 'default');
      setIsPublic(profileData.is_public ?? true);
    } else if (isNewUserMode) {
      setUsername(defaultUsernameForNewUser || "");
      setDisplayName(userEmail?.split('@')[0] || "New User");
      setBio("");
      setSelectedGenres([]);
      setSelectedRole("user");
      setSocialLinks(initialSocialLinksState);
      setTheme('default');
      setIsPublic(true);
    } else {
      setDisplayName("");
      setUsername("");
      setBio("");
      setSelectedGenres([]);
      setSelectedRole("user");
      setSocialLinks(initialSocialLinksState);
      setTheme('default');
      setIsPublic(true);
    }
  }, [profileData, isNewUserMode, defaultUsernameForNewUser, userEmail]);

  useEffect(() => {
    populateFormFields();
  }, [populateFormFields]);

  return {
    displayName, setDisplayName,
    username, setUsername,
    bio, setBio,
    selectedGenres, setSelectedGenres,
    selectedRole, setSelectedRole,
    socialLinks, setSocialLinks,
    theme, setTheme,
    isPublic, setIsPublic,
    getProfileFormData: useCallback(() => ({
      username,
      displayName,
      bio,
      selectedGenres,
      selectedRole,
      socialLinks,
      theme,
      isPublic,
    }), [username, displayName, bio, selectedGenres, selectedRole, socialLinks, theme, isPublic]),
  };
};
