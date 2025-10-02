import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Version: 1.0.0 - Direct Slack Interactive Handler
const FUNCTION_VERSION = '1.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL') ?? '';
const slackSigningSecret = Deno.env.get('SLACK_SIGNING_SECRET') ?? '';

console.log(`[slack-interactive-handler] Version ${FUNCTION_VERSION} initialized`);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'x-slack-signature, x-slack-request-timestamp, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${FUNCTION_VERSION}] Request received from Slack`);

    // Verify Slack signature
    const slackSignature = req.headers.get('x-slack-signature');
    const slackTimestamp = req.headers.get('x-slack-request-timestamp');
    const requestBody = await req.text();

    if (!slackSignature || !slackTimestamp) {
      console.error('[slack-auth-error] Missing Slack headers');
      return new Response(
        JSON.stringify({ error: 'Missing Slack authentication headers' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify timestamp is recent (within 5 minutes)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTimestamp - parseInt(slackTimestamp)) > 300) {
      console.error('[slack-auth-error] Timestamp too old');
      return new Response(
        JSON.stringify({ error: 'Request timestamp too old' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify Slack signature using Web Crypto API
    const sigBasestring = `v0:${slackTimestamp}:${requestBody}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(slackSigningSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(sigBasestring)
    );
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const mySignature = `v0=${hashHex}`;

    if (mySignature !== slackSignature) {
      console.error('[slack-auth-error] Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Invalid Slack signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('[slack-auth] Signature verified successfully');

    // Parse Slack payload
    const payload = JSON.parse(new URLSearchParams(requestBody).get('payload') || '{}');
    console.log('[slack-payload]', JSON.stringify(payload, null, 2));

    const action = payload.actions?.[0];
    if (!action) {
      throw new Error('No action found in payload');
    }

    const actionId = action.action_id;
    const actionValue = JSON.parse(action.value);
    const verificationId = actionValue.verificationId;
    const user = payload.user;

    console.log(`[slack-action] Action: ${actionId}, VerificationId: ${verificationId}, User: ${user.name}`);

    // Immediate response to Slack (must be within 3 seconds)
    const responsePromise = handleVerificationAction(
      verificationId,
      actionId,
      user.name,
      payload.response_url
    );

    // Respond immediately with acknowledgment
    const immediateResponse = new Response(
      JSON.stringify({
        replace_original: true,
        text: `⏳ Processing ${actionId === 'approve_verification' ? 'verification' : 'rejection'}...`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

    // Process in background
    responsePromise.catch(error => {
      console.error('[background-error]', error);
    });

    return immediateResponse;

  } catch (error: any) {
    console.error('[edge-function-error]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

async function handleVerificationAction(
  verificationId: string,
  actionId: string,
  slackUserName: string,
  responseUrl: string
) {
  console.log(`[handleVerificationAction] Processing ${actionId} for ${verificationId}`);

  const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

  // Fetch verification record
  const { data: verification, error: verificationError } = await serviceSupabase
    .from('user_verifications')
    .select(`
      *,
      profiles:user_id (
        id,
        email,
        name
      )
    `)
    .eq('id', verificationId)
    .single();

  if (verificationError || !verification) {
    console.error('[verification-error]', verificationError);
    throw new Error(`Verification not found: ${verificationError?.message}`);
  }

  // Fetch guide profile
  const { data: guideProfile, error: guideError } = await serviceSupabase
    .from('guide_profiles')
    .select('*')
    .eq('user_id', verification.user_id)
    .single();

  if (guideError || !guideProfile) {
    console.error('[guide-error]', guideError);
    throw new Error(`Guide profile not found: ${guideError?.message}`);
  }

  const action = actionId === 'approve_verification' ? 'verify' : 'reject';
  const newStatus = action === 'verify' ? 'approved' : 'rejected';

  // Update verification status
  const { error: updateError } = await serviceSupabase
    .from('user_verifications')
    .update({
      verification_status: newStatus,
      admin_notes: `${action === 'verify' ? 'Verified' : 'Rejected'} by ${slackUserName} via Slack`,
      updated_at: new Date().toISOString(),
    })
    .eq('id', verificationId);

  if (updateError) {
    console.error('[update-verification-error]', updateError);
    throw updateError;
  }

  // If verified, update certifications in guide profile with timestamps
  if (action === 'verify') {
    const certifications = guideProfile?.certifications || [];
    const verifiedTimestamp = new Date().toISOString();
    const updatedCerts = certifications.map((cert: any) => {
      if (cert.verificationPriority === 1 || cert.verificationPriority === 2) {
        return { 
          ...cert, 
          verificationStatus: 'verified',
          verifiedDate: verifiedTimestamp,
          verifiedBy: slackUserName
        };
      }
      return cert;
    });

    const { error: profileError } = await serviceSupabase
      .from('guide_profiles')
      .update({
        certifications: updatedCerts,
        verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', verification.user_id);

    if (profileError) {
      console.error('[update-profile-error]', profileError);
      throw profileError;
    }
  }

  console.log(`[handleVerificationAction] Successfully ${action === 'verify' ? 'verified' : 'rejected'} verification`);

  // Update the original message
  const emoji = action === 'verify' ? '✅' : '❌';
  const actionText = action === 'verify' ? 'Verified' : 'Rejected';

  await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      replace_original: true,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${emoji} Verification ${actionText}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Guide:*\n${guideProfile.display_name}`,
            },
            {
              type: 'mrkdwn',
              text: `*Email:*\n${verification.profiles?.email || 'N/A'}`,
            },
          ],
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Action:*\n${actionText}`,
            },
            {
              type: 'mrkdwn',
              text: `*By:*\n@${slackUserName}`,
            },
          ],
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date().toISOString()}`,
          },
        },
      ],
    }),
  });

  // Send confirmation to Slack channel
  await sendSlackConfirmation(guideProfile, action, slackUserName);

  console.log(`[handleVerificationAction] Complete - message updated`);
}

async function sendSlackConfirmation(
  guideProfile: any,
  action: 'verify' | 'reject',
  slackUserName: string
) {
  const emoji = action === 'verify' ? '✅' : '❌';
  const actionText = action === 'verify' ? 'Verified' : 'Rejected';

  const blocks: any[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *Verification ${actionText}* by @${slackUserName}`,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Guide:*\n${guideProfile.display_name}`,
        },
        {
          type: 'mrkdwn',
          text: `*Location:*\n${guideProfile.location || 'N/A'}`,
        },
      ],
    },
  ];

  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  console.log(`[sendSlackConfirmation] Confirmation sent for ${action}`);
}
