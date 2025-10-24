import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationPreferences {
  id?: string;
  user_id?: string;
  email_on_new_message: boolean;
  email_on_new_booking?: boolean;
  email_on_booking_update?: boolean;
  email_on_review?: boolean;
  email_on_payout?: boolean;
  email_on_ticket_update?: boolean;
  sms_on_urgent_booking?: boolean;
  push_notifications?: boolean;
  email_digest_frequency: string;
  created_at?: string;
  updated_at?: string;
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Create default preferences
        const { data: newData, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            email_on_new_message: true,
            email_on_new_booking: true,
            email_on_booking_update: true,
            email_on_review: true,
            email_on_payout: true,
            sms_on_urgent_booking: false,
            push_notifications: true,
            email_digest_frequency: 'instant',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setPreferences(newData);
      } else {
        setPreferences(data);
      }
    } catch (error: any) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: any) => {
    if (!user || !preferences) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences({ ...preferences, [key]: value });
      toast.success('Preference updated');
    } catch (error: any) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
    }
  };

  return {
    preferences,
    loading,
    updatePreference,
    refetch: fetchPreferences,
  };
}
