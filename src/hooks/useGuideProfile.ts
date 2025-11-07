import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { GuideProfile } from '@/types/guide';

/**
 * SECURITY MODEL for Guide Profiles
 * 
 * Phone Number Protection:
 * - Only visible to authenticated users OR the profile owner
 * - Anonymous users always see null
 * - Enforced at application layer (frontend) for defense-in-depth
 * - Database RLS policies also restrict access
 * 
 * Stripe Account Protection:
 * - stripe_account_id should NEVER be exposed to public
 * - Only visible to profile owner and admins
 * - Enforced by database RLS policies
 * 
 * RLS Policy Hierarchy:
 * 1. Owner Access - Full CRUD on own profile
 * 2. Admin Access - Full CRUD on all profiles
 * 3. Authenticated Access - Read verified profiles only
 * 4. Public Access - Read verified profiles via guide_profiles_public view
 */

// Enhanced error type for better debugging
export type ProfileError = {
  type: 'no_profile' | 'rls_blocked' | 'network_error' | 'auth_error' | 'unknown';
  message: string;
  originalError?: any;
};

export function useGuideProfile(guideId: string | undefined) {
  return useQuery({
    queryKey: ['guide-profile', guideId],
    queryFn: async () => {
      if (!guideId) throw new Error('Guide ID is required');

      console.log('[useGuideProfile] Starting fetch for guideId:', guideId);

      const { data: { user } } = await supabase.auth.getUser();
      const isOwner = user?.id === guideId;
      const isAuthenticated = !!user;

      console.log('[useGuideProfile] Auth check:', { 
        isOwner, 
        isAuthenticated, 
        currentUserId: user?.id 
      });

      const { data, error } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('user_id', guideId)
        .maybeSingle();

      if (error) {
        console.error('[useGuideProfile] Query error:', error);
        throw error;
      }
      
      if (!data) {
        console.warn('[useGuideProfile] No profile found for guideId:', guideId);
        throw new Error('Guide profile not found');
      }

      console.log('[useGuideProfile] Successfully fetched profile:', {
        user_id: data.user_id,
        display_name: data.display_name,
        verified: data.verified,
        has_certifications: Array.isArray(data.certifications) && data.certifications.length > 0
      });

      return {
        ...data,
        phone: (isOwner || isAuthenticated) ? data.phone : null,
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      } as unknown as GuideProfile;
    },
    enabled: !!guideId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a "not found" error
      if (error?.message?.includes('not found')) return false;
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
  });
}

export function useMyGuideProfile() {
  return useQuery({
    queryKey: ['my-guide-profile'],
    queryFn: async (): Promise<GuideProfile | null> => {
      console.log('[useMyGuideProfile] ========== START ==========');
      
      // Step 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('[useMyGuideProfile] Auth error:', authError);
        const error: ProfileError = {
          type: 'auth_error',
          message: 'Authentication failed',
          originalError: authError
        };
        throw error;
      }

      if (!user) {
        console.warn('[useMyGuideProfile] User not authenticated');
        const error: ProfileError = {
          type: 'auth_error',
          message: 'Not authenticated',
          originalError: null
        };
        throw error;
      }

      console.log('[useMyGuideProfile] User authenticated:', {
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Step 2: Check user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[useMyGuideProfile] Role check:', { 
        role: roleData?.role, 
        error: roleError 
      });

      // Step 3: Query guide profile
      console.log('[useMyGuideProfile] Querying guide_profiles for user:', user.id);
      
      const { data, error, status, statusText } = await supabase
        .from('guide_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      console.log('[useMyGuideProfile] Query result:', {
        hasData: !!data,
        error: error,
        status: status,
        statusText: statusText,
      });

      if (error) {
        console.error('[useMyGuideProfile] Detailed error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        // Determine error type based on error code/message
        if (error.code === '42501' || error.message?.includes('policy')) {
          const profileError: ProfileError = {
            type: 'rls_blocked',
            message: 'Permission denied. Row Level Security policy may be blocking access.',
            originalError: error
          };
          throw profileError;
        } else if (error.code === 'PGRST116' || error.message?.includes('network')) {
          const profileError: ProfileError = {
            type: 'network_error',
            message: 'Network error while fetching profile',
            originalError: error
          };
          throw profileError;
        } else {
          const profileError: ProfileError = {
            type: 'unknown',
            message: error.message || 'Unknown error',
            originalError: error
          };
          throw profileError;
        }
      }

      if (!data) {
        console.warn('[useMyGuideProfile] No guide profile found for user:', user.id);
        console.log('[useMyGuideProfile] ========== END (NO DATA) ==========');
        return null;
      }

      console.log('[useMyGuideProfile] Successfully fetched profile:', {
        id: data.id,
        user_id: data.user_id,
        display_name: data.display_name,
        verified: data.verified,
        profile_completed: data.profile_completed,
        stripe_account_id: data.stripe_account_id ? '***' : null,
        has_certifications: Array.isArray(data.certifications) && data.certifications.length > 0,
      });

      console.log('[useMyGuideProfile] ========== END (SUCCESS) ==========');
      
      return {
        ...data,
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
      } as unknown as GuideProfile;
    },
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: (failureCount, error: any) => {
      // Don't retry auth errors or RLS blocks
      if (error?.type === 'auth_error' || error?.type === 'rls_blocked') {
        return false;
      }
      // Retry network errors up to 3 times
      if (error?.type === 'network_error') {
        return failureCount < 3;
      }
      // Retry unknown errors once
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Helper hook to manually refresh the profile
export function useRefreshMyGuideProfile() {
  const queryClient = useQueryClient();
  
  return () => {
    console.log('[useRefreshMyGuideProfile] Manually invalidating cache');
    queryClient.invalidateQueries({ queryKey: ['my-guide-profile'] });
    queryClient.refetchQueries({ queryKey: ['my-guide-profile'] });
  };
}
