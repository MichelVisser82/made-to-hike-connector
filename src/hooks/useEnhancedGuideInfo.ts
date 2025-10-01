import { useQuery } from '@tanstack/react-query';
import type { Tour } from '@/types';
import { useGuideProfile } from './useGuideProfile';
import { useGuideStats } from './useGuideStats';
import { getGuideDisplayInfo, type GuideDisplayInfo } from '@/utils/guideDataUtils';

/**
 * Enhanced hook that combines tour data with fresh guide profile and stats
 * Provides unified, consistent guide information across all components
 * 
 * Features:
 * - Smart caching with proper invalidation
 * - Progressive loading (basic info → professional info → stats)
 * - Robust fallback hierarchy
 * - Consistent data interface
 */
export function useEnhancedGuideInfo(tour: Tour) {
  // Fetch guide profile and stats in parallel
  const { 
    data: guideProfile, 
    isLoading: isLoadingProfile,
    error: profileError 
  } = useGuideProfile(tour.guide_id);
  
  const { 
    data: guideStats, 
    isLoading: isLoadingStats,
    error: statsError 
  } = useGuideStats(tour.guide_id);
  
  // Combine data using utility function
  const guideInfo = getGuideDisplayInfo(tour, guideProfile, guideStats);
  
  // Progressive loading states
  const isLoadingBasic = isLoadingProfile;
  const isLoadingProfessional = isLoadingProfile;
  const isLoadingStatsData = isLoadingStats;
  const isLoading = isLoadingProfile || isLoadingStats;
  
  // Error handling
  const hasError = !!profileError || !!statsError;
  
  return {
    guideInfo,
    isLoading,
    isLoadingBasic,
    isLoadingProfessional,
    isLoadingStats: isLoadingStatsData,
    hasError,
    // Raw data access for specific use cases
    guideProfile,
    guideStats,
  };
}
