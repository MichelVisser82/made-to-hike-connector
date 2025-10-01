import type { Tour } from '@/types';
import type { GuideProfile, GuideStats } from '@/types/guide';

/**
 * Unified guide display information interface
 * Combines data from tour object and guide profile with validation flags
 */
export interface GuideDisplayInfo {
  // Basic Info (primary source: tour object, fallback: guide profile)
  displayName: string;
  avatarUrl: string | null;
  
  // Professional Info (primary source: guide profile)
  certificationTitle: string | null;
  experienceYears: number | null;
  activeSince: Date | null;
  bio: string | null;
  location: string | null;
  
  // Stats Info
  toursCompleted: number;
  averageRating: number;
  totalHikers: number;
  
  // Validation Flags
  hasBasicInfo: boolean;
  hasProfessionalInfo: boolean;
  hasStatsInfo: boolean;
  isFullyLoaded: boolean;
}

/**
 * Extracts and normalizes guide information with robust fallback hierarchy
 * Priority: tour fields → guide profile → calculated values → defaults
 */
export function getGuideDisplayInfo(
  tour: Tour,
  guideProfile?: GuideProfile | null,
  guideStats?: GuideStats | null
): GuideDisplayInfo {
  // Basic Info - prioritize tour data (fast, always available)
  const displayName = tour.guide_display_name || guideProfile?.display_name || 'Professional Guide';
  const avatarUrl = tour.guide_avatar_url || guideProfile?.profile_image_url || null;
  
  // Professional Info - require guide profile
  const certificationTitle = guideProfile?.certifications?.[0]?.title || null;
  
  // Experience calculation with fallback hierarchy
  let experienceYears: number | null = null;
  if (guideProfile?.experience_years) {
    experienceYears = guideProfile.experience_years;
  } else if (guideProfile?.active_since) {
    const activeSinceDate = new Date(guideProfile.active_since);
    experienceYears = new Date().getFullYear() - activeSinceDate.getFullYear();
  }
  
  const activeSince = guideProfile?.active_since ? new Date(guideProfile.active_since) : null;
  const bio = guideProfile?.bio || null;
  const location = guideProfile?.location || null;
  
  // Stats Info
  const toursCompleted = guideStats?.tours_completed || 0;
  const averageRating = guideStats?.average_rating || 0;
  const totalHikers = guideStats?.total_hikers || 0;
  
  // Validation Flags
  const hasBasicInfo = !!(displayName && avatarUrl);
  const hasProfessionalInfo = !!(certificationTitle || experienceYears);
  const hasStatsInfo = toursCompleted > 0 || averageRating > 0;
  const isFullyLoaded = hasBasicInfo && hasProfessionalInfo && hasStatsInfo;
  
  return {
    displayName,
    avatarUrl,
    certificationTitle,
    experienceYears,
    activeSince,
    bio,
    location,
    toursCompleted,
    averageRating,
    totalHikers,
    hasBasicInfo,
    hasProfessionalInfo,
    hasStatsInfo,
    isFullyLoaded,
  };
}

/**
 * Gets experience display text with hierarchical fallbacks
 */
export function getExperienceDisplayText(guideInfo: GuideDisplayInfo): string {
  if (guideInfo.experienceYears && guideInfo.experienceYears > 0) {
    return `${guideInfo.experienceYears}+ years experience`;
  }
  
  if (guideInfo.toursCompleted > 0) {
    return `${guideInfo.toursCompleted}+ tours completed`;
  }
  
  return 'Experienced professional';
}

/**
 * Gets certification display text with fallback
 */
export function getCertificationDisplayText(guideInfo: GuideDisplayInfo): string {
  return guideInfo.certificationTitle || 'Certified Professional';
}
