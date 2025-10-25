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
  tours?: { title: string; };
  profiles?: { name: string; avatar_url?: string; };
}

// Hook to get pending reviews to write
export function usePendingReviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['pending-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch reviews where user is either hiker or guide
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          tours!inner (title)
        `)
        .or(`hiker_id.eq.${user.id},guide_id.eq.${user.id}`)
        .eq('review_status', 'draft')
        .order('expires_at', { ascending: true });

      if (error) throw error;

      // Fetch profile data for the "other person" in each review
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          // Determine who the "other person" is (the one being reviewed)
          const isReviewingGuide = review.review_type === 'hiker_to_guide';
          const otherPersonId = isReviewingGuide ? review.guide_id : review.hiker_id;

          let profileData = null;

          if (isReviewingGuide) {
            // Fetch guide profile for hiker→guide reviews
            const { data: guideProfile } = await supabase
              .from('guide_profiles')
              .select('display_name, profile_image_url')
              .eq('user_id', otherPersonId)
              .maybeSingle();
            
            if (guideProfile) {
              profileData = {
                name: guideProfile.display_name,
                avatar_url: guideProfile.profile_image_url
              };
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
            profiles: profileData
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

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          tours!inner (title),
          profiles!reviews_${otherColumn}_fkey (name, avatar_url)
        `)
        .eq(column, user.id)
        .eq('review_status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ReviewData[];
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
