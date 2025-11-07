import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { TrendingUp, Users, Euro, Mountain, Loader2 } from 'lucide-react';
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics';

export function AdminAnalyticsSection() {
  const { data: analytics, isLoading } = useAdminAnalytics();

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-playfair text-charcoal mb-2">Platform Analytics</h1>
        <p className="text-charcoal/60">View platform-wide performance metrics and trends</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-burgundy" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-burgundy/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-charcoal font-playfair">
                <Users className="w-5 h-5 text-burgundy" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-playfair text-charcoal">{analytics?.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-charcoal/60 mt-1">{formatGrowth(analytics?.userGrowth || 0)} from last month</p>
            </CardContent>
          </Card>

          <Card className="border-burgundy/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-charcoal font-playfair">
                <Mountain className="w-5 h-5 text-burgundy" />
                Total Tours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-playfair text-charcoal">{analytics?.totalTours.toLocaleString()}</p>
              <p className="text-sm text-charcoal/60 mt-1">{formatGrowth(analytics?.tourGrowth || 0)} from last month</p>
            </CardContent>
          </Card>

          <Card className="border-burgundy/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-charcoal font-playfair">
                <Euro className="w-5 h-5 text-burgundy" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-playfair text-charcoal">€{analytics?.currentMonthRevenue.toLocaleString()}</p>
              <p className="text-sm text-charcoal/60 mt-1">This month</p>
            </CardContent>
          </Card>

          <Card className="border-burgundy/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-charcoal font-playfair">
                <TrendingUp className="w-5 h-5 text-burgundy" />
                Growth Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-playfair text-charcoal">{formatGrowth(analytics?.avgGrowth || 0)}</p>
              <p className="text-sm text-charcoal/60 mt-1">Monthly average</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-burgundy/10">
        <CardHeader>
          <CardTitle className="text-charcoal font-playfair">Analytics Dashboard</CardTitle>
          <CardDescription className="text-charcoal/60">
            Detailed analytics and reporting coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <TrendingUp className="w-16 h-16 text-burgundy/20 mx-auto mb-4" />
            <h3 className="text-lg font-playfair text-charcoal mb-2">
              Advanced Analytics
            </h3>
            <p className="text-sm text-charcoal/60 max-w-md mx-auto">
              Comprehensive analytics dashboard with charts, graphs, and detailed metrics will be available here. 
              Track user engagement, booking trends, revenue patterns, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
