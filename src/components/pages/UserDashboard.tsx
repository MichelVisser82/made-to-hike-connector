import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare } from 'lucide-react';
import { type User, type Tour } from '../../types';
import { MainLayout } from '../layout/MainLayout';
import type { DashboardSection } from '@/types/dashboard';
import type { Conversation } from '@/types/chat';
import { ConversationList } from '../chat/ConversationList';
import { ChatWindow } from '../chat/ChatWindow';
import { ScrollArea } from '../ui/scroll-area';

interface UserDashboardProps {
  user: User;
  onNavigateToSearch: () => void;
  onTourClick: (tour: Tour) => void;
}

export function UserDashboard({ user, onNavigateToSearch }: UserDashboardProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>('today');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  return (
    <MainLayout
      dashboardMode="hiker"
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      showVerificationBadge={false}
      isVerified={false}
    >
      <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {user.name}!</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">No upcoming tours booked yet.</p>
              <Button onClick={onNavigateToSearch}>
                Find Your Next Adventure
              </Button>
            </CardContent>
          </Card>

          {/* Messages Section - Full Width 2 Column Grid */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  My Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[500px]">
                  {/* Left: Conversations List */}
                  <div className="md:col-span-1 border-r pr-4 overflow-hidden flex flex-col">
                    <ScrollArea className="flex-1">
                      <ConversationList
                        userId={user.id}
                        selectedId={selectedConversation?.id}
                        onSelect={(conversation) => {
                          setSelectedConversation(conversation);
                        }}
                      />
                    </ScrollArea>
                  </div>
                  
                  {/* Right: Chat Window */}
                  <div className="md:col-span-2 h-full">
                    {selectedConversation ? (
                      <ChatWindow
                        conversation={selectedConversation}
                        onClose={() => setSelectedConversation(null)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Select a conversation to view messages</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}