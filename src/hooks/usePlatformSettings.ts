import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PlatformSettings {
  require_verification_for_publishing: boolean;
}

export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'verification_requirements')
        .maybeSingle();

      if (error) throw error;
      
      // Default settings if none exist
      const defaultSettings: PlatformSettings = {
        require_verification_for_publishing: true,
      };

      if (!data?.setting_value) {
        return defaultSettings;
      }

      return {
        ...defaultSettings,
        ...(data.setting_value as Partial<PlatformSettings>),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
