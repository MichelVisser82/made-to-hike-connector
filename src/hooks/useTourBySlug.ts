import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tour } from '@/types';

export function useTourBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['tour', 'slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');

      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Tour not found');

      return data as Tour;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false
  });
}
