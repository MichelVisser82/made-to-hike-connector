import { supabase } from '@/integrations/supabase/client';

export async function isSlugAvailable(slug: string, currentUserId?: string): Promise<boolean> {
  // Check reserved slugs
  const { data: reserved } = await supabase
    .from('reserved_slugs')
    .select('slug')
    .eq('slug', slug)
    .maybeSingle();
  
  if (reserved) return false;
  
  // Check existing guide profiles
  const query = supabase
    .from('guide_profiles')
    .select('user_id')
    .eq('slug', slug);
  
  // If updating existing profile, exclude current user
  if (currentUserId) {
    query.neq('user_id', currentUserId);
  }
  
  const { data: existing } = await query.maybeSingle();
  
  return !existing;
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}
