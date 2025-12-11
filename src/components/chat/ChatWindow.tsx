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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, MessageSquare, MapPin, FileText, X, Forward } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation } from '@/types/chat';
import { format } from 'date-fns';
import { QuickOfferForm } from '@/components/guide/QuickOfferForm';

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
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [forwardEmail, setForwardEmail] = useState('');
  const [forwardNote, setForwardNote] = useState('');
  const [actionLoading, setActionLoading] = useState<'decline' | 'forward' | null>(null);
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

  // Get request ID from conversation metadata for custom tour requests
  const requestId = conversation.metadata?.request_id;

  const handleDecline = async () => {
    if (!requestId || !user?.id) return;
    
    setActionLoading('decline');
    try {
      const { error } = await supabase.functions.invoke('respond-to-public-request', {
        body: {
          request_id: requestId,
          guide_id: user.id,
          response_type: 'declined',
          decline_reason: declineReason || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Request Declined",
        description: "You've declined this custom tour request.",
      });
      setDeclineModalOpen(false);
      setDeclineReason('');
    } catch (error) {
      console.error('Error declining request:', error);
      toast({
        title: "Failed to decline",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleForward = async () => {
    if (!requestId || !user?.id || !forwardEmail) return;
    
    setActionLoading('forward');
    try {
      const { error } = await supabase.functions.invoke('respond-to-public-request', {
        body: {
          request_id: requestId,
          guide_id: user.id,
          response_type: 'forwarded',
          forwarded_to_email: forwardEmail,
          personal_note: forwardNote || null,
        },
      });

      if (error) throw error;

      toast({
        title: "Request Forwarded",
        description: `Request forwarded to ${forwardEmail}`,
      });
      setForwardModalOpen(false);
      setForwardEmail('');
      setForwardNote('');
    } catch (error) {
      console.error('Error forwarding request:', error);
      toast({
        title: "Failed to forward",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
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
      <div className="p-4 border-t space-y-2">
        {/* Action buttons for custom tour requests */}
        {conversation.conversation_type === 'custom_tour_request' && 
         user?.id === conversation.guide_id && (
          <>
            <QuickOfferForm
              conversation={conversation}
              open={offerModalOpen}
              onOpenChange={setOfferModalOpen}
              onOfferSent={() => {
                toast({
                  title: "Offer Sent",
                  description: "Your tour offer has been sent to the client via email.",
                });
                setOfferModalOpen(false);
              }}
            />
            
            {/* Action buttons row */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOfferModalOpen(true)}
                className="flex-1 border-primary text-primary hover:bg-primary/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Offer
              </Button>
              
              {requestId && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setForwardModalOpen(true)}
                    className="border-muted-foreground/30 text-muted-foreground hover:bg-muted"
                  >
                    <Forward className="w-4 h-4 mr-2" />
                    Forward
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDeclineModalOpen(true)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </>
              )}
            </div>

            {/* Decline Modal */}
            <Dialog open={declineModalOpen} onOpenChange={setDeclineModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Decline Request</DialogTitle>
                  <DialogDescription>
                    Let the requester know why you're unable to take this request.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="decline-reason">Reason (optional)</Label>
                    <Textarea
                      id="decline-reason"
                      value={declineReason}
                      onChange={(e) => setDeclineReason(e.target.value)}
                      placeholder="E.g., Fully booked during those dates, outside my guiding area..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeclineModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDecline}
                    disabled={actionLoading === 'decline'}
                  >
                    {actionLoading === 'decline' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <X className="w-4 h-4 mr-2" />
                    )}
                    Decline Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Forward Modal */}
            <Dialog open={forwardModalOpen} onOpenChange={setForwardModalOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Forward Request</DialogTitle>
                  <DialogDescription>
                    Forward this request to another guide who might be able to help.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="forward-email">Guide's Email *</Label>
                    <Input
                      id="forward-email"
                      type="email"
                      value={forwardEmail}
                      onChange={(e) => setForwardEmail(e.target.value)}
                      placeholder="guide@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="forward-note">Personal Note (optional)</Label>
                    <Textarea
                      id="forward-note"
                      value={forwardNote}
                      onChange={(e) => setForwardNote(e.target.value)}
                      placeholder="Add a note to the guide you're forwarding to..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setForwardModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleForward}
                    disabled={actionLoading === 'forward' || !forwardEmail}
                  >
                    {actionLoading === 'forward' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Forward className="w-4 h-4 mr-2" />
                    )}
                    Forward Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}

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
