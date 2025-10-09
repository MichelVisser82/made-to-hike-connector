import { supabase } from '@/integrations/supabase/client';

/**
 * Clears stale Supabase auth state from localStorage
 * This prevents anonymous users from being blocked by expired auth tokens
 */
export async function clearStaleAuthState(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If there's no valid session, clear any auth data
    if (!session) {
      // Clear Supabase auth from localStorage
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key);
        }
      });
      
      console.log('[AuthCleanup] Cleared stale auth state');
    }
  } catch (error) {
    console.error('[AuthCleanup] Error clearing auth state:', error);
  }
}

/**
 * Ensures the current request will be made as anonymous
 * Clears any stale auth tokens that might interfere
 */
export async function ensureAnonymousContext(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Sign out to ensure clean anonymous state
      await supabase.auth.signOut({ scope: 'local' });
    }
  } catch (error) {
    console.error('[AuthCleanup] Error ensuring anonymous context:', error);
  }
}
