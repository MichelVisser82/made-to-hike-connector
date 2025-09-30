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
    const { email, password, guideData } = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Create user with admin privileges
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: guideData.display_name,
        role: 'guide',
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        name: guideData.display_name,
      });

    if (profileError) throw profileError;

    // Assign guide role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'guide',
      });

    if (roleError) throw roleError;

    // Upload images if provided
    let profileImageUrl: string | undefined;
    const portfolioUrls: string[] = [];

    if (guideData.profile_image_base64) {
      const buffer = Uint8Array.from(atob(guideData.profile_image_base64), c => c.charCodeAt(0));
      const fileName = `${userId}/profile-${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, buffer, { contentType: 'image/jpeg' });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('hero-images')
          .getPublicUrl(fileName);
        profileImageUrl = publicUrl;
      }
    }

    if (guideData.portfolio_images_base64 && guideData.portfolio_images_base64.length > 0) {
      for (let i = 0; i < guideData.portfolio_images_base64.length; i++) {
        const base64 = guideData.portfolio_images_base64[i];
        const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const fileName = `${userId}/portfolio-${Date.now()}-${i}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('tour-images')
          .upload(fileName, buffer, { contentType: 'image/jpeg' });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('tour-images')
            .getPublicUrl(fileName);
          portfolioUrls.push(publicUrl);
        }
      }
    }

    // Create guide profile with admin privileges
    const { error: guideProfileError } = await supabase
      .from('guide_profiles')
      .insert({
        user_id: userId,
        display_name: guideData.display_name,
        bio: guideData.bio,
        location: guideData.location,
        profile_image_url: profileImageUrl,
        certifications: guideData.certifications || [],
        specialties: guideData.specialties || [],
        guiding_areas: guideData.guiding_areas || [],
        terrain_capabilities: guideData.terrain_capabilities || [],
        portfolio_images: portfolioUrls,
        seasonal_availability: guideData.seasonal_availability,
        upcoming_availability_start: guideData.upcoming_availability_start,
        upcoming_availability_end: guideData.upcoming_availability_end,
        daily_rate: guideData.daily_rate,
        daily_rate_currency: guideData.daily_rate_currency,
        max_group_size: guideData.max_group_size,
        min_group_size: guideData.min_group_size,
        languages_spoken: guideData.languages_spoken || ['English'],
        profile_completed: true,
        verified: false,
      });

    if (guideProfileError) throw guideProfileError;

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Guide account created successfully!',
      user_id: userId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in guide-signup:', error);
    
    return new Response(JSON.stringify({
      error: {
        message: error.message || 'Guide signup failed',
        code: error.code || 'SIGNUP_ERROR'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
