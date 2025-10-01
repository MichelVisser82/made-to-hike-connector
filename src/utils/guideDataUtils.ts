import type { Tour } from '@/types';
import type { GuideProfile, GuideStats, GuideCertification } from '@/types/guide';

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
 * Certification abbreviation mapping for common certifications
 */
const CERTIFICATION_ABBREVIATIONS: Record<string, string> = {
  'International Mountain Leader': 'IML',
  'Mountain Leader': 'ML',
  'Wilderness First Aid': 'WFA',
  'Wilderness First Responder': 'WFR',
  'Mountain Instructor Certificate': 'MIC',
  'International Federation of Mountain Guides Association': 'IFMGA',
  'Alpine Guide': 'AG',
  'Rock Climbing Instructor': 'RCI',
  'Winter Mountain Leader': 'WML',
  'Mountain Training': 'MT',
};

/**
 * Gets abbreviated certification title for badge display
 */
export function getAbbreviatedCertification(fullTitle: string): string {
  // Check for exact match
  if (CERTIFICATION_ABBREVIATIONS[fullTitle]) {
    return CERTIFICATION_ABBREVIATIONS[fullTitle];
  }
  
  // Check for partial match
  for (const [key, abbr] of Object.entries(CERTIFICATION_ABBREVIATIONS)) {
    if (fullTitle.includes(key)) {
      return abbr;
    }
  }
  
  // Fallback: Create abbreviation from first letters of words
  const words = fullTitle.split(' ').filter(w => w.length > 2);
  if (words.length > 1) {
    return words.map(w => w[0].toUpperCase()).join('');
  }
  
  return fullTitle;
}

/**
 * Gets the primary certification from a guide profile
 * Priority: isPrimary → highest priority → first available
 */
export function getPrimaryCertification(certifications?: GuideCertification[] | null): GuideCertification | null {
  if (!certifications || certifications.length === 0) return null;
  
  // First priority: explicitly marked as primary
  const primaryCert = certifications.find(c => c.isPrimary);
  if (primaryCert) return primaryCert;
  
  // Second priority: Find highest priority certification
  const priorityCerts = certifications
    .filter(c => c.verificationPriority)
    .sort((a, b) => (a.verificationPriority || 999) - (b.verificationPriority || 999));
  
  if (priorityCerts.length > 0) return priorityCerts[0];
  
  // Fallback to first certification
  return certifications[0];
}

/**
 * Gets certification display text with fallback
 */
export function getCertificationDisplayText(guideInfo: GuideDisplayInfo): string {
  return guideInfo.certificationTitle || 'Certified Professional';
}
