import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token to verify admin status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is admin
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roles, error: rolesError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (rolesError || !roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for actual operations
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const { action, guideUserId } = await req.json();

    if (!guideUserId) {
      return new Response(
        JSON.stringify({ error: 'guideUserId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin action: ${action} for guide: ${guideUserId}`);

    if (action === 'deactivate') {
      // Deactivate guide profile
      const { error: guideError } = await serviceClient
        .from('guide_profiles')
        .update({ verified: false, updated_at: new Date().toISOString() })
        .eq('user_id', guideUserId);

      if (guideError) {
        console.error('Error deactivating guide profile:', guideError);
        throw guideError;
      }

      // Deactivate all tours
      const { data: updatedTours, error: toursError } = await serviceClient
        .from('tours')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('guide_id', guideUserId)
        .select('id, title');

      if (toursError) {
        console.error('Error deactivating tours:', toursError);
        throw toursError;
      }

      console.log(`Deactivated ${updatedTours?.length || 0} tours`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Guide deactivated',
          toursDeactivated: updatedTours?.length || 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'publish') {
      // Reactivate guide profile only (tours stay inactive for manual review)
      const { error: guideError } = await serviceClient
        .from('guide_profiles')
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq('user_id', guideUserId);

      if (guideError) {
        console.error('Error publishing guide:', guideError);
        throw guideError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Guide published' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'delete') {
      // Full GDPR-compliant deletion - delegating to the existing function
      const { data: deleteResult, error: deleteError } = await serviceClient.functions.invoke(
        'gdpr-delete-guide',
        { body: { guideUserId } }
      );

      if (deleteError) {
        console.error('Error deleting guide:', deleteError);
        throw deleteError;
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Guide deleted', ...deleteResult }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use: deactivate, publish, or delete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Admin manage guide error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
