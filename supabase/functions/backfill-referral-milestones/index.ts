import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting referral milestone backfill...');

    // Get all guide referral signups without milestone_2
    const { data: signups, error: signupsError } = await supabase
      .from('referral_signups')
      .select('id, user_id, user_type, profile_created_at')
      .eq('user_type', 'guide')
      .is('milestone_2_at', null);

    if (signupsError) {
      console.error('Error fetching signups:', signupsError);
      throw signupsError;
    }

    console.log(`Found ${signups?.length || 0} guide signups without milestone_2`);

    const updates = [];

    // Check each guide for published tours
    for (const signup of signups || []) {
      const { data: tours, error: toursError } = await supabase
        .from('tours')
        .select('id, created_at, updated_at, is_active')
        .eq('guide_id', signup.user_id)
        .eq('is_active', true)
        .order('created_at', { ascending: true })
        .limit(1);

      if (toursError) {
        console.error(`Error fetching tours for user ${signup.user_id}:`, toursError);
        continue;
      }

      if (tours && tours.length > 0) {
        const firstTour = tours[0];
        console.log(`Found published tour for user ${signup.user_id}:`, firstTour.id);

        // Update the referral signup
        const { error: updateError } = await supabase
          .from('referral_signups')
          .update({
            milestone_2_at: firstTour.updated_at || firstTour.created_at,
            milestone_2_type: 'first_tour_published',
            milestone_2_id: firstTour.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', signup.id);

        if (updateError) {
          console.error(`Error updating signup ${signup.id}:`, updateError);
        } else {
          updates.push({
            signup_id: signup.id,
            user_id: signup.user_id,
            tour_id: firstTour.id
          });
        }
      }
    }

    console.log(`Backfill complete. Updated ${updates.length} referral signups.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Backfilled ${updates.length} referral milestones`,
        updates
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in backfill-referral-milestones:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
