
import { Json } from "@/integrations/supabase/types";

export interface ShowTimes {
  days: string[];
  start: string;
  end: string;
}

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
  show_times: ShowTimes | null;
  social_links: SocialLinks | null;
  created_at: string | null;
  updated_at: string | null;
  start_date: string | null;
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
}

// PersonalityFormData represents the data structure used in the form
export interface PersonalityFormData {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  social_links?: {
    twitter: string;
    instagram: string;
    facebook: string;
  };
  startDate?: Date | null;
  socialLinks?: SocialLinks;
}
