import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { MessageSquare, Phone, Send, Star, Edit, Mail, Bell, Loader2, ChevronDown, ChevronUp, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Plus, Wand2, Edit2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useConversations } from '@/hooks/useConversations';
import { ChatWindow } from '../chat/ChatWindow';
import { EmailTemplateEditorDialog } from './EmailTemplateEditorDialog';
import { ChatMessageTemplateDialog } from './ChatMessageTemplateDialog';
import { PublicRequestCard } from './PublicRequestCard';
import { ForwardRequestModal } from '../modals/ForwardRequestModal';
import { useEmailTemplates, type EmailTemplate } from '@/hooks/useEmailTemplates';
import { useChatMessageTemplates, type ChatMessageTemplate } from '@/hooks/useChatMessageTemplates';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation as ChatConversation, Review, ReviewStats, NotificationPreference } from '@/types';
import type { Conversation } from '@/types/chat';
import { LoadingSpinner, ConversationsSkeleton, StatsCardsSkeleton, ListSkeleton } from './LoadingStates';
import ReviewsTab from './reviews/ReviewsTab';

interface PublicTourRequest {
  id: string;
  trip_name: string;
  region: string;
  preferred_dates: string;
  duration: string;
  group_size: string;
  experience_level: string;
  budget_per_person: string | null;
  description: string;
  special_requests: string[] | null;
  requester_name: string;
  requester_email: string;
  created_at: string;
}

interface InboxSectionProps {
  reviews: Review[];
  reviewStats: ReviewStats;
  notificationPreferences: NotificationPreference[];
  loading: boolean;
  onReplyToReview: (reviewId: string) => void;
  onUpdateNotificationPreference: (preferenceId: string, channel: 'email' | 'sms' | 'push', enabled: boolean) => void;
}
export function InboxSection({
  reviews,
  reviewStats,
  notificationPreferences,
  loading,
  onReplyToReview,
  onUpdateNotificationPreference
}: InboxSectionProps) {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [editingEmailTemplate, setEditingEmailTemplate] = useState<Partial<EmailTemplate> | null>(null);
  const [emailTemplateDialogOpen, setEmailTemplateDialogOpen] = useState(false);
  const [editingChatTemplate, setEditingChatTemplate] = useState<Partial<ChatMessageTemplate> | null>(null);
  const [chatTemplateDialogOpen, setChatTemplateDialogOpen] = useState(false);
  
  // Public requests state
  const [publicRequests, setPublicRequests] = useState<PublicTourRequest[]>([]);
  const [publicRequestsLoading, setPublicRequestsLoading] = useState(false);
  const [publicRequestsExpanded, setPublicRequestsExpanded] = useState(true);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [requestToForward, setRequestToForward] = useState<PublicTourRequest | null>(null);
  
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    templates: emailTemplates,
    createTemplate,
    updateTemplate,
    toggleTemplate,
    deleteTemplate
  } = useEmailTemplates(user?.id);
  
  const {
    templates: chatTemplates,
    createTemplate: createChatTemplate,
    updateTemplate: updateChatTemplate,
    toggleTemplate: toggleChatTemplate,
    deleteTemplate: deleteChatTemplate
  } = useChatMessageTemplates(user?.id);
  const isAdmin = profile?.role === 'admin';
  const isGuide = profile?.role === 'guide';
  const {
    conversations,
    loading: conversationsLoading,
    optimisticallyMarkConversationAsRead,
    refetch: refetchConversations
  } = useConversations(user?.id, isAdmin);

  // Calculate unread count
  const unreadCount = conversations.filter(c => c.unread_count && c.unread_count > 0).length;

  // Fetch public tour requests for guides
  useEffect(() => {
    if (!user?.id || !isGuide) return;

    const fetchPublicRequests = async () => {
      setPublicRequestsLoading(true);
      try {
        // Get requests that this guide hasn't responded to yet
        const { data: responses } = await supabase
          .from('guide_request_responses')
          .select('request_id')
          .eq('guide_id', user.id);

        const respondedRequestIds = responses?.map(r => r.request_id) || [];

        // Fetch open requests excluding ones this guide has already responded to
        let query = supabase
          .from('public_tour_requests')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (respondedRequestIds.length > 0) {
          query = query.not('id', 'in', `(${respondedRequestIds.join(',')})`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching public requests:', error);
        } else {
          setPublicRequests(data || []);
        }
      } catch (err) {
        console.error('Error fetching public requests:', err);
      } finally {
        setPublicRequestsLoading(false);
      }
    };

    fetchPublicRequests();
  }, [user?.id, isGuide]);

  const handlePublicRequestInterested = (conversationId: string) => {
    // Remove the request from the list and navigate to the conversation
    setPublicRequests(prev => prev.filter(r => r.id !== requestToForward?.id));
    refetchConversations();
    
    // Find and select the new conversation
    setTimeout(() => {
      const newConv = conversations.find(c => c.id === conversationId);
      if (newConv) {
        setSelectedConversation(newConv);
      }
      setSearchParams({ section: 'inbox', conversation: conversationId });
    }, 500);
  };

  const handlePublicRequestDeclined = () => {
    // Refresh the list to remove declined request
    setPublicRequests(prev => prev.filter(r => r.id !== requestToForward?.id));
  };

  const handleForwardRequest = (request: PublicTourRequest) => {
    setRequestToForward(request);
    setForwardModalOpen(true);
  };

  const handleForwarded = () => {
    // Remove the request from the list after forwarding
    if (requestToForward) {
      setPublicRequests(prev => prev.filter(r => r.id !== requestToForward.id));
    }
    setRequestToForward(null);
  };

  // Extract bookingId from URL params for review auto-opening
  const bookingId = searchParams.get('bookingId') || undefined;

  // Auto-select tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['messages', 'reviews', 'automated', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Auto-create default email templates if guide has none
  useEffect(() => {
    if (!user?.id || !isGuide || emailTemplates.length > 0 || createTemplate.isPending) return;
    const createDefaultTemplates = async () => {
      const defaultTemplates: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>[] = [{
        guide_id: user.id,
        name: 'Booking Confirmation',
        description: 'Sent immediately after booking is confirmed',
        subject: 'Your {tour-name} Booking is Confirmed! 🎉',
        content: `Hi {guest-firstname},

Welcome aboard! Your booking for {tour-name} is confirmed.

📅 Date: {tour-date}
📍 Meeting Point: {meeting-point}
⏰ Start Time: {start-time}
👥 Participants: {guest-count}

What to bring:
• Hiking boots
• Layered clothing
• Water and snacks
• Camera (optional)

If you have any questions, feel free to reach out!

Best regards,
{guide-name}`,
        trigger_type: 'booking_confirmed' as const,
        timing_value: 0,
        timing_unit: 'hours' as const,
        timing_direction: 'after' as const,
        is_active: true,
        send_as_email: true
      }, {
        guide_id: user.id,
        name: 'Pre-Trip Reminder',
        description: 'Sent 2 days before tour date',
        subject: 'Your {tour-name} Adventure is Coming Up! ⛰️',
        content: `Hi {guest-firstname},

Your trek is coming up in 2 days! Here's what you need to know:

📅 Date: {tour-date}
📍 Meeting Point: {meeting-point}
⏰ Please arrive by: {start-time}

Don't forget to bring:
✓ Proper hiking boots
✓ Rain gear (just in case)
✓ Water bottle
✓ Sun protection
✓ Layers for changing weather

Looking forward to an amazing adventure together!

See you soon,
{guide-name}`,
        trigger_type: 'booking_reminder' as const,
        timing_value: 2,
        timing_unit: 'days' as const,
        timing_direction: 'before' as const,
        is_active: true,
        send_as_email: true
      }, {
        guide_id: user.id,
        name: 'Thank You & Review Request',
        description: 'Sent after tour completes',
        subject: 'Thank You for Hiking with Us! 🏔️',
        content: `Hi {guest-firstname},

Thank you for joining me on {tour-name}! It was a pleasure having you on the trail.

I hope you enjoyed the experience and created some lasting memories. If you have a moment, I'd really appreciate it if you could share your feedback by leaving a review.

Your review helps other hikers discover the tours and helps me improve the experience for future guests.

Until our next adventure!

Best regards,
{guide-name}`,
        trigger_type: 'tour_completed' as const,
        timing_value: 1,
        timing_unit: 'days' as const,
        timing_direction: 'after' as const,
        is_active: true,
        send_as_email: true
      }];
      for (const template of defaultTemplates) {
        await createTemplate.mutateAsync(template);
      }
    };
    createDefaultTemplates();
  }, [user?.id, isGuide, emailTemplates.length, createTemplate]);

  // Auto-create default chat message templates if guide has none
  useEffect(() => {
    if (!user?.id || !isGuide || chatTemplates.length > 0 || createChatTemplate.isPending) return;
    const createDefaultChatTemplates = async () => {
      const defaultChatTemplates = [
        {
          guide_id: user.id,
          name: 'Welcome & Trip Preparation',
          description: 'Initial greeting and preparation info',
          message_content: 'Hello everyone! I\'m excited to have you join the tour. Please make sure to bring appropriate hiking gear and check the weather forecast. Looking forward to meeting you!',
          category: 'greeting',
          is_active: true,
          sort_order: 1,
        },
        {
          guide_id: user.id,
          name: '48-Hour Reminder',
          description: 'Friendly reminder before the tour',
          message_content: 'Hi team! Just a friendly reminder that our tour is coming up in 48 hours. See you at the meeting point soon!',
          category: 'booking',
          is_active: true,
          sort_order: 2,
        },
        {
          guide_id: user.id,
          name: 'Weather Update',
          description: 'Share weather conditions',
          message_content: 'Weather update for our upcoming tour: Conditions look favorable for hiking. Please dress in layers and bring rain gear just in case.',
          category: 'weather',
          is_active: true,
          sort_order: 3,
        },
        {
          guide_id: user.id,
          name: 'Post-Trip Thank You',
          description: 'Thank participants after the tour',
          message_content: 'Thank you all for joining the tour! It was a pleasure guiding you. I\'d appreciate if you could leave a review of your experience.',
          category: 'farewell',
          is_active: true,
          sort_order: 4,
        },
      ];

      for (const template of defaultChatTemplates) {
        await createChatTemplate.mutateAsync(template);
      }
    };
    createDefaultChatTemplates();
  }, [user?.id, isGuide, chatTemplates.length, createChatTemplate]);

  // Auto-select conversation from URL parameter (only on initial load)
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0 && !selectedConversation) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setSelectedConversation(conversation);
        setActiveTab('messages');
      }
    }
  }, [conversations]);
  const renderStarRating = (rating: number, size: number = 16, filled: boolean = true) => {
    return <div className="flex gap-0.5">
        {Array.from({
        length: 5
      }).map((_, i) => <Star key={i} className={`w-${size === 20 ? '5' : '4'} h-${size === 20 ? '5' : '4'} ${i < rating ? 'fill-gold text-gold' : 'fill-none text-charcoal/20'}`} />)}
      </div>;
  };
  return <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-playfair text-charcoal mb-2">
          Inbox &amp; Reviews
        </h1>
        <p className="text-charcoal/60">
          Manage guest communications and reviews
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-cream p-1 rounded-lg mb-6 flex-wrap h-auto">
          <TabsTrigger value="messages" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Messages ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Reviews
          </TabsTrigger>
          <TabsTrigger value="automated" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Automated Messages
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-burgundy data-[state=active]:text-white">
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* MESSAGES TAB */}
        <TabsContent value="messages" className="space-y-6">
          {/* Public Requests Panel - Only for Guides */}
          {isGuide && publicRequests.length > 0 && (
            <Collapsible open={publicRequestsExpanded} onOpenChange={setPublicRequestsExpanded}>
              <Card className="border-burgundy/20 bg-gradient-to-r from-burgundy/5 to-cream/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-burgundy/5 transition-colors rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center">
                          <Inbox className="w-5 h-5 text-burgundy" />
                        </div>
                        <div>
                          <CardTitle className="font-playfair text-lg text-charcoal flex items-center gap-2">
                            New Public Requests
                            <Badge className="bg-burgundy text-white">
                              {publicRequests.length}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="text-charcoal/60">
                            Hikers looking for guides in your regions
                          </CardDescription>
                        </div>
                      </div>
                      {publicRequestsExpanded ? (
                        <ChevronUp className="w-5 h-5 text-charcoal/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-charcoal/40" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {publicRequestsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-burgundy" />
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {publicRequests.map(request => (
                          <PublicRequestCard
                            key={request.id}
                            request={request}
                            guideId={user?.id || ''}
                            onInterested={(conversationId) => {
                              setPublicRequests(prev => prev.filter(r => r.id !== request.id));
                              refetchConversations();
                              setTimeout(() => {
                                setSearchParams({ section: 'inbox', conversation: conversationId });
                              }, 500);
                            }}
                            onDeclined={() => {
                              setPublicRequests(prev => prev.filter(r => r.id !== request.id));
                            }}
                            onForward={(req) => {
                              setRequestToForward(req);
                              setForwardModalOpen(true);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )}

          {/* Conversations Section */}
          {conversationsLoading ? <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
            </div> : conversations.length === 0 && publicRequests.length === 0 ? <Card>
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  No conversations yet
                </h3>
                <p className="text-sm text-charcoal/60">
                  Messages from your guests will appear here
                </p>
              </CardContent>
            </Card> : conversations.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Conversations List */}
              <Card className="p-4 h-[600px] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-charcoal">Conversations</h3>
                  {unreadCount > 0 && <Badge className="bg-burgundy text-white px-2 py-1 rounded text-xs">
                      {unreadCount}
                    </Badge>}
                </div>
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {conversations.map(conv => {
                  // useConversations sets conv.profiles to the correct person to display
                  const displayName = conv.profiles?.name || conv.anonymous_name || 'Unknown User';
                  const avatarUrl = conv.profiles?.avatar_url;

                  // Generate initials (first letter of first name + first letter of last name)
                  const getInitials = (name: string) => {
                    const parts = name.trim().split(' ');
                    if (parts.length === 1) return parts[0][0].toUpperCase();
                    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                  };

                  // Determine subtitle
                  const subtitle = conv.conversation_type === 'admin_support' && conv.ticket?.ticket_number ? `Ticket #${conv.ticket.ticket_number}` : conv.tours?.title || 'General inquiry';
                  return <div key={conv.id} onClick={e => {
                    e.stopPropagation();
                    optimisticallyMarkConversationAsRead(conv.id);
                    setSelectedConversation(conv);
                    // Update URL to reflect selected conversation
                    setSearchParams({
                      section: 'inbox',
                      conversation: conv.id
                    });
                  }} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-burgundy/10 border-l-2 border-l-burgundy' : 'hover:bg-cream/50'} ${conv.unread_count && conv.unread_count > 0 ? 'bg-burgundy/5' : ''}`}>
                          <div className="flex items-start gap-3">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
                              <AvatarFallback className="bg-burgundy text-white text-sm">
                                {getInitials(displayName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-medium text-charcoal text-sm truncate">
                                  {displayName}
                                </p>
                                <span className="text-xs text-charcoal/50 flex-shrink-0 ml-2">
                                  {format(new Date(conv.last_message_at), 'MMM d')}
                                </span>
                              </div>
                              <p className="text-xs text-charcoal/60 truncate mb-1">
                                {subtitle}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {conv.conversation_type === 'custom_tour_request' && (
                                  <Badge variant="outline" className="border-burgundy/30 text-burgundy text-xs px-2 py-0.5">
                                    Custom Tour Request
                                  </Badge>
                                )}
                                {conv.unread_count && conv.unread_count > 0 && (
                                  <Badge className="bg-burgundy text-white text-xs px-2 py-0.5">
                                    {conv.unread_count} new
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>;
                })}
                  </div>
                </ScrollArea>
              </Card>

              {/* Active Conversation */}
              <Card className="md:col-span-2 h-[600px]">
                {selectedConversation ? <ChatWindow conversation={selectedConversation} onClose={() => setSelectedConversation(null)} /> : <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                      <p className="text-charcoal/60">
                        Select a conversation to view messages
                      </p>
                    </div>
                  </CardContent>}
              </Card>
            </div> : null}
          
          {/* Forward Request Modal */}
          <ForwardRequestModal
            open={forwardModalOpen}
            onOpenChange={setForwardModalOpen}
            request={requestToForward}
            guideId={user?.id || ''}
            onForwarded={handleForwarded}
          />
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews">
          <ReviewsTab isGuide={isGuide || false} openBookingId={bookingId} onClearBookingId={() => {
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('bookingId');
          setSearchParams(newParams);
        }} />
        </TabsContent>

        {/* AUTOMATED MESSAGES TAB */}
        <TabsContent value="automated" className="space-y-6">
          {/* Automated Email Templates Section */}
          <Card>
            <CardHeader>
              <CardTitle>Automated Email Templates</CardTitle>
              <CardDescription>
                Set up automated emails sent to guests based on booking triggers and timing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => {
              setEditingEmailTemplate(null);
              setEmailTemplateDialogOpen(true);
            }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Email Template
              </Button>

              <div className="space-y-2">
                {createTemplate.isPending ? <div className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" />
                    <p>Setting up your default templates...</p>
                  </div> : emailTemplates.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">Loading templates...</p>
                  </div> : [...emailTemplates].sort((a, b) => {
                const order = ['booking_confirmed', 'booking_reminder', 'tour_completed'];
                return order.indexOf(a.trigger_type) - order.indexOf(b.trigger_type);
              }).map(template => <div key={template.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{template.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {template.description || template.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.trigger_type.replace('_', ' ')}
                        </Badge>
                        {template.timing_value > 0 && <Badge variant="outline" className="text-xs">
                            {template.timing_value} {template.timing_unit} {template.timing_direction}
                          </Badge>}
                        {!template.is_active && <Badge variant="secondary">Disabled</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={template.is_active} onCheckedChange={checked => toggleTemplate.mutate({
                      id: template.id,
                      isActive: checked
                    })} />
                      <Button variant="ghost" size="sm" onClick={() => {
                    setEditingEmailTemplate(template);
                    setEmailTemplateDialogOpen(true);
                  }}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteTemplate.mutate(template.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>)}
              </div>
            </CardContent>
          </Card>

          {/* Standardized Chat Messages Section */}
          <Card>
            <CardHeader>
              <CardTitle>Standardized Chat Messages</CardTitle>
              <CardDescription>
                Create quick reply templates that you can use in any chat conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEditingChatTemplate(null);
                  setChatTemplateDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Chat Message Template
              </Button>

              <div className="space-y-2">
                {chatTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No chat templates yet</p>
                    <p className="text-sm">Create templates for messages you use frequently</p>
                  </div>
                ) : (
                  [...chatTemplates]
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((template) => (
                      <div
                        key={template.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{template.name}</h4>
                          {template.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {template.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                            {!template.is_active && (
                              <Badge variant="secondary">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {template.message_content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Switch
                            checked={template.is_active}
                            onCheckedChange={(checked) =>
                              toggleChatTemplate.mutate({
                                id: template.id,
                                isActive: checked,
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingChatTemplate(template);
                              setChatTemplateDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteChatTemplate.mutate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-playfair text-charcoal mb-6">
              Notification Preferences
            </h2>
            {loading ? <ListSkeleton items={4} /> : <div className="space-y-6">
                {notificationPreferences.map(pref => <div key={pref.id} className="pb-6 border-b border-burgundy/5 last:border-0">
                    <h3 className="font-medium text-charcoal mb-1">{pref.title}</h3>
                    <p className="text-sm text-charcoal/60 mb-3">{pref.description}</p>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-charcoal/60" />
                        <span className="text-sm text-charcoal mr-2">Email</span>
                        <Switch checked={pref.email} onCheckedChange={checked => onUpdateNotificationPreference(pref.id, 'email', checked)} className="data-[state=checked]:bg-burgundy" />
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-charcoal/60" />
                        <span className="text-sm text-charcoal mr-2">SMS</span>
                        <Switch checked={pref.sms} onCheckedChange={checked => onUpdateNotificationPreference(pref.id, 'sms', checked)} className="data-[state=checked]:bg-burgundy" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-charcoal/60" />
                        <span className="text-sm text-charcoal mr-2">Push</span>
                        <Switch checked={pref.push} onCheckedChange={checked => onUpdateNotificationPreference(pref.id, 'push', checked)} className="data-[state=checked]:bg-burgundy" />
                      </div>
                    </div>
                  </div>)}
              </div>}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Template Editor Dialog */}
      <EmailTemplateEditorDialog 
        template={editingEmailTemplate} 
        existingTemplates={emailTemplates} 
        open={emailTemplateDialogOpen} 
        onOpenChange={setEmailTemplateDialogOpen} 
        onSave={templateData => {
          if (templateData.id) {
            updateTemplate.mutate({
              id: templateData.id,
              updates: templateData
            });
          } else {
            createTemplate.mutate({
              ...templateData,
              guide_id: user!.id
            } as any);
          }
        }} 
      />

      {/* Chat Message Template Dialog */}
      <ChatMessageTemplateDialog
        template={editingChatTemplate}
        open={chatTemplateDialogOpen}
        onOpenChange={setChatTemplateDialogOpen}
        onSave={(templateData) => {
          if (templateData.id) {
            updateChatTemplate.mutate({
              id: templateData.id,
              updates: templateData,
            });
          } else {
            createChatTemplate.mutate({
              ...templateData,
              guide_id: user!.id,
            } as any);
          }
        }}
      />
    </div>;
}