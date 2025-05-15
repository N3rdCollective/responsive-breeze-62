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
      about_page: {
        Row: {
          backstory: string
          created_at: string | null
          genre_stats: string
          global_stats: string
          id: string
          mission: string
          possibilities_stats: string
          soundscape: string
          subtitle: string
          title: string
          updated_at: string | null
        }
        Insert: {
          backstory?: string
          created_at?: string | null
          genre_stats?: string
          global_stats?: string
          id?: string
          mission?: string
          possibilities_stats?: string
          soundscape?: string
          subtitle?: string
          title?: string
          updated_at?: string | null
        }
        Update: {
          backstory?: string
          created_at?: string | null
          genre_stats?: string
          global_stats?: string
          id?: string
          mission?: string
          possibilities_stats?: string
          soundscape?: string
          subtitle?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics: {
        Row: {
          country: string | null
          device_type: string | null
          id: string
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          visit_date: string | null
        }
        Insert: {
          country?: string | null
          device_type?: string | null
          id?: string
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visit_date?: string | null
        }
        Update: {
          country?: string | null
          device_type?: string | null
          id?: string
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          visit_date?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_timestamp: string
          participant1_id: string
          participant2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_timestamp?: string
          participant1_id: string
          participant2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_timestamp?: string
          participant1_id?: string
          participant2_id?: string
        }
        Relationships: []
      }
      featured_artists: {
        Row: {
          archived_at: string | null
          bio: string
          created_at: string | null
          id: string
          image_url: string | null
          is_archived: boolean | null
          name: string
          social_links: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          archived_at?: string | null
          bio: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          name: string
          social_links?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          archived_at?: string | null
          bio?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_archived?: boolean | null
          name?: string
          social_links?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      featured_videos: {
        Row: {
          created_at: string | null
          credit: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          thumbnail: string | null
          title: string
          updated_at: string | null
          youtube_id: string
        }
        Insert: {
          created_at?: string | null
          credit?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail?: string | null
          title: string
          updated_at?: string | null
          youtube_id: string
        }
        Update: {
          created_at?: string | null
          credit?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          thumbnail?: string | null
          title?: string
          updated_at?: string | null
          youtube_id?: string
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_edited: boolean
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_edited?: boolean
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_edited?: boolean
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          category_id: string
          created_at: string
          id: string
          is_locked: boolean
          is_sticky: boolean
          last_post_at: string
          last_post_user_id: string | null
          slug: string
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_sticky?: boolean
          last_post_at?: string
          last_post_user_id?: string | null
          slug: string
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_sticky?: boolean
          last_post_at?: string
          last_post_user_id?: string | null
          slug?: string
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_last_post_user_id_fkey"
            columns: ["last_post_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      home_settings: {
        Row: {
          created_at: string | null
          id: string
          show_hero: boolean
          show_live_banner: boolean
          show_news_section: boolean
          show_personalities: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_hero?: boolean
          show_live_banner?: boolean
          show_news_section?: boolean
          show_personalities?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          show_hero?: boolean
          show_live_banner?: boolean
          show_news_section?: boolean
          show_personalities?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      log_edits: {
        Row: {
          created_at: string
          edit_reason: string | null
          edited_by: string
          id: string
          log_id: string
          new_values: Json
          previous_values: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          edit_reason?: string | null
          edited_by: string
          id?: string
          log_id: string
          new_values: Json
          previous_values: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          edit_reason?: string | null
          edited_by?: string
          id?: string
          log_id?: string
          new_values?: Json
          previous_values?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_edits_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_edits_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "staff_activity_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          id: string
          is_deleted: boolean
          media_url: string | null
          recipient_id: string
          sender_id: string
          status: string
          timestamp: string
        }
        Insert: {
          content: string
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          recipient_id: string
          sender_id: string
          status?: string
          timestamp?: string
        }
        Update: {
          content?: string
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          recipient_id?: string
          sender_id?: string
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      pending_staff: {
        Row: {
          approved_at: string | null
          email: string
          id: string
          invited_at: string | null
          rejected_at: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          rejected_at?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          rejected_at?: string | null
          status?: string
        }
        Relationships: []
      }
      personalities: {
        Row: {
          bio: string | null
          created_at: string | null
          display_order: number | null
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          role: string
          social_links: Json | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          role?: string
          social_links?: Json | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_order?: number | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          role?: string
          social_links?: Json | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          author_name: string | null
          category: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          post_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          post_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          author_name?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          post_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          display_name: string | null
          favorite_genres: string[] | null
          id: string
          profile_picture: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id: string
          profile_picture?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          profile_picture?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      shows: {
        Row: {
          artwork_url: string | null
          created_at: string | null
          days: string[]
          description: string | null
          end_time: string
          external_id: string | null
          id: string
          personality_id: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          artwork_url?: string | null
          created_at?: string | null
          days: string[]
          description?: string | null
          end_time: string
          external_id?: string | null
          id?: string
          personality_id?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          artwork_url?: string | null
          created_at?: string | null
          days?: string[]
          description?: string | null
          end_time?: string
          external_id?: string | null
          id?: string
          personality_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shows_personality_id_fkey"
            columns: ["personality_id"]
            isOneToOne: false
            referencedRelation: "personalities"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors_affiliates: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          profile_picture: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          profile_picture?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          profile_picture?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          staff_id: string
          updated_at: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          staff_id: string
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          staff_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_activity_logs_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          copyright_text: string | null
          created_at: string | null
          id: string
          language: string | null
          site_tagline: string
          site_title: string
          social_media_links: Json | null
          time_zone: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          copyright_text?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          site_tagline?: string
          site_title?: string
          social_media_links?: Json | null
          time_zone?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          copyright_text?: string | null
          created_at?: string | null
          id?: string
          language?: string | null
          site_tagline?: string
          site_title?: string
          social_media_links?: Json | null
          time_zone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      timeline_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          media_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_staff: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_user_role: {
        Args: { required_role: string }
        Returns: boolean
      }
      create_activity_log: {
        Args: {
          p_staff_id: string
          p_action_type: string
          p_description: string
          p_entity_type?: string
          p_entity_id?: string
          p_details?: Json
          p_ip_address?: string
        }
        Returns: string
      }
      get_analytics_summary: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_visits: number
          unique_visitors: number
          page_path: string
          visit_count: number
          device_breakdown: Json
        }[]
      }
      increment_topic_view_count: {
        Args: { topic_id_param: string }
        Returns: undefined
      }
      staff_has_role: {
        Args: { user_id: string; required_roles: string[] }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
