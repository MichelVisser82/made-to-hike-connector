import * as turf from '@turf/turf';

export interface Coordinate {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface RouteAnalysis {
  totalDistance: number; // km
  elevationGain: number; // meters
  elevationLoss: number; // meters
  boundingBox: {
    center: { lat: number; lng: number };
    radius: number; // km
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface SplitSuggestion {
  splitIndex: number;
  coordinates: Coordinate;
  reason: string;
  distance: number;
  elevation: number;
}

export interface ProfileData {
  distance: number; // cumulative km
  elevation: number; // meters
}

/**
 * Analyze a route to calculate distance, elevation gain/loss, and bounding box
 */
export function analyzeRoute(trackpoints: Coordinate[]): RouteAnalysis {
  if (trackpoints.length < 2) {
    throw new Error('Route must have at least 2 points');
  }

  let totalDistance = 0;
  let elevationGain = 0;
  let elevationLoss = 0;

  // Calculate distance and elevation
  for (let i = 1; i < trackpoints.length; i++) {
    const from = turf.point([trackpoints[i - 1].lng, trackpoints[i - 1].lat]);
    const to = turf.point([trackpoints[i].lng, trackpoints[i].lat]);
    totalDistance += turf.distance(from, to, { units: 'kilometers' });

    if (trackpoints[i].elevation !== undefined && trackpoints[i - 1].elevation !== undefined) {
      const diff = trackpoints[i].elevation! - trackpoints[i - 1].elevation!;
      if (diff > 0) {
        elevationGain += diff;
      } else {
        elevationLoss += Math.abs(diff);
      }
    }
  }

  // Calculate bounding box
  const lngs = trackpoints.map(p => p.lng);
  const lats = trackpoints.map(p => p.lat);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);

  const center = {
    lat: (north + south) / 2,
    lng: (east + west) / 2
  };

  // Calculate radius (approximate)
  const centerPoint = turf.point([center.lng, center.lat]);
  const northEast = turf.point([east, north]);
  const radius = turf.distance(centerPoint, northEast, { units: 'kilometers' });

  return {
    totalDistance: parseFloat(totalDistance.toFixed(2)),
    elevationGain: Math.round(elevationGain),
    elevationLoss: Math.round(elevationLoss),
    boundingBox: {
      center,
      radius: parseFloat(radius.toFixed(2)),
      north,
      south,
      east,
      west
    }
  };
}

/**
 * Suggest where to split a route into multiple days
 */
export function suggestDaySplits(
  trackpoints: Coordinate[],
  targetDays: number
): SplitSuggestion[] {
  if (targetDays <= 1 || trackpoints.length < targetDays * 2) {
    return [];
  }

  const analysis = analyzeRoute(trackpoints);
  const targetDistancePerDay = analysis.totalDistance / targetDays;

  const suggestions: SplitSuggestion[] = [];
  let accumulatedDistance = 0;
  let lastSplitIndex = 0;

  for (let i = 1; i < trackpoints.length; i++) {
    const from = turf.point([trackpoints[i - 1].lng, trackpoints[i - 1].lat]);
    const to = turf.point([trackpoints[i].lng, trackpoints[i].lat]);
    accumulatedDistance += turf.distance(from, to, { units: 'kilometers' });

    // When we've accumulated roughly the target distance for a day
    if (accumulatedDistance >= targetDistancePerDay * 0.9 && suggestions.length < targetDays - 1) {
      const dayPoints = trackpoints.slice(lastSplitIndex, i);
      const dayAnalysis = analyzeRoute(dayPoints);

      suggestions.push({
        splitIndex: i,
        coordinates: trackpoints[i],
        reason: `Day ${suggestions.length + 1} → Day ${suggestions.length + 2}`,
        distance: dayAnalysis.totalDistance,
        elevation: dayAnalysis.elevationGain
      });

      lastSplitIndex = i;
      accumulatedDistance = 0;
    }
  }

  return suggestions;
}

/**
 * Calculate elevation profile for charting
 */
export function calculateElevationProfile(coordinates: Coordinate[]): ProfileData[] {
  const profile: ProfileData[] = [];
  let cumulativeDistance = 0;

  profile.push({
    distance: 0,
    elevation: coordinates[0].elevation || 0
  });

  for (let i = 1; i < coordinates.length; i++) {
    const from = turf.point([coordinates[i - 1].lng, coordinates[i - 1].lat]);
    const to = turf.point([coordinates[i].lng, coordinates[i].lat]);
    cumulativeDistance += turf.distance(from, to, { units: 'kilometers' });

    profile.push({
      distance: parseFloat(cumulativeDistance.toFixed(2)),
      elevation: coordinates[i].elevation || 0
    });
  }

  return profile;
}

/**
 * Simplify a route to reduce number of points (Douglas-Peucker algorithm)
 */
export function simplifyRoute(coordinates: Coordinate[], tolerance: number = 0.0001): Coordinate[] {
  if (coordinates.length <= 2) return coordinates;

  const line = turf.lineString(coordinates.map(c => [c.lng, c.lat]));
  const simplified = turf.simplify(line, { tolerance, highQuality: false });

  return simplified.geometry.coordinates.map((coord, idx) => ({
    lng: coord[0],
    lat: coord[1],
    elevation: coordinates[Math.min(idx, coordinates.length - 1)].elevation
  }));
}

/**
 * Get route bounding box for map centering
 */
export function getRouteBoundingBox(coordinates: Coordinate[]): [[number, number], [number, number]] {
  const lats = coordinates.map(c => c.lat);
  const lngs = coordinates.map(c => c.lng);
  
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  ];
}
