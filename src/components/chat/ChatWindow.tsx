import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMessages } from '@/hooks/useMessages';
import { useChatMessageTemplates } from '@/hooks/useChatMessageTemplates';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MessageSquare, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/chat';
import { format } from 'date-fns';

interface ChatWindowProps {
  conversation: Conversation;
  onClose?: () => void;
}

export function ChatWindow({ conversation, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { messages, loading, sendMessage, markAsRead } = useMessages(conversation.id);
  const { templates: chatTemplates } = useChatMessageTemplates(user?.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when opening
  useEffect(() => {
    if (user?.id) {
      markAsRead(user.id);
    }
  }, [conversation.id, user?.id]);

  // Typing indicators
  useEffect(() => {
    const channel = supabase.channel(`typing-${conversation.id}`);

    channel
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== user?.id) {
          setTypingUsers((prev) => {
            if (!prev.includes(payload.payload.userId)) {
              return [...prev, payload.payload.userId];
            }
            return prev;
          });

          setTimeout(() => {
            setTypingUsers((prev) => prev.filter((id) => id !== payload.payload.userId));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, user?.id]);

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const channel = supabase.channel(`typing-${conversation.id}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user?.id, userName: profile?.name }
    });

    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator after 3 seconds
    }, 3000);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      // Determine sender type
      let senderType = 'hiker';
      if (user?.id === conversation.guide_id) {
        senderType = 'guide';
      } else if (profile?.role === 'admin') {
        senderType = 'admin';
      }

      const result = await sendMessage(
        newMessage,
        senderType,
        profile?.name || 'Anonymous'
      );

      setNewMessage('');

      // Show warning if content was moderated
      if (result?.moderation?.hasViolations) {
        toast({
          title: 'Message sent with modifications',
          description: 'Contact information was automatically redacted for safety.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Failed to send message',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const replaceVariables = (template: string): string => {
    let result = template;
    
    // Replace guest name
    const guestName = conversation.profiles?.name || conversation.anonymous_name || 'there';
    result = result.replace(/{guest-name}/g, guestName);
    
    // Replace tour name
    const tourName = conversation.tours?.title || 'the tour';
    result = result.replace(/{tour-name}/g, tourName);
    
    // Replace guide name
    const guideName = profile?.name || 'your guide';
    result = result.replace(/{guide-name}/g, guideName);
    
    // For tour date and meeting point, use placeholders that indicate the info needs to be filled
    result = result.replace(/{tour-date}/g, '[tour date]');
    result = result.replace(/{meeting-point}/g, '[meeting point]');
    
    return result;
  };

  const insertTemplate = (templateContent: string) => {
    const processedContent = replaceVariables(templateContent);
    setNewMessage(processedContent);
    setTemplatesOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          {conversation.conversation_type === 'tour_inquiry' && conversation.tours?.title && (
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Tour Inquiry
              </Badge>
            </div>
          )}
          <h3 className="font-semibold">
            {conversation.tours?.title || 'Chat'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {conversation.profiles?.name || conversation.anonymous_name || 'Anonymous'}
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={user?.id}
                isAdmin={profile?.role === 'admin'}
                ticketOwnerName={conversation.anonymous_name || conversation.profiles?.name}
              />
            ))
          )}
          <div ref={scrollRef} />
        </div>

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2 px-4">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Someone is typing...</span>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2 items-end">
          {chatTemplates.length > 0 && (
            <Popover open={templatesOpen} onOpenChange={setTemplatesOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-[60px] w-[60px] flex-shrink-0"
                  title="Insert template"
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-2" align="start" side="top">
                <div className="space-y-1">
                  <p className="text-xs font-medium px-2 py-1">Quick Reply Templates</p>
                  <ScrollArea className="max-h-[300px]">
                    {chatTemplates
                      .filter(t => t.is_active)
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((template) => (
                        <button
                          key={template.id}
                          onClick={() => insertTemplate(template.message_content)}
                          className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{template.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          {template.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          )}
                        </button>
                      ))}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}
          <Textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="h-[60px] w-[60px] flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
          {chatTemplates.length > 0 && ' • Click template icon to insert quick replies'}
        </p>
      </div>
    </div>
  );
}
