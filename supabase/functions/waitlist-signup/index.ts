import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface WaitlistSignupRequest {
  email: string;
  user_type: 'guide' | 'hiker';
  source_section: string;
}

// Brevo Newsletter List ID - configure this in your Brevo dashboard
const BREVO_NEWSLETTER_LIST_ID = 2;

async function syncToBrevo(
  email: string,
  userType: 'guide' | 'hiker',
  sourceSection: string
): Promise<void> {
  const brevoApiKey = Deno.env.get('BREVO_API_KEY');
  
  if (!brevoApiKey) {
    console.warn('BREVO_API_KEY not configured, skipping Brevo sync');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': brevoApiKey,
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        listIds: [BREVO_NEWSLETTER_LIST_ID],
        updateEnabled: true,
        attributes: {
          USER_TYPE: userType.toUpperCase(),
          SOURCE: 'waitlist',
          SOURCE_SECTION: sourceSection,
          SIGNUP_DATE: new Date().toISOString().split('T')[0],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Don't throw for duplicate contacts (already exists)
      if (errorData.code === 'duplicate_parameter') {
        console.log('Contact already exists in Brevo, updated attributes');
        return;
      }
      console.error('Brevo API error:', errorData);
    } else {
      console.log('Successfully synced contact to Brevo:', email);
    }
  } catch (error) {
    // Don't fail the signup if Brevo sync fails
    console.error('Failed to sync to Brevo:', error);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { email, user_type, source_section }: WaitlistSignupRequest = await req.json();

    // Basic validation
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user_type || !['guide', 'hiker'].includes(user_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid user type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert into launch_signups (service role bypasses RLS)
    const { data, error } = await supabase
      .from('launch_signups')
      .insert({
        email: email.toLowerCase().trim(),
        user_type,
        source_section,
      })
      .select('id')
      .single();

    if (error) {
      // Check for duplicate email (unique constraint violation)
      if (error.code === '23505') {
        // Still sync to Brevo to update attributes
        await syncToBrevo(email, user_type, source_section);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Already registered',
            duplicate: true 
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.error('Database error:', error);
      throw error;
    }

    // Sync to Brevo Newsletter list with USER_TYPE tag
    await syncToBrevo(email, user_type, source_section);

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: data.id,
        message: 'Successfully joined waitlist' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Waitlist signup error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process signup',
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
