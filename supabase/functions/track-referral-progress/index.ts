import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TrackProgressRequest {
  referralCode: string;
  step: 'profile_created' | 'milestone_2' | 'completed';
  userId?: string;
  userType?: 'hiker' | 'guide';
  milestoneData?: {
    type: 'first_booking' | 'first_tour_published';
    id: string;
  };
  completionBookingId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: TrackProgressRequest = await req.json();

    console.log('track-referral-progress called:', body);

    const { referralCode, step, userId, userType, milestoneData, completionBookingId } = body;

    // Get the referral
    const { data: referral, error: fetchError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referral_code', referralCode)
      .single();

    if (fetchError || !referral) {
      console.error('Referral not found:', referralCode);
      return new Response(
        JSON.stringify({ error: 'Referral not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if referral is expired
    if (new Date(referral.expires_at) < new Date()) {
      await supabase
        .from('referrals')
        .update({ status: 'expired' })
        .eq('id', referral.id);

      return new Response(
        JSON.stringify({ error: 'Referral has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update referral based on step
    let updateData: any = { updated_at: new Date().toISOString() };

    switch (step) {
      case 'profile_created':
        if (referral.status !== 'link_sent') {
          return new Response(
            JSON.stringify({ error: 'Invalid referral state for profile creation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updateData = {
          ...updateData,
          status: 'profile_created',
          referee_id: userId,
          referee_type: userType,
          profile_created_at: new Date().toISOString()
        };
        break;

      case 'milestone_2':
        if (referral.status !== 'profile_created') {
          return new Response(
            JSON.stringify({ error: 'Invalid referral state for milestone 2' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updateData = {
          ...updateData,
          status: 'milestone_2',
          milestone_2_at: new Date().toISOString(),
          milestone_2_type: milestoneData?.type,
          milestone_2_id: milestoneData?.id
        };
        break;

      case 'completed':
        if (referral.status !== 'milestone_2') {
          return new Response(
            JSON.stringify({ error: 'Invalid referral state for completion' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updateData = {
          ...updateData,
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_booking_id: completionBookingId
        };

        // Trigger reward processing
        await supabase.functions.invoke('process-referral-reward', {
          body: { referralId: referral.id }
        });
        break;
    }

    // Update referral
    const { error: updateError } = await supabase
      .from('referrals')
      .update(updateData)
      .eq('id', referral.id);

    if (updateError) {
      console.error('Error updating referral:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update referral progress' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Referral progress updated:', referral.id, step);

    return new Response(
      JSON.stringify({ success: true, message: `Referral progress updated to ${step}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in track-referral-progress:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
