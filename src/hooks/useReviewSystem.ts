import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ReviewData {
  id: string;
  booking_id: string;
  tour_id: string;
  hiker_id: string;
  guide_id: string;
  review_type: 'hiker_to_guide' | 'guide_to_hiker';
  review_status: 'draft' | 'submitted' | 'published' | 'expired' | 'void';
  overall_rating: number;
  comment: string;
  category_ratings?: {
    expertise: number;
    safety: number;
    communication: number;
    leadership: number;
    value: number;
  };
  quick_assessment?: {
    fitness_accurate: boolean;
    well_prepared: boolean;
    great_companion: boolean;
    would_guide_again: boolean;
  };
  highlight_tags?: string[];
  photos?: string[];
  private_safety_notes?: string;
  paired_review_id?: string;
  published_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  tours?: { 
    title: string; 
    hero_image?: string;
    images?: string[];
    meeting_point_formatted?: string;
    region?: string;
  };
  bookings?: {
    booking_date: string;
  };
  profiles?: { 
    name: string; 
    avatar_url?: string;
  };
  guide_profiles?: {
    display_name: string;
    profile_image_url?: string;
    certifications?: any[];
    verified?: boolean;
  };
}

// Hook to get pending reviews to write
export function usePendingReviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch reviews that this user needs to WRITE (not reviews where they're being reviewed)
      // - Hikers write 'hiker_to_guide' reviews where they are the hiker
      // - Guides write 'guide_to_hiker' reviews where they are the guide
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          tours!inner (title, hero_image, images, meeting_point_formatted, region),
          bookings!inner (booking_date)
        `)
        .or(`and(hiker_id.eq.${user.id},review_type.eq.hiker_to_guide),and(guide_id.eq.${user.id},review_type.eq.guide_to_hiker)`)
        .in('review_status', ['draft', 'submitted'])
        .order('expires_at', { ascending: true });

      if (error) throw error;

      // Fetch profile data for the "other person" in each review
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          // Determine who the "other person" is (the one being reviewed)
          const isReviewingGuide = review.review_type === 'hiker_to_guide';
          const otherPersonId = isReviewingGuide ? review.guide_id : review.hiker_id;

          let profileData = null;
          let guideProfileData = null;

          if (isReviewingGuide) {
            // Fetch guide profile for hiker→guide reviews
            const { data: guideProfile } = await supabase
              .from('guide_profiles')
              .select('display_name, profile_image_url, certifications, verified')
              .eq('user_id', otherPersonId)
              .maybeSingle();
            
            if (guideProfile) {
              profileData = {
                name: guideProfile.display_name,
                avatar_url: guideProfile.profile_image_url
              };
              guideProfileData = guideProfile;
            }
          } else {
            // Fetch hiker profile for guide→hiker reviews
            const { data: hikerProfile } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', otherPersonId)
              .maybeSingle();
            
            profileData = hikerProfile;
          }

          return {
            ...review,
            profiles: profileData,
            guide_profiles: guideProfileData
          };
        })
      );

      return reviewsWithProfiles as unknown as ReviewData[];
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Hook to get published reviews received
export function useReceivedReviews(isGuide: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['received-reviews', user?.id, isGuide],
    queryFn: async () => {
      if (!user?.id) return [];

      const column = isGuide ? 'guide_id' : 'hiker_id';
      const otherColumn = isGuide ? 'hiker_id' : 'guide_id';
      const reviewType = isGuide ? 'hiker_to_guide' : 'guide_to_hiker';

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          tours!inner (title),
          profiles!reviews_${otherColumn}_fkey (name, avatar_url)
        `)
        .eq(column, user.id)
        .eq('review_type', reviewType)
        .eq('review_status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Fetch guide profiles for reviews where reviewer is a guide
      const reviewsWithGuideProfiles = await Promise.all(
        (data || []).map(async (review) => {
          let guideProfileData = null;

          // If this is a guide reviewing a hiker, fetch the guide's own profile
          if (review.review_type === 'guide_to_hiker') {
            const { data: guideProfile } = await supabase
              .from('guide_profiles')
              .select('display_name, profile_image_url, certifications, verified')
              .eq('user_id', review.guide_id)
              .maybeSingle();
            
            guideProfileData = guideProfile;
          }

          return {
            ...review,
            guide_profiles: guideProfileData
          };
        })
      );

      return reviewsWithGuideProfiles as unknown as ReviewData[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to get published reviews given (written by the user)
export function useGivenReviews(isGuide: boolean) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['given-reviews', user?.id, isGuide],
    queryFn: async () => {
      if (!user?.id) return [];

      const column = isGuide ? 'guide_id' : 'hiker_id';
      const otherColumn = isGuide ? 'hiker_id' : 'guide_id';
      const reviewType = isGuide ? 'guide_to_hiker' : 'hiker_to_guide';

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          tours!inner (title, hero_image, images),
          bookings!inner (booking_date)
        `)
        .eq(column, user.id)
        .eq('review_type', reviewType)
        .eq('review_status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data for the reviewed person
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          let profileData = null;
          let guideProfileData = null;

          // If hiker reviewing guide, fetch guide profile
          if (review.review_type === 'hiker_to_guide') {
            const { data: guideProfile } = await supabase
              .from('guide_profiles')
              .select('display_name, profile_image_url, certifications, verified')
              .eq('user_id', review.guide_id)
              .maybeSingle();
            
            if (guideProfile) {
              profileData = {
                name: guideProfile.display_name,
                avatar_url: guideProfile.profile_image_url
              };
              guideProfileData = guideProfile;
            }
          } else {
            // If guide reviewing hiker, fetch hiker profile
            const { data: hikerProfile } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', review.hiker_id)
              .maybeSingle();
            
            profileData = hikerProfile;
          }

          return {
            ...review,
            profiles: profileData,
            guide_profiles: guideProfileData
          };
        })
      );

      return reviewsWithProfiles as unknown as ReviewData[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to submit a review
export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: {
      reviewId: string;
      overallRating: number;
      comment: string;
      categoryRatings?: any;
      quickAssessment?: any;
      highlightTags?: string[];
      photos?: string[];
      privateSafetyNotes?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('submit-review', {
        body: reviewData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['received-reviews'] });
    },
  });
}

// Hook to post a response to a review
export function usePostReviewResponse() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (responseData: {
      reviewId: string;
      responderType: 'guide' | 'hiker';
      responseText: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('post-review-response', {
        body: {
          ...responseData,
          responderId: user?.id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-reviews'] });
    },
  });
}
