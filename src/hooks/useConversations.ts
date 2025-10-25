import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/chat';

export function useConversations(userId: string | undefined, isAdmin: boolean = false) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchConversations();

    // Subscribe to new messages and read receipts
    const messagesChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          ...(isAdmin ? {} : { filter: `hiker_id=eq.${userId},guide_id=eq.${userId}` })
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          // Slight delay to ensure read receipts are processed
          setTimeout(() => fetchConversations(), 500);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_read_receipts'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [userId, isAdmin]);

  async function fetchConversations() {
    if (!userId) return;

    // Fetch conversations - RLS policies will handle access control
    // Admins see all conversations, others see only their own
    let query = supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });
    
    // For non-admins, explicitly filter by user participation
    if (!isAdmin) {
      query = query.or(`hiker_id.eq.${userId},guide_id.eq.${userId}`);
    }
    
    const { data: convData, error } = await query;

    console.log('Fetching conversations, isAdmin:', isAdmin, 'count:', convData?.length);

    if (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
      return;
    }

    // Deduplicate conversations by hiker+guide+tour, keeping most recent
    const uniqueConvMap = new Map<string, typeof convData[0]>();
    (convData || []).forEach(conv => {
      const key = `${conv.hiker_id || 'anon'}_${conv.guide_id}_${conv.tour_id || 'none'}`;
      const existing = uniqueConvMap.get(key);
      
      // Keep the most recent conversation (already sorted by last_message_at desc)
      if (!existing || new Date(conv.last_message_at) > new Date(existing.last_message_at)) {
        uniqueConvMap.set(key, conv);
      }
    });

    const uniqueConversations = Array.from(uniqueConvMap.values());

    // Fetch all related data for each conversation
    const conversationsWithData = await Promise.all(
      uniqueConversations.map(async (conv) => {
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

        // Get ticket info if admin_support conversation
        let ticketInfo = null;
        if (conv.conversation_type === 'admin_support') {
          const { data: ticket } = await supabase
            .from('tickets')
            .select('ticket_number')
            .eq('conversation_id', conv.id)
            .maybeSingle();
          ticketInfo = ticket;
        }

        // Get admin profile for admin_support conversations
        let adminProfile = null;
        if (conv.conversation_type === 'admin_support' || conv.conversation_type === 'guide_admin') {
          // Find a message where sender is NOT the current user (that's the admin)
          const { data: adminMessage } = await supabase
            .from('messages')
            .select('sender_id')
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .not('sender_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (adminMessage?.sender_id) {
            const { data: admin } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', adminMessage.sender_id)
              .maybeSingle();
            adminProfile = admin;
            console.log('Fetched admin profile for conversation:', conv.id, admin);
          } else {
            console.log('No admin message found for conversation:', conv.id);
          }
        }

        // Determine which profile to show - always show the OTHER person
        let otherProfile;
        if (conv.conversation_type === 'admin_support' || conv.conversation_type === 'guide_admin') {
          // For admin conversations, determine who the other person is
          const isCurrentUserTicketCreator = conv.hiker_id === userId || conv.guide_id === userId;
          
          if (isCurrentUserTicketCreator) {
            // Current user created the ticket, show the admin who responded
            otherProfile = adminProfile;
            console.log('Setting otherProfile to adminProfile for conversation:', conv.id, adminProfile);
          } else {
            // Current user is the admin, show the ticket creator
            otherProfile = hikerProfile || guideProfile;
          }
        } else if (isAdmin && conv.hiker_id !== userId && conv.guide_id !== userId) {
          // Admin viewing someone else's conversation - show hiker
          otherProfile = hikerProfile;
        } else {
          // Regular conversation - show the other person
          otherProfile = conv.hiker_id === userId ? guideProfile : hikerProfile;
        }

        return {
          ...conv,
          tours: tourInfo,
          hiker_profile: hikerProfile,
          guide_profile: guideProfile,
          profiles: otherProfile,
          unread_count: unreadCount,
          ticket: ticketInfo
        };
      })
    );

    console.log('Processed conversations:', conversationsWithData.length);
    setConversations(conversationsWithData as any);
    setLoading(false);
  }

  const optimisticallyMarkConversationAsRead = (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  };

  return { 
    conversations, 
    loading, 
    refetch: fetchConversations,
    optimisticallyMarkConversationAsRead 
  };
}
