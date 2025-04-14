
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
      // We would add other tables here as needed
    };
  };
}
