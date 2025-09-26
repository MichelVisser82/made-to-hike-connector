// Image recommendation system for intelligent image selection

export interface ImageRecommendation {
  category: string;
  usageContext: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export const imageRecommendations = {
  // Landing page recommendations
  heroSection: {
    category: 'hero',
    usageContext: 'landing',
    tags: ['mountain', 'landscape', 'adventure', 'hiking'],
    priority: 'high' as const,
    description: 'Epic mountain landscapes for hero sections'
  },
  
  featuresSection: {
    category: 'hiking',
    usageContext: 'landing',
    tags: ['group', 'trail', 'equipment', 'guide'],
    priority: 'medium' as const,
    description: 'Hiking activities and group adventures'
  },

  testimonialsBackground: {
    category: 'landscape',
    usageContext: 'landing',
    tags: ['sunset', 'peaceful', 'nature'],
    priority: 'medium' as const,
    description: 'Serene backgrounds for testimonials'
  },

  // Tour pages recommendations
  tourHero: {
    category: 'adventure',
    usageContext: 'tours',
    tags: ['action', 'hiking', 'mountain'],
    priority: 'high' as const,
    description: 'Dynamic adventure shots for tour pages'
  },

  tourGallery: {
    category: 'landscape',
    usageContext: 'tours',
    tags: ['trail', 'view', 'destination'],
    priority: 'medium' as const,
    description: 'Beautiful trail and destination photos'
  },

  // About page recommendations
  aboutTeam: {
    category: 'portrait',
    usageContext: 'about',
    tags: ['guide', 'professional', 'outdoor'],
    priority: 'medium' as const,
    description: 'Professional guide portraits'
  },

  aboutStory: {
    category: 'hiking',
    usageContext: 'about',
    tags: ['journey', 'experience', 'nature'],
    priority: 'medium' as const,
    description: 'Story-telling hiking images'
  },

  // Contact page recommendations
  contactBackground: {
    category: 'nature',
    usageContext: 'contact',
    tags: ['peaceful', 'accessible', 'welcoming'],
    priority: 'low' as const,
    description: 'Welcoming nature scenes'
  },

  // Search/Browse recommendations
  searchFilters: {
    category: 'detail',
    usageContext: 'search',
    tags: ['equipment', 'trail', 'map'],
    priority: 'low' as const,
    description: 'Detail shots for search interface'
  },

  // Booking recommendations
  bookingConfirmation: {
    category: 'adventure',
    usageContext: 'booking',
    tags: ['success', 'celebration', 'achievement'],
    priority: 'medium' as const,
    description: 'Celebratory adventure moments'
  }
};

// Categories for easy reference
export const imageCategories = [
  'hero',
  'landscape', 
  'hiking',
  'portrait',
  'detail',
  'equipment',
  'nature',
  'mountains',
  'trails',
  'adventure'
] as const;

// Usage contexts for organization
export const usageContexts = [
  'landing',
  'tours', 
  'about',
  'contact',
  'search',
  'booking',
  'testimonials',
  'gallery',
  'background'
] as const;

// Common hiking/adventure tags for suggestions
export const popularTags = [
  'mountain',
  'landscape', 
  'adventure',
  'hiking',
  'trail',
  'nature',
  'sunset',
  'sunrise',
  'group',
  'guide',
  'equipment',
  'backpack',
  'summit',
  'view',
  'forest',
  'peak',
  'outdoor',
  'journey',
  'experience',
  'professional',
  'action',
  'peaceful',
  'destination',
  'celebration',
  'achievement'
] as const;