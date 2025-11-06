import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { MessageSquare, Phone, Send, Star, Edit, Mail, Bell, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Settings, Wand2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useConversations } from '@/hooks/useConversations';
import { ChatWindow } from '../chat/ChatWindow';
import { AutomatedResponsesSettings } from '../guide/AutomatedResponsesSettings';
import { EmailTemplateEditorDialog } from './EmailTemplateEditorDialog';
import { useEmailTemplates, type EmailTemplate } from '@/hooks/useEmailTemplates';
import type { Conversation as ChatConversation, Review, ReviewStats, NotificationPreference } from '@/types';
import type { Conversation } from '@/types/chat';
import { LoadingSpinner, ConversationsSkeleton, StatsCardsSkeleton, ListSkeleton } from './LoadingStates';
import ReviewsTab from './reviews/ReviewsTab';
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
  const { user } = useAuth();
  const { profile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    templates: emailTemplates, 
    createTemplate, 
    updateTemplate, 
    toggleTemplate,
    deleteTemplate 
  } = useEmailTemplates(user?.id);
  const isAdmin = profile?.role === 'admin';
  const isGuide = profile?.role === 'guide';
  const {
    conversations,
    loading: conversationsLoading,
    optimisticallyMarkConversationAsRead
  } = useConversations(user?.id, isAdmin);

  // Calculate unread count
  const unreadCount = conversations.filter(c => c.unread_count && c.unread_count > 0).length;

  // Extract bookingId from URL params for review auto-opening
  const bookingId = searchParams.get('bookingId') || undefined;

  // Auto-select tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['messages', 'reviews', 'automated', 'notifications'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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
        <TabsContent value="messages">
          {conversationsLoading ? <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
            </div> : conversations.length === 0 ? <Card>
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  No conversations yet
                </h3>
                <p className="text-sm text-charcoal/60">
                  Messages from your guests will appear here
                </p>
              </CardContent>
            </Card> : <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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
                              {conv.unread_count && conv.unread_count > 0 && <Badge className="bg-burgundy text-white text-xs px-2 py-0.5">
                                  {conv.unread_count} new
                                </Badge>}
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
            </div>}
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setEditingEmailTemplate(null)
                    setEmailTemplateDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Email Template
                </Button>
                
                {emailTemplates.length === 0 && (
                  <Button 
                    variant="default"
                    className="flex-1"
                    onClick={async () => {
                      if (!user?.id) return;
                      
                      const defaultTemplates: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
                        {
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
                        },
                        {
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
                        },
                        {
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
                        }
                      ];
                      
                      for (const template of defaultTemplates) {
                        await createTemplate.mutateAsync(template);
                      }
                    }}
                    disabled={createTemplate.isPending}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {createTemplate.isPending ? 'Adding...' : 'Add Default Templates'}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {emailTemplates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="mb-2">No email templates yet</p>
                    <p className="text-sm">
                      Create custom templates or add our pre-made ones to get started
                    </p>
                  </div>
                ) : (
                  emailTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{template.name}</h4>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => 
                            toggleTemplate.mutate({ id: template.id, isActive: checked })
                          }
                        />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {template.description || template.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {template.trigger_type.replace('_', ' ')}
                        </Badge>
                        {template.timing_value > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {template.timing_value} {template.timing_unit} {template.timing_direction}
                          </Badge>
                        )}
                        {!template.is_active && (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingEmailTemplate(template)
                          setEmailTemplateDialogOpen(true)
                        }}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTemplate.mutate(template.id)}
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

          {/* Automated Responses Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recurring (Group) Messages</CardTitle>
              <CardDescription>Set up recurring messages to your guest for (group) chat</CardDescription>
            </CardHeader>
            <CardContent>
              <AutomatedResponsesSettings />
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
        open={emailTemplateDialogOpen}
        onOpenChange={setEmailTemplateDialogOpen}
        onSave={(templateData) => {
          if (templateData.id) {
            updateTemplate.mutate({ 
              id: templateData.id, 
              updates: templateData 
            })
          } else {
            createTemplate.mutate({
              ...templateData,
              guide_id: user!.id
            } as any)
          }
        }}
      />
    </div>;
}