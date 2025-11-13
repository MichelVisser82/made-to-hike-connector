import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tour } from '@/types';

interface SavedTour {
  id: string;
  user_id: string;
  tour_id: string;
  saved_at: string;
  tours: Tour;
}

export function useSavedTours(userId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved tours
  const { data: savedTours = [], isLoading } = useQuery({
    queryKey: ['saved-tours', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await (supabase as any)
        .from('saved_tours')
        .select(`
          *,
          tours:tour_id (
            id,
            title,
            slug,
            hero_image,
            images,
            region,
            difficulty,
            duration,
            price,
            currency,
            rating,
            reviews_count,
            guide_id,
            guide_display_name,
            guide_avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      return data as SavedTour[];
    },
    enabled: !!userId,
    staleTime: 30000,
  });

  // Check if tour is saved
  const isTourSaved = (tourId: string) => {
    return savedTours.some(st => st.tour_id === tourId);
  };

  // Save tour mutation
  const saveTourMutation = useMutation({
    mutationFn: async (tourId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await (supabase as any)
        .from('saved_tours')
        .insert({ user_id: userId, tour_id: tourId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-tours', userId] });
      toast({ title: 'Tour saved to your collection' });
    },
    onError: (error) => {
      console.error('Error saving tour:', error);
      toast({ title: 'Failed to save tour', variant: 'destructive' });
    },
  });

  // Unsave tour mutation
  const unsaveTourMutation = useMutation({
    mutationFn: async (tourId: string) => {
      if (!userId) throw new Error('User not authenticated');
      
      const { error } = await (supabase as any)
        .from('saved_tours')
        .delete()
        .eq('user_id', userId)
        .eq('tour_id', tourId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-tours', userId] });
      toast({ title: 'Tour removed from saved list' });
    },
    onError: (error) => {
      console.error('Error unsaving tour:', error);
      toast({ title: 'Failed to remove tour', variant: 'destructive' });
    },
  });

  // Toggle save/unsave
  const toggleSaveTour = async (tourId: string) => {
    if (isTourSaved(tourId)) {
      await unsaveTourMutation.mutateAsync(tourId);
    } else {
      await saveTourMutation.mutateAsync(tourId);
    }
  };

  return {
    savedTours,
    isLoading,
    isTourSaved,
    toggleSaveTour,
    saveTour: saveTourMutation.mutateAsync,
    unsaveTour: unsaveTourMutation.mutateAsync,
  };
}
