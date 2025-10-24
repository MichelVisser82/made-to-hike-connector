import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GuideProfile } from '@/types/guide';

export function useGuideProfileBySlug(slug: string | undefined) {
  // Check if the slug is actually a UUID
  const isUUID = slug && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  return useQuery({
    queryKey: ['guide-profile-slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Guide slug is required');

      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      const isAuthenticated = !!user;

      // Query by UUID if it's a UUID, otherwise by slug
      let query = supabase
        .from('guide_profiles')
        .select('*')
        .eq('verified', true);
      
      if (isUUID) {
        query = query.eq('user_id', slug);
      } else {
        query = query.eq('slug', slug);
      }
      
      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Guide profile not found');

      // SECURITY: Explicitly null out phone for unauthenticated users to prevent scraping
      // This provides defense-in-depth alongside database RLS policies
      // Note: Database also has guide_profiles_public view available for future use
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
