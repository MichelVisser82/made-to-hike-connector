import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GuideProfile } from '@/types/guide';

export function useGuideProfileByEmail(email: string | undefined) {
  return useQuery({
    queryKey: ['guide-profile-email', email],
    queryFn: async () => {
      if (!email) throw new Error('Email is required');

      // First get the user_id from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) throw new Error('Profile not found');

      // Then get the guide_profiles data
      const { data: guideData, error: guideError } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('user_id', profileData.id)
        .maybeSingle();

      if (guideError) throw guideError;
      if (!guideData) throw new Error('Guide profile not found');

      return {
        ...guideData,
        certifications: Array.isArray(guideData.certifications) ? guideData.certifications : [],
      } as unknown as GuideProfile;
    },
    enabled: !!email,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
  });
}
