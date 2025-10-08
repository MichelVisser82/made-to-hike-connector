import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GuideProfile } from '@/types/guide';

export function useGuideProfile(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide-profile', guideId],
    queryFn: async () => {
      if (!guideId) throw new Error('Guide ID is required');

      console.log('useGuideProfile - Fetching for guideId:', guideId);

      // Check if current user is the guide owner or authenticated
      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user?.id === guideId;
      const isAuthenticated = !!user;

      const { data, error } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('user_id', guideId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Guide profile not found');

      console.log('useGuideProfile - Fetched data:', {
        experience_years: data.experience_years,
        certifications: data.certifications
      });

      // For privacy: only include phone if user is the guide owner or authenticated
      return {
        ...data,
        phone: (isOwner || isAuthenticated) ? data.phone : null,
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      } as unknown as GuideProfile;
    },
    enabled: !!guideId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });
}

export function useMyGuideProfile() {
  return useQuery({
    queryKey: ['my-guide-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      } as unknown as GuideProfile;
    },
    staleTime: 5 * 60 * 1000,
  });
}
