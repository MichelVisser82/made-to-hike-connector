/**
 * Bypass Authentication Utilities
 * 
 * Manages session-based bypass token for secret access to pre-launch site
 */

const BYPASS_TOKEN_KEY = 'mth_bypass_token';
const BYPASS_ATTEMPTS_KEY = 'mth_bypass_attempts';
const MAX_ATTEMPTS = 3;

/**
 * Check if user has valid bypass token
 */
export const hasValidBypass = (): boolean => {
  const token = sessionStorage.getItem(BYPASS_TOKEN_KEY);
  return token === 'valid';
};

/**
 * Set bypass token (grants access for session)
 */
export const setBypassToken = (): void => {
  sessionStorage.setItem(BYPASS_TOKEN_KEY, 'valid');
  sessionStorage.removeItem(BYPASS_ATTEMPTS_KEY); // Reset attempts on success
};

/**
 * Clear bypass token
 */
export const clearBypassToken = (): void => {
  sessionStorage.removeItem(BYPASS_TOKEN_KEY);
};

/**
 * Get remaining password attempts
 */
export const getRemainingAttempts = (): number => {
  const attempts = sessionStorage.getItem(BYPASS_ATTEMPTS_KEY);
  const used = attempts ? parseInt(attempts, 10) : 0;
  return Math.max(0, MAX_ATTEMPTS - used);
};

/**
 * Record a failed attempt
 * Returns true if attempts remain, false if locked out
 */
export const recordFailedAttempt = (): boolean => {
  const attempts = sessionStorage.getItem(BYPASS_ATTEMPTS_KEY);
  const used = attempts ? parseInt(attempts, 10) : 0;
  const newUsed = used + 1;
  sessionStorage.setItem(BYPASS_ATTEMPTS_KEY, newUsed.toString());
  return newUsed < MAX_ATTEMPTS;
};

/**
 * Hash password using SHA-256
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};
