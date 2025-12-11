export type DashboardSection = 'today' | 'my-trips' | 'tours' | 'bookings' | 'money' | 'reviews' | 'inbox' | 'overview' | 'support' | 'content' | 'platform' | 'analytics' | 'referrals';
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
  type: 'booking' | 'review' | 'message' | 'payment' | 'custom_request' | 'document' | 'review_pending';
  message: string;
  time: string;
  isRead: boolean;
  actionLink?: string;
  requiresAction: boolean;
  actionType?: 'approve_booking' | 'respond_request' | 'write_review' | 'upload_document' | 'view_only';
  relatedEntityId?: string;
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
