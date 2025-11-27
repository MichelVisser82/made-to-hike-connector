import { Coordinate } from '@/utils/routeAnalysis';
import { LucideIcon, Mountain, Landmark, Bird, Camera, Coffee, Droplet, Gift } from 'lucide-react';

export type RouteDisplayMode = 'region_overview' | 'waypoints_only' | 'none';

export type HighlightCategory = 
  | 'scenic_viewpoint'
  | 'historical_site'
  | 'wildlife_spot'
  | 'photo_opportunity'
  | 'rest_area'
  | 'water_source'
  | 'local_secret';

export interface TourMapSettings {
  id?: string;
  tourId: string;
  showMeetingPoint: boolean;
  routeDisplayMode: RouteDisplayMode;
  regionCenterLat?: number;
  regionCenterLng?: number;
  regionRadiusKm?: number;
  featuredHighlightIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TourDayRoute {
  id?: string;
  tourId: string;
  dayNumber: number;
  routeCoordinates: Coordinate[];
  distanceKm?: number;
  elevationGainM?: number;
  elevationLossM?: number;
  estimatedDurationHours?: number;
  elevationProfile?: { distance: number; elevation: number }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TourHighlight {
  id?: string;
  tourId: string;
  dayNumber?: number;
  name: string;
  description?: string;
  category: HighlightCategory;
  latitude: number;
  longitude: number;
  elevationM?: number;
  isPublic: boolean;
  guideNotes?: string;
  photos: string[];
  sequenceOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TourGPXFile {
  id?: string;
  tourId: string;
  originalFilename: string;
  storagePath: string;
  totalDistanceKm?: number;
  totalElevationGainM?: number;
  totalPoints?: number;
  uploadedAt?: string;
}

export interface GPXParseResult {
  trackpoints: Coordinate[];
  waypoints: Array<{
    name: string;
    description?: string;
    lat: number;
    lng: number;
    elevation?: number;
  }>;
  analysis: {
    totalDistance: number;
    elevationGain: number;
    elevationLoss: number;
    boundingBox: {
      center: { lat: number; lng: number };
      radius: number;
    };
  };
}

export const HIGHLIGHT_CATEGORY_LABELS: Record<HighlightCategory, string> = {
  scenic_viewpoint: 'Scenic Viewpoint',
  historical_site: 'Historical Site',
  wildlife_spot: 'Wildlife Spot',
  photo_opportunity: 'Photo Opportunity',
  rest_area: 'Rest Area',
  water_source: 'Water Source',
  local_secret: 'Local Secret'
};

// For React component usage
export const HIGHLIGHT_CATEGORY_LUCIDE_ICONS: Record<HighlightCategory, LucideIcon> = {
  scenic_viewpoint: Mountain,
  historical_site: Landmark,
  wildlife_spot: Bird,
  photo_opportunity: Camera,
  rest_area: Coffee,
  water_source: Droplet,
  local_secret: Gift
};

// For Leaflet marker HTML (inline SVG strings)
export const HIGHLIGHT_CATEGORY_SVG: Record<HighlightCategory, string> = {
  scenic_viewpoint: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>',
  historical_site: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>',
  wildlife_spot: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>',
  photo_opportunity: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
  rest_area: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>',
  water_source: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>',
  local_secret: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>'
};

// Deprecated emoji icons (kept for backwards compatibility)
export const HIGHLIGHT_CATEGORY_ICONS: Record<HighlightCategory, string> = {
  scenic_viewpoint: '👁️',
  historical_site: '🏛️',
  wildlife_spot: '🦅',
  photo_opportunity: '📸',
  rest_area: '☕',
  water_source: '💧',
  local_secret: '🎁'
};
