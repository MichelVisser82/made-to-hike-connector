import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ProcessRewardRequest {
  referralId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: ProcessRewardRequest = await req.json();

    console.log('process-referral-reward called for referral:', body.referralId);

    // Get the referral with referrer info
    const { data: referral, error: fetchError } = await supabase
      .from('referrals')
      .select(`
        *,
        referrer:profiles!referrals_referrer_id_fkey(id, name, first_name, email),
        referee:profiles!referrals_referee_id_fkey(id, name, email)
      `)
      .eq('id', body.referralId)
      .single();

    if (fetchError || !referral) {
      console.error('Referral not found:', body.referralId);
      return new Response(
        JSON.stringify({ error: 'Referral not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if reward already issued
    if (referral.reward_status === 'issued') {
      console.log('Reward already issued for referral:', referral.id);
      return new Response(
        JSON.stringify({ success: true, message: 'Reward already issued' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (referral.reward_type === 'voucher') {
      // Issue voucher for hiker referrers
      await issueVoucher(supabase, referral);
    } else if (referral.reward_type === 'credit') {
      // Issue credit for guide referrers
      await issueCredit(supabase, referral);
    }

    // Update referral reward status
    await supabase
      .from('referrals')
      .update({
        reward_status: 'issued',
        reward_issued_at: new Date().toISOString()
      })
      .eq('id', referral.id);

    // Send thank you email to referee
    await sendRefereeThanksEmail(supabase, referral);

    console.log('Reward processed successfully for referral:', referral.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Reward processed successfully' }),
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

async function issueVoucher(supabase: any, referral: any) {
  const referrerFirstName = referral.referrer?.first_name || 'FRIEND';
  const voucherCode = `MTHREF_${referrerFirstName.toUpperCase()}_${referral.reward_amount}_${generateRandomString(6)}`;

  // Create discount code
  const { data: discountCode, error: discountError } = await supabase
    .from('discount_codes')
    .insert({
      code: voucherCode,
      discount_type: 'fixed',
      discount_value: referral.reward_amount,
      scope: 'platform',
      is_active: true,
      user_id: referral.referrer_id,
      user_email: referral.referrer?.email,
      source_type: 'referral_reward',
      source_id: referral.id,
      is_public: false,
      max_uses: 1,
      min_purchase_amount: 100,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    })
    .select()
    .single();

  if (discountError) {
    console.error('Error creating discount code:', discountError);
    throw discountError;
  }

  // Update referral with voucher info
  await supabase
    .from('referrals')
    .update({
      voucher_code: voucherCode,
      voucher_id: discountCode.id
    })
    .eq('id', referral.id);

  // Send email to referrer
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_voucher_issued_hiker',
      to: referral.referrer?.email,
      referrerName: referral.referrer?.name,
      refereeName: referral.referee?.name,
      voucherCode,
      voucherAmount: referral.reward_amount,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  });

  console.log('Voucher issued:', voucherCode);
}

async function issueCredit(supabase: any, referral: any) {
  // Create credit entry
  const { error: creditError } = await supabase
    .from('user_credits')
    .insert({
      user_id: referral.referrer_id,
      amount: referral.reward_amount,
      currency: referral.reward_currency,
      source_type: 'referral_reward',
      source_id: referral.id,
      status: 'active'
    });

  if (creditError) {
    console.error('Error creating credit:', creditError);
    throw creditError;
  }

  // Get total credits for email
  const { data: credits } = await supabase
    .from('user_credits')
    .select('amount')
    .eq('user_id', referral.referrer_id)
    .eq('status', 'active');

  const totalCredits = credits?.reduce((sum: number, c: any) => sum + c.amount, 0) || referral.reward_amount;

  // Send email to referrer
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_credit_issued_guide',
      to: referral.referrer?.email,
      referrerName: referral.referrer?.name,
      refereeName: referral.referee?.name,
      creditAmount: referral.reward_amount,
      totalCredits
    }
  });

  console.log('Credit issued:', referral.reward_amount);
}

async function sendRefereeThanksEmail(supabase: any, referral: any) {
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_completed_thanks',
      to: referral.referee?.email,
      refereeName: referral.referee?.name,
      referrerName: referral.referrer?.name
    }
  });
}

function generateRandomString(length: number): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}
