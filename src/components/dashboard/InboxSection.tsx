import { useState } from 'react';
import { format } from 'date-fns';
import {
  MessageSquare,
  Phone,
  Send,
  Star,
  Edit,
  Mail,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import type {
  Conversation,
  Review,
  ReviewStats,
  MessageTemplate,
  NotificationPreference,
} from '@/types';
import { LoadingSpinner, ConversationsSkeleton, StatsCardsSkeleton, ListSkeleton } from './LoadingStates';

interface InboxSectionProps {
  conversations: Conversation[];
  reviews: Review[];
  reviewStats: ReviewStats;
  templates: MessageTemplate[];
  notificationPreferences: NotificationPreference[];
  unreadCount: number;
  loading: boolean;
  onSendMessage: (conversationId: string, message: string) => void;
  onCallGuest: (conversationId: string) => void;
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
  conversations,
  reviews,
  reviewStats,
  templates,
  notificationPreferences,
  unreadCount,
  loading,
  onSendMessage,
  onCallGuest,
  onReplyToReview,
  onToggleTemplate,
  onEditTemplate,
  onUpdateNotificationPreference,
}: InboxSectionProps) {
  const [activeTab, setActiveTab] = useState('messages');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedConversation) {
      onSendMessage(selectedConversation.id, messageInput);
      setMessageInput('');
    }
  };

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
          {loading ? (
            <ConversationsSkeleton />
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
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-charcoal">Conversations</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-burgundy text-white px-2 py-1 rounded text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conv.id
                          ? 'bg-burgundy/10'
                          : 'hover:bg-cream/50'
                      } ${
                        conv.is_unread
                          ? 'bg-burgundy/5 border-l-2 border-l-burgundy'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-burgundy text-white text-sm">
                            {conv.guest_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-charcoal text-sm">
                              {conv.guest_name}
                            </p>
                            <span className="text-xs text-charcoal/50">
                              {format(new Date(conv.last_message_time), 'h:mm a')}
                            </span>
                          </div>
                          <p className="text-sm text-charcoal/70 truncate mb-1">
                            {conv.last_message}
                          </p>
                          {conv.is_unread && (
                            <Badge className="bg-burgundy text-white text-xs px-2 py-0.5">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Active Conversation */}
              <Card className="md:col-span-2 flex flex-col h-[600px]">
                {selectedConversation ? (
                  <>
                    {/* Header */}
                    <div className="p-4 border-b flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-burgundy text-white">
                            {selectedConversation.guest_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-charcoal">
                            {selectedConversation.guest_name}
                          </p>
                          <p className="text-sm text-charcoal/60">
                            {selectedConversation.tour_title}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCallGuest(selectedConversation.id)}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {selectedConversation.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              msg.sender === 'guide' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                msg.sender === 'guide'
                                  ? 'bg-burgundy text-white'
                                  : 'bg-cream text-charcoal'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  msg.sender === 'guide'
                                    ? 'text-white/70'
                                    : 'text-charcoal/50'
                                }`}
                              >
                                {format(new Date(msg.timestamp), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t flex gap-2">
                      <Input
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="bg-burgundy hover:bg-burgundy-dark text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <CardContent className="flex-1 flex items-center justify-center">
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
          {loading ? (
            <>
              <StatsCardsSkeleton />
              <ListSkeleton />
            </>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                {/* Overall Rating Card */}
                <Card className="bg-gradient-to-br from-burgundy to-burgundy-dark text-white shadow-lg">
                  <CardContent className="p-6">
                    <p className="text-sm text-white/80 mb-1">Overall Rating</p>
                    <p className="text-4xl font-playfair mb-2">
                      {reviewStats.overall.toFixed(1)}
                    </p>
                    {renderStarRating(5, 20)}
                    <p className="text-sm text-white/70 mt-2">
                      From {reviewStats.total} reviews
                    </p>
                  </CardContent>
                </Card>

                {/* 5 Stars */}
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-charcoal/60 mb-2">5 Stars</p>
                    <p className="text-2xl font-playfair text-charcoal mb-3">
                      {reviewStats.breakdown[5]}
                    </p>
                    <div className="bg-cream h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sage h-full transition-all duration-500"
                        style={{
                          width: `${(reviewStats.breakdown[5] / reviewStats.total) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 4 Stars */}
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-charcoal/60 mb-2">4 Stars</p>
                    <p className="text-2xl font-playfair text-charcoal mb-3">
                      {reviewStats.breakdown[4]}
                    </p>
                    <div className="bg-cream h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gold h-full transition-all duration-500"
                        style={{
                          width: `${(reviewStats.breakdown[4] / reviewStats.total) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 3 or Less */}
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-charcoal/60 mb-2">3★ or less</p>
                    <p className="text-2xl font-playfair text-charcoal mb-3">
                      {reviewStats.breakdown[3] + reviewStats.breakdown[2] + reviewStats.breakdown[1]}
                    </p>
                    <div className="bg-cream h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-charcoal h-full transition-all duration-500"
                        style={{
                          width: `${((reviewStats.breakdown[3] + reviewStats.breakdown[2] + reviewStats.breakdown[1]) / reviewStats.total) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <Card className="p-6">
                <h2 className="text-xl font-playfair text-charcoal mb-6">
                  Recent Reviews
                </h2>
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                    <h3 className="text-lg font-playfair text-charcoal mb-2">
                      No reviews yet
                    </h3>
                    <div className="text-sm text-charcoal/60 space-y-1">
                      <p>• Respond quickly to booking requests</p>
                      <p>• Provide excellent service</p>
                      <p>• Encourage guests to leave reviews</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-burgundy/5">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-6 first:pt-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-charcoal">
                            {review.guest_name}
                          </p>
                          {renderStarRating(review.rating)}
                        </div>
                        <p className="text-xs text-charcoal/60 mb-2">
                          {review.tour_title} • {format(new Date(review.date), 'MMMM yyyy')}
                        </p>
                        <p className="text-sm text-charcoal/70 leading-relaxed mb-3">
                          {review.comment}
                        </p>
                        {review.reply ? (
                          <div className="bg-cream/50 p-3 rounded-lg">
                            <p className="text-xs text-charcoal/60 mb-1">Your reply:</p>
                            <p className="text-sm text-charcoal">{review.reply}</p>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReplyToReview(review.id)}
                            className="border-burgundy/30"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </TabsContent>

        {/* AUTOMATED MESSAGES TAB */}
        <TabsContent value="automated" className="space-y-6">
          {loading ? (
            <ListSkeleton items={2} />
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-charcoal">{template.name}</h3>
                  <Switch
                    checked={template.enabled}
                    onCheckedChange={(checked) => onToggleTemplate(template.id, checked)}
                    className="data-[state=checked]:bg-burgundy"
                  />
                </div>
                <p className="text-sm text-charcoal/60 mb-4">
                  {template.description}
                </p>
                <div className="bg-cream/50 border border-burgundy/10 p-4 rounded-lg mb-4">
                  <p className="text-sm text-charcoal whitespace-pre-line">
                    {template.content}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => onEditTemplate(template.id)}
                  className="border-burgundy/30"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Template
                </Button>
              </Card>
            ))
          )}
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
