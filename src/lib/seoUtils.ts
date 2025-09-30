import type { Tour } from "@/types";

/**
 * Generate SEO-friendly slug from text
 * Handles special characters, accents, and ensures URL safety
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove accents and diacritics
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove special characters except spaces and hyphens
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Trim hyphens from start and end
    .replace(/^-+|-+$/g, '')
    // Limit length for SEO (45-50 chars)
    .substring(0, 50)
    .replace(/-+$/g, ''); // Trim trailing hyphen after substring
}

/**
 * Generate enhanced SEO slug for tours with regional context
 */
export function generateTourSlug(tour: Partial<Tour>): string {
  const { title, region } = tour;
  if (!title) return '';
  
  const baseSlug = generateSlug(title);
  const regionSlug = region ? `-${region}` : '';
  
  return `${baseSlug}${regionSlug}`.substring(0, 50);
}

/**
 * Generate optimized meta title for tour pages
 * Format: "{Tour Title} - {Duration} {Difficulty} Hike in {Region} | MadeToHike"
 */
export function generateTourMetaTitle(tour: Tour): string {
  const parts = [tour.title];
  
  if (tour.duration) {
    parts.push(tour.duration);
  }
  
  if (tour.difficulty) {
    parts.push(`${tour.difficulty} hike`);
  }
  
  if (tour.region) {
    parts.push(`in ${capitalizeRegion(tour.region)}`);
  }
  
  const title = parts.join(' - ');
  const fullTitle = `${title} | MadeToHike`;
  
  // Keep under 60 characters for SEO
  return fullTitle.length > 60 ? `${tour.title} | MadeToHike` : fullTitle;
}

/**
 * Generate optimized meta description for tour pages
 * Format: "Join our expert guides for a {duration} {difficulty} hiking adventure in {region}. {highlights}. From €{price}/person. Book now!"
 */
export function generateTourMetaDescription(tour: Tour): string {
  const parts: string[] = [];
  
  parts.push(`Join our expert guides for a ${tour.duration || ''} ${tour.difficulty || ''} hiking adventure in ${capitalizeRegion(tour.region)}.`);
  
  if (tour.highlights && tour.highlights.length > 0) {
    const highlight = tour.highlights[0];
    parts.push(highlight.endsWith('.') ? highlight : `${highlight}.`);
  }
  
  parts.push(`From ${tour.currency === 'GBP' ? '£' : '€'}${tour.price}/person. Book now!`);
  
  const description = parts.join(' ');
  
  // Keep under 160 characters for SEO
  return description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;
}

/**
 * Capitalize region name for display
 */
export function capitalizeRegion(region: string): string {
  const regionMap: Record<string, string> = {
    dolomites: 'the Dolomites',
    pyrenees: 'the Pyrenees',
    scotland: 'Scotland'
  };
  
  return regionMap[region.toLowerCase()] || region;
}

/**
 * Get canonical URL for tour page
 */
export function getTourCanonicalUrl(slug: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/tours/${slug}`;
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
