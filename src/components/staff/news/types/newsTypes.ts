
export interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  status: string;
  created_at: string;
}
