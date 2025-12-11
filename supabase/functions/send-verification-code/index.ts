import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    console.log('=== SEND VERIFICATION CODE CALLED ===');
    console.log('Email address:', email);

    if (!email) {
      console.error('No email provided in request');
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if user already exists
    console.log('Checking if user already exists...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase());

    if (userExists) {
      console.log('User already exists with this email:', email);
      return new Response(
        JSON.stringify({ error: 'This email is already registered. Please log in instead.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User does not exist, proceeding with verification code...');

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated verification code for:', email);

    // Store code in kv_store with 10-minute expiry
    const { error: kvError } = await supabase
      .from('kv_store_158bb0c0')
      .upsert({
        key: `verification_code:${email}`,
        value: { code, timestamp: Date.now() },
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      });

    if (kvError) {
      console.error('Error storing verification code:', kvError);
      return new Response(
        JSON.stringify({ error: 'Failed to store verification code. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verification code stored successfully, invoking send-email function...');

    // Send verification email via send-email function
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: email,
        type: 'verification-code',
        data: {
          code,
          email
        }
      }
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send verification email. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verification email sent successfully to:', email);

    return new Response(
      JSON.stringify({ message: 'Verification code sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-verification-code:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
