
export interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  author_name: string | null; // Add author_name property
  status: string;
  created_at: string;
  tags?: string[]; // Add tags property
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginatedPosts {
  data: Post[];
  pagination: PaginationMeta;
}
