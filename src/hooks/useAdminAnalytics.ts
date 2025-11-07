import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get users from last month for comparison
      const { count: lastMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', currentMonthStart.toISOString());

      // Get total tours count
      const { count: totalTours } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get tours from last month for comparison
      const { count: lastMonthTours } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('created_at', currentMonthStart.toISOString());

      // Get revenue for current month
      const { data: currentRevenue } = await supabase
        .from('bookings')
        .select('total_price, currency')
        .in('status', ['confirmed', 'completed'])
        .gte('created_at', currentMonthStart.toISOString());

      // Get revenue for last month
      const { data: lastRevenue } = await supabase
        .from('bookings')
        .select('total_price, currency')
        .in('status', ['confirmed', 'completed'])
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString());

      // Calculate totals
      const currentMonthRevenue = currentRevenue?.reduce((sum, b) => sum + Number(b.total_price || 0), 0) || 0;
      const lastMonthRevenue = lastRevenue?.reduce((sum, b) => sum + Number(b.total_price || 0), 0) || 0;

      // Calculate growth percentages
      const userGrowth = lastMonthUsers ? Math.round(((totalUsers || 0) - lastMonthUsers) / lastMonthUsers * 100) : 0;
      const tourGrowth = lastMonthTours ? Math.round(((totalTours || 0) - lastMonthTours) / lastMonthTours * 100) : 0;
      const revenueGrowth = lastMonthRevenue ? Math.round((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;

      // Calculate average growth rate
      const avgGrowth = Math.round((userGrowth + tourGrowth + revenueGrowth) / 3);

      return {
        totalUsers: totalUsers || 0,
        userGrowth,
        totalTours: totalTours || 0,
        tourGrowth,
        currentMonthRevenue,
        revenueGrowth,
        avgGrowth,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
