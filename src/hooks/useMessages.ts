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

    const unreadMessages = messages.filter(
      (msg) => msg.sender_id !== userId && !msg.read_receipts?.some((r) => r.user_id === userId)
    );

    for (const msg of unreadMessages) {
      const { error } = await supabase
        .from('message_read_receipts')
        .insert({
          message_id: msg.id,
          user_id: userId,
          read_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to mark message as read:', error);
      }
    }

    // Refetch to update UI with read receipts
    await fetchMessages();
  }

  return { messages, loading, sendMessage, markAsRead, refetch: fetchMessages };
}
