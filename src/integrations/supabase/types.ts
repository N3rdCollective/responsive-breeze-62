export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advertisements: {
        Row: {
          active: boolean | null
          created_at: string | null
          end_date: string
          height: number
          id: string
          image_url: string
          link_url: string | null
          location: string
          name: string
          start_date: string
          updated_at: string | null
          weight: number | null
          width: number
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          end_date: string
          height: number
          id?: string
          image_url: string
          link_url?: string | null
          location: string
          name: string
          start_date: string
          updated_at?: string | null
          weight?: number | null
          width: number
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          end_date?: string
          height?: number
          id?: string
          image_url?: string
          link_url?: string | null
          location?: string
          name?: string
          start_date?: string
          updated_at?: string | null
          weight?: number | null
          width?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          ticket_packages: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          ticket_packages?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          ticket_packages?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      featured_artists: {
        Row: {
          active: boolean | null
          artist_image: string | null
          artist_name: string
          artist_page_link: string | null
          bio: string | null
          created_at: string | null
          end_date: string
          id: string
          instagram_url: string | null
          start_date: string
          twitter_url: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          artist_image?: string | null
          artist_name: string
          artist_page_link?: string | null
          bio?: string | null
          created_at?: string | null
          end_date: string
          id?: string
          instagram_url?: string | null
          start_date: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          artist_image?: string | null
          artist_name?: string
          artist_page_link?: string | null
          bio?: string | null
          created_at?: string | null
          end_date?: string
          id?: string
          instagram_url?: string | null
          start_date?: string
          twitter_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hosts: {
        Row: {
          bio: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      members: {
        Row: {
          approved: boolean | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          approved?: boolean | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          approved?: boolean | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          category: string | null
          content: string | null
          created_at: string | null
          featured_image: string | null
          id: string
          post_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          post_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          featured_image?: string | null
          id?: string
          post_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      shows: {
        Row: {
          created_at: string | null
          days: string[]
          description: string | null
          end_time: string
          host_id: string | null
          id: string
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days: string[]
          description?: string | null
          end_time: string
          host_id?: string | null
          id?: string
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days?: string[]
          description?: string | null
          end_time?: string
          host_id?: string | null
          id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shows_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      slider_items: {
        Row: {
          created_at: string | null
          description: string | null
          height: number | null
          id: string
          media_type: string | null
          media_url: string
          sort_order: number | null
          title: string
          updated_at: string | null
          url: string | null
          width: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: string
          media_type?: string | null
          media_url: string
          sort_order?: number | null
          title: string
          updated_at?: string | null
          url?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          height?: number | null
          id?: string
          media_type?: string | null
          media_url?: string
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          url?: string | null
          width?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_role: {
        Args: {
          required_role: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
