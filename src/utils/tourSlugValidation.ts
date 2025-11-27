import { supabase } from '@/integrations/supabase/client';

// Reserved slugs that cannot be used for tours
const RESERVED_SLUGS = [
  'book', 'create', 'edit', 'new', 'admin', 'dashboard', 'search',
  'tours', 'guides', 'bookings', 'profile', 'settings', 'help',
  'about', 'contact', 'privacy', 'terms', 'api'
];

export async function isTourSlugAvailable(
  slug: string, 
  currentTourId?: string
): Promise<boolean> {
  // Check reserved slugs
  if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
    return false;
  }

  // Check if slug is only numbers
  if (/^\d+$/.test(slug)) {
    return false;
  }

  // Check existing tours
  const query = supabase
    .from('tours')
    .select('id')
    .eq('slug', slug);
  
  // If updating existing tour, exclude current tour
  if (currentTourId) {
    query.neq('id', currentTourId);
  }
  
  const { data: existing } = await query.maybeSingle();
  
  return !existing;
}

export function generateUniqueSlugSuggestions(baseSlug: string): string[] {
  const suggestions: string[] = [];
  
  // Add numbered suggestions
  for (let i = 2; i <= 4; i++) {
    suggestions.push(`${baseSlug}-${i}`);
  }
  
  // Add descriptive suffixes
  suggestions.push(`${baseSlug}-tour`);
  suggestions.push(`${baseSlug}-adventure`);
  
  return suggestions;
}

export function sanitizeTourSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}
