export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  favorite_genres: string[] | null;
  avatar_url: string | null; 
  role: 'user' | 'artist' | 'producer' | 'industry_professional' | 'Music Fan' | 'DJ' | 'Band Member' | 'Music Journalist' | 'Label Owner'; 
  social_links?: { 
    instagram?: string | null;
    twitter?: string | null;
    website?: string | null;
  } | null;
  theme?: string | null;
  is_public?: boolean | null;
  created_at: string; 
  forum_signature: string | null;
  forum_post_count: number;
}

export type NavigationItem = {
  path: string;
  label: string;
  onClick?: () => void;
  icon?: React.ElementType; // Add optional icon
  iconOnly?: boolean; // Added for icon-only display
}
