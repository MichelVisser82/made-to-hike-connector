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
  invitationToken?: string;
}

interface DeleteInvitationRequest {
  action: 'delete_invitation';
  userId: string;
  invitationId?: string;
  refereeEmail?: string;
}

type RequestBody = GenerateLinksRequest | GetStatsRequest | SendInvitationRequest | TrackClickRequest | DeleteInvitationRequest;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body: RequestBody = await req.json();

    console.log('manage-referrals called:', body.action);

    let response;
    switch (body.action) {
      case 'generate_links':
        response = await generateLinks(supabase, body);
        break;
      case 'get_stats':
        response = await getStats(supabase, body);
        break;
      case 'send_invitation':
        response = await sendInvitation(supabase, body);
        break;
      case 'track_click':
        response = await trackClick(supabase, body);
        break;
      case 'delete_invitation':
        response = await deleteInvitation(supabase, body);
        break;
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in manage-referrals:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function generateLinks(supabase: any, body: GenerateLinksRequest) {
  const { userId, userType, firstName } = body;

  const links = {
    hikerLink: '',
    guideLink: ''
  };

  // Generate hiker referral link (all users can refer hikers)
  const hikerCode = await generateReferralCode(firstName, 'hiker');
  const { data: hikerLink, error: hikerError } = await supabase
    .from('referral_links')
    .upsert({
      referrer_id: userId,
      referrer_type: userType,
      target_type: 'hiker',
      referral_code: hikerCode,
      reward_amount: userType === 'hiker' ? 25 : 50,
      reward_type: 'voucher'
    }, {
      onConflict: 'referrer_id,target_type'
    })
    .select()
    .single();

  if (hikerError) {
    console.error('Error creating hiker link:', hikerError);
    throw hikerError;
  }

  links.hikerLink = `${Deno.env.get('APP_URL') || 'https://madetohike.com'}/join?ref=${hikerLink.referral_code}`;

  // Generate guide referral link (only if user is guide or hiker)
  const guideCode = await generateReferralCode(firstName, 'guide');
  const { data: guideLink, error: guideError } = await supabase
    .from('referral_links')
    .upsert({
      referrer_id: userId,
      referrer_type: userType,
      target_type: 'guide',
      referral_code: guideCode,
      reward_amount: 50,
      reward_type: userType === 'guide' ? 'credit' : 'voucher'
    }, {
      onConflict: 'referrer_id,target_type'
    })
    .select()
    .single();

  if (guideError) {
    console.error('Error creating guide link:', guideError);
    throw guideError;
  }

  links.guideLink = `${Deno.env.get('APP_URL') || 'https://madetohike.com'}/join?ref=${guideLink.referral_code}`;

  return { links };
}

async function getStats(supabase: any, body: GetStatsRequest) {
  const { userId } = body;

  // Get referral links
  const { data: links, error: linksError } = await supabase
    .from('referral_links')
    .select('*')
    .eq('referrer_id', userId);

  if (linksError) throw linksError;

  // If no links, return empty stats
  if (!links || links.length === 0) {
    return {
      stats: {
        total_invitations_sent: 0,
        total_signups: 0,
        pending_invitations: 0,
        clicked_invitations: 0,
        completed_signups: 0,
        pending_signups: 0,
        generic_link_signups: 0,
        email_signups: 0,
        total_rewards_issued: 0,
        invitations: [],
        signups: []
      }
    };
  }

  const linkIds = links.map((l: any) => l.id);

  // Get all invitations
  const { data: invitations, error: invitationsError } = await supabase
    .from('referral_invitations')
    .select(`
      *,
      referral_link:referral_links(target_type, reward_amount, reward_type)
    `)
    .in('referral_link_id', linkIds)
    .order('created_at', { ascending: false });

  if (invitationsError) throw invitationsError;

  // Get all signups
  const { data: signups, error: signupsError } = await supabase
    .from('referral_signups')
    .select(`
      *,
      referral_link:referral_links(target_type, reward_amount, reward_type),
      invitation:referral_invitations(referee_email)
    `)
    .in('referral_link_id', linkIds)
    .order('created_at', { ascending: false });

  if (signupsError) throw signupsError;

  // Calculate stats
  const stats = {
    total_invitations_sent: invitations.length,
    total_signups: signups.length,
    pending_invitations: invitations.filter((i: any) => i.status === 'sent').length,
    clicked_invitations: invitations.filter((i: any) => i.status === 'clicked').length,
    completed_signups: signups.filter((s: any) => s.completed_at).length,
    pending_signups: signups.filter((s: any) => !s.completed_at && s.profile_created_at).length,
    generic_link_signups: signups.filter((s: any) => s.signup_source === 'generic_link').length,
    email_signups: signups.filter((s: any) => s.signup_source === 'email_invitation').length,
    total_rewards_issued: signups.filter((s: any) => s.reward_status === 'issued').length,
    invitations: invitations.map((inv: any) => ({
      id: inv.id,
      invitation_token: inv.invitation_token,
      referee_email: inv.referee_email,
      status: inv.status,
      target_type: inv.referral_link.target_type,
      reward_amount: inv.referral_link.reward_amount,
      sent_at: inv.sent_at,
      clicked_at: inv.clicked_at,
      expires_at: inv.expires_at
    })),
    signups: signups.map((signup: any) => ({
      id: signup.id,
      user_id: signup.user_id,
      signup_email: signup.signup_email,
      signup_source: signup.signup_source,
      target_type: signup.referral_link.target_type,
      reward_amount: signup.referral_link.reward_amount,
      profile_created_at: signup.profile_created_at,
      milestone_2_at: signup.milestone_2_at,
      completed_at: signup.completed_at,
      reward_status: signup.reward_status,
      voucher_code: signup.voucher_code,
      invitation_email: signup.invitation?.referee_email
    }))
  };

  return { stats };
}

async function sendInvitation(supabase: any, body: SendInvitationRequest) {
  const { userId, targetEmail, targetType, personalMessage } = body;

  // Get the referral link for this user and target type
  const { data: link, error: linkError } = await supabase
    .from('referral_links')
    .select('*')
    .eq('referrer_id', userId)
    .eq('target_type', targetType)
    .single();

  if (linkError) {
    console.error('Error fetching referral link:', linkError);
    throw new Error('Referral link not found. Please generate links first.');
  }

  // Generate unique invitation token
  const invitationToken = `INV_${generateRandomString(10)}`;

  // Create invitation record
  const { data: invitation, error: invitationError } = await supabase
    .from('referral_invitations')
    .insert({
      referral_link_id: link.id,
      invitation_token: invitationToken,
      referee_email: targetEmail,
      personal_message: personalMessage,
      status: 'sent'
    })
    .select()
    .single();

  if (invitationError) {
    console.error('Error creating invitation:', invitationError);
    throw invitationError;
  }

  // Get referrer info for email
  const { data: referrer } = await supabase
    .from('profiles')
    .select('name, first_name')
    .eq('id', userId)
    .single();

  // Build invitation URL with both ref and inv tokens
  const invitationUrl = `${Deno.env.get('APP_URL') || 'https://madetohike.com'}/join?ref=${link.referral_code}&inv=${invitationToken}`;

  // Send invitation email
  await supabase.functions.invoke('send-email', {
    body: {
      type: 'referral_invitation',
      to: targetEmail,
      template_data: {
        referrerName: referrer?.name || 'A friend',
        refereeName: null, // Could add this if we have recipient's name
        referralLink: invitationUrl,
        personalMessage: personalMessage || null,
        targetType: targetType,
        rewardAmount: link.reward_amount
      }
    }
  });

  return { 
    success: true, 
    message: 'Invitation sent successfully',
    invitation_id: invitation.id,
    invitation_url: invitationUrl
  };
}

async function trackClick(supabase: any, body: TrackClickRequest) {
  const { referralCode, invitationToken } = body;

  // Increment click count on referral link
  const { error: linkError } = await supabase
    .from('referral_links')
    .update({ 
      click_count: supabase.raw('click_count + 1'),
      updated_at: new Date().toISOString()
    })
    .eq('referral_code', referralCode);

  if (linkError) {
    console.error('Error tracking link click:', linkError);
  }

  // If invitation token provided, update invitation
  if (invitationToken) {
    const { error: invError } = await supabase
      .from('referral_invitations')
      .update({ 
        status: 'clicked',
        clicked_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('invitation_token', invitationToken)
      .eq('status', 'sent'); // Only update if not already progressed

    if (invError) {
      console.error('Error tracking invitation click:', invError);
    }
  }

  return { success: true };
}

async function deleteInvitation(supabase: any, body: DeleteInvitationRequest) {
  const { userId, invitationId, refereeEmail } = body;

  let query = supabase.from('referral_invitations').delete();

  if (invitationId) {
    // Delete by invitation ID (verify ownership)
    const { data: invitation } = await supabase
      .from('referral_invitations')
      .select('referral_link:referral_links(referrer_id)')
      .eq('id', invitationId)
      .single();

    if (!invitation || invitation.referral_link.referrer_id !== userId) {
      throw new Error('Unauthorized to delete this invitation');
    }

    query = query.eq('id', invitationId);
  } else if (refereeEmail) {
    // Delete by email (verify ownership via link)
    const { data: links } = await supabase
      .from('referral_links')
      .select('id')
      .eq('referrer_id', userId);

    if (!links || links.length === 0) {
      throw new Error('No referral links found for this user');
    }

    const linkIds = links.map((l: any) => l.id);

    query = query
      .eq('referee_email', refereeEmail)
      .in('referral_link_id', linkIds);
  } else {
    throw new Error('Either invitationId or refereeEmail required');
  }

  const { error } = await query;

  if (error) {
    console.error('Error deleting invitation:', error);
    throw error;
  }

  return { success: true, message: 'Invitation deleted successfully' };
}

function generateReferralCode(firstName: string, type: 'hiker' | 'guide'): string {
  const prefix = firstName.substring(0, 6).toUpperCase().replace(/[^A-Z]/g, '');
  const typeChar = type === 'hiker' ? 'H' : 'G';
  const random = generateRandomString(6).toUpperCase();
  return `${prefix}_${typeChar}_${random}`;
}

function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}