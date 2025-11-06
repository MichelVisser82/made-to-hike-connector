import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  MessageSquare,
  Phone,
  Send,
  Star,
  Edit,
  Mail,
  Bell,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useConversations } from '@/hooks/useConversations';
import { ChatWindow } from '../chat/ChatWindow';
import { AutomatedResponsesSettings } from '../guide/AutomatedResponsesSettings';
import type {
  Conversation as ChatConversation,
  Review,
  ReviewStats,
  MessageTemplate,
  NotificationPreference,
} from '@/types';
import type { Conversation } from '@/types/chat';
import { LoadingSpinner, ConversationsSkeleton, StatsCardsSkeleton, ListSkeleton } from './LoadingStates';
import ReviewsTab from './reviews/ReviewsTab';

interface InboxSectionProps {
  reviews: Review[];
  reviewStats: ReviewStats;
  templates: MessageTemplate[];
  notificationPreferences: NotificationPreference[];
  loading: boolean;
  onReplyToReview: (reviewId: string) => void;
  onToggleTemplate: (templateId: string, enabled: boolean) => void;
  onEditTemplate: (templateId: string) => void;
  onUpdateNotificationPreference: (
    preferenceId: string,
    channel: 'email' | 'sms' | 'push',
    enabled: boolean
  ) => void;
}

export function InboxSection({
  reviews,
  reviewStats,
  templates,
  notificationPreferences,
  loading,
  onReplyToReview,
  onToggleTemplate,
  onEditTemplate,
  onUpdateNotificationPreference,
}: InboxSectionProps) {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const { user } = useAuth();
  const { profile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const isAdmin = profile?.role === 'admin';
  const isGuide = profile?.role === 'guide';
  const { conversations, loading: conversationsLoading, optimisticallyMarkConversationAsRead } = useConversations(user?.id, isAdmin);
  
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
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-${size === 20 ? '5' : '4'} h-${size === 20 ? '5' : '4'} ${
              i < rating
                ? 'fill-gold text-gold'
                : 'fill-none text-charcoal/20'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
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
          <TabsTrigger
            value="messages"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Messages ({unreadCount})
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Reviews
          </TabsTrigger>
          <TabsTrigger
            value="automated"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Automated Messages
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-burgundy data-[state=active]:text-white"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* MESSAGES TAB */}
        <TabsContent value="messages">
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
            </div>
          ) : conversations.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  No conversations yet
                </h3>
                <p className="text-sm text-charcoal/60">
                  Messages from your guests will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Conversations List */}
              <Card className="p-4 h-[600px] overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-charcoal">Conversations</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-burgundy text-white px-2 py-1 rounded text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <ScrollArea className="flex-1">
                  <div className="space-y-2 pr-4">
                    {conversations.map((conv) => {
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
                      const subtitle = conv.conversation_type === 'admin_support' && conv.ticket?.ticket_number
                        ? `Ticket #${conv.ticket.ticket_number}`
                        : conv.tours?.title || 'General inquiry';
                      
                      return (
                        <div
                          key={conv.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            optimisticallyMarkConversationAsRead(conv.id);
                            setSelectedConversation(conv);
                            // Update URL to reflect selected conversation
                            setSearchParams({ section: 'inbox', conversation: conv.id });
                          }}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation?.id === conv.id
                              ? 'bg-burgundy/10 border-l-2 border-l-burgundy'
                              : 'hover:bg-cream/50'
                          } ${
                            conv.unread_count && conv.unread_count > 0
                              ? 'bg-burgundy/5'
                              : ''
                          }`}
                        >
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
                              {conv.unread_count && conv.unread_count > 0 && (
                                <Badge className="bg-burgundy text-white text-xs px-2 py-0.5">
                                  {conv.unread_count} new
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </Card>

              {/* Active Conversation */}
              <Card className="md:col-span-2 h-[600px]">
                {selectedConversation ? (
                  <ChatWindow
                    conversation={selectedConversation}
                    onClose={() => setSelectedConversation(null)}
                  />
                ) : (
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                      <p className="text-charcoal/60">
                        Select a conversation to view messages
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews">
          <ReviewsTab 
            isGuide={isGuide || false} 
            openBookingId={bookingId}
            onClearBookingId={() => {
              const newParams = new URLSearchParams(searchParams);
              newParams.delete('bookingId');
              setSearchParams(newParams);
            }}
          />
        </TabsContent>

        {/* AUTOMATED MESSAGES TAB */}
        <TabsContent value="automated" className="space-y-6">
          <AutomatedResponsesSettings />
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-xl font-playfair text-charcoal mb-6">
              Notification Preferences
            </h2>
            {loading ? (
              <ListSkeleton items={4} />
            ) : (
              <div className="space-y-6">
                {notificationPreferences.map((pref) => (
                  <div key={pref.id} className="pb-6 border-b border-burgundy/5 last:border-0">
                    <h3 className="font-medium text-charcoal mb-1">{pref.title}</h3>
                    <p className="text-sm text-charcoal/60 mb-3">{pref.description}</p>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-charcoal/60" />
                        <span className="text-sm text-charcoal mr-2">Email</span>
                        <Switch
                          checked={pref.email}
                          onCheckedChange={(checked) =>
                            onUpdateNotificationPreference(pref.id, 'email', checked)
                          }
                          className="data-[state=checked]:bg-burgundy"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-charcoal/60" />
                        <span className="text-sm text-charcoal mr-2">SMS</span>
                        <Switch
                          checked={pref.sms}
                          onCheckedChange={(checked) =>
                            onUpdateNotificationPreference(pref.id, 'sms', checked)
                          }
                          className="data-[state=checked]:bg-burgundy"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-charcoal/60" />
                        <span className="text-sm text-charcoal mr-2">Push</span>
                        <Switch
                          checked={pref.push}
                          onCheckedChange={(checked) =>
                            onUpdateNotificationPreference(pref.id, 'push', checked)
                          }
                          className="data-[state=checked]:bg-burgundy"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
