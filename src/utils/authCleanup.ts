/**
 * Silently clears stale Supabase auth state from localStorage
 * This prevents anonymous users from being blocked by expired auth tokens
 * Does NOT trigger auth state change events or notifications
 */
export function clearSupabaseAuthCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase.auth')) {
        localStorage.removeItem(key);
      }
    });
    console.log('[AuthCleanup] Cleared Supabase auth cache');
  } catch (error) {
    console.error('[AuthCleanup] Error clearing auth cache:', error);
  }
}
