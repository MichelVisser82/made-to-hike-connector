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
          discount_amount: number | null
          discount_code: string | null
          hiker_id: string
          id: string
          participants: number
          participants_details: Json | null
          payment_status: string | null
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
          subtotal: number | null
          total_price: number
          tour_id: string
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_reference?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          date_slot_id?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          hiker_id: string
          id?: string
          participants?: number
          participants_details?: Json | null
          payment_status?: string | null
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
          subtotal?: number | null
          total_price: number
          tour_id: string
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_reference?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          date_slot_id?: string | null
          discount_amount?: number | null
          discount_code?: string | null
          hiker_id?: string
          id?: string
          participants?: number
          participants_details?: Json | null
          payment_status?: string | null
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
          subtotal?: number | null
          total_price?: number
          tour_id?: string
          updated_at?: string
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
      conversations: {
        Row: {
          anonymous_email: string | null
          anonymous_name: string | null
          conversation_type: string
          created_at: string | null
          guide_id: string | null
          hiker_id: string | null
          id: string
          last_message_at: string | null
          status: string | null
          tour_id: string | null
          updated_at: string | null
        }
        Insert: {
          anonymous_email?: string | null
          anonymous_name?: string | null
          conversation_type?: string
          created_at?: string | null
          guide_id?: string | null
          hiker_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          tour_id?: string | null
          updated_at?: string | null
        }
        Update: {
          anonymous_email?: string | null
          anonymous_name?: string | null
          conversation_type?: string
          created_at?: string | null
          guide_id?: string | null
          hiker_id?: string | null
          id?: string
          last_message_at?: string | null
          status?: string | null
          tour_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
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
          max_uses: number | null
          min_purchase_amount: number | null
          scope: string
          times_used: number | null
          updated_at: string | null
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
          max_uses?: number | null
          min_purchase_amount?: number | null
          scope: string
          times_used?: number | null
          updated_at?: string | null
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
          max_uses?: number | null
          min_purchase_amount?: number | null
          scope?: string
          times_used?: number | null
          updated_at?: string | null
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
        ]
      }
      guide_profiles: {
        Row: {
          active_since: string | null
          bank_account_last4: string | null
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
          intro_video_duration_seconds: number | null
          intro_video_file_path: string | null
          intro_video_size_bytes: number | null
          intro_video_thumbnail_url: string | null
          intro_video_url: string | null
          is_featured: boolean | null
          languages_spoken: string[] | null
          location: string | null
          location_formatted: string | null
          location_lat: number | null
          location_lng: number | null
          max_group_size: number | null
          min_group_size: number | null
          onboarding_step: number | null
          payout_schedule: string | null
          phone: string | null
          portfolio_images: string[] | null
          profile_completed: boolean | null
          profile_image_url: string | null
          seasonal_availability: string | null
          slug: string | null
          specialties: string[] | null
          stripe_account_id: string | null
          stripe_kyc_status: string | null
          terrain_capabilities: string[] | null
          upcoming_availability_end: string | null
          upcoming_availability_start: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          video_type: string | null
          website_url: string | null
        }
        Insert: {
          active_since?: string | null
          bank_account_last4?: string | null
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
          intro_video_duration_seconds?: number | null
          intro_video_file_path?: string | null
          intro_video_size_bytes?: number | null
          intro_video_thumbnail_url?: string | null
          intro_video_url?: string | null
          is_featured?: boolean | null
          languages_spoken?: string[] | null
          location?: string | null
          location_formatted?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          payout_schedule?: string | null
          phone?: string | null
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          slug?: string | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_kyc_status?: string | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          video_type?: string | null
          website_url?: string | null
        }
        Update: {
          active_since?: string | null
          bank_account_last4?: string | null
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
          intro_video_duration_seconds?: number | null
          intro_video_file_path?: string | null
          intro_video_size_bytes?: number | null
          intro_video_thumbnail_url?: string | null
          intro_video_url?: string | null
          is_featured?: boolean | null
          languages_spoken?: string[] | null
          location?: string | null
          location_formatted?: string | null
          location_lat?: number | null
          location_lng?: number | null
          max_group_size?: number | null
          min_group_size?: number | null
          onboarding_step?: number | null
          payout_schedule?: string | null
          phone?: string | null
          portfolio_images?: string[] | null
          profile_completed?: boolean | null
          profile_image_url?: string | null
          seasonal_availability?: string | null
          slug?: string | null
          specialties?: string[] | null
          stripe_account_id?: string | null
          stripe_kyc_status?: string | null
          terrain_capabilities?: string[] | null
          upcoming_availability_end?: string | null
          upcoming_availability_start?: string | null
          updated_at?: string
          user_id?: string
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
      profiles: {
        Row: {
          accessibility_needs: string | null
          avatar_url: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          dietary_preferences: Json | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          hiking_experience: string | null
          id: string
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
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          hiking_experience?: string | null
          id: string
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
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          hiking_experience?: string | null
          id?: string
          medical_conditions?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
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
          max_group_size: number | null
          meeting_point: string
          meeting_point_formatted: string | null
          meeting_point_lat: number | null
          meeting_point_lng: number | null
          meta_description: string | null
          meta_title: string | null
          min_group_size: number | null
          pack_weight: number | null
          price: number
          rating: number | null
          region: Database["public"]["Enums"]["region"]
          reviews_count: number | null
          service_fee: number | null
          service_fee_percentage: number | null
          short_description: string | null
          slug: string | null
          terrain_types: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean | null
          auto_confirm?: boolean | null
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
          max_group_size?: number | null
          meeting_point: string
          meeting_point_formatted?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_group_size?: number | null
          pack_weight?: number | null
          price: number
          rating?: number | null
          region: Database["public"]["Enums"]["region"]
          reviews_count?: number | null
          service_fee?: number | null
          service_fee_percentage?: number | null
          short_description?: string | null
          slug?: string | null
          terrain_types?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean | null
          auto_confirm?: boolean | null
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
          max_group_size?: number | null
          meeting_point?: string
          meeting_point_formatted?: string | null
          meeting_point_lat?: number | null
          meeting_point_lng?: number | null
          meta_description?: string | null
          meta_title?: string | null
          min_group_size?: number | null
          pack_weight?: number | null
          price?: number
          rating?: number | null
          region?: Database["public"]["Enums"]["region"]
          reviews_count?: number | null
          service_fee?: number | null
          service_fee_percentage?: number | null
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
      migrate_tour_dates_to_slots: { Args: never; Returns: undefined }
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
