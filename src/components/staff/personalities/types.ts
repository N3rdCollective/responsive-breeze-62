
export interface Personality {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  social_links: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  } | null;
  created_at: string;
  updated_at: string | null;
  start_date: string | null;
  display_order?: number;
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

export interface PersonalityFormData {
  name: string;
  role: string;
  bio: string;
  image_url: string;
  socialLinks: {
    twitter: string;
    instagram: string;
    facebook: string;
  };
  startDate: Date | null;
  display_order?: number;
}
