import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FollowedGuide {
  id: string;
  follower_id: string;
  guide_id: string;
  followed_at: string;
  guide_profiles: {
    user_id: string;
    display_name: string;
    slug: string;
    profile_image_url: string | null;
    bio: string | null;
    location: string | null;
    specialties: string[] | null;
    certifications: any[] | null;
    experience_years: number | null;
    daily_rate: number | null;
    daily_rate_currency: string | null;
  };
}

export function useFollowedGuides(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch followed guides
  const { data: followedGuides = [], isLoading } = useQuery({
    queryKey: ['followed-guides', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('followed_guides')
        .select(`
          *,
          guide_profiles:guide_id (
            user_id,
            display_name,
            slug,
            profile_image_url,
            bio,
            location,
            specialties,
            certifications,
            experience_years,
            daily_rate,
            daily_rate_currency
          )
        `)
        .eq('follower_id', userId)
        .order('followed_at', { ascending: false });

      if (error) throw error;
      return data as FollowedGuide[];
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Check if guide is followed
  const isGuideFollowed = (guideId: string) => {
    return followedGuides.some(fg => fg.guide_id === guideId);
  };

  // Follow guide mutation
  const followGuideMutation = useMutation({
    mutationFn: async (guideId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('followed_guides')
        .insert({ follower_id: userId, guide_id: guideId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-guides', userId] });
      toast({ title: "You're now following this guide" });
    },
    onError: (error) => {
      console.error('Error following guide:', error);
      toast({ title: 'Failed to follow guide', variant: 'destructive' });
    },
  });

  // Unfollow guide mutation
  const unfollowGuideMutation = useMutation({
    mutationFn: async (guideId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('followed_guides')
        .delete()
        .eq('follower_id', userId)
        .eq('guide_id', guideId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-guides', userId] });
      toast({ title: 'You unfollowed this guide' });
    },
    onError: (error) => {
      console.error('Error unfollowing guide:', error);
      toast({ title: 'Failed to unfollow guide', variant: 'destructive' });
    },
  });

  // Toggle follow/unfollow
  const toggleFollowGuide = async (guideId: string) => {
    if (isGuideFollowed(guideId)) {
      await unfollowGuideMutation.mutateAsync(guideId);
    } else {
      await followGuideMutation.mutateAsync(guideId);
    }
  };

  return {
    followedGuides,
    isLoading,
    isGuideFollowed,
    toggleFollowGuide,
    followGuide: followGuideMutation.mutateAsync,
    unfollowGuide: unfollowGuideMutation.mutateAsync,
  };
}
