export interface GuideCertification {
  // Certification type
  certificationType: 'standard' | 'custom';
  certificationId?: string; // ID from preloaded list (for standard)
  
  // Core fields
  title: string; // Certification Name
  certifyingBody: string; // Certifying Organization
  certificateNumber?: string; // Certificate ID/Number (required for Priority 1 & 2)
  description?: string; // Optional description
  
  // Dates
  expiryDate?: string; // ISO date string (required)
  addedDate?: string; // ISO date string
  verifiedDate?: string; // ISO date string
  
  // Document
  certificateDocument?: File | string; // File upload or URL after upload
  
  // Verification
  verificationPriority?: 1 | 2 | 3 | 4;
  verificationDocuments?: string[]; // Admin-only file references
  
  // Display
  badgeColor?: string; // Hex color for badge
  isPrimary?: boolean; // Primary certification to display prominently
  icon?: string; // Optional icon
}

export interface GuideProfile {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  profile_image_url?: string;
  hero_background_url?: string;
  bio?: string;
  location?: string;
  active_since?: string;
  experience_years?: number;
  verified: boolean;
  certifications: GuideCertification[];
  specialties: string[];
  guiding_areas: string[];
  terrain_capabilities: string[];
  difficulty_levels: string[];
  seasonal_availability?: string;
  upcoming_availability_start?: string;
  upcoming_availability_end?: string;
  daily_rate?: number;
  daily_rate_currency: 'EUR' | 'GBP';
  contact_email?: string;
  phone?: string;
  instagram_url?: string;
  facebook_url?: string;
  website_url?: string;
  intro_video_url?: string;
  intro_video_thumbnail_url?: string;
  max_group_size?: number;
  min_group_size: number;
  languages_spoken: string[];
  profile_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface GuideSignupData {
  // Step 2: Basic Info
  display_name: string;
  slug?: string;
  email: string;
  password: string;
  profile_image?: File;
  experience_years: number;
  
  // Step 3: Location
  location: string;
  location_lat?: number;
  location_lng?: number;
  location_formatted?: string;
  
  // Step 4: Specialties
  specialties: string[];
  
  // Step 5: Difficulty Levels
  difficulty_levels: string[];
  
  // Step 6: Certifications
  certifications: GuideCertification[];
  
  // Step 7: Group Preferences
  min_group_size: number;
  max_group_size: number;
  
  // Step 8: Day Rates
  daily_rate: number;
  daily_rate_currency: 'EUR' | 'GBP';
  
  // Step 9: Availability
  seasonal_availability: string;
  upcoming_availability_start?: string;
  upcoming_availability_end?: string;
  
  // Step 10: Guiding Areas
  guiding_areas: string[];
  
  // Step 11: Terrain Capabilities
  terrain_capabilities: string[];
  
  // Step 12: Bio
  bio: string;
  
  // Step 14: Languages
  languages_spoken: string[];
  
  // Step 15: Terms
  terms_accepted: boolean;
}

export interface GuideStats {
  tours_completed: number;
  average_rating: number;
  total_hikers: number;
  review_count: number;
}
