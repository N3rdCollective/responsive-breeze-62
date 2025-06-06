
import { Json } from "@/integrations/supabase/types";

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

export interface Personality {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  social_links: SocialLinks | null;
  created_at: string | null;
  updated_at: string | null;
  start_date: string | null;
  display_order?: number;
  featured?: boolean;
}

export interface FormValues {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  twitter: string;
  instagram: string;
  facebook: string;
  featured?: boolean;
}

// PersonalityFormData represents the data structure used in the form
export interface PersonalityFormData {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  socialLinks?: SocialLinks;
  startDate?: Date | null;
  featured?: boolean;
}
