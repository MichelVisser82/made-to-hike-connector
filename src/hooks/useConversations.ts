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

    // Fetch conversations first
    const { data: convData, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`hiker_id.eq.${userId},guide_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    // Fetch all related data for each conversation
    const conversationsWithData = await Promise.all(
      (convData || []).map(async (conv) => {
        // Get tour info
        let tourInfo = null;
        if (conv.tour_id) {
          const { data: tour } = await supabase
            .from('tours')
            .select('id, title, hero_image')
            .eq('id', conv.tour_id)
            .maybeSingle();
          tourInfo = tour;
        }

        // Get hiker profile
        let hikerProfile = null;
        if (conv.hiker_id) {
          const { data: hiker } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', conv.hiker_id)
            .maybeSingle();
          hikerProfile = hiker;
        }

        // Get guide profile
        let guideProfile = null;
        if (conv.guide_id) {
          const { data: guide } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', conv.guide_id)
            .maybeSingle();
          guideProfile = guide;
        }

        // Calculate unread count
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

        // Determine which profile to show (the OTHER person)
        const otherProfile = conv.hiker_id === userId ? guideProfile : hikerProfile;

        return {
          ...conv,
          tours: tourInfo,
          hiker_profile: hikerProfile,
          guide_profile: guideProfile,
          profiles: otherProfile,
          unread_count: unreadCount
        };
      })
    );

    setConversations(conversationsWithData as any);
    setLoading(false);
  }

  return { conversations, loading, refetch: fetchConversations };
}
