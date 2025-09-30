import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting guide profile repair process...');
    
    // Find all users with 'guide' role
    const { data: guideRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'guide');

    if (rolesError) throw rolesError;
    
    console.log(`Found ${guideRoles?.length || 0} users with guide role`);

    // Get all existing guide profiles
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('guide_profiles')
      .select('user_id');

    if (profilesError) throw profilesError;

    const existingProfileIds = new Set(existingProfiles?.map(p => p.user_id) || []);
    
    // Find guides without profiles
    const orphanedGuides = guideRoles?.filter(role => !existingProfileIds.has(role.user_id)) || [];
    
    console.log(`Found ${orphanedGuides.length} guides without profiles`);

    if (orphanedGuides.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'No orphaned guide profiles found',
        created: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create minimal profiles for orphaned guides
    const profilesToCreate = [];
    
    for (const guide of orphanedGuides) {
      // Get user email from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, name')
        .eq('id', guide.user_id)
        .single();

      profilesToCreate.push({
        user_id: guide.user_id,
        display_name: profile?.name || profile?.email?.split('@')[0] || 'Guide',
        bio: '',
        location: '',
        verified: false,
        profile_completed: false,
        onboarding_step: 0,
        min_group_size: 1,
        daily_rate_currency: 'EUR',
        specialties: [],
        guiding_areas: [],
        terrain_capabilities: [],
        portfolio_images: [],
        languages_spoken: ['English'],
      });
    }

    const { data: created, error: insertError } = await supabase
      .from('guide_profiles')
      .insert(profilesToCreate)
      .select();

    if (insertError) {
      console.error('Error creating profiles:', insertError);
      throw insertError;
    }

    console.log(`Successfully created ${created?.length || 0} guide profiles`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Created ${created?.length || 0} guide profiles`,
      created: created?.length || 0,
      profiles: created
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in fix-guide-profiles:', error);
    
    return new Response(JSON.stringify({
      error: {
        message: error.message || 'Failed to fix guide profiles',
        code: error.code || 'FIX_ERROR'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
