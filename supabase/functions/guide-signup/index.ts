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
    const { email, password, guideData, userId: existingUserId } = await req.json();

    let userId: string;

    // If userId is provided, use existing user (already logged in scenario)
    if (existingUserId) {
      userId = existingUserId;
    } else {
      // Create new user
      if (!email || !password) {
        throw new Error('Email and password are required for new user creation');
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: guideData.display_name,
          role: 'guide',
        }
      });

      if (authError) {
        // If user already exists, try to get their ID
        if (authError.message?.includes('already been registered')) {
          const { data: existingUser } = await supabase.auth.admin.listUsers();
          const user = existingUser.users.find(u => u.email === email);
          if (user) {
            userId = user.id;
          } else {
            throw new Error('User exists but could not be found');
          }
        } else {
          throw authError;
        }
      } else {
        if (!authData.user) throw new Error('User creation failed');
        userId = authData.user.id;
      }
    }

    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        name: guideData.display_name,
      }, {
        onConflict: 'id'
      });

    if (profileError) throw profileError;

    // Assign guide role if not already assigned
    const { error: roleError } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'guide',
      }, {
        onConflict: 'user_id,role'
      });

    if (roleError) throw roleError;

    // Upload profile image if provided
    let profileImageUrl: string | undefined;

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

    // Process portfolio images: upload to storage and insert into website_images table
    const portfolioImageIds: string[] = [];

    if (guideData.portfolio_images_base64 && guideData.portfolio_images_base64.length > 0) {
      for (let i = 0; i < guideData.portfolio_images_base64.length; i++) {
        const imageData = guideData.portfolio_images_base64[i];
        const base64 = imageData.base64;
        const metadata = imageData.metadata || {};
        
        const buffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const fileName = `${userId}/portfolio-${Date.now()}-${i}.jpg`;
        const filePath = `guides/${userId}/portfolio/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('tour-images')
          .upload(filePath, buffer, { contentType: 'image/jpeg' });

        if (uploadError) {
          console.error('Portfolio upload error:', uploadError);
          continue;
        }

        // Insert into website_images table
        const { data: imageRecord, error: imageError } = await supabase
          .from('website_images')
          .insert({
            file_name: fileName,
            file_path: filePath,
            bucket_id: 'tour-images',
            category: 'portfolio',
            uploaded_by: userId,
            usage_context: ['portfolio', 'guide'],
            alt_text: metadata.alt_text || `Portfolio image ${i + 1}`,
            description: metadata.description || '',
            tags: metadata.tags || [],
            priority: 5,
            is_active: true,
          })
          .select('id')
          .single();

        if (!imageError && imageRecord) {
          portfolioImageIds.push(imageRecord.id);
        }
      }
    }

    // Create or update guide profile with portfolio image IDs
    const { error: guideProfileError } = await supabase
      .from('guide_profiles')
      .upsert({
        user_id: userId,
        display_name: guideData.display_name,
        bio: guideData.bio,
        location: guideData.location,
        profile_image_url: profileImageUrl,
        experience_years: guideData.experience_years,
        certifications: guideData.certifications || [],
        specialties: guideData.specialties || [],
        guiding_areas: guideData.guiding_areas || [],
        terrain_capabilities: guideData.terrain_capabilities || [],
        portfolio_images: portfolioImageIds,
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
      }, {
        onConflict: 'user_id'
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
