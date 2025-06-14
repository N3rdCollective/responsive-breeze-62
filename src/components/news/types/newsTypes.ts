
/**
 * Common News component types
 */

export interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  author_name: string | null; // Keep both for compatibility
  status: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  featured_artist_id?: string | null;
}

export interface FeaturedArtist {
  id: string;
  name: string;
  bio: string;
  image_url: string | null;
  website: string | null;
  social_links?: {
    spotify?: string | null;
    instagram?: string | null;
    twitter?: string | null;
    youtube?: string | null;
  } | null;
  created_at: string | null;
  updated_at: string | null;
  is_archived: boolean | null;
  archived_at: string | null;
}
