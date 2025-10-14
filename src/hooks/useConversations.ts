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
      .select(`
        *,
        tours (
          id,
          title,
          hero_image
        ),
        hiker_profile:profiles!hiker_id (
          id,
          name,
          avatar_url
        ),
        guide_profile:profiles!guide_id (
          id,
          name,
          avatar_url
        )
      `)
      .or(`hiker_id.eq.${userId},guide_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    const conversationsWithUnread = await Promise.all(
      (data || []).map(async (conv) => {
        const { data: unreadMessages } = await supabase
          .from('messages')
          .select('id')
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId);

        let unreadCount = 0;
        if (unreadMessages) {
          for (const msg of unreadMessages) {
            const { data: receipt } = await supabase
              .from('message_read_receipts')
              .select('id')
              .eq('message_id', msg.id)
              .eq('user_id', userId)
              .maybeSingle();
            
            if (!receipt) {
              unreadCount++;
            }
          }
        }

        const profiles = conv.hiker_id === userId ? conv.guide_profile : conv.hiker_profile;

        return { 
          ...conv, 
          unread_count: unreadCount,
          profiles: profiles
        };
      })
    );

    setConversations(conversationsWithUnread as any);
    setLoading(false);
  }

  return { conversations, loading, refetch: fetchConversations };
}
