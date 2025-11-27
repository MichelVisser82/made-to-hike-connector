import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { X, MessageSquare, Mail, Phone, Calendar, Send, Paperclip, AlertCircle, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import type { BookingWithDetails } from '@/types';
import { MessageBubble } from '../chat/MessageBubble';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingWithDetails;
}

export function MessagesModal({
  isOpen,
  onClose,
  booking,
}: MessagesModalProps) {
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [moderationWarning, setModerationWarning] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, loading } = useMessages(conversationId);

  // Pre-made message templates
  const messageTemplates = [
    { id: 1, label: "Meeting Point Confirmation", text: `Hi! Just confirming our meeting point: ${booking.tour?.meeting_point}. See you soon!` },
    { id: 2, label: "Weather Update", text: "Hi! The weather looks great for our tour. Don't forget to bring sunscreen and water!" },
    { id: 3, label: "Equipment Reminder", text: "Hi! Just a reminder to bring your hiking boots, water bottle, and any personal medications. Looking forward to our adventure!" },
    { id: 4, label: "Running Late", text: "Hi! I'm running a few minutes late. I'll be there as soon as possible. Thank you for your patience!" },
    { id: 5, label: "Thank You", text: "Thank you for booking with me! I'm excited to show you around. Feel free to ask any questions before the tour." },
  ];

  useEffect(() => {
    if (isOpen && booking) {
      fetchOrCreateConversation();
    }
  }, [isOpen, booking]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchOrCreateConversation = async () => {
    setIsLoadingConversation(true);
    try {
      if (!booking.tour?.guide_id || !booking.hiker_id || !booking.tour_id) {
        console.error('Missing required booking data:', { 
          guideId: booking.tour?.guide_id, 
          hikerId: booking.hiker_id, 
          tourId: booking.tour_id 
        });
        toast({
          title: 'Error',
          description: 'Unable to load conversation. Missing booking information.',
          variant: 'destructive'
        });
        setIsLoadingConversation(false);
        return;
      }

      const { data: existing, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('tour_id', booking.tour_id)
        .eq('hiker_id', booking.hiker_id)
        .eq('guide_id', booking.tour.guide_id)
        .eq('conversation_type', 'booking_chat')
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
        throw fetchError;
      }

      if (existing) {
        console.log('Found existing conversation:', existing.id);
        setConversationId(existing.id);
      } else {
        console.log('Creating new conversation...');
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            tour_id: booking.tour_id,
            hiker_id: booking.hiker_id,
            guide_id: booking.tour.guide_id,
            conversation_type: 'booking_chat'
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          throw createError;
        }

        if (newConv) {
          console.log('Created new conversation:', newConv.id);
          setConversationId(newConv.id);
        } else {
          throw new Error('Failed to create conversation - no data returned');
        }
      }
    } catch (error) {
      console.error('Failed to fetch or create conversation:', error);
      toast({
        title: 'Error',
        description: 'Unable to set up messaging. Please refresh and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingConversation(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    if (!conversationId) {
      toast({
        title: 'Please wait',
        description: 'Conversation is being set up...',
        variant: 'default'
      });
      return;
    }
    
    try {
      const result = await sendMessage(newMessage, 'guide', user?.email);
      
      if (result?.moderated) {
        setModerationWarning(result.moderationReason);
        toast({
          title: 'Message moderated',
          description: 'Some content was removed for safety. The message was still sent.',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Message sent',
          description: 'Your message has been sent to the guest',
        });
      }
      
      setNewMessage('');
      setModerationWarning(null);
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleTemplateSelect = (templateText: string) => {
    setNewMessage(templateText);
    setShowTemplates(false);
    toast({
      title: 'Template loaded',
      description: 'You can edit the message before sending',
    });
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'File attachment',
      description: 'File attachments will be available soon',
    });
  };

  const handleCallGuest = () => {
    const phone = booking.hiker?.phone || booking.guest?.phone;
    const country = booking.hiker?.country || booking.guest?.country || '';
    if (phone) {
      window.location.href = `tel:${country}${phone}`;
    } else {
      toast({
        title: 'No phone number',
        description: 'Guest phone number is not available',
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cream to-cream-light border-b border-burgundy/10 px-6 py-4 -mx-6 -mt-6 mb-6">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-medium text-charcoal">
                Messages with {booking.hiker?.name || booking.guest?.name}
              </h2>
              <p className="text-sm text-charcoal/60">
                Booking #{booking.booking_reference || 'N/A'} • {booking.tour?.title}
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="hidden md:block">
            <Card className="p-4 space-y-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 bg-gradient-to-br from-burgundy to-burgundy-dark">
                  <AvatarFallback className="bg-gradient-to-br from-burgundy to-burgundy-dark text-white">
                    {getInitials(booking.hiker?.name || booking.guest?.name || 'Guest')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-charcoal">{booking.hiker?.name || booking.guest?.name}</p>
                  <p className="text-xs text-charcoal/60">Primary Guest</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-charcoal/60" />
                  <span className="text-charcoal/80 truncate">{booking.hiker?.email || booking.guest?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-charcoal/60" />
                  <span className="text-charcoal/80">{booking.hiker?.phone || booking.guest?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-charcoal/60" />
                  <span className="text-charcoal/80">
                    {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-charcoal">{booking.tour?.title}</p>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="md:col-span-2">
            {isLoadingConversation ? (
              <div className="py-12 text-center">
                <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4 animate-pulse" />
                <p className="text-sm text-charcoal/60">Setting up conversation...</p>
              </div>
            ) : !conversationId ? (
              <div className="py-12 text-center">
                <AlertCircle className="w-16 h-16 text-destructive/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  Unable to load conversation
                </h3>
                <p className="text-sm text-charcoal/60 mb-4">
                  Please close and try again
                </p>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            ) : (
              <>
                {moderationWarning && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {moderationWarning}
                    </AlertDescription>
                  </Alert>
                )}
                
                {loading ? (
                  <div className="py-12 text-center">
                    <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4 animate-pulse" />
                    <p className="text-sm text-charcoal/60">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                    <h3 className="text-lg font-playfair text-charcoal mb-2">
                      No messages yet
                    </h3>
                    <p className="text-sm text-charcoal/60">
                      Send the first message to start the conversation
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-96 pr-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {/* Message Input */}
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoadingConversation || !conversationId}
                  className="flex-1 border-burgundy/20"
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-burgundy hover:bg-burgundy-dark"
                  disabled={!newMessage.trim() || isLoadingConversation || !conversationId}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => setShowTemplates(!showTemplates)}
                  disabled={isLoadingConversation || !conversationId}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Templates
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleAttachFile}
                  disabled={isLoadingConversation || !conversationId}
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach File
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={handleCallGuest}
                  disabled={isLoadingConversation}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Guest
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />

                  {/* Templates dropdown */}
                  {showTemplates && (
                    <Card className="p-2 space-y-1">
                      {messageTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template.text)}
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-cream/50 transition-colors"
                        >
                          <p className="text-sm font-medium text-charcoal">{template.label}</p>
                          <p className="text-xs text-charcoal/60 mt-0.5 line-clamp-1">{template.text}</p>
                        </button>
                      ))}
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
