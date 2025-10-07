import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';

export function useGuideTours(guideId: string | undefined, limit = 3) {
  return useQuery({
    queryKey: ['guide-tours', guideId, limit],
    queryFn: async () => {
      if (!guideId) throw new Error('Guide ID is required');

      const { data, error } = await supabase
        .from('tours')
        .select(`
          *,
          guide:guide_profiles!tours_guide_id_fkey(
            display_name,
            profile_image_url,
            slug
          )
        `)
        .eq('guide_id', guideId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching guide tours:', error);
        throw error;
      }
      
      console.log('Guide tours loaded:', data?.length || 0);
      return data as any[];
    },
    enabled: !!guideId,
    staleTime: 5 * 60 * 1000,
  });
}
