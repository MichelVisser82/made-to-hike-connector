import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare, Calendar, MapPin } from 'lucide-react';
import { type User, type Tour } from '../../types';
import { MainLayout } from '../layout/MainLayout';
import type { DashboardSection } from '@/types/dashboard';
import type { Conversation } from '@/types/chat';
import { ConversationList } from '../chat/ConversationList';
import { ChatWindow } from '../chat/ChatWindow';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';

interface UserDashboardProps {
  user: User;
  onNavigateToSearch: () => void;
  onTourClick: (tour: Tour) => void;
}

export function UserDashboard({ user, onNavigateToSearch }: UserDashboardProps) {
  const [activeSection, setActiveSection] = useState<DashboardSection>('today');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const location = useLocation();
  
  // Fetch hiker's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoadingBookings(true);
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            tours!inner(id, title, region, meeting_point, guide_display_name, guide_avatar_url)
          `)
          .eq('hiker_id', user.id)
          .order('booking_date', { ascending: true });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [user.id]);
  
  // Show success message if redirected from booking success
  useEffect(() => {
    const state = location.state as { bookingSuccess?: boolean; bookingReference?: string };
    if (state?.bookingSuccess) {
      toast.success(
        `Booking confirmed! Reference: ${state.bookingReference}`,
        { duration: 5000 }
      );
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  
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
              {loadingBookings ? (
                <p className="text-muted-foreground">Loading bookings...</p>
              ) : bookings.length === 0 ? (
                <>
                  <p className="text-muted-foreground mb-4">No upcoming tours booked yet.</p>
                  <Button onClick={onNavigateToSearch}>
                    Find Your Next Adventure
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{booking.tours.title}</h3>
                        <Badge 
                          variant={
                            booking.status === 'confirmed' ? 'default' : 
                            booking.status === 'pending_confirmation' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {booking.status === 'pending_confirmation' ? 'Pending' : booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(booking.booking_date), 'PPP')}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.tours.region}
                        </div>
                        <p className="mt-2">
                          <span className="font-medium">Booking Reference:</span> {booking.booking_reference}
                        </p>
                      </div>
                    </div>
                  ))}
                  {bookings.length > 3 && (
                    <Button variant="outline" className="w-full">
                      View All Bookings ({bookings.length})
                    </Button>
                  )}
                </div>
              )}
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