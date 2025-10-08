import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GuideProfile } from '@/types/guide';

export function useGuideProfileBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['guide-profile-slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Guide slug is required');

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      const isAuthenticated = !!user;

      const { data, error } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('slug', slug)
        .eq('verified', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Guide profile not found');

      // For privacy: exclude phone number from unauthenticated users
      return {
        ...data,
        phone: isAuthenticated ? data.phone : null,
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      } as unknown as GuideProfile;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
