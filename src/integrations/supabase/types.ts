export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          hiker_id: string
          id: string
          participants: number
          special_requests: string | null
          status: string
          total_price: number
          tour_id: string
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          hiker_id: string
          id?: string
          participants?: number
          special_requests?: string | null
          status?: string
          total_price: number
          tour_id: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          hiker_id?: string
          id?: string
          participants?: number
          special_requests?: string | null
          status?: string
          total_price?: number
          tour_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hiker_id_fkey"
            columns: ["hiker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_profiles: {
        Row: {
          active_since: string | null
          bio: string | null
          certifications: Json | null
          created_at: string
          daily_rate: number | null
          daily_rate_currency: Database["public"]["Enums"]["currency"] | null
          difficulty_levels: string[] | null
          display_name: string
          experience_years: number | null
          facebook_url: string | null
          guiding_areas: string[] | null
          hero_background_url: string | null
          id: string
          instagram_url: string | null
          languages_spoken: string[] | null
          location: string | null
          max_group_size: number | null
          min_group_size: number | null
          onboarding_step: number | null
          phone: string | null
          portfolio_images: string[] | null
          profile_completed: boolean | null
          profile_image_url: string | null
          seasonal_availability: string | null
          specialties: string[] | null
          terrain_capabilities: string[] | null
          upcoming_availability_end: string | null
          upcoming_availability_start: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          active_since?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string
          daily_rate?: number | null
          daily_rate_currency?: Database["public"]["Enums"]["currency"] | null
          difficulty_levels?: string[] | null
          display_name: string
          experience_years?: number | null
          facebook_url?: string | null
          guiding_areas?: string[] | null
          hero_background_url?: string | null
          id?: string
          instagram_url?: string | null
          languages_spoken?: string[] | null
          location?: string | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          phone?: string | null
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          specialties?: string[] | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          active_since?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string
          daily_rate?: number | null
          daily_rate_currency?: Database["public"]["Enums"]["currency"] | null
          difficulty_levels?: string[] | null
          display_name?: string
          experience_years?: number | null
          facebook_url?: string | null
          guiding_areas?: string[] | null
          hero_background_url?: string | null
          id?: string
          instagram_url?: string | null
          languages_spoken?: string[] | null
          location?: string | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          phone?: string | null
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          specialties?: string[] | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
      kv_store_158bb0c0: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          guide_id: string
          hiker_id: string
          id: string
          rating: number
          tour_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          guide_id: string
          hiker_id: string
          id?: string
          rating: number
          tour_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          guide_id?: string
          hiker_id?: string
          id?: string
          rating?: number
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hiker_id_fkey"
            columns: ["hiker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_step_templates: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          item_text: string
          sort_order: number
          step_name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          item_text: string
          sort_order?: number
          step_name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          item_text?: string
          sort_order?: number
          step_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tours: {
        Row: {
          archived: boolean | null
          available_dates: string[]
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          daily_hours: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          distance_km: number | null
          duration: string
          elevation_gain_m: number | null
          excluded_items: string[] | null
          group_size: number
          guide_avatar_url: string | null
          guide_display_name: string | null
          guide_id: string
          hero_image: string | null
          highlights: string[]
          id: string
          images: string[]
          includes: string[]
          is_active: boolean
          itinerary: Json | null
          meeting_point: string
          meta_description: string | null
          meta_title: string | null
          pack_weight: number | null
          price: number
          rating: number | null
          region: Database["public"]["Enums"]["region"]
          reviews_count: number | null
          service_fee: number | null
          short_description: string | null
          slug: string | null
          terrain_types: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          available_dates?: string[]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          daily_hours?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          distance_km?: number | null
          duration: string
          elevation_gain_m?: number | null
          excluded_items?: string[] | null
          group_size: number
          guide_avatar_url?: string | null
          guide_display_name?: string | null
          guide_id: string
          hero_image?: string | null
          highlights?: string[]
          id?: string
          images?: string[]
          includes?: string[]
          is_active?: boolean
          itinerary?: Json | null
          meeting_point: string
          meta_description?: string | null
          meta_title?: string | null
          pack_weight?: number | null
          price: number
          rating?: number | null
          region: Database["public"]["Enums"]["region"]
          reviews_count?: number | null
          service_fee?: number | null
          short_description?: string | null
          slug?: string | null
          terrain_types?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          available_dates?: string[]
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          daily_hours?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          distance_km?: number | null
          duration?: string
          elevation_gain_m?: number | null
          excluded_items?: string[] | null
          group_size?: number
          guide_avatar_url?: string | null
          guide_display_name?: string | null
          guide_id?: string
          hero_image?: string | null
          highlights?: string[]
          id?: string
          images?: string[]
          includes?: string[]
          is_active?: boolean
          itinerary?: Json | null
          meeting_point?: string
          meta_description?: string | null
          meta_title?: string | null
          pack_weight?: number | null
          price?: number
          rating?: number | null
          region?: Database["public"]["Enums"]["region"]
          reviews_count?: number | null
          service_fee?: number | null
          short_description?: string | null
          slug?: string | null
          terrain_types?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tours_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_verifications: {
        Row: {
          admin_notes: string | null
          company_name: string | null
          created_at: string
          experience_years: number | null
          id: string
          insurance_info: string | null
          license_number: string | null
          updated_at: string
          user_id: string
          verification_documents: string[] | null
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          admin_notes?: string | null
          company_name?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          insurance_info?: string | null
          license_number?: string | null
          updated_at?: string
          user_id: string
          verification_documents?: string[] | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          admin_notes?: string | null
          company_name?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          insurance_info?: string | null
          license_number?: string | null
          updated_at?: string
          user_id?: string
          verification_documents?: string[] | null
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "user_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      website_images: {
        Row: {
          alt_text: string | null
          bucket_id: string
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          id: string
          is_active: boolean | null
          priority: number | null
          tags: string[] | null
          updated_at: string
          uploaded_by: string
          usage_context: string[] | null
        }
        Insert: {
          alt_text?: string | null
          bucket_id: string
          category: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          tags?: string[] | null
          updated_at?: string
          uploaded_by: string
          usage_context?: string[] | null
        }
        Update: {
          alt_text?: string | null
          bucket_id?: string
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_active?: boolean | null
          priority?: number | null
          tags?: string[] | null
          updated_at?: string
          uploaded_by?: string
          usage_context?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_role_if_user_exists: {
        Args: { user_email: string }
        Returns: undefined
      }
      generate_tour_slug: {
        Args: { tour_region: string; tour_title: string }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { _role: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "hiker" | "guide" | "admin"
      currency: "EUR" | "GBP"
      difficulty: "easy" | "moderate" | "challenging" | "expert"
      region: "dolomites" | "pyrenees" | "scotland"
      verification_status: "pending" | "approved" | "rejected" | "not_requested"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["hiker", "guide", "admin"],
      currency: ["EUR", "GBP"],
      difficulty: ["easy", "moderate", "challenging", "expert"],
      region: ["dolomites", "pyrenees", "scotland"],
      verification_status: ["pending", "approved", "rejected", "not_requested"],
    },
  },
} as const
