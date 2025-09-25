import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

// Get allowed origins from environment or use default for development
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be set dynamically based on request origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Initialize Supabase client with service role for admin operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  console.log('=== CUSTOM SIGNUP FUNCTION CALLED ===')

  // Get request origin and set CORS headers dynamically
  const origin = req.headers.get('origin') || '';
  const headers = { ...corsHeaders };

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (Deno.env.get('ENVIRONMENT') === 'development') {
    // In development, allow any origin
    headers['Access-Control-Allow-Origin'] = '*';
  } else {
    // In production, only allow configured origins
    headers['Access-Control-Allow-Origin'] = allowedOrigins[0] || 'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com';
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers
    });
  }

  try {
    const { email, password, metadata } = await req.json();
    console.log('=== CUSTOM SIGNUP REQUEST ===');
    console.log('Email:', email);
    console.log('Metadata keys:', Object.keys(metadata || {}));

    if (!email || !password) {
      console.error('Missing email or password');
      throw new Error('Email and password are required');
    }

    // Generate verification token with expiration
    const verificationToken = crypto.randomUUID();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours
    console.log('Generated verification token with 24h expiry');

    // Create user with email_confirmed: false
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User is not confirmed yet
      user_metadata: {
        ...metadata,
        verification_token: verificationToken,
        verification_token_expires_at: tokenExpiry.toISOString(),
        verification_sent_at: new Date().toISOString()
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(authError.message);
    }

    console.log('User created successfully:', authData.user.id);

    // Send verification email using our send-email function
    console.log('Sending verification email...');
    
    const emailPayload = {
      type: 'custom_verification',
      to: email,
      subject: 'Verify Your MadeToHike Account',
      template_data: {
        user_name: metadata?.name || email.split('@')[0],
        verification_url: `https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/verify-email`,
        verification_token: verificationToken,
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
      headers: { 'Content-Type': 'application/json', ...headers },
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
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }
});