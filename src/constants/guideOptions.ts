/**
 * Centralized constants for guide profile options
 * Used in both signup flow and profile editing to ensure consistency
 */

// SPECIALTIES - Comprehensive list of guide specializations
export const SPECIALTY_OPTIONS = [
  // Climbing & Technical
  'Rock Climbing',
  'Ice Climbing',
  'Via Ferrata',
  'Scrambling',
  
  // Hiking & Trekking
  'Alpine Hiking',
  'Glacier Trekking',
  'Winter Hiking',
  'Trekking',
  'Backpacking',
  
  // Mountaineering
  'Mountaineering',
  'Alpine Touring',
  
  // Special Interest
  'Wildlife Watching',
  'Photography Tours',
  'Multi-day Expeditions',
] as const;

// TERRAIN - Types of terrain guides can lead on
export const TERRAIN_OPTIONS = [
  'High Alpine',
  'Mountain Trails',
  'Alpine Meadows',
  'Ridge Walking',
  'Rocky Terrain',
  'Glacier Routes',
  'Snow & Ice',
  'Via Ferrata',
  'Forest Trails',
  'Coastal Paths',
  'Canyon Routes',
  'Desert Hiking',
] as const;

// DIFFICULTY - Unified difficulty levels with consistent values
export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', description: 'Suitable for beginners with no prior experience' },
  { value: 'moderate', label: 'Moderate', description: 'Some hiking experience required' },
  { value: 'challenging', label: 'Challenging', description: 'Advanced skills and fitness needed' },
  { value: 'expert', label: 'Expert', description: 'For experienced mountaineers only' },
] as const;

// LANGUAGES - Common European languages for guide communication
export const LANGUAGE_OPTIONS = [
  'English',
  'German',
  'French',
  'Italian',
  'Spanish',
  'Dutch',
  'Norwegian',
  'Swedish',
  'Polish',
  'Czech',
  'Portuguese',
  'Romanian',
  'Greek',
  'Finnish',
  'Danish',
] as const;

// Type exports for TypeScript
export type Specialty = typeof SPECIALTY_OPTIONS[number];
export type Terrain = typeof TERRAIN_OPTIONS[number];
export type DifficultyLevel = typeof DIFFICULTY_OPTIONS[number]['value'];
export type Language = typeof LANGUAGE_OPTIONS[number];
