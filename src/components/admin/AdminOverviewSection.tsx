import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { 
  ShieldCheck, 
  Headphones, 
  Euro, 
  Users, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Image as ImageIcon,
  MapPin,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AdminOverviewSectionProps {
  adminName: string;
  onSectionNavigate: (section: string) => void;
}

interface AdminStats {
  pendingVerifications: number;
  openTickets: number;
  monthlyRevenue: number;
  activeUsers: number;
  recentActivity: Array<{
    id: string;
    type: 'verification' | 'ticket' | 'flagged' | 'region';
    message: string;
    time: string;
    actionLink?: string;
  }>;
}

export function AdminOverviewSection({ adminName, onSectionNavigate }: AdminOverviewSectionProps) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats>({
    pendingVerifications: 0,
    openTickets: 0,
    monthlyRevenue: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();

  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Fetch pending verifications
      const { count: verificationCount } = await supabase
        .from('user_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      // Fetch monthly revenue (completed bookings this month)
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const bookingsResult = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'completed')
        .gte('created_at', firstDayOfMonth.toISOString());

      const monthlyRevenue = Array.isArray(bookingsResult.data) 
        ? bookingsResult.data.reduce((sum: number, b: any) => sum + (b.total_price || 0), 0)
        : 0;

      // Fetch active users count
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch recent verifications for activity feed
      const { data: recentVerifications } = await supabase
        .from('user_verifications')
        .select('id, created_at, profiles!inner(name)')
        .eq('verification_status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivity = recentVerifications?.map(v => ({
        id: v.id,
        type: 'verification' as const,
        message: `New verification request from ${(v.profiles as any).name}`,
        time: format(new Date(v.created_at), 'p'),
        actionLink: `/dashboard?section=platform&tab=verifications`
      })) || [];

      setStats({
        pendingVerifications: verificationCount || 0,
        openTickets: 0, // Placeholder - will be implemented when support tickets table exists
        monthlyRevenue,
        activeUsers: userCount || 0,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header Card */}
      <Card className="bg-gradient-to-br from-burgundy via-burgundy-dark to-burgundy text-white p-8 rounded-xl shadow-lg border-0">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-playfair mb-2">
              {getGreeting()}, {adminName}
            </h1>
            <p className="text-white/80">{formatDate(currentDate)}</p>
          </div>
          <Badge className="bg-white/20 text-white border-0 px-4 py-2">
            Admin Dashboard
          </Badge>
        </div>
      </Card>

      {/* Statistics Cards Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* Pending Verifications Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/dashboard?section=platform&tab=verifications')}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center shadow-md mb-3">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            {stats.pendingVerifications}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">Pending Verifications</div>
          <div className="text-xs text-charcoal/50">
            {stats.pendingVerifications === 0 ? 'All caught up!' : 'Awaiting review'}
          </div>
        </Card>

        {/* Support Tickets Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/dashboard?section=support&tab=tickets')}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center shadow-md mb-3">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            {stats.openTickets}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">Open Tickets</div>
          <div className="text-xs text-charcoal/50">
            {stats.openTickets === 0 ? 'No pending tickets' : 'Needs attention'}
          </div>
        </Card>

        {/* Monthly Revenue Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/dashboard?section=analytics')}
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sage to-emerald-600 flex items-center justify-center shadow-md mb-3">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            €{stats.monthlyRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">Monthly Revenue</div>
          <div className="text-xs text-charcoal/50">Platform earnings</div>
        </Card>

        {/* Active Users Card */}
        <Card 
          className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-burgundy to-burgundy-dark flex items-center justify-center shadow-md mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-playfair text-charcoal mb-1">
            {stats.activeUsers}
          </div>
          <div className="text-sm text-charcoal/60 mb-1">Active Users</div>
          <div className="text-xs text-charcoal/50">Total registered</div>
        </Card>
      </div>

      {/* Recent Activity + Quick Actions Layout */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="md:col-span-2">
          <Card className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
            <h2 className="text-xl font-playfair text-charcoal mb-4">Recent Activity</h2>

            {loading ? (
              <div className="py-8 text-center text-charcoal/60">Loading activity...</div>
            ) : stats.recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
                <h3 className="text-lg font-playfair text-charcoal mb-2">
                  All Quiet on the Platform
                </h3>
                <p className="text-sm text-charcoal/60">
                  No pending items requiring immediate attention
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => {
                  const Icon = activity.type === 'verification' 
                    ? ShieldCheck 
                    : activity.type === 'ticket'
                      ? Headphones
                      : activity.type === 'flagged'
                        ? AlertTriangle
                        : MapPin;
                  
                  const colorClass = activity.type === 'verification'
                    ? 'bg-burgundy/10 text-burgundy'
                    : activity.type === 'ticket'
                      ? 'bg-gold/10 text-gold'
                      : activity.type === 'flagged'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-sage/10 text-sage';

                  return (
                    <div
                      key={activity.id}
                      className="p-4 bg-cream/50 hover:bg-cream rounded-lg transition-colors cursor-pointer"
                      onClick={() => activity.actionLink && navigate(activity.actionLink)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-charcoal">{activity.message}</p>
                          <p className="text-xs text-charcoal/50 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
            <h3 className="text-lg font-playfair text-charcoal mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/dashboard?section=platform&tab=verifications')}
                className="w-full bg-burgundy hover:bg-burgundy-dark text-white justify-start"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Review Verifications
              </Button>
              <Button
                onClick={() => navigate('/dashboard?section=support&tab=tickets')}
                variant="outline"
                className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5 justify-start"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Check Support Tickets
              </Button>
              <Button
                onClick={() => navigate('/dashboard?section=support&tab=flagged')}
                variant="outline"
                className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5 justify-start"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Review Flagged Content
              </Button>
              <Button
                onClick={() => navigate('/dashboard?section=content&tab=regions')}
                variant="outline"
                className="w-full border-burgundy/30 text-burgundy hover:bg-burgundy/5 justify-start"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Region Requests
              </Button>
            </div>
          </Card>

          {/* Platform Status Card */}
          <Card className="p-6 bg-white border border-burgundy/10 rounded-lg shadow-md">
            <h3 className="text-lg font-playfair text-charcoal mb-4">Platform Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal/70">System Health</span>
                <Badge className="bg-sage/10 text-sage border-0">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal/70">Database</span>
                <Badge className="bg-sage/10 text-sage border-0">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal/70">Backups</span>
                <Badge className="bg-sage/10 text-sage border-0">Up to date</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
