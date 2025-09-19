export type Page = 'landing' | 'search' | 'tour-detail' | 'user-dashboard' | 'guide-dashboard' | 'admin-dashboard' | 'verification' | 'booking' | 'settings' | 'wireframe' | 'about' | 'guides' | 'safety' | 'careers' | 'press' | 'blog' | 'privacy' | 'terms' | 'cookies' | 'contact';

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
  guide_name: string;
  guide_avatar: string;
  region: 'dolomites' | 'pyrenees' | 'scotland';
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  duration: string;
  group_size: number;
  price: number;
  currency: 'EUR' | 'GBP';
  description: string;
  highlights: string[];
  includes: string[];
  meeting_point: string;
  images: string[];
  available_dates: string[];
  rating: number;
  reviews_count: number;
  created_at: string;
}

export interface SearchFilters {
  region: string;
  difficulty: string;
  dateRange: string;
  maxPrice: string;
}