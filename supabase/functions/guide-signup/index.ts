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

      // Also track referral progress for existing users coming via referral links
      if (guideData.referral_code) {
        console.log('Processing referral code for existing guide user:', guideData.referral_code);
        console.log('With invitation token:', guideData.invitation_token);
        try {
          await supabase.functions.invoke('track-referral-progress', {
            body: {
              referralCode: guideData.referral_code,
              invitationToken: guideData.invitation_token,
              step: 'profile_created',
              userId: userId,
              userType: 'guide'
            }
          });
          console.log('Guide referral progress tracked successfully for existing user');
        } catch (refError) {
          console.error('Error tracking referral for existing user (non-blocking):', refError);
        }
      }
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
          referral_code: guideData.referral_code // Capture referral code from guide data
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

        // Track referral progress if referral code present
        if (guideData.referral_code) {
          console.log('Processing referral code for guide:', guideData.referral_code);
          console.log('With invitation token:', guideData.invitation_token);
          try {
            await supabase.functions.invoke('track-referral-progress', {
              body: {
                referralCode: guideData.referral_code,
                invitationToken: guideData.invitation_token, // Pass invitation token for proper linking
                step: 'profile_created',
                userId: authData.user.id,
                userType: 'guide'
              }
            });
            console.log('Guide referral progress tracked successfully');
          } catch (refError) {
            console.error('Error tracking referral (non-blocking):', refError);
          }
        }
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

    // Process certification documents: upload to guide-documents bucket
    const certificationsWithUrls = await Promise.all(
      (guideData.certifications || []).map(async (cert: any) => {
        if (cert.certificateDocumentBase64) {
          try {
            const buffer = Uint8Array.from(atob(cert.certificateDocumentBase64), c => c.charCodeAt(0));
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const fileName = `cert-${timestamp}-${random}.jpg`;
            const filePath = `${userId}/certificates/${fileName}`;
            
            const { error: uploadError } = await supabase.storage
              .from('guide-documents')
              .upload(filePath, buffer, { 
                contentType: 'image/jpeg',
                upsert: false 
              });

            if (uploadError) {
              console.error('Certificate upload error:', uploadError);
              return {
                ...cert,
                certificateDocument: null,
                certificateDocumentBase64: undefined,
              };
            }

            return {
              ...cert,
              certificateDocument: filePath,
              certificateDocumentBase64: undefined,
              certificateDocumentName: undefined,
              certificateDocumentType: undefined,
            };
          } catch (error) {
            console.error('Certificate processing error:', error);
            return {
              ...cert,
              certificateDocument: null,
              certificateDocumentBase64: undefined,
            };
          }
        }
        return cert;
      })
    );

    // Create or update guide profile with portfolio image IDs and processed certifications
    const { error: guideProfileError } = await supabase
      .from('guide_profiles')
      .upsert({
        user_id: userId,
        slug: guideData.slug || null,
        display_name: guideData.display_name,
        bio: guideData.bio,
        location: guideData.location,
        country: guideData.country,
        profile_image_url: profileImageUrl,
        experience_years: guideData.experience_years,
        certifications: certificationsWithUrls,
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
        address_line1: guideData.address_line1 || null,
        address_line2: guideData.address_line2 || null,
        address_city: guideData.address_city || null,
        address_state: guideData.address_state || null,
        address_postal_code: guideData.address_postal_code || null,
        date_of_birth: guideData.date_of_birth || null,
        profile_completed: true,
        verified: false,
      }, {
        onConflict: 'user_id'
      });

    if (guideProfileError) throw guideProfileError;

    // Check if guide has any certifications to auto-request verification
    const hasCertifications = guideData.certifications && guideData.certifications.length > 0;

    const verificationStatus = hasCertifications ? 'pending' : 'not_requested';

    // Create or update user_verifications record and get the ID
    const { data: verificationData, error: verificationError } = await supabase
      .from('user_verifications')
      .upsert({
        user_id: userId,
        verification_status: verificationStatus,
        admin_notes: hasCertifications 
          ? `Auto-requested verification: Guide signed up with ${guideData.certifications?.length || 0} certification(s)`
          : null,
      }, {
        onConflict: 'user_id'
      })
      .select('id')
      .single();

    if (verificationError) {
      console.error('Error creating verification record:', verificationError);
      // Don't fail signup if verification record fails
    }

    // Send Slack notification if verification was auto-requested
    if (hasCertifications && verificationData?.id) {
      try {
        console.log('Sending Slack notification for verification:', verificationData.id);
        await supabase.functions.invoke('slack-verification-notification', {
          body: {
            verificationId: verificationData.id,
            action: 'send',
          }
        });
        console.log('Slack notification sent successfully');
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
        // Don't fail signup if Slack notification fails
      }

      // Also send email notification
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'admin_verification_request',
            to: 'admin@madetohike.com',
            template_data: {
              guide_name: guideData.display_name,
              guide_email: email,
              certification_count: guideData.certifications?.length || 0,
              timestamp: new Date().toISOString(),
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
        // Don't fail signup if email fails
      }
    }

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
