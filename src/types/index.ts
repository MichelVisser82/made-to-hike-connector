export type Page = 'landing' | 'search' | 'tour-detail' | 'user-dashboard' | 'guide-dashboard' | 'admin-dashboard' | 'verification' | 'booking' | 'pending-booking' | 'about' | 'guides' | 'safety' | 'careers' | 'press' | 'blog' | 'privacy' | 'terms' | 'cookies' | 'contact' | 'tour-creation' | 'guide-profile' | 'guide-profile-edit' | 'certifications';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'hiker' | 'guide' | 'admin';
  verified: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected' | 'not_requested';
  verification_documents?: string[];
  business_info?: {
    company_name?: string;
    license_number?: string;
    insurance_info?: string;
    experience_years?: number;
  };
}

export interface Tour {
  id: string;
  title: string;
  guide_id: string;
  guide_display_name?: string;
  guide_avatar_url?: string;
  region: 'dolomites' | 'pyrenees' | 'scotland';
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  duration: string;
  group_size: number;
  price: number;
  currency: 'EUR' | 'GBP';
  short_description: string;
  description: string;
  highlights: string[];
  includes: string[];
  meeting_point: string;
  hero_image?: string;
  images: string[];
  available_dates: string[];
  rating: number;
  reviews_count: number;
  created_at: string;
  is_active: boolean;
  archived?: boolean;
  pack_weight?: number;
  daily_hours?: string;
  terrain_types?: string[];
  itinerary?: any;
  excluded_items?: string[];
  service_fee?: number;
  distance_km?: number;
  elevation_gain_m?: number;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface SearchFilters {
  region: string;
  difficulty: string;
  dateRange: string;
  maxPrice: string;
}

export interface Booking {
  id: string;
  tour_id: string;
  hiker_id: string;
  booking_date: string;
  participants: number;
  total_price: number;
  currency: 'EUR' | 'GBP';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingWithDetails extends Booking {
  tour?: {
    title: string;
    duration: string;
    region: string;
    meeting_point: string;
    guide_id: string;
  };
  guest?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
  };
  participants_details?: Array<{
    name: string;
    age: number;
    waiver_signed: boolean;
  }>;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Message {
  id: string;
  booking_id: string;
  sender: 'guide' | 'guest';
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  booking_id: string;
  tour_id: string;
  tour_title: string;
  guest_name: string;
  date: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  currency: 'EUR' | 'GBP';
  status: 'pending' | 'completed' | 'refunded';
  created_at: string;
}

export interface Balances {
  pending: number;
  available: number;
  lifetime: number;
  currency: 'EUR' | 'GBP';
}

export interface TopEarningTour {
  tour_id: string;
  tour_title: string;
  total_earnings: number;
  booking_count: number;
}

export interface Payout {
  id: string;
  amount: number;
  currency: 'EUR' | 'GBP';
  scheduled_date: string;
  status: 'scheduled' | 'processing' | 'completed';
  created_at: string;
}

export interface TaxDocument {
  id: string;
  name: string;
  type: 'PDF' | 'CSV';
  year: number;
  file_path: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  guest_id: string;
  guest_name: string;
  guest_avatar?: string;
  tour_id: string;
  tour_title: string;
  last_message: string;
  last_message_time: string;
  is_unread: boolean;
  messages: Message[];
}

export interface Review {
  id: string;
  guest_name: string;
  guest_avatar?: string;
  tour_title: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
}

export interface ReviewStats {
  overall: number;
  total: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  enabled: boolean;
}

export interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  email: boolean;
  sms: boolean;
  push: boolean;
}