import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Mountain, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Plus,
  Euro,
  Users2,
  MapPin,
  Eye,
  Cloud,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DashboardStats, TodayScheduleItem, WeatherData, Notification } from '@/types/dashboard';

interface TodaySectionProps {
  guideName: string;
  currentDate: Date;
  upcomingTours: TodayScheduleItem[];
  stats: DashboardStats;
  weather?: WeatherData;
  notifications: Notification[];
  onCreateTour: () => void;
  onManageAvailability: () => void;
  onViewEarnings: () => void;
  onSectionNavigate: (section: string) => void;
  stripeConnected?: boolean;
}

export function TodaySection({
  guideName,
  currentDate,
  upcomingTours,
  stats,
  weather,
  notifications,
  onCreateTour,
  onManageAvailability,
  onViewEarnings,
  onSectionNavigate,
  stripeConnected = false,
}: TodaySectionProps) {
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-sage text-white';
      case 'pending':
        return 'bg-gold text-white';
      case 'completed':
        return 'bg-charcoal/20 text-charcoal';
      default:
        return 'bg-burgundy/10 text-burgundy';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header Card */}
      <Card className="bg-gradient-to-br from-burgundy via-burgundy-dark to-burgundy text-white p-8 rounded-xl shadow-lg border-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-playfair mb-2">
              {getGreeting()}, {guideName}
            </h1>
            <p className="text-white/80">{formatDate(currentDate)}</p>
          </div>
          <Button
            onClick={onManageAvailability}
            variant="ghost"
            className="border border-white/30 text-white hover:bg-white hover:text-burgundy"
          >
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Today's Tours Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSectionNavigate('tours')}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center shadow-md mb-3">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            {stats.todayTours}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">Next 30 Days</div>
          <div className="text-xs text-charcoal/50">
            {stats.todayTours === 0 ? 'No tours scheduled' : `${stats.todayTours} upcoming ${stats.todayTours === 1 ? 'tour' : 'tours'}`}
          </div>
        </Card>

        {/* Pending Bookings Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSectionNavigate('bookings')}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-md mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            {stats.pendingBookings}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">Pending Bookings</div>
          <div className="text-xs text-charcoal/50">
            {stats.pendingBookings === 0 ? 'All caught up!' : 'Awaiting response'}
          </div>
        </Card>

        {/* Week Earnings Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={onViewEarnings}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sage to-emerald-600 flex items-center justify-center shadow-md mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            €{stats.weekEarnings.toLocaleString()}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">This Week</div>
          <div className="text-xs text-charcoal/50">+15% from last week</div>
        </Card>

        {/* Unread Messages Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onSectionNavigate('inbox')}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center shadow-md mb-3">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            {stats.unreadMessages}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">Unread Messages</div>
          <div className="text-xs text-charcoal/50">
            {stats.urgentMessages && stats.urgentMessages > 0 
              ? `${stats.urgentMessages} urgent` 
              : stats.unreadMessages === 0 
                ? 'No new messages' 
                : ''}
          </div>
        </Card>
      </div>

      {/* Today's Schedule + Sidebar Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Today's Schedule */}
        <div className="md:col-span-2">
          <Card className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-playfair text-charcoal">Upcoming Schedule (30 Days)</h2>
            <Button
              onClick={onManageAvailability}
              variant="ghost"
              size="sm"
              className="text-sm text-burgundy hover:bg-burgundy/5"
            >
              View Full Calendar
            </Button>
            </div>

            {upcomingTours.length === 0 ? (
              // Empty State
              <div className="py-12 text-center">
                <Calendar className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  No tours scheduled in the next 30 days
                </h3>
                <p className="text-sm text-charcoal/60 mb-6">
                  Your schedule is clear. Time to plan your next adventure!
                </p>
                <Button onClick={onCreateTour} className="bg-burgundy hover:bg-burgundy-dark text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Tour
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="p-4 bg-cream/50 hover:bg-cream rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-burgundy flex-shrink-0">
                        {tour.time}
                      </div>
                      <div className="w-px h-12 bg-burgundy/20" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-charcoal">{tour.title}</h4>
                          <Badge className={`${getStatusBadgeColor(tour.status)} text-xs px-2 py-1`}>
                            {tour.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-charcoal/70 mt-1">
                          <div className="flex items-center gap-1">
                            <Users2 className="w-4 h-4" />
                            <span>{tour.guestName} ({tour.participantCount} guests)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{tour.location}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Weather Alert */}
                {weather && (
                  <div className="bg-cream p-4 rounded-lg mt-4">
                    <div className="flex items-start gap-3">
                      <Cloud className="w-5 h-5 text-charcoal/60 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-charcoal mb-1">Weather Alert</h4>
                        <p className="text-sm text-charcoal/70">
                          {weather.condition} conditions. High: {weather.high}°C, Low: {weather.low}°C. 
                          Perfect hiking weather!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Quick Actions + Notifications */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
            <h3 className="text-lg font-playfair text-charcoal mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={onCreateTour}
                className="w-full bg-burgundy hover:bg-burgundy-dark text-white justify-start"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Tour
              </Button>
              <Button
                onClick={onManageAvailability}
                variant="outline"
                className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5 justify-start"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Manage Availability
              </Button>
              <Button
                onClick={onViewEarnings}
                variant="outline"
                className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5 justify-start"
              >
                <Euro className="w-4 h-4 mr-2" />
                View Earnings
              </Button>
            </div>
          </Card>

          {/* Notifications Card */}
          <Card className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
            <h3 className="text-lg font-playfair text-charcoal mb-4">Notifications</h3>
            <div className="space-y-3">
              {/* Stripe Connection Notification */}
              {!stripeConnected && (
                <div className="flex items-start gap-3 p-3 bg-gold/10 rounded-lg border border-gold/30">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gold/20 text-gold">
                    <Euro className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal font-medium">Connect Stripe to Receive Payments</p>
                    <p className="text-xs text-charcoal/70 mt-1">
                      Set up your payout account to start earning from bookings
                    </p>
                    <Button
                      onClick={() => navigate('/settings/payment')}
                      variant="link"
                      className="text-burgundy p-0 h-auto mt-1 text-xs"
                    >
                      Connect Now →
                    </Button>
                  </div>
                </div>
              )}

              {notifications.slice(0, stripeConnected ? 3 : 2).map((notification) => {
                const Icon = notification.type === 'booking' 
                  ? Users 
                  : notification.type === 'review' 
                    ? Star 
                    : MessageSquare;
                const colorClass = notification.type === 'booking'
                  ? 'bg-burgundy/10 text-burgundy'
                  : notification.type === 'review'
                    ? 'bg-gold/10 text-gold'
                    : 'bg-sage/10 text-sage';

                return (
                  <div key={notification.id} className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal">{notification.message}</p>
                      <p className="text-xs text-charcoal/50 mt-1">{notification.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
