
export interface SystemSettings {
  id: string;
  site_title: string;
  site_tagline: string;
  contact_email: string | null;
  contact_phone: string | null;
  social_media_links: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  copyright_text: string;
  language: string;
  time_zone: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSettingsFormValues {
  site_title: string;
  site_tagline: string;
  contact_email: string;
  contact_phone: string;
  social_media_links: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  copyright_text: string;
  language: string;
  time_zone: string;
}
