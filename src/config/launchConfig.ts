/**
 * Launch Configuration
 * 
 * Control the pre-launch landing page visibility
 * When IS_LAUNCHED is false, the Coming Soon page is shown
 * When IS_LAUNCHED is true, the full app is visible
 * 
 * To launch the full website:
 * 1. Change IS_LAUNCHED to true
 * 2. The Coming Soon page will be automatically removed
 * 3. Full app becomes visible to everyone
 */

export const IS_LAUNCHED = false;

/**
 * Bypass password hash (SHA-256)
 * To generate a new hash, use: await crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password'))
 * Then convert to hex string
 * 
 * Current password hash is for: "preview2025"
 */
export const BYPASS_PASSWORD_HASH = "4a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd5";
