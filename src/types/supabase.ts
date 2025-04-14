
export type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  profile_picture: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Profile>;
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          featured_image: string | null;
          post_date: string;
          category: string | null;
          author: string | null;
          author_name: string | null;
          status: string;
          tags: string[] | null;
          excerpt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string;
          featured_image?: string | null;
          post_date?: string;
          category?: string | null;
          author?: string | null;
          author_name?: string | null;
          status?: string;
          tags?: string[] | null;
          excerpt?: string | null;
        };
        Update: Partial<{
          title: string;
          content: string;
          featured_image: string | null;
          post_date: string;
          category: string | null;
          author: string | null;
          author_name: string | null;
          status: string;
          tags: string[] | null;
          excerpt: string | null;
        }>;
      };
      // Add other tables as needed
    };
  };
}
