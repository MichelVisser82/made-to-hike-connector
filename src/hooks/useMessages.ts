import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/chat';

export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  async function fetchMessages() {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        read_receipts:message_read_receipts(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages((data || []) as Message[]);
    }
    setLoading(false);
  }

  async function sendMessage(content: string, senderType: string, senderName?: string) {
    if (!conversationId) {
      throw new Error('No conversation ID available');
    }

    const { data: session } = await supabase.auth.getSession();
    
    const response = await supabase.functions.invoke('send-message', {
      body: {
        conversationId,
        content,
        senderType,
        senderName
      },
      headers: session.session ? {
        Authorization: `Bearer ${session.session.access_token}`
      } : {}
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  }

  async function markAsRead(userId: string) {
    if (!conversationId) return;

    // Fetch all messages in the conversation that are not sent by the current user
    const { data: unreadMessages, error: fetchError } = await supabase
      .from('messages')
      .select('id, sender_id')
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (fetchError) {
      console.error('Failed to fetch unread messages:', fetchError);
      return;
    }

    if (!unreadMessages || unreadMessages.length === 0) return;

    // Insert read receipts for all unread messages (upsert to avoid duplicates)
    for (const msg of unreadMessages) {
      const { error } = await supabase
        .from('message_read_receipts')
        .upsert({
          message_id: msg.id,
          user_id: userId,
          read_at: new Date().toISOString()
        }, {
          onConflict: 'message_id,user_id'
        });

      if (error && error.code !== '23505') { // Ignore duplicate key errors
        console.error('Failed to mark message as read:', error);
      }
    }

    // Refetch messages to update UI
    await fetchMessages();
  }

  return { messages, loading, sendMessage, markAsRead, refetch: fetchMessages };
}
