import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';

export interface TripItineraryDay {
  day_number: number;
  title: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  overview: string;
  activities?: Array<{
    time?: string;
    title: string;
    description: string;
  }>;
  stats?: {
    distance_km?: number;
    elevation_gain_m?: number;
    hiking_time_hours?: number;
  };
  photo_opportunities?: string;
}

export interface TripChecklistItem {
  id: string;
  item_type: 'essential_gear' | 'personal_items' | 'documents' | 'preparation';
  item_name: string;
  is_checked: boolean;
  checked_at: string | null;
}

export interface PreparationStatus {
  payment_confirmed: boolean;
  emergency_contact_added: boolean;
  waiver_signed: boolean;
  insurance_uploaded: boolean;
  checklist_completed: boolean;
  overall_percentage: number;
}

export interface TripDetails {
  booking: {
    id: string;
    booking_reference: string;
    booking_date: string;
    participants: number;
    total_price: number;
    currency: string;
    status: string;
    payment_status: string;
    payment_type: string;
    special_requests: string | null;
    waiver_uploaded_at: string | null;
    insurance_uploaded_at: string | null;
    insurance_file_url: string | null;
    participants_details: any[];
  };
  tour: Tour & {
    itinerary?: {
      days: TripItineraryDay[];
    };
  };
  guide: {
    user_id: string;
    display_name: string;
    profile_image_url: string | null;
    phone: string | null;
    bio: string | null;
    languages_spoken: string[];
    certifications: any[];
    experience_years: number | null;
    average_rating: number;
    review_count: number;
  };
  checklist: TripChecklistItem[];
  preparationStatus: PreparationStatus;
}

export function useTripDetails(bookingId: string | undefined) {
  return useQuery({
    queryKey: ['trip-details', bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error('Booking ID is required');

      // Fetch booking with tour and guide data
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          tours (
            *,
            guide_profiles!tours_guide_id_fkey (
              user_id,
              display_name,
              profile_image_url,
              phone,
              bio,
              languages_spoken,
              certifications,
              experience_years
            )
          )
        `)
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      if (!bookingData) throw new Error('Booking not found');

      // Fetch checklist items
      const { data: checklistData } = await supabase
        .from('trip_checklist_items')
        .select('*')
        .eq('booking_id', bookingId)
        .order('item_type', { ascending: true });

      // Fetch profile for emergency contact check
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from('profiles')
        .select('emergency_contact_name, emergency_contact_phone')
        .eq('id', user?.id)
        .single();

      // Fetch guide stats (rating and review count)
      const guideId = bookingData.tours?.guide_profiles?.user_id;
      let guideStats = { average_rating: 0, review_count: 0 };
      
      if (guideId) {
        const { data: reviews } = await supabase
          .from('reviews')
          .select('overall_rating')
          .eq('guide_id', guideId)
          .eq('review_type', 'hiker_to_guide')
          .eq('review_status', 'published');

        if (reviews && reviews.length > 0) {
          const avgRating = reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;
          guideStats = {
            average_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            review_count: reviews.length
          };
        }
      }

      // Calculate preparation status
      const checklist = checklistData || [];
      const checkedItems = checklist.filter(item => item.is_checked).length;
      const totalChecklistItems = checklist.length;

      const preparationStatus: PreparationStatus = {
        payment_confirmed: bookingData.payment_status === 'succeeded',
        emergency_contact_added: !!(profileData?.emergency_contact_name && profileData?.emergency_contact_phone),
        waiver_signed: !!bookingData.waiver_uploaded_at,
        insurance_uploaded: !!bookingData.insurance_uploaded_at,
        checklist_completed: totalChecklistItems > 0 ? checkedItems === totalChecklistItems : false,
        overall_percentage: 0
      };

      // Calculate overall percentage (5 main items)
      const completedMainItems = [
        preparationStatus.payment_confirmed,
        preparationStatus.emergency_contact_added,
        preparationStatus.waiver_signed,
        preparationStatus.insurance_uploaded,
        preparationStatus.checklist_completed
      ].filter(Boolean).length;
      
      preparationStatus.overall_percentage = Math.round((completedMainItems / 5) * 100);

      const tripDetails: TripDetails = {
        booking: {
          ...bookingData,
          participants_details: Array.isArray(bookingData.participants_details) 
            ? bookingData.participants_details 
            : []
        } as any,
        tour: bookingData.tours as any,
        guide: {
          ...bookingData.tours?.guide_profiles,
          certifications: Array.isArray(bookingData.tours?.guide_profiles?.certifications)
            ? bookingData.tours?.guide_profiles?.certifications
            : [],
          average_rating: guideStats.average_rating,
          review_count: guideStats.review_count
        } as any,
        checklist: (checklist || []) as TripChecklistItem[],
        preparationStatus
      };

      return tripDetails;
    },
    enabled: !!bookingId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
