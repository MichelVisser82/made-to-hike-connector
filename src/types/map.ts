import { Coordinate } from '@/utils/routeAnalysis';

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

export const HIGHLIGHT_CATEGORY_ICONS: Record<HighlightCategory, string> = {
  scenic_viewpoint: '👁️',
  historical_site: '🏛️',
  wildlife_spot: '🦅',
  photo_opportunity: '📸',
  rest_area: '☕',
  water_source: '💧',
  local_secret: '🎁'
};
