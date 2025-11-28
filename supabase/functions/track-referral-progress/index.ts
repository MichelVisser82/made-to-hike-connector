import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface TrackProgressRequest {
  referralCode?: string;
  invitationToken?: string;
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

    const { referralCode, invitationToken, step, userId, userType, milestoneData, completionBookingId } = body;

    // For milestone_2 and completed steps, we can look up the signup directly by userId
    // and don't need the referral code
    if ((step === 'milestone_2' || step === 'completed') && userId) {
      // Look up existing signup by userId
      const { data: existingSignup } = await supabase
        .from('referral_signups')
        .select('id, referral_link_id, milestone_2_at, completed_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingSignup) {
        console.log('No referral signup found for user:', userId);
        return new Response(
          JSON.stringify({ success: true, message: 'No referral to track' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update the milestone
      if (step === 'milestone_2' && !existingSignup.milestone_2_at) {
        const { error: updateError } = await supabase
          .from('referral_signups')
          .update({
            milestone_2_at: new Date().toISOString(),
            milestone_2_type: milestoneData?.type,
            milestone_2_id: milestoneData?.id,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating milestone_2:', updateError);
          throw updateError;
        }

        console.log('Referral milestone_2 updated for user:', userId);
        return new Response(
          JSON.stringify({ success: true, message: 'Referral progress updated to milestone_2' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (step === 'completed' && !existingSignup.completed_at) {
        const { error: updateError } = await supabase
          .from('referral_signups')
          .update({
            completed_at: new Date().toISOString(),
            completion_booking_id: completionBookingId,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating completion:', updateError);
          throw updateError;
        }

        // Trigger reward processing
        await supabase.functions.invoke('process-referral-reward', {
          body: { signupId: existingSignup.id }
        });

        console.log('Referral completed for user:', userId);
        return new Response(
          JSON.stringify({ success: true, message: 'Referral progress updated to completed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Already tracked
      return new Response(
        JSON.stringify({ success: true, message: 'Milestone already tracked' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For profile_created step, we need the referral code
    if (!referralCode) {
      return new Response(
        JSON.stringify({ error: 'Referral code required for profile creation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the referral link by code if possible
    let { data: link, error: linkError } = await supabase
      .from('referral_links')
      .select('*')
      .eq('referral_code', referralCode)
      .maybeSingle();


    // If no link found by code (e.g. legacy link where code was rotated), try resolving via invitation token
    if ((!link || linkError) && invitationToken) {
      console.log('Referral link not found by code, trying invitation token fallback');

      const { data: invitation, error: invError } = await supabase
        .from('referral_invitations')
        .select('referral_link_id')
        .eq('invitation_token', invitationToken)
        .maybeSingle();

      if (!invError && invitation?.referral_link_id) {
        const { data: linkById, error: linkByIdError } = await supabase
          .from('referral_links')
          .select('*')
          .eq('id', invitation.referral_link_id)
          .maybeSingle();

        if (!linkByIdError && linkById) {
          link = linkById;
          linkError = null;
        }
      }
    }

    if (linkError || !link) {
      console.error('Referral link not found for code or invitation:', { referralCode, invitationToken, linkError });
      return new Response(
        JSON.stringify({ error: 'Referral link not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if link is expired
    if (new Date(link.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Referral link has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only profile_created step needs full link validation above
    if (step !== 'profile_created') {
      return new Response(
        JSON.stringify({ error: 'Invalid step for this code path' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle profile_created step
    if (!userId || !userType) {
      throw new Error('userId and userType required for profile_created step');
    }

    // Check if signup already exists
    const { data: existingSignup } = await supabase
      .from('referral_signups')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingSignup) {
      console.log('Signup already tracked for user:', userId);
      return new Response(
        JSON.stringify({ success: true, message: 'Signup already tracked' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to find matching invitation by token or email
    let invitationId = null;
    let signupSource = 'generic_link';

    if (invitationToken) {
      const { data: invitation } = await supabase
        .from('referral_invitations')
        .select('id')
        .eq('invitation_token', invitationToken)
        .eq('referral_link_id', link.id)
        .single();

      if (invitation) {
        invitationId = invitation.id;
        signupSource = 'email_invitation';

        // Update invitation status
        await supabase
          .from('referral_invitations')
          .update({ 
            status: 'signed_up',
            updated_at: new Date().toISOString()
          })
          .eq('id', invitation.id);
      }
    }

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    // Create referral signup record
    const signupData: any = {
      referral_link_id: link.id,
      invitation_id: invitationId,
      user_id: userId,
      user_type: userType,
      signup_email: profile?.email || '',
      signup_source: signupSource,
      profile_created_at: new Date().toISOString()
    };

    // Create €15 welcome discount for hiker referrals
    if (link.target_type === 'hiker' && userType === 'hiker') {
      console.log('Creating €15 welcome discount for new hiker:', userId);
      
      const discountCode = `WELCOME${referralCode.substring(0, 6)}`;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 12);
      
      const { data: discount, error: discountError } = await supabase
        .from('discount_codes')
        .insert({
          code: discountCode,
          discount_type: 'fixed',
          discount_value: 15,
          scope: 'user_specific',
          user_id: userId,
          source_type: 'referral_welcome',
          source_id: link.id,
          is_active: true,
          is_public: false,
          max_uses: 1,
          times_used: 0,
          valid_from: new Date().toISOString(),
          valid_until: expiryDate.toISOString()
        })
        .select()
        .single();
      
      if (discountError) {
        console.error('Error creating welcome discount:', discountError);
      } else {
        signupData.welcome_discount_code = discountCode;
        signupData.welcome_discount_id = discount.id;
        console.log('Welcome discount created:', discountCode);
      }
    }

    const { error: signupError } = await supabase
      .from('referral_signups')
      .insert(signupData);

    if (signupError) {
      console.error('Error creating signup:', signupError);
      throw signupError;
    }

    console.log('Referral progress updated:', step);

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