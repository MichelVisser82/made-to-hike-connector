import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, code, firstName, lastName, password, verifyOnly, createAccount } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password requirements if creating account
    if (createAccount && password) {
      if (password.length < 8) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 8 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!/[A-Z]/.test(password)) {
        return new Response(
          JSON.stringify({ error: 'Password must contain at least one uppercase letter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!/[a-z]/.test(password)) {
        return new Response(
          JSON.stringify({ error: 'Password must contain at least one lowercase letter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (!/[0-9]/.test(password)) {
        return new Response(
          JSON.stringify({ error: 'Password must contain at least one number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Retrieve stored code from kv_store
    const { data: kvData, error: kvError } = await supabase
      .from('kv_store_158bb0c0')
      .select('value')
      .eq('key', `verification_code:${email}`)
      .single();

    if (kvError || !kvData) {
      return new Response(
        JSON.stringify({ error: 'Verification code not found or expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const storedData = kvData.value as { code: string; timestamp: number };

    // Check if code matches
    if (storedData.code !== code) {
      return new Response(
        JSON.stringify({ error: 'Invalid verification code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is still valid (10 minutes)
    const now = Date.now();
    const codeAge = now - storedData.timestamp;
    if (codeAge > 10 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: 'Verification code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If only verifying code, return success without creating account
    if (verifyOnly) {
      return new Response(
        JSON.stringify({ 
          message: 'Code verified successfully',
          verified: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only create account if explicitly requested
    if (!createAccount) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!firstName || !lastName || !password) {
      return new Response(
        JSON.stringify({ error: 'First name, last name, and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);

    if (userExists) {
      return new Response(
        JSON.stringify({ error: 'Email already registered. Please log in instead.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase auth user with metadata
    // The handle_new_user trigger will automatically create profile and assign role
    const fullName = `${firstName} ${lastName}`.trim();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        firstName,
        lastName,
        name: fullName,
        role: 'hiker'
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return new Response(
        JSON.stringify({ error: authError.message || 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User created successfully:', authData.user.id);

    // Delete verification code from kv_store
    await supabase
      .from('kv_store_158bb0c0')
      .delete()
      .eq('key', `verification_code:${email}`);

    console.log('Verification code deleted');

    // Return success - frontend will handle sign-in with its own client
    return new Response(
      JSON.stringify({ 
        message: 'Account created successfully',
        user: authData.user,
        email,
        // Signal to frontend to sign in
        shouldSignIn: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-code:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
