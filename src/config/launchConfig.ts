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

export const IS_LAUNCHED = true;

/**
 * Bypass password hash (SHA-256)
 * To generate a new hash, use: await crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password'))
 * Then convert to hex string
 * 
 * Current password hash is for: "preview2025"
 */
export const BYPASS_PASSWORD_HASH = "b7a875fc1ea228b9061041b7cec4bd3f52ab3ce3cadbe33c6b86eda8e4a13e61";

/**
 * SEO Configuration
 * Controls sitemap URLs and canonical base for the website
 */
export const SEO_CONFIG = {
  isLaunched: IS_LAUNCHED,
  sitemapUrl: IS_LAUNCHED 
    ? 'https://madetohike.com/sitemap.xml' 
    : 'https://madetohike.com/sitemap-prelaunch.xml',
  canonicalBase: 'https://madetohike.com',
};
