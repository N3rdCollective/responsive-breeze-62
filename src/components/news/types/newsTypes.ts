
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
  status: string;
  tags?: string[];
  featured_artist_id?: string | null;
}

export interface FeaturedArtist {
  id: string;
  name: string;
  bio: string;
  image_url: string | null;
  website?: string | null;
  social_links?: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  } | null;
  created_at?: string;
  updated_at?: string;
}
