import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role for admin operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  console.log('=== CUSTOM SIGNUP FUNCTION CALLED ===')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { email, password, metadata } = await req.json();
    console.log('=== CUSTOM SIGNUP REQUEST ===');
    console.log('Email:', email);
    console.log('Metadata:', JSON.stringify(metadata, null, 2));

    if (!email || !password) {
      console.error('Missing email or password');
      throw new Error('Email and password are required');
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    console.log('Generated verification token');

    // Check for referral code and invitation token in metadata
    const referralCode = metadata?.referral_code;
    const invitationToken = metadata?.invitation_token;
    console.log('Referral code from metadata:', referralCode);
    console.log('Invitation token from metadata:', invitationToken);

    // Create user with email_confirmed: false
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User is not confirmed yet
      user_metadata: {
        ...metadata,
        verification_token: verificationToken,
        verification_sent_at: new Date().toISOString(),
        referral_code: referralCode, // Preserve referral code
        invitation_token: invitationToken // Preserve invitation token
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(authError.message);
    }

    console.log('User created successfully:', authData.user.id);

    // Track referral progress if referral code present
    if (referralCode) {
      console.log('Processing referral code:', referralCode);
      console.log('With invitation token:', invitationToken);
      try {
        await supabase.functions.invoke('track-referral-progress', {
          body: {
            referralCode,
            invitationToken,
            step: 'profile_created',
            userId: authData.user.id,
            userType: metadata?.role || 'hiker'
          }
        });
        console.log('Referral progress tracked successfully');
      } catch (refError) {
        console.error('Error tracking referral (non-blocking):', refError);
      }
    }

    // Send verification email using our send-email function
    console.log('Sending verification email...');
    
    const emailPayload = {
      type: 'custom_verification',
      to: email,
      subject: 'Verify Your MadeToHike Account',
      template_data: {
        user_name: metadata?.name || email.split('@')[0],
        verification_url: `https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`,
        user_email: email
      }
    };
    
    console.log('Email payload:', JSON.stringify(emailPayload, null, 2));
    
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('Email response status:', emailResponse.status);
    const responseText = await emailResponse.text();
    console.log('Email response body:', responseText);
    
    if (!emailResponse.ok) {
      console.error('Email sending failed with status:', emailResponse.status);
      console.error('Email error response:', responseText);
      // Don't fail the signup if email fails, just log it
      console.log('Continuing signup despite email error');
    } else {
      try {
        const emailResult = JSON.parse(responseText);
        console.log('Verification email sent successfully:', emailResult);
      } catch (e) {
        console.log('Email sent but response not JSON:', responseText);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Account created! Please check your email to verify your account.',
      user_id: authData.user.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in custom-signup function:', error);
    
    return new Response(JSON.stringify({
      error: {
        message: error.message || 'Signup failed',
        code: error.code || 'SIGNUP_ERROR'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});