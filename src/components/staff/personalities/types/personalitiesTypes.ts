
export interface Personality {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  social_links: Record<string, string> | null;
  show_times: Record<string, string> | null;
  start_date: string | null;
  created_at: string;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginatedPersonalities {
  data: Personality[];
  pagination: PaginationMeta;
}
