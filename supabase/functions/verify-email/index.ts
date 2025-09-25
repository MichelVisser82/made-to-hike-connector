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
  console.log('=== EMAIL VERIFICATION FUNCTION CALLED ===')
  
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
    const { token, email } = await req.json();
    console.log('Verification request for:', email, 'with token:', token ? 'present' : 'missing');

    if (!token || !email) {
      throw new Error('Token and email are required');
    }

    // Find user by email and verification token
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      throw new Error('Failed to verify email');
    }

    const user = users.users.find(u => 
      u.email === email && 
      u.user_metadata?.verification_token === token &&
      !u.email_confirmed_at
    );

    if (!user) {
      console.log('User not found or already verified');
      throw new Error('Invalid verification token or email already verified');
    }

    // Confirm the user's email
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id, 
      { 
        email_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          verification_token: null, // Clear the token
          verified_at: new Date().toISOString()
        }
      }
    );

    if (updateError) {
      console.error('Error updating user:', updateError);
      throw new Error('Failed to verify email');
    }

    console.log('Email verified successfully for user:', user.id);

    // Send welcome email
    console.log('Sending welcome email...');
    const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'welcome',
        to: email,
        subject: 'Welcome to MadeToHike! 🏔️',
        template_data: {
          user_name: user.user_metadata?.name || email.split('@')[0]
        }
      })
    });

    if (!emailResponse.ok) {
      console.error('Welcome email failed, but verification succeeded');
    } else {
      console.log('Welcome email sent successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email verified successfully! You can now sign in.',
      user_id: user.id
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in verify-email function:', error);
    
    return new Response(JSON.stringify({
      error: {
        message: error.message || 'Email verification failed',
        code: error.code || 'VERIFICATION_ERROR'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});