import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline';
  last_seen: string;
  updated_at: string;
}

export function usePresence(userId: string | undefined) {
  const [presence, setPresence] = useState<UserPresence | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial presence
    const fetchPresence = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setPresence(data as UserPresence);
      }
    };

    fetchPresence();

    // Subscribe to presence changes
    const channel = supabase
      .channel(`presence-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setPresence(payload.new as UserPresence);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return presence;
}

// Heartbeat to update presence
export function usePresenceHeartbeat() {
  useEffect(() => {
    const updatePresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status: 'online',
          last_seen: new Date().toISOString()
        });
    };

    // Update presence every 30 seconds
    const interval = setInterval(updatePresence, 30000);
    updatePresence(); // Initial update

    // Set to offline on unmount
    return () => {
      clearInterval(interval);
      
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('user_presence')
            .update({
              status: 'offline',
              last_seen: new Date().toISOString()
            })
            .eq('user_id', user.id);
        }
      });
    };
  }, []);
}
