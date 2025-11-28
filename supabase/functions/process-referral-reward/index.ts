import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ProcessRewardRequest {
  signupId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { signupId }: ProcessRewardRequest = await req.json();

    console.log('process-referral-reward called for signup:', signupId);

    // Get signup with link details
    const { data: signup, error: signupError } = await supabase
      .from('referral_signups')
      .select(`
        *,
        referral_link:referral_links(
          referrer_id,
          referrer_type,
          target_type,
          reward_amount,
          reward_currency,
          reward_type
        )
      `)
      .eq('id', signupId)
      .single();
    
    // Fetch referee profile separately
    if (signup && !signupError) {
      const { data: refereeProfile } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', signup.user_id)
        .single();
      
      signup.referee = refereeProfile;
    }

    if (signupError || !signup) {
      console.error('Signup not found:', signupId);
      throw new Error('Signup not found');
    }

    // Check if reward already issued
    if (signup.reward_status === 'issued') {
      console.log('Reward already issued for signup:', signupId);
      return new Response(
        JSON.stringify({ message: 'Reward already issued' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if referral is completed
    if (!signup.completed_at) {
      throw new Error('Referral not completed yet');
    }

    const link = signup.referral_link;

    // Issue reward based on type
    if (link.reward_type === 'voucher') {
      await issueVoucher(supabase, signup, link);
    } else if (link.reward_type === 'credit') {
      await issueCredit(supabase, signup, link);
    }

    // Update signup reward status
    await supabase
      .from('referral_signups')
      .update({
        reward_status: 'issued',
        reward_issued_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', signupId);

    // Send thank you email to referee
    await sendRefereeThanksEmail(supabase, signup);

    return new Response(
      JSON.stringify({ success: true, message: 'Reward issued successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in process-referral-reward:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function issueVoucher(supabase: any, signup: any, link: any) {
  const voucherCode = `REF${generateRandomString(8).toUpperCase()}`;
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 12);

  const { data: voucher, error: voucherError } = await supabase
    .from('discount_codes')
    .insert({
      code: voucherCode,
      discount_type: 'fixed',
      discount_value: link.reward_amount,
      scope: 'user_specific',
      user_id: link.referrer_id,
      source_type: 'referral_reward',
      source_id: signup.id,
      is_active: true,
      is_public: false,
      max_uses: 1,
      times_used: 0,
      valid_from: new Date().toISOString(),
      valid_until: expiryDate.toISOString()
    })
    .select()
    .single();

  if (voucherError) {
    console.error('Error creating voucher:', voucherError);
    throw voucherError;
  }

  // Update signup with voucher info
  await supabase
    .from('referral_signups')
    .update({
      voucher_code: voucherCode,
      voucher_id: voucher.id
    })
    .eq('id', signup.id);

  // Get referrer info
  const { data: referrer } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', link.referrer_id)
    .single();

  // Send email to referrer
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_success',
      to: referrer.email,
      template_data: {
        referrer_name: referrer.name,
        referee_name: signup.referee?.name || 'your referral',
        reward_type: 'voucher',
        reward_amount: link.reward_amount,
        voucher_code: voucherCode,
        voucher_expiry: expiryDate.toISOString()
      }
    }
  });

  console.log('Voucher issued:', voucherCode);
}

async function issueCredit(supabase: any, signup: any, link: any) {
  const { error: creditError } = await supabase
    .from('user_credits')
    .insert({
      user_id: link.referrer_id,
      amount: link.reward_amount,
      currency: link.reward_currency || 'EUR',
      source_type: 'referral_reward',
      source_id: signup.id,
      status: 'active',
      notes: 'Referral reward - valid for 12 months'
    });

  if (creditError) {
    console.error('Error creating credit:', creditError);
    throw creditError;
  }

  // Get referrer info and total credits
  const { data: referrer } = await supabase
    .from('profiles')
    .select('name, email')
    .eq('id', link.referrer_id)
    .single();

  const { data: credits } = await supabase
    .from('user_credits')
    .select('amount')
    .eq('user_id', link.referrer_id)
    .eq('status', 'active');

  const totalCredits = credits?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0;

  // Send email to referrer
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_success',
      to: referrer.email,
      template_data: {
        referrer_name: referrer.name,
        referee_name: signup.referee?.name || 'your referral',
        reward_type: 'credit',
        reward_amount: link.reward_amount,
        total_credits: totalCredits
      }
    }
  });

  console.log('Credit issued:', link.reward_amount);
}

async function sendRefereeThanksEmail(supabase: any, signup: any) {
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_welcome',
      to: signup.referee?.email || signup.signup_email,
      template_data: {
        referee_name: signup.referee?.name || 'there'
      }
    }
  });
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}