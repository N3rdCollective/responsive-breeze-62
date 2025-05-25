
import type { LucideIcon } from 'lucide-react';

export interface UserProfile {
  id: string;
  username?: string | null;
  display_name?: string | null;
  first_name?: string | null; // Added for enhanced signup
  last_name?: string | null; // Added for enhanced signup
  bio?: string | null;
  profile_picture?: string | null; // This is avatar_url in current schema. Keep for compatibility or refactor if needed.
  avatar_url?: string | null; // Preferred field name based on common Supabase naming
  favorite_genres?: string[] | null;
  social_links?: Record<string, string> | null;
  created_at?: string;
  updated_at?: string;
  is_public?: boolean;
  theme?: string; // e.g., 'light', 'dark', 'system'
  role?: string | null; // User role, e.g., 'user', 'moderator', 'admin'
  forum_post_count?: number;
  forum_signature?: string | null;
}

export interface NavigationItem {
  path: string;
  label: string;
  onClick?: () => void;
  icon?: LucideIcon | React.ElementType;
  iconOnly?: boolean;
  badgeCount?: number; // Added for unread message count
}

export interface UserPreferences {
  theme?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
}

export interface UserSearchResult {
  id: string;
  username: string;
  display_name?: string | null;
  avatar_url?: string | null;
}

