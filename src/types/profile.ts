
export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  favorite_genres: string[] | null;
  avatar_url: string | null; // This was 'profile_picture' in db, mapped in useProfile
  role: 'user' | 'artist' | 'producer' | 'industry_professional' | 'Music Fan' | 'DJ' | 'Band Member' | 'Music Journalist' | 'Label Owner'; // Added new roles
  social_links?: { // Made optional and specific
    instagram?: string | null;
    twitter?: string | null;
    website?: string | null;
  } | null;
  theme?: string | null;
  is_public?: boolean | null;
}

export type NavigationItem = {
  path: string;
  label: string;
  onClick?: () => void;
}
