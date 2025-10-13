import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/chat';

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `hiker_id=eq.${userId},guide_id=eq.${userId}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function fetchConversations() {
    if (!userId) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`hiker_id.eq.${userId},guide_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations((data || []) as any);
    }
    setLoading(false);
  }

  return { conversations, loading, refetch: fetchConversations };
}
