
export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  favorite_genres: string[] | null;
  avatar_url: string | null;
  role: 'user' | 'artist' | 'producer' | 'industry_professional';
}

export type NavigationItem = {
  path: string;
  label: string;
  onClick?: () => void;
}
