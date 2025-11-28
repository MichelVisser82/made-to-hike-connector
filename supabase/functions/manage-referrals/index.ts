import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GenerateLinksRequest {
  action: 'generate_links';
  userId: string;
  userType: 'hiker' | 'guide';
  firstName: string;
}

interface GetStatsRequest {
  action: 'get_stats';
  userId: string;
}

interface SendInvitationRequest {
  action: 'send_invitation';
  userId: string;
  targetEmail: string;
  targetType: 'hiker' | 'guide';
  personalMessage?: string;
}

interface TrackClickRequest {
  action: 'track_click';
  referralCode: string;
}

type RequestBody = GenerateLinksRequest | GetStatsRequest | SendInvitationRequest | TrackClickRequest;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: RequestBody = await req.json();

    console.log('manage-referrals called with action:', body.action);

    // Route to appropriate handler
    switch (body.action) {
      case 'generate_links':
        return await generateLinks(supabase, body);
      case 'get_stats':
        return await getStats(supabase, body);
      case 'send_invitation':
        return await sendInvitation(supabase, body);
      case 'track_click':
        return await trackClick(supabase, body);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Error in manage-referrals:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateLinks(supabase: any, body: GenerateLinksRequest) {
  const { userId, userType, firstName } = body;

  // Check if links already exist
  const { data: existingReferrals } = await supabase
    .from('referrals')
    .select('referral_code, target_type')
    .eq('referrer_id', userId)
    .in('status', ['link_sent', 'profile_created', 'milestone_2']);

  const existingCodes: { [key: string]: string } = {};
  existingReferrals?.forEach((ref: any) => {
    existingCodes[ref.target_type] = ref.referral_code;
  });

  const links: { [key: string]: string } = {};

  // Generate hiker link (only for hikers)
  if (userType === 'hiker') {
    if (existingCodes['hiker']) {
      links.hikerLink = `${Deno.env.get('SITE_URL') || 'https://madetohike.com'}/join?ref=${existingCodes['hiker']}`;
    } else {
      const hikerCode = generateReferralCode(firstName, 'hiker');
      await createReferral(supabase, userId, userType, hikerCode, 'hiker');
      links.hikerLink = `${Deno.env.get('SITE_URL') || 'https://madetohike.com'}/join?ref=${hikerCode}`;
    }
  }

  // Generate guide link (for both hikers and guides)
  if (existingCodes['guide']) {
    links.guideLink = `${Deno.env.get('SITE_URL') || 'https://madetohike.com'}/guides/join?ref=${existingCodes['guide']}`;
  } else {
    const guideCode = generateReferralCode(firstName, 'guide');
    await createReferral(supabase, userId, userType, guideCode, 'guide');
    links.guideLink = `${Deno.env.get('SITE_URL') || 'https://madetohike.com'}/guides/join?ref=${guideCode}`;
  }

  console.log('Generated links:', links);

  return new Response(
    JSON.stringify({ success: true, links }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getStats(supabase: any, body: GetStatsRequest) {
  const { userId } = body;

  // Get user type
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  const userType = userRoles?.role || 'hiker';

  // Get referral statistics
  const { data: referrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId);

  const totalInvites = referrals?.length || 0;
  const acceptedInvites = referrals?.filter((r: any) => 
    ['profile_created', 'milestone_2', 'completed'].includes(r.status)
  ).length || 0;
  const completedInvites = referrals?.filter((r: any) => r.status === 'completed').length || 0;

  let stats: any = {
    totalInvites,
    acceptedInvites,
    completedInvites,
    referrals: referrals || []
  };

  if (userType === 'hiker') {
    // Get vouchers
    const { data: vouchers } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('source_type', 'referral_reward')
      .eq('is_active', true);

    const totalVouchersValue = vouchers?.reduce((sum: number, v: any) => 
      sum + (v.discount_type === 'fixed' ? v.discount_value : 0), 0) || 0;
    
    const availableVouchers = vouchers?.filter((v: any) => v.times_used === 0) || [];
    const availableVouchersValue = availableVouchers.reduce((sum: number, v: any) => 
      sum + (v.discount_type === 'fixed' ? v.discount_value : 0), 0) || 0;

    stats.vouchers = vouchers || [];
    stats.totalVouchersValue = totalVouchersValue;
    stats.availableVouchersValue = availableVouchersValue;
  } else if (userType === 'guide') {
    // Get credits
    const { data: credits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId);

    const activeCredits = credits?.filter((c: any) => c.status === 'active') || [];
    const availableCredits = activeCredits.reduce((sum: number, c: any) => sum + c.amount, 0);
    const totalCredits = credits?.reduce((sum: number, c: any) => 
      c.source_type !== 'withdrawal' ? sum + c.amount : sum, 0) || 0;
    
    const pendingReferrals = referrals?.filter((r: any) => 
      ['profile_created', 'milestone_2'].includes(r.status)
    ) || [];
    const pendingCredits = pendingReferrals.reduce((sum: number, r: any) => 
      sum + (r.reward_amount || 0), 0);

    stats.credits = credits || [];
    stats.availableCredits = availableCredits;
    stats.totalCredits = totalCredits;
    stats.pendingCredits = pendingCredits;
  }

  return new Response(
    JSON.stringify({ success: true, stats }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendInvitation(supabase: any, body: SendInvitationRequest) {
  const { userId, targetEmail, targetType, personalMessage } = body;

  // Get referrer info
  const { data: referrer } = await supabase
    .from('profiles')
    .select('name, first_name')
    .eq('id', userId)
    .single();

  // Check if referral code exists for this target type
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('referral_code')
    .eq('referrer_id', userId)
    .eq('target_type', targetType)
    .single();

  let referralCode = existingReferral?.referral_code;
  
  if (!referralCode) {
    referralCode = generateReferralCode(referrer?.first_name || 'Friend', targetType);
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    await createReferral(supabase, userId, userRoles?.role || 'hiker', referralCode, targetType);
  }

  const referralUrl = targetType === 'hiker' 
    ? `${Deno.env.get('SITE_URL') || 'https://madetohike.com'}/join?ref=${referralCode}`
    : `${Deno.env.get('SITE_URL') || 'https://madetohike.com'}/guides/join?ref=${referralCode}`;

  // Get referrer role to determine referrerType
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  // Send email via send-email function
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_invitation',
      to: targetEmail,
      data: {
        referrerName: referrer?.name || 'A friend',
        referrerType: userRoles?.role || 'hiker',
        referralLink: referralUrl,
        personalMessage: personalMessage || null
      }
    }
  });

  console.log('Invitation sent to:', targetEmail);

  return new Response(
    JSON.stringify({ success: true, message: 'Invitation sent successfully' }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function trackClick(supabase: any, body: TrackClickRequest) {
  const { referralCode } = body;

  // Increment click count
  const { error } = await supabase
    .from('referrals')
    .update({ 
      click_count: supabase.raw('click_count + 1'),
      updated_at: new Date().toISOString()
    })
    .eq('referral_code', referralCode);

  if (error) {
    console.error('Error tracking click:', error);
  }

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper functions
function generateReferralCode(firstName: string, type: 'hiker' | 'guide'): string {
  const cleanName = firstName.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 6);
  const typeCode = type === 'hiker' ? 'H' : 'G';
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${cleanName}_${typeCode}_${random}`;
}

async function createReferral(
  supabase: any,
  referrerId: string,
  referrerType: 'hiker' | 'guide',
  referralCode: string,
  targetType: 'hiker' | 'guide'
) {
  // Determine reward amount based on referrer and target type
  let rewardAmount: number;
  let rewardType: 'voucher' | 'credit';

  if (referrerType === 'hiker' && targetType === 'hiker') {
    rewardAmount = 25;
    rewardType = 'voucher';
  } else if (referrerType === 'hiker' && targetType === 'guide') {
    rewardAmount = 50;
    rewardType = 'voucher';
  } else if (referrerType === 'guide' && targetType === 'guide') {
    rewardAmount = 50;
    rewardType = 'credit';
  } else {
    throw new Error('Invalid referrer-target combination');
  }

  const { error } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrerId,
      referrer_type: referrerType,
      referral_code: referralCode,
      target_type: targetType,
      reward_amount: rewardAmount,
      reward_type: rewardType,
      status: 'link_sent'
    });

  if (error) {
    console.error('Error creating referral:', error);
    throw error;
  }

  console.log('Created referral:', referralCode);
}
