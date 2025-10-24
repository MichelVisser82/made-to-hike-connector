import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserSettings {
  language: string;
  timezone: string;
  date_format: string;
  currency_display: string;
  profile_visibility: string;
  show_email_to_bookings: boolean;
  show_phone_to_bookings: boolean;
  analytics_cookies: boolean;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default settings
        const { data: newData, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            language: 'en',
            timezone: 'Europe/London',
            date_format: 'DD/MM/YYYY',
            currency_display: 'EUR',
            profile_visibility: 'public',
            show_email_to_bookings: false,
            show_phone_to_bookings: false,
            analytics_cookies: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      } else {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error fetching user settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    if (!user || !settings) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      setSettings({ ...settings, [key]: value });
      toast.success('Setting updated');
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast.error('Failed to update setting');
    }
  };

  return {
    settings,
    loading,
    updateSetting,
    refetch: fetchSettings,
  };
}
