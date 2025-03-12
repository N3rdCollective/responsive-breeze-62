
export interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
}

export interface SponsorFormData {
  name: string;
  logo_url: string;
  website_url: string;
  description: string;
  is_active: boolean;
  logo_file?: File | null;
  display_order?: number;
}

export interface LogoUploadResponse {
  url: string;
  error?: string;
}
