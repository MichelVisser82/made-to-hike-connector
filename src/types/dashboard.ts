export type DashboardSection = 'today' | 'my-trips' | 'tours' | 'bookings' | 'money' | 'reviews' | 'inbox' | 'overview' | 'support' | 'content' | 'platform' | 'analytics';
export type DashboardMode = 'guide' | 'admin' | 'hiker' | null;

export interface DashboardMetric {
  label: string;
  value: string | number;
  subtext: string;
  icon: string;
  gradientColors: string;
  onClick?: () => void;
}

export interface Notification {
  id: string;
  type: 'booking' | 'review' | 'message' | 'payment';
  message: string;
  time: string;
  isRead: boolean;
  actionLink?: string;
}

export interface TodayScheduleItem {
  id: string;
  time: string;
  title: string;
  status: 'confirmed' | 'pending' | 'completed';
  guestName: string;
  participantCount: number;
  location: string;
  tourId: string;
  tourSlug?: string;
}

export interface DashboardStats {
  todayTours: number;
  pendingBookings: number;
  weekEarnings: number;
  unreadMessages: number;
  nextTourTime?: string;
  urgentMessages?: number;
}

export interface WeatherData {
  condition: string;
  high: number;
  low: number;
  icon?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}
