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
      automated_messages: {
        Row: {
          created_at: string | null
          delay_minutes: number | null
          guide_id: string
          id: string
          is_active: boolean | null
          message_template: string
          tour_id: string | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delay_minutes?: number | null
          guide_id: string
          id?: string
          is_active?: boolean | null
          message_template: string
          tour_id?: string | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delay_minutes?: number | null
          guide_id?: string
          id?: string
          is_active?: boolean | null
          message_template?: string
          tour_id?: string | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_messages_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_messages_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_reference: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          date_slot_id: string | null
          deposit_amount: number | null
          discount_amount: number | null
          discount_code: string | null
          escrow_enabled: boolean | null
          final_payment_amount: number | null
          final_payment_due_date: string | null
          final_payment_intent_id: string | null
          final_payment_status: string | null
          guide_fee_amount: number | null
          hiker_email: string | null
          hiker_id: string
          id: string
          insurance_file_url: string | null
          insurance_uploaded_at: string | null
          participants: number
          participants_details: Json | null
          payment_status: string | null
          payment_type: string | null
          platform_revenue: number | null
          primary_contact_id: string | null
          refund_amount: number | null
          refund_reason: string | null
          refund_status: string | null
          refunded_at: string | null
          service_fee_amount: number | null
          special_requests: string | null
          status: string
          stripe_client_secret: string | null
          stripe_payment_intent_id: string | null
          stripe_refund_id: string | null
          stripe_transfer_id: string | null
          subtotal: number | null
          total_price: number
          tour_id: string
          transfer_amount: number | null
          transfer_created_at: string | null
          transfer_status: string | null
          updated_at: string
          waiver_data: Json | null
          waiver_uploaded_at: string | null
        }
        Insert: {
          booking_date: string
          booking_reference?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          date_slot_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          discount_code?: string | null
          escrow_enabled?: boolean | null
          final_payment_amount?: number | null
          final_payment_due_date?: string | null
          final_payment_intent_id?: string | null
          final_payment_status?: string | null
          guide_fee_amount?: number | null
          hiker_email?: string | null
          hiker_id: string
          id?: string
          insurance_file_url?: string | null
          insurance_uploaded_at?: string | null
          participants?: number
          participants_details?: Json | null
          payment_status?: string | null
          payment_type?: string | null
          platform_revenue?: number | null
          primary_contact_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          service_fee_amount?: number | null
          special_requests?: string | null
          status?: string
          stripe_client_secret?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          subtotal?: number | null
          total_price: number
          tour_id: string
          transfer_amount?: number | null
          transfer_created_at?: string | null
          transfer_status?: string | null
          updated_at?: string
          waiver_data?: Json | null
          waiver_uploaded_at?: string | null
        }
        Update: {
          booking_date?: string
          booking_reference?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          date_slot_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          discount_code?: string | null
          escrow_enabled?: boolean | null
          final_payment_amount?: number | null
          final_payment_due_date?: string | null
          final_payment_intent_id?: string | null
          final_payment_status?: string | null
          guide_fee_amount?: number | null
          hiker_email?: string | null
          hiker_id?: string
          id?: string
          insurance_file_url?: string | null
          insurance_uploaded_at?: string | null
          participants?: number
          participants_details?: Json | null
          payment_status?: string | null
          payment_type?: string | null
          platform_revenue?: number | null
          primary_contact_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_status?: string | null
          refunded_at?: string | null
          service_fee_amount?: number | null
          special_requests?: string | null
          status?: string
          stripe_client_secret?: string | null
          stripe_payment_intent_id?: string | null
          stripe_refund_id?: string | null
          stripe_transfer_id?: string | null
          subtotal?: number | null
          total_price?: number
          tour_id?: string
          transfer_amount?: number | null
          transfer_created_at?: string | null
          transfer_status?: string | null
          updated_at?: string
          waiver_data?: Json | null
          waiver_uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_date_slot_id_fkey"
            columns: ["date_slot_id"]
            isOneToOne: false
            referencedRelation: "tour_date_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hiker_id_fkey"
            columns: ["hiker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
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
      chat_attachments: {
        Row: {
          blurred_regions: Json | null
          conversation_id: string
          created_at: string | null
          detected_violations: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          message_id: string
          moderation_status: string | null
          thumbnail_path: string | null
          uploader_id: string | null
        }
        Insert: {
          blurred_regions?: Json | null
          conversation_id: string
          created_at?: string | null
          detected_violations?: Json | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          message_id: string
          moderation_status?: string | null
          thumbnail_path?: string | null
          uploader_id?: string | null
        }
        Update: {
          blurred_regions?: Json | null
          conversation_id?: string
          created_at?: string | null
          detected_violations?: Json | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          message_id?: string
          moderation_status?: string | null
          thumbnail_path?: string | null
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_attachments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_attachments_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          guide_id: string
          id: string
          is_active: boolean | null
          message_content: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          guide_id: string
          id?: string
          is_active?: boolean | null
          message_content: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          guide_id?: string
          id?: string
          is_active?: boolean | null
          message_content?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          anonymous_email: string | null
          anonymous_name: string | null
          booking_id: string | null
          conversation_type: string
          created_at: string | null
          guide_id: string | null
          hiker_id: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          status: string | null
          tour_id: string | null
          updated_at: string | null
        }
        Insert: {
          anonymous_email?: string | null
          anonymous_name?: string | null
          booking_id?: string | null
          conversation_type?: string
          created_at?: string | null
          guide_id?: string | null
          hiker_id?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string | null
          tour_id?: string | null
          updated_at?: string | null
        }
        Update: {
          anonymous_email?: string | null
          anonymous_name?: string | null
          booking_id?: string | null
          conversation_type?: string
          created_at?: string | null
          guide_id?: string | null
          hiker_id?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string | null
          tour_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_hiker_id_fkey"
            columns: ["hiker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_code_usage: {
        Row: {
          booking_id: string
          booking_total_after: number | null
          booking_total_before: number | null
          currency: string | null
          discount_amount: number
          discount_code_id: string
          id: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          booking_id: string
          booking_total_after?: number | null
          booking_total_before?: number | null
          currency?: string | null
          discount_amount: number
          discount_code_id: string
          id?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string
          booking_total_after?: number | null
          booking_total_before?: number | null
          currency?: string | null
          discount_amount?: number
          discount_code_id?: string
          id?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discount_code_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usage_discount_code_id_fkey"
            columns: ["discount_code_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_code_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          applicable_tour_ids: string[] | null
          code: string
          created_at: string | null
          created_by: string | null
          discount_type: string
          discount_value: number
          guide_id: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_uses: number | null
          min_purchase_amount: number | null
          scope: string
          source_id: string | null
          source_type: string | null
          times_used: number | null
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_tour_ids?: string[] | null
          code: string
          created_at?: string | null
          created_by?: string | null
          discount_type: string
          discount_value: number
          guide_id?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          scope: string
          source_id?: string | null
          source_type?: string | null
          times_used?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_tour_ids?: string[] | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          guide_id?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_uses?: number | null
          min_purchase_amount?: number | null
          scope?: string
          source_id?: string | null
          source_type?: string | null
          times_used?: number | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          booking_id: string
          id: string
          recipient_email: string
          sent_at: string | null
          status: string | null
          subject: string
          template_id: string | null
        }
        Insert: {
          booking_id: string
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string | null
          subject: string
          template_id?: string | null
        }
        Update: {
          booking_id?: string
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          content: string
          created_at: string | null
          description: string | null
          guide_id: string
          id: string
          is_active: boolean | null
          name: string
          send_as_email: boolean | null
          subject: string
          timing_direction: string | null
          timing_unit: string | null
          timing_value: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          description?: string | null
          guide_id: string
          id?: string
          is_active?: boolean | null
          name: string
          send_as_email?: boolean | null
          subject: string
          timing_direction?: string | null
          timing_unit?: string | null
          timing_value?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          description?: string | null
          guide_id?: string
          id?: string
          is_active?: boolean | null
          name?: string
          send_as_email?: boolean | null
          subject?: string
          timing_direction?: string | null
          timing_unit?: string | null
          timing_value?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      followed_guides: {
        Row: {
          followed_at: string
          follower_id: string
          guide_id: string
          id: string
        }
        Insert: {
          followed_at?: string
          follower_id: string
          guide_id: string
          id?: string
        }
        Update: {
          followed_at?: string
          follower_id?: string
          guide_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followed_guides_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "followed_guides_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      guide_profiles: {
        Row: {
          account_link_expires_at: string | null
          account_link_url: string | null
          active_since: string | null
          address_city: string | null
          address_line1: string | null
          address_line2: string | null
          address_postal_code: string | null
          address_state: string | null
          bank_account_last4: string | null
          bio: string | null
          cancellation_approach: string | null
          cancellation_policy_type: string | null
          certifications: Json | null
          country: string | null
          created_at: string
          custom_guide_fee_percentage: number | null
          custom_hiker_fee_percentage: number | null
          daily_rate: number | null
          daily_rate_currency: Database["public"]["Enums"]["currency"] | null
          date_of_birth: string | null
          deposit_amount: number | null
          deposit_type: string | null
          difficulty_levels: string[] | null
          display_name: string
          early_bird_settings: Json | null
          experience_years: number | null
          facebook_url: string | null
          final_payment_days: number | null
          group_discount_settings: Json | null
          guiding_areas: string[] | null
          hero_background_url: string | null
          id: string
          instagram_url: string | null
          intro_video_duration_seconds: number | null
          intro_video_file_path: string | null
          intro_video_size_bytes: number | null
          intro_video_thumbnail_url: string | null
          intro_video_url: string | null
          is_featured: boolean | null
          languages_spoken: string[] | null
          last_minute_settings: Json | null
          location: string | null
          location_formatted: string | null
          location_lat: number | null
          location_lng: number | null
          max_group_size: number | null
          min_group_size: number | null
          onboarding_step: number | null
          payout_schedule: string | null
          phone: string | null
          phone_country: string | null
          portfolio_images: string[] | null
          profile_completed: boolean | null
          profile_image_url: string | null
          seasonal_availability: string | null
          slug: string | null
          specialties: string[] | null
          stripe_account_id: string | null
          stripe_kyc_status: string | null
          stripe_requirements: Json | null
          terrain_capabilities: string[] | null
          upcoming_availability_end: string | null
          upcoming_availability_start: string | null
          updated_at: string
          user_id: string
          uses_custom_fees: boolean | null
          verified: boolean | null
          video_type: string | null
          website_url: string | null
        }
        Insert: {
          account_link_expires_at?: string | null
          account_link_url?: string | null
          active_since?: string | null
          address_city?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          bank_account_last4?: string | null
          bio?: string | null
          cancellation_approach?: string | null
          cancellation_policy_type?: string | null
          certifications?: Json | null
          country?: string | null
          created_at?: string
          custom_guide_fee_percentage?: number | null
          custom_hiker_fee_percentage?: number | null
          daily_rate?: number | null
          daily_rate_currency?: Database["public"]["Enums"]["currency"] | null
          date_of_birth?: string | null
          deposit_amount?: number | null
          deposit_type?: string | null
          difficulty_levels?: string[] | null
          display_name: string
          early_bird_settings?: Json | null
          experience_years?: number | null
          facebook_url?: string | null
          final_payment_days?: number | null
          group_discount_settings?: Json | null
          guiding_areas?: string[] | null
          hero_background_url?: string | null
          id?: string
          instagram_url?: string | null
          intro_video_duration_seconds?: number | null
          intro_video_file_path?: string | null
          intro_video_size_bytes?: number | null
          intro_video_thumbnail_url?: string | null
          intro_video_url?: string | null
          is_featured?: boolean | null
          languages_spoken?: string[] | null
          last_minute_settings?: Json | null
          location?: string | null
          location_formatted?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          payout_schedule?: string | null
          phone?: string | null
          phone_country?: string | null
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          slug?: string | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_kyc_status?: string | null
          stripe_requirements?: Json | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string
          user_id: string
          uses_custom_fees?: boolean | null
          verified?: boolean | null
          video_type?: string | null
          website_url?: string | null
        }
        Update: {
          account_link_expires_at?: string | null
          account_link_url?: string | null
          active_since?: string | null
          address_city?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          bank_account_last4?: string | null
          bio?: string | null
          cancellation_approach?: string | null
          cancellation_policy_type?: string | null
          certifications?: Json | null
          country?: string | null
          created_at?: string
          custom_guide_fee_percentage?: number | null
          custom_hiker_fee_percentage?: number | null
          daily_rate?: number | null
          daily_rate_currency?: Database["public"]["Enums"]["currency"] | null
          date_of_birth?: string | null
          deposit_amount?: number | null
          deposit_type?: string | null
          difficulty_levels?: string[] | null
          display_name?: string
          early_bird_settings?: Json | null
          experience_years?: number | null
          facebook_url?: string | null
          final_payment_days?: number | null
          group_discount_settings?: Json | null
          guiding_areas?: string[] | null
          hero_background_url?: string | null
          id?: string
          instagram_url?: string | null
          intro_video_duration_seconds?: number | null
          intro_video_file_path?: string | null
          intro_video_size_bytes?: number | null
          intro_video_thumbnail_url?: string | null
          intro_video_url?: string | null
          is_featured?: boolean | null
          languages_spoken?: string[] | null
          last_minute_settings?: Json | null
          location?: string | null
          location_formatted?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          payout_schedule?: string | null
          phone?: string | null
          phone_country?: string | null
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          slug?: string | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_kyc_status?: string | null
          stripe_requirements?: Json | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string
          user_id?: string
          uses_custom_fees?: boolean | null
          verified?: boolean | null
          video_type?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      help_faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          helpful_count: number
          id: string
          is_active: boolean
          not_helpful_count: number
          question: string
          search_keywords: string[] | null
          sort_order: number
          updated_at: string
          user_type: string
          view_count: number
        }
        Insert: {
          answer: string
          category: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_active?: boolean
          not_helpful_count?: number
          question: string
          search_keywords?: string[] | null
          sort_order?: number
          updated_at?: string
          user_type: string
          view_count?: number
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_active?: boolean
          not_helpful_count?: number
          question?: string
          search_keywords?: string[] | null
          sort_order?: number
          updated_at?: string
          user_type?: string
          view_count?: number
        }
        Relationships: []
      }
      help_searches: {
        Row: {
          created_at: string
          created_ticket: boolean
          id: string
          results_shown: Json | null
          search_query: string
          selected_faq_id: string | null
          user_id: string | null
          was_helpful: boolean | null
        }
        Insert: {
          created_at?: string
          created_ticket?: boolean
          id?: string
          results_shown?: Json | null
          search_query: string
          selected_faq_id?: string | null
          user_id?: string | null
          was_helpful?: boolean | null
        }
        Update: {
          created_at?: string
          created_ticket?: boolean
          id?: string
          results_shown?: Json | null
          search_query?: string
          selected_faq_id?: string | null
          user_id?: string | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "help_searches_selected_faq_id_fkey"
            columns: ["selected_faq_id"]
            isOneToOne: false
            referencedRelation: "help_faqs"
            referencedColumns: ["id"]
          },
        ]
      }
      hiking_regions: {
        Row: {
          country: string
          created_at: string
          description: string
          display_order: number | null
          gps_bounds: Json | null
          id: string
          is_active: boolean
          is_featured: boolean | null
          key_features: string[]
          region: string | null
          subregion: string
          updated_at: string
        }
        Insert: {
          country: string
          created_at?: string
          description: string
          display_order?: number | null
          gps_bounds?: Json | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          key_features?: string[]
          region?: string | null
          subregion: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          display_order?: number | null
          gps_bounds?: Json | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          key_features?: string[]
          region?: string | null
          subregion?: string
          updated_at?: string
        }
        Relationships: []
      }
      kv_store: {
        Row: {
          created_at: string | null
          expires_at: string
          key: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          key: string
          value: Json
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      kv_store_158bb0c0: {
        Row: {
          created_at: string | null
          expires_at: string
          key: string
          value: Json
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          key: string
          value: Json
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      launch_signups: {
        Row: {
          certifications: string[] | null
          created_at: string
          early_tester_interest: boolean | null
          email: string
          id: string
          regions: string[] | null
          source_section: string | null
          user_type: string
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          early_tester_interest?: boolean | null
          email: string
          id?: string
          regions?: string[] | null
          source_section?: string | null
          user_type: string
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          early_tester_interest?: boolean | null
          email?: string
          id?: string
          regions?: string[] | null
          source_section?: string | null
          user_type?: string
        }
        Relationships: []
      }
      message_read_receipts: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_automated: boolean | null
          message_type: string | null
          moderated_content: string | null
          moderation_flags: Json | null
          moderation_status: string | null
          sender_id: string | null
          sender_name: string | null
          sender_type: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_automated?: boolean | null
          message_type?: string | null
          moderated_content?: string | null
          moderation_flags?: Json | null
          moderation_status?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_automated?: boolean | null
          message_type?: string | null
          moderated_content?: string | null
          moderation_flags?: Json | null
          moderation_status?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email_digest_frequency: string | null
          email_on_new_message: boolean | null
          email_on_ticket_update: boolean | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_digest_frequency?: string | null
          email_on_new_message?: boolean | null
          email_on_ticket_update?: boolean | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_digest_frequency?: string | null
          email_on_new_message?: boolean | null
          email_on_ticket_update?: boolean | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_documents: {
        Row: {
          booking_id: string
          created_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          emergency_contact_submitted_at: string | null
          id: string
          insurance_document_url: string | null
          insurance_emergency_number: string | null
          insurance_policy_number: string | null
          insurance_provider: string | null
          insurance_submitted_at: string | null
          participant_token_id: string
          updated_at: string | null
          waiver_data: Json | null
          waiver_signature_url: string | null
          waiver_submitted_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          emergency_contact_submitted_at?: string | null
          id?: string
          insurance_document_url?: string | null
          insurance_emergency_number?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          insurance_submitted_at?: string | null
          participant_token_id: string
          updated_at?: string | null
          waiver_data?: Json | null
          waiver_signature_url?: string | null
          waiver_submitted_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          emergency_contact_submitted_at?: string | null
          id?: string
          insurance_document_url?: string | null
          insurance_emergency_number?: string | null
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          insurance_submitted_at?: string | null
          participant_token_id?: string
          updated_at?: string | null
          waiver_data?: Json | null
          waiver_signature_url?: string | null
          waiver_submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_documents_participant_token_id_fkey"
            columns: ["participant_token_id"]
            isOneToOne: false
            referencedRelation: "participant_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_tokens: {
        Row: {
          booking_id: string
          completed_at: string | null
          created_at: string | null
          emergency_contact_completed: boolean | null
          expires_at: string
          id: string
          insurance_completed: boolean | null
          last_accessed_at: string | null
          participant_email: string
          participant_index: number
          participant_name: string
          reminder_count: number | null
          reminder_sent_at: string | null
          token_hash: string
          used_at: string | null
          waiver_completed: boolean | null
        }
        Insert: {
          booking_id: string
          completed_at?: string | null
          created_at?: string | null
          emergency_contact_completed?: boolean | null
          expires_at?: string
          id?: string
          insurance_completed?: boolean | null
          last_accessed_at?: string | null
          participant_email: string
          participant_index: number
          participant_name: string
          reminder_count?: number | null
          reminder_sent_at?: string | null
          token_hash: string
          used_at?: string | null
          waiver_completed?: boolean | null
        }
        Update: {
          booking_id?: string
          completed_at?: string | null
          created_at?: string | null
          emergency_contact_completed?: boolean | null
          expires_at?: string
          id?: string
          insurance_completed?: boolean | null
          last_accessed_at?: string | null
          participant_email?: string
          participant_index?: number
          participant_name?: string
          reminder_count?: number | null
          reminder_sent_at?: string | null
          token_hash?: string
          used_at?: string | null
          waiver_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participant_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accessibility_needs: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          dietary_preferences: Json | null
          email: string
          emergency_contact_country: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string | null
          hiking_experience: string | null
          id: string
          last_name: string | null
          medical_conditions: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          accessibility_needs?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: Json | null
          email: string
          emergency_contact_country?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          hiking_experience?: string | null
          id: string
          last_name?: string | null
          medical_conditions?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          accessibility_needs?: string | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_preferences?: Json | null
          email?: string
          emergency_contact_country?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          hiking_experience?: string | null
          id?: string
          last_name?: string | null
          medical_conditions?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referral_invitations: {
        Row: {
          clicked_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          invitation_token: string
          personal_message: string | null
          referee_email: string
          referral_link_id: string
          sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          clicked_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_token: string
          personal_message?: string | null
          referee_email: string
          referral_link_id: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          clicked_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_token?: string
          personal_message?: string | null
          referee_email?: string
          referral_link_id?: string
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_invitations_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_links: {
        Row: {
          click_count: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          referral_code: string
          referrer_id: string
          referrer_type: string
          reward_amount: number
          reward_currency: string | null
          reward_type: string
          target_type: string
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          referral_code: string
          referrer_id: string
          referrer_type: string
          reward_amount: number
          reward_currency?: string | null
          reward_type: string
          target_type: string
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          referral_code?: string
          referrer_id?: string
          referrer_type?: string
          reward_amount?: number
          reward_currency?: string | null
          reward_type?: string
          target_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_signups: {
        Row: {
          completed_at: string | null
          completion_booking_id: string | null
          created_at: string | null
          id: string
          invitation_id: string | null
          milestone_2_at: string | null
          milestone_2_id: string | null
          milestone_2_type: string | null
          profile_created_at: string | null
          referral_link_id: string
          reward_issued_at: string | null
          reward_status: string | null
          signup_email: string
          signup_source: string
          updated_at: string | null
          user_id: string
          user_type: string
          voucher_code: string | null
          voucher_id: string | null
          welcome_discount_code: string | null
          welcome_discount_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_booking_id?: string | null
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          milestone_2_at?: string | null
          milestone_2_id?: string | null
          milestone_2_type?: string | null
          profile_created_at?: string | null
          referral_link_id: string
          reward_issued_at?: string | null
          reward_status?: string | null
          signup_email: string
          signup_source: string
          updated_at?: string | null
          user_id: string
          user_type: string
          voucher_code?: string | null
          voucher_id?: string | null
          welcome_discount_code?: string | null
          welcome_discount_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_booking_id?: string | null
          created_at?: string | null
          id?: string
          invitation_id?: string | null
          milestone_2_at?: string | null
          milestone_2_id?: string | null
          milestone_2_type?: string | null
          profile_created_at?: string | null
          referral_link_id?: string
          reward_issued_at?: string | null
          reward_status?: string | null
          signup_email?: string
          signup_source?: string
          updated_at?: string | null
          user_id?: string
          user_type?: string
          voucher_code?: string | null
          voucher_id?: string | null
          welcome_discount_code?: string | null
          welcome_discount_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_signups_completion_booking_id_fkey"
            columns: ["completion_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_signups_completion_booking_id_fkey"
            columns: ["completion_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_signups_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "referral_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_signups_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_signups_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_signups_welcome_discount_id_fkey"
            columns: ["welcome_discount_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          click_count: number | null
          completed_at: string | null
          completion_booking_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_suspicious: boolean | null
          milestone_2_at: string | null
          milestone_2_id: string | null
          milestone_2_type: string | null
          profile_created_at: string | null
          referee_email: string | null
          referee_id: string | null
          referee_type: string | null
          referral_code: string
          referrer_id: string
          referrer_type: string
          reward_amount: number | null
          reward_currency: string | null
          reward_issued_at: string | null
          reward_status: string | null
          reward_type: string
          status: string | null
          target_type: string
          updated_at: string | null
          voucher_code: string | null
          voucher_id: string | null
        }
        Insert: {
          click_count?: number | null
          completed_at?: string | null
          completion_booking_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_suspicious?: boolean | null
          milestone_2_at?: string | null
          milestone_2_id?: string | null
          milestone_2_type?: string | null
          profile_created_at?: string | null
          referee_email?: string | null
          referee_id?: string | null
          referee_type?: string | null
          referral_code: string
          referrer_id: string
          referrer_type: string
          reward_amount?: number | null
          reward_currency?: string | null
          reward_issued_at?: string | null
          reward_status?: string | null
          reward_type: string
          status?: string | null
          target_type: string
          updated_at?: string | null
          voucher_code?: string | null
          voucher_id?: string | null
        }
        Update: {
          click_count?: number | null
          completed_at?: string | null
          completion_booking_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_suspicious?: boolean | null
          milestone_2_at?: string | null
          milestone_2_id?: string | null
          milestone_2_type?: string | null
          profile_created_at?: string | null
          referee_email?: string | null
          referee_id?: string | null
          referee_type?: string | null
          referral_code?: string
          referrer_id?: string
          referrer_type?: string
          reward_amount?: number | null
          reward_currency?: string | null
          reward_issued_at?: string | null
          reward_status?: string | null
          reward_type?: string
          status?: string | null
          target_type?: string
          updated_at?: string | null
          voucher_code?: string | null
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referee_id_fkey"
            columns: ["referee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reserved_slugs: {
        Row: {
          created_at: string | null
          description: string | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          slug?: string
        }
        Relationships: []
      }
      review_notifications: {
        Row: {
          booking_id: string
          clicked_at: string | null
          id: string
          notification_type: string
          opened_at: string | null
          recipient_id: string
          recipient_type: string
          sent_at: string | null
        }
        Insert: {
          booking_id: string
          clicked_at?: string | null
          id?: string
          notification_type: string
          opened_at?: string | null
          recipient_id: string
          recipient_type: string
          sent_at?: string | null
        }
        Update: {
          booking_id?: string
          clicked_at?: string | null
          id?: string
          notification_type?: string
          opened_at?: string | null
          recipient_id?: string
          recipient_type?: string
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
        ]
      }
      review_responses: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          moderation_flags: Json | null
          moderation_status: string | null
          responder_id: string
          responder_type: string
          response_text: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          moderation_flags?: Json | null
          moderation_status?: string | null
          responder_id: string
          responder_type: string
          response_text: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          moderation_flags?: Json | null
          moderation_status?: string | null
          responder_id?: string
          responder_type?: string
          response_text?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_responses_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          category_ratings: Json | null
          comment: string | null
          created_at: string
          expires_at: string | null
          guide_id: string
          highlight_tags: string[] | null
          hiker_id: string
          hiker_name: string | null
          id: string
          last_reminder_sent_at: string | null
          overall_rating: number
          paired_review_id: string | null
          photos: Json | null
          private_safety_notes: string | null
          published_at: string | null
          quick_assessment: Json | null
          reminder_sent_count: number | null
          review_status: string | null
          review_type: string | null
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          category_ratings?: Json | null
          comment?: string | null
          created_at?: string
          expires_at?: string | null
          guide_id: string
          highlight_tags?: string[] | null
          hiker_id: string
          hiker_name?: string | null
          id?: string
          last_reminder_sent_at?: string | null
          overall_rating: number
          paired_review_id?: string | null
          photos?: Json | null
          private_safety_notes?: string | null
          published_at?: string | null
          quick_assessment?: Json | null
          reminder_sent_count?: number | null
          review_status?: string | null
          review_type?: string | null
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          category_ratings?: Json | null
          comment?: string | null
          created_at?: string
          expires_at?: string | null
          guide_id?: string
          highlight_tags?: string[] | null
          hiker_id?: string
          hiker_name?: string | null
          id?: string
          last_reminder_sent_at?: string | null
          overall_rating?: number
          paired_review_id?: string | null
          photos?: Json | null
          private_safety_notes?: string | null
          published_at?: string | null
          quick_assessment?: Json | null
          reminder_sent_count?: number | null
          review_status?: string | null
          review_type?: string | null
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
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
            foreignKeyName: "reviews_paired_review_id_fkey"
            columns: ["paired_review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
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
      saved_tours: {
        Row: {
          id: string
          saved_at: string
          tour_id: string
          user_id: string
        }
        Insert: {
          id?: string
          saved_at?: string
          tour_id: string
          user_id: string
        }
        Update: {
          id?: string
          saved_at?: string
          tour_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_tours_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_balance_snapshots: {
        Row: {
          available_balance: Json
          created_at: string | null
          guide_id: string
          id: string
          pending_balance: Json
          platform_fees_collected: number | null
          reserved_balance: Json | null
          snapshot_date: string
          stripe_account_id: string
          total_payouts: number | null
          total_transfers: number | null
        }
        Insert: {
          available_balance: Json
          created_at?: string | null
          guide_id: string
          id?: string
          pending_balance: Json
          platform_fees_collected?: number | null
          reserved_balance?: Json | null
          snapshot_date: string
          stripe_account_id: string
          total_payouts?: number | null
          total_transfers?: number | null
        }
        Update: {
          available_balance?: Json
          created_at?: string | null
          guide_id?: string
          id?: string
          pending_balance?: Json
          platform_fees_collected?: number | null
          reserved_balance?: Json | null
          snapshot_date?: string
          stripe_account_id?: string
          total_payouts?: number | null
          total_transfers?: number | null
        }
        Relationships: []
      }
      stripe_payouts: {
        Row: {
          amount: number
          arrival_date: string | null
          created_at: string | null
          currency: string
          destination_bank_last4: string | null
          guide_id: string | null
          id: string
          metadata: Json | null
          method: string | null
          paid_at: string | null
          status: string
          stripe_payout_id: string
        }
        Insert: {
          amount: number
          arrival_date?: string | null
          created_at?: string | null
          currency?: string
          destination_bank_last4?: string | null
          guide_id?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          paid_at?: string | null
          status?: string
          stripe_payout_id: string
        }
        Update: {
          amount?: number
          arrival_date?: string | null
          created_at?: string | null
          currency?: string
          destination_bank_last4?: string | null
          guide_id?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          paid_at?: string | null
          status?: string
          stripe_payout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_payouts_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_payouts_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_transfers: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string
          destination_account_id: string
          guide_id: string | null
          id: string
          metadata: Json | null
          status: string
          stripe_transfer_id: string
          transferred_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string
          destination_account_id: string
          guide_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_transfer_id: string
          transferred_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string
          destination_account_id?: string
          guide_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string
          stripe_transfer_id?: string
          transferred_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_transfers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_transfers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_transfers_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stripe_transfers_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          api_version: string | null
          created_at: string | null
          error_message: string | null
          event_type: string
          id: string
          livemode: boolean | null
          payload: Json
          processed: boolean | null
          processed_at: string | null
          stripe_event_id: string
        }
        Insert: {
          api_version?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          livemode?: boolean | null
          payload: Json
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id: string
        }
        Update: {
          api_version?: string | null
          created_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          livemode?: boolean | null
          payload?: Json
          processed?: boolean | null
          processed_at?: string | null
          stripe_event_id?: string
        }
        Relationships: []
      }
      tax_documents: {
        Row: {
          created_at: string | null
          file_path: string
          gross_income: number
          guide_id: string
          id: string
          net_income: number
          platform_fees: number
          total_bookings: number
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          file_path: string
          gross_income?: number
          guide_id: string
          id?: string
          net_income?: number
          platform_fees?: number
          total_bookings?: number
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          file_path?: string
          gross_income?: number
          guide_id?: string
          id?: string
          net_income?: number
          platform_fees?: number
          total_bookings?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      ticket_activities: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string | null
          id: string
          new_value: string | null
          note: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          note?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          id?: string
          new_value?: string | null
          note?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_activities_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          conversation_id: string
          created_at: string | null
          first_response_at: string | null
          id: string
          priority: string | null
          resolved_at: string | null
          slack_channel_id: string | null
          slack_thread_ts: string | null
          status: string | null
          ticket_number: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          conversation_id: string
          created_at?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          slack_channel_id?: string | null
          slack_thread_ts?: string | null
          status?: string | null
          ticket_number: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          conversation_id?: string
          created_at?: string | null
          first_response_at?: string | null
          id?: string
          priority?: string | null
          resolved_at?: string | null
          slack_channel_id?: string | null
          slack_thread_ts?: string | null
          status?: string | null
          ticket_number?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: true
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_date_slots: {
        Row: {
          created_at: string
          currency_override: Database["public"]["Enums"]["currency"] | null
          discount_label: string | null
          discount_percentage: number | null
          early_bird_date: string | null
          id: string
          is_available: boolean
          notes: string | null
          price_override: number | null
          slot_date: string
          spots_booked: number
          spots_total: number
          tour_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency_override?: Database["public"]["Enums"]["currency"] | null
          discount_label?: string | null
          discount_percentage?: number | null
          early_bird_date?: string | null
          id?: string
          is_available?: boolean
          notes?: string | null
          price_override?: number | null
          slot_date: string
          spots_booked?: number
          spots_total?: number
          tour_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency_override?: Database["public"]["Enums"]["currency"] | null
          discount_label?: string | null
          discount_percentage?: number | null
          early_bird_date?: string | null
          id?: string
          is_available?: boolean
          notes?: string | null
          price_override?: number | null
          slot_date?: string
          spots_booked?: number
          spots_total?: number
          tour_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_date_slots_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_day_routes: {
        Row: {
          created_at: string | null
          day_number: number
          distance_km: number | null
          elevation_gain_m: number | null
          elevation_loss_m: number | null
          elevation_profile: Json | null
          estimated_duration_hours: number | null
          id: string
          route_coordinates: Json
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_number: number
          distance_km?: number | null
          elevation_gain_m?: number | null
          elevation_loss_m?: number | null
          elevation_profile?: Json | null
          estimated_duration_hours?: number | null
          id?: string
          route_coordinates: Json
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_number?: number
          distance_km?: number | null
          elevation_gain_m?: number | null
          elevation_loss_m?: number | null
          elevation_profile?: Json | null
          estimated_duration_hours?: number | null
          id?: string
          route_coordinates?: Json
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_day_routes_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_gpx_files: {
        Row: {
          id: string
          original_filename: string
          storage_path: string
          total_distance_km: number | null
          total_elevation_gain_m: number | null
          total_points: number | null
          tour_id: string
          uploaded_at: string | null
        }
        Insert: {
          id?: string
          original_filename: string
          storage_path: string
          total_distance_km?: number | null
          total_elevation_gain_m?: number | null
          total_points?: number | null
          tour_id: string
          uploaded_at?: string | null
        }
        Update: {
          id?: string
          original_filename?: string
          storage_path?: string
          total_distance_km?: number | null
          total_elevation_gain_m?: number | null
          total_points?: number | null
          tour_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_gpx_files_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: true
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_highlights: {
        Row: {
          category: string
          created_at: string | null
          day_number: number | null
          description: string | null
          elevation_m: number | null
          guide_notes: string | null
          id: string
          is_public: boolean | null
          latitude: number
          longitude: number
          name: string
          photos: Json | null
          sequence_order: number | null
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          day_number?: number | null
          description?: string | null
          elevation_m?: number | null
          guide_notes?: string | null
          id?: string
          is_public?: boolean | null
          latitude: number
          longitude: number
          name: string
          photos?: Json | null
          sequence_order?: number | null
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          day_number?: number | null
          description?: string | null
          elevation_m?: number | null
          guide_notes?: string | null
          id?: string
          is_public?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          photos?: Json | null
          sequence_order?: number | null
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_highlights_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_map_settings: {
        Row: {
          created_at: string | null
          featured_highlight_ids: string[] | null
          id: string
          region_center_lat: number | null
          region_center_lng: number | null
          region_radius_km: number | null
          route_display_mode: string | null
          show_meeting_point: boolean | null
          tour_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          featured_highlight_ids?: string[] | null
          id?: string
          region_center_lat?: number | null
          region_center_lng?: number | null
          region_radius_km?: number | null
          route_display_mode?: string | null
          show_meeting_point?: boolean | null
          tour_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          featured_highlight_ids?: string[] | null
          id?: string
          region_center_lat?: number | null
          region_center_lng?: number | null
          region_radius_km?: number | null
          route_display_mode?: string | null
          show_meeting_point?: boolean | null
          tour_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_map_settings_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: true
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_offers: {
        Row: {
          accepted_at: string | null
          booking_id: string | null
          conversation_id: string
          created_at: string | null
          currency: string | null
          declined_at: string | null
          duration: string
          expires_at: string | null
          group_size: number
          guide_id: string
          hiker_email: string
          hiker_id: string | null
          id: string
          included_items: string
          itinerary: string
          meeting_point: string
          meeting_time: string
          offer_status: string | null
          offer_token: string
          personal_note: string | null
          preferred_date: string | null
          price_per_person: number
          total_price: number
          tour_id: string | null
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          booking_id?: string | null
          conversation_id: string
          created_at?: string | null
          currency?: string | null
          declined_at?: string | null
          duration: string
          expires_at?: string | null
          group_size: number
          guide_id: string
          hiker_email: string
          hiker_id?: string | null
          id?: string
          included_items: string
          itinerary: string
          meeting_point: string
          meeting_time: string
          offer_status?: string | null
          offer_token: string
          personal_note?: string | null
          preferred_date?: string | null
          price_per_person: number
          total_price: number
          tour_id?: string | null
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          booking_id?: string | null
          conversation_id?: string
          created_at?: string | null
          currency?: string | null
          declined_at?: string | null
          duration?: string
          expires_at?: string | null
          group_size?: number
          guide_id?: string
          hiker_email?: string
          hiker_id?: string | null
          id?: string
          included_items?: string
          itinerary?: string
          meeting_point?: string
          meeting_time?: string
          offer_status?: string | null
          offer_token?: string
          personal_note?: string | null
          preferred_date?: string | null
          price_per_person?: number
          total_price?: number
          tour_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_offers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_offers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_offers_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_offers_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_offers_hiker_id_fkey"
            columns: ["hiker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_offers_tour_id_fkey"
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
          auto_confirm: boolean | null
          available_dates: string[]
          average_distance_per_day_km: number | null
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          custom_cancellation_approach: string | null
          custom_cancellation_policy_type: string | null
          custom_deposit_amount: number | null
          custom_deposit_type: string | null
          custom_discount_settings: Json | null
          custom_final_payment_days: number | null
          daily_hours: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          discounts_disabled: boolean | null
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
          is_custom_tour: boolean
          itinerary: Json | null
          max_group_size: number | null
          meeting_point: string
          meeting_point_formatted: string | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          meeting_time: string | null
          meta_description: string | null
          meta_title: string | null
          min_group_size: number | null
          pack_weight: number | null
          packing_list: Json | null
          policy_overrides: Json | null
          price: number
          rating: number | null
          region: string
          region_country: string | null
          region_region: string | null
          region_subregion: string | null
          reviews_count: number | null
          service_fee: number | null
          service_fee_percentage: number | null
          short_description: string | null
          slug: string | null
          status: string
          terrain_types: string[] | null
          title: string
          updated_at: string
          using_default_cancellation: boolean | null
          using_default_discounts: boolean | null
          using_default_payment: boolean | null
        }
        Insert: {
          archived?: boolean | null
          auto_confirm?: boolean | null
          available_dates?: string[]
          average_distance_per_day_km?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          custom_cancellation_approach?: string | null
          custom_cancellation_policy_type?: string | null
          custom_deposit_amount?: number | null
          custom_deposit_type?: string | null
          custom_discount_settings?: Json | null
          custom_final_payment_days?: number | null
          daily_hours?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          discounts_disabled?: boolean | null
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
          is_custom_tour?: boolean
          itinerary?: Json | null
          max_group_size?: number | null
          meeting_point: string
          meeting_point_formatted?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_time?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_group_size?: number | null
          pack_weight?: number | null
          packing_list?: Json | null
          policy_overrides?: Json | null
          price: number
          rating?: number | null
          region: string
          region_country?: string | null
          region_region?: string | null
          region_subregion?: string | null
          reviews_count?: number | null
          service_fee?: number | null
          service_fee_percentage?: number | null
          short_description?: string | null
          slug?: string | null
          status?: string
          terrain_types?: string[] | null
          title: string
          updated_at?: string
          using_default_cancellation?: boolean | null
          using_default_discounts?: boolean | null
          using_default_payment?: boolean | null
        }
        Update: {
          archived?: boolean | null
          auto_confirm?: boolean | null
          available_dates?: string[]
          average_distance_per_day_km?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          custom_cancellation_approach?: string | null
          custom_cancellation_policy_type?: string | null
          custom_deposit_amount?: number | null
          custom_deposit_type?: string | null
          custom_discount_settings?: Json | null
          custom_final_payment_days?: number | null
          daily_hours?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          discounts_disabled?: boolean | null
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
          is_custom_tour?: boolean
          itinerary?: Json | null
          max_group_size?: number | null
          meeting_point?: string
          meeting_point_formatted?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meeting_time?: string | null
          meta_description?: string | null
          meta_title?: string | null
          min_group_size?: number | null
          pack_weight?: number | null
          packing_list?: Json | null
          policy_overrides?: Json | null
          price?: number
          rating?: number | null
          region?: string
          region_country?: string | null
          region_region?: string | null
          region_subregion?: string | null
          reviews_count?: number | null
          service_fee?: number | null
          service_fee_percentage?: number | null
          short_description?: string | null
          slug?: string | null
          status?: string
          terrain_types?: string[] | null
          title?: string
          updated_at?: string
          using_default_cancellation?: boolean | null
          using_default_discounts?: boolean | null
          using_default_payment?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tours_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tours_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guide_profiles_public"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trip_checklist_items: {
        Row: {
          booking_id: string
          checked_at: string | null
          created_at: string | null
          id: string
          is_checked: boolean | null
          item_name: string
          item_type: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          checked_at?: string | null
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          item_name: string
          item_type: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          checked_at?: string | null
          created_at?: string | null
          id?: string
          is_checked?: boolean | null
          item_name?: string
          item_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_checklist_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_checklist_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          notes: string | null
          source_id: string | null
          source_type: string
          status: string | null
          used_at: string | null
          used_on_booking_id: string | null
          user_id: string
          withdrawal_amount: number | null
          withdrawn_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          source_id?: string | null
          source_type: string
          status?: string | null
          used_at?: string | null
          used_on_booking_id?: string | null
          user_id: string
          withdrawal_amount?: number | null
          withdrawn_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          notes?: string | null
          source_id?: string | null
          source_type?: string
          status?: string | null
          used_at?: string | null
          used_on_booking_id?: string | null
          user_id?: string
          withdrawal_amount?: number | null
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_credits_used_on_booking_id_fkey"
            columns: ["used_on_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_credits_used_on_booking_id_fkey"
            columns: ["used_on_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_guide_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_presence: {
        Row: {
          last_seen: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          last_seen?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          last_seen?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      user_settings: {
        Row: {
          analytics_cookies: boolean | null
          created_at: string | null
          currency_display: string | null
          date_format: string | null
          id: string
          language: string | null
          profile_visibility: string | null
          show_email_to_bookings: boolean | null
          show_phone_to_bookings: boolean | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analytics_cookies?: boolean | null
          created_at?: string | null
          currency_display?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          profile_visibility?: string | null
          show_email_to_bookings?: boolean | null
          show_phone_to_bookings?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analytics_cookies?: boolean | null
          created_at?: string | null
          currency_display?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          profile_visibility?: string | null
          show_email_to_bookings?: boolean | null
          show_phone_to_bookings?: boolean | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_submitted_regions: {
        Row: {
          admin_notes: string | null
          country: string
          created_at: string
          declined_reason: string | null
          description: string
          id: string
          key_features: string[]
          region: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_by: string
          subregion: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          admin_notes?: string | null
          country: string
          created_at?: string
          declined_reason?: string | null
          description: string
          id?: string
          key_features?: string[]
          region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_by: string
          subregion: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          admin_notes?: string | null
          country?: string
          created_at?: string
          declined_reason?: string | null
          description?: string
          id?: string
          key_features?: string[]
          region?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_by?: string
          subregion?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: []
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
      webhook_processing_queue: {
        Row: {
          api_version: string | null
          created_at: string | null
          error_message: string | null
          event_data: Json
          event_id: string
          event_type: string
          id: string
          livemode: boolean | null
          max_retries: number | null
          next_retry_at: string | null
          processed_at: string | null
          processing_status: string | null
          retry_count: number | null
        }
        Insert: {
          api_version?: string | null
          created_at?: string | null
          error_message?: string | null
          event_data: Json
          event_id: string
          event_type: string
          id?: string
          livemode?: boolean | null
          max_retries?: number | null
          next_retry_at?: string | null
          processed_at?: string | null
          processing_status?: string | null
          retry_count?: number | null
        }
        Update: {
          api_version?: string | null
          created_at?: string | null
          error_message?: string | null
          event_data?: Json
          event_id?: string
          event_type?: string
          id?: string
          livemode?: boolean | null
          max_retries?: number | null
          next_retry_at?: string | null
          processed_at?: string | null
          processing_status?: string | null
          retry_count?: number | null
        }
        Relationships: []
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
      bookings_guide_view: {
        Row: {
          booking_date: string | null
          booking_reference: string | null
          created_at: string | null
          currency: Database["public"]["Enums"]["currency"] | null
          date_slot_id: string | null
          hiker_email: string | null
          hiker_id: string | null
          id: string | null
          insurance_file_url: string | null
          insurance_uploaded_at: string | null
          participants: number | null
          participants_details: Json | null
          payment_status: string | null
          special_requests: string | null
          status: string | null
          stripe_client_secret: string | null
          stripe_payment_intent_id: string | null
          total_price: number | null
          tour_id: string | null
          updated_at: string | null
          waiver_data: Json | null
          waiver_uploaded_at: string | null
        }
        Insert: {
          booking_date?: string | null
          booking_reference?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          date_slot_id?: string | null
          hiker_email?: string | null
          hiker_id?: string | null
          id?: string | null
          insurance_file_url?: string | null
          insurance_uploaded_at?: string | null
          participants?: number | null
          participants_details?: Json | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string | null
          stripe_client_secret?: never
          stripe_payment_intent_id?: never
          total_price?: number | null
          tour_id?: string | null
          updated_at?: string | null
          waiver_data?: Json | null
          waiver_uploaded_at?: string | null
        }
        Update: {
          booking_date?: string | null
          booking_reference?: string | null
          created_at?: string | null
          currency?: Database["public"]["Enums"]["currency"] | null
          date_slot_id?: string | null
          hiker_email?: string | null
          hiker_id?: string | null
          id?: string | null
          insurance_file_url?: string | null
          insurance_uploaded_at?: string | null
          participants?: number | null
          participants_details?: Json | null
          payment_status?: string | null
          special_requests?: string | null
          status?: string | null
          stripe_client_secret?: never
          stripe_payment_intent_id?: never
          total_price?: number | null
          tour_id?: string | null
          updated_at?: string | null
          waiver_data?: Json | null
          waiver_uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_date_slot_id_fkey"
            columns: ["date_slot_id"]
            isOneToOne: false
            referencedRelation: "tour_date_slots"
            referencedColumns: ["id"]
          },
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
      guide_profiles_public: {
        Row: {
          active_since: string | null
          bio: string | null
          certifications: Json | null
          created_at: string | null
          daily_rate: number | null
          daily_rate_currency: Database["public"]["Enums"]["currency"] | null
          difficulty_levels: string[] | null
          display_name: string | null
          experience_years: number | null
          facebook_url: string | null
          guiding_areas: string[] | null
          hero_background_url: string | null
          id: string | null
          instagram_url: string | null
          intro_video_thumbnail_url: string | null
          intro_video_url: string | null
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
          slug: string | null
          specialties: string[] | null
          terrain_capabilities: string[] | null
          upcoming_availability_end: string | null
          upcoming_availability_start: string | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          active_since?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          daily_rate?: number | null
          daily_rate_currency?: Database["public"]["Enums"]["currency"] | null
          difficulty_levels?: string[] | null
          display_name?: string | null
          experience_years?: number | null
          facebook_url?: string | null
          guiding_areas?: string[] | null
          hero_background_url?: string | null
          id?: string | null
          instagram_url?: string | null
          intro_video_thumbnail_url?: string | null
          intro_video_url?: string | null
          languages_spoken?: string[] | null
          location?: string | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          phone?: never
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          slug?: string | null
          specialties?: string[] | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          active_since?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          daily_rate?: number | null
          daily_rate_currency?: Database["public"]["Enums"]["currency"] | null
          difficulty_levels?: string[] | null
          display_name?: string | null
          experience_years?: number | null
          facebook_url?: string | null
          guiding_areas?: string[] | null
          hero_background_url?: string | null
          id?: string | null
          instagram_url?: string | null
          intro_video_thumbnail_url?: string | null
          intro_video_url?: string | null
          languages_spoken?: string[] | null
          location?: string | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          phone?: never
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          slug?: string | null
          specialties?: string[] | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_role_if_user_exists: {
        Args: { user_email: string }
        Returns: undefined
      }
      calculate_guide_average_ratings: {
        Args: { guide_user_id: string }
        Returns: Json
      }
      can_view_guide_phone: {
        Args: { _guide_user_id: string }
        Returns: boolean
      }
      cleanup_expired_kv_store: { Args: never; Returns: undefined }
      generate_guide_slug: { Args: { guide_name: string }; Returns: string }
      generate_tour_slug: {
        Args: { tour_region: string; tour_title: string }
        Returns: string
      }
      get_current_user_role: { Args: never; Returns: string }
      get_guide_all_date_slots: {
        Args: { p_end_date?: string; p_guide_id: string; p_start_date?: string }
        Returns: {
          availability_status: string
          currency: Database["public"]["Enums"]["currency"]
          discount_percentage: number
          price: number
          slot_date: string
          slot_id: string
          spots_booked: number
          spots_remaining: number
          spots_total: number
          tour_duration: string
          tour_id: string
          tour_title: string
        }[]
      }
      get_review_pair_status: { Args: { booking_uuid: string }; Returns: Json }
      get_tour_date_availability: {
        Args: { p_tour_id: string }
        Returns: {
          currency: Database["public"]["Enums"]["currency"]
          discount_label: string
          discount_percentage: number
          is_available: boolean
          is_early_bird: boolean
          price: number
          slot_date: string
          slot_id: string
          spots_booked: number
          spots_remaining: number
          spots_total: number
        }[]
      }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      hiker_has_booking_for_tour: {
        Args: { _hiker_id: string; _tour_id: string }
        Returns: boolean
      }
      migrate_tour_dates_to_slots: { Args: never; Returns: undefined }
      user_has_booking_with_guide: {
        Args: { _guide_id: string; _user_id: string }
        Returns: boolean
      }
      validate_discount_code: {
        Args: {
          p_code: string
          p_guide_id: string
          p_subtotal: number
          p_tour_id: string
        }
        Returns: {
          discount_amount: number
          error_message: string
          is_valid: boolean
        }[]
      }
      verify_guide_certification: {
        Args: { p_cert_updates: Json; p_user_id: string; p_verified_by: string }
        Returns: Json
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
