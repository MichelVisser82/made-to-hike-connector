import { Coordinate } from './routeAnalysis';

/**
 * Fetches elevation data from Open-Elevation API for coordinates that lack elevation
 * @param coordinates Array of coordinates that may need elevation data
 * @returns Updated coordinates with elevation data
 */
export async function fetchElevationData(coordinates: Coordinate[]): Promise<Coordinate[]> {
  // Filter coordinates that need elevation
  const needsElevation = coordinates.filter(c => c.elevation === undefined || c.elevation === 0);
  
  if (needsElevation.length === 0) {
    return coordinates;
  }

  try {
    // Open-Elevation API supports batch requests
    // Split into chunks of 100 to avoid overwhelming the API
    const chunkSize = 100;
    const chunks: Coordinate[][] = [];
    
    for (let i = 0; i < needsElevation.length; i += chunkSize) {
      chunks.push(needsElevation.slice(i, i + chunkSize));
    }

    const elevationPromises = chunks.map(async (chunk) => {
      const locations = chunk.map(c => ({ latitude: c.lat, longitude: c.lng }));
      
      const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch elevation data');
      }

      const data = await response.json();
      return data.results.map((result: any, index: number) => ({
        ...chunk[index],
        elevation: result.elevation
      }));
    });

    const elevationChunks = await Promise.all(elevationPromises);
    const updatedCoordinates = elevationChunks.flat();

    // Merge back into original coordinates array
    const coordMap = new Map(
      updatedCoordinates.map(c => [`${c.lat},${c.lng}`, c.elevation])
    );

    return coordinates.map(c => ({
      ...c,
      elevation: c.elevation || coordMap.get(`${c.lat},${c.lng}`) || 0
    }));

  } catch (error) {
    console.error('Error fetching elevation data:', error);
    // Return original coordinates if API fails
    return coordinates;
  }
}

/**
 * Estimates elevation using linear interpolation between known points
 * Useful as a fallback when API is unavailable
 */
export function estimateElevation(
  coordinates: Coordinate[],
  index: number
): number {
  if (index === 0 || index === coordinates.length - 1) {
    return 0;
  }

  // Find nearest known elevations before and after
  let beforeIdx = index - 1;
  let afterIdx = index + 1;

  while (beforeIdx >= 0 && !coordinates[beforeIdx].elevation) {
    beforeIdx--;
  }

  while (afterIdx < coordinates.length && !coordinates[afterIdx].elevation) {
    afterIdx++;
  }

  if (beforeIdx >= 0 && afterIdx < coordinates.length) {
    const before = coordinates[beforeIdx];
    const after = coordinates[afterIdx];
    
    if (before.elevation && after.elevation) {
      // Linear interpolation
      const ratio = (index - beforeIdx) / (afterIdx - beforeIdx);
      return before.elevation + ratio * (after.elevation - before.elevation);
    }
  }

  return 0;
}
