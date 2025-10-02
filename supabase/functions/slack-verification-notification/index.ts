import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Version: 4.0.0 - Secure JWT-authenticated edge function (Frontend-Driven Architecture)
const FUNCTION_VERSION = '4.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL') ?? '';

console.log(`[slack-verification-notification] Version ${FUNCTION_VERSION} initialized with JWT authentication`);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestPayload {
  verificationId: string;
  action: 'send' | 'approve' | 'reject';
  adminNotes?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`[${FUNCTION_VERSION}] Request received:`, req.method);

    // Extract JWT token from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('[auth-error] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create authenticated Supabase client using JWT
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify user identity
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[auth-error]', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`[${FUNCTION_VERSION}] Authenticated user:`, user.id);

    // Parse request payload
    const payload: RequestPayload = await req.json();
    const { verificationId, action, adminNotes } = payload;

    if (!verificationId) {
      throw new Error('verificationId is required');
    }

    // Create service role client for database operations
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch verification record
    console.log(`[${FUNCTION_VERSION}] Fetching verification:`, verificationId);
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

    // Check if user is admin
    const { data: userRole } = await serviceSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const isAdmin = userRole?.role === 'admin';

    // Handle different actions with authorization checks
    if (action === 'send') {
      // Authorization: User must own the verification OR be admin
      if (verification.user_id !== user.id && !isAdmin) {
        console.error('[auth-error] User does not own verification and is not admin');
        return new Response(
          JSON.stringify({ error: 'Forbidden: You can only send notifications for your own verifications' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Validation: Only allow pending verifications
      if (verification.verification_status !== 'pending') {
        console.error('[validation-error] Verification is not pending:', verification.verification_status);
        return new Response(
          JSON.stringify({ 
            error: 'Bad Request: Only pending verifications can be sent to Slack',
            currentStatus: verification.verification_status 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
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

      await sendSlackNotification(verification, guideProfile, serviceSupabase);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Slack notification sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
      
    } else if (action === 'approve' || action === 'reject') {
      // Authorization: Only admins can approve/reject
      if (!isAdmin) {
        console.error('[auth-error] User is not admin, cannot approve/reject');
        return new Response(
          JSON.stringify({ error: 'Forbidden: Only admins can approve or reject verifications' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
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

      await handleVerificationAction(verification, guideProfile, action, adminNotes, serviceSupabase);
      
      return new Response(
        JSON.stringify({ success: true, message: `Verification ${action}d` }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error: any) {
    console.error('[edge-function-error]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});

async function sendSlackNotification(verification: any, guideProfile: any, serviceSupabase: any) {
  console.log(`[sendSlackNotification] Starting v${FUNCTION_VERSION}`);
  
  const certifications = guideProfile?.certifications || [];
  const priorityCerts = certifications.filter((cert: any) => 
    cert.verificationPriority === 1 || cert.verificationPriority === 2
  );

  // Separate into new vs already verified
  const newCerts = priorityCerts.filter((cert: any) => 
    !cert.verified && !cert.verifiedDate
  );
  const verifiedCerts = priorityCerts.filter((cert: any) => 
    cert.verified || cert.verifiedDate
  );

  console.log(`[sendSlackNotification] Found ${newCerts.length} NEW priority certs, ${verifiedCerts.length} already verified`);

  // Generate signed URLs for certification documents (for ALL priority certs)
  const certsWithUrls = await Promise.all(
    priorityCerts.map(async (cert: any) => {
      if (cert.certificateDocument) {
        try {
          const { data: signedUrlData } = await serviceSupabase.storage
            .from('guide-documents')
            .createSignedUrl(cert.certificateDocument, 604800); // 7 days

          return {
            ...cert,
            documentUrl: signedUrlData?.signedUrl || null,
          };
        } catch (error) {
          console.error(`[cert-url-error] ${cert.title}:`, error);
          return { ...cert, documentUrl: null };
        }
      }
      return { ...cert, documentUrl: null };
    })
  );

  // Build Slack message blocks
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🏔️ New Guide Verification Request',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Guide Name:*\n${guideProfile.display_name || 'N/A'}`,
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
          text: `*Location:*\n${guideProfile.location || 'N/A'}`,
        },
        {
          type: 'mrkdwn',
          text: `*Experience:*\n${verification.experience_years || 0} years`,
        },
      ],
    },
    {
      type: 'divider',
    },
  ];

  // Section 1: NEW CERTIFICATIONS (Needs Review)
  const newCertsWithUrls = certsWithUrls.filter(c => !c.verified && !c.verifiedDate);

  if (newCertsWithUrls.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🔍 New Certifications Requiring Verification (${newCertsWithUrls.length}):*`,
      },
    });

    newCertsWithUrls.forEach((cert: any) => {
      const priorityEmoji = cert.verificationPriority === 1 ? '🔴' : '🟡';
      const certText = `${priorityEmoji} *${cert.title}*\nPriority: ${cert.verificationPriority} | Status: Pending Review`;
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: certText,
        },
      });

      if (cert.documentUrl) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `📄 <${cert.documentUrl}|View Certificate Document>`,
          },
        });
      }
    });
  }

  // Section 2: ALREADY VERIFIED (For Context)
  const verifiedCertsWithUrls = certsWithUrls.filter(c => c.verified || c.verifiedDate);

  if (verifiedCertsWithUrls.length > 0) {
    blocks.push(
      { type: 'divider' },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*✅ Already Verified Certifications (${verifiedCertsWithUrls.length}):*`,
        },
      }
    );

    verifiedCertsWithUrls.forEach((cert: any) => {
      const priorityEmoji = cert.verificationPriority === 1 ? '🔴' : '🟡';
      const certText = `${priorityEmoji} *${cert.title}*\nPriority: ${cert.verificationPriority} | Status: ✅ Verified`;
      
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: certText,
        },
      });
    });
  }

  blocks.push(
    {
      type: 'divider',
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✅ Approve',
            emoji: true,
          },
          style: 'primary',
          value: verification.id,
          action_id: 'approve_verification',
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '❌ Reject',
            emoji: true,
          },
          style: 'danger',
          value: verification.id,
          action_id: 'reject_verification',
        },
      ],
    }
  );

  // Send to Slack
  console.log(`[sendSlackNotification] Sending to Slack webhook`);
  const slackResponse = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!slackResponse.ok) {
    const errorText = await slackResponse.text();
    console.error('[slack-webhook-error]', errorText);
    throw new Error(`Slack webhook failed: ${errorText}`);
  }

  console.log(`[sendSlackNotification] Success - notification sent`);
}

async function handleVerificationAction(
  verification: any,
  guideProfile: any,
  action: 'approve' | 'reject',
  adminNotes: string | undefined,
  serviceSupabase: any
) {
  console.log(`[handleVerificationAction] ${action} for verification:`, verification.id);

  const newStatus = action === 'approve' ? 'verified' : 'rejected';

  // Update verification status
  const { error: updateError } = await serviceSupabase
    .from('user_verifications')
    .update({
      verification_status: newStatus,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', verification.id);

  if (updateError) {
    console.error('[update-verification-error]', updateError);
    throw updateError;
  }

  // If approved, update certifications in guide profile
  if (action === 'approve') {
    const certifications = guideProfile?.certifications || [];
    const updatedCerts = certifications.map((cert: any) => {
      if (cert.verificationPriority === 1 || cert.verificationPriority === 2) {
        return { ...cert, verificationStatus: 'verified' };
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

  console.log(`[handleVerificationAction] Successfully ${action}d verification`);

  // Send confirmation to Slack
  await sendSlackConfirmation(verification, guideProfile, action, adminNotes);
}

async function sendSlackConfirmation(
  verification: any,
  guideProfile: any,
  action: 'approve' | 'reject',
  adminNotes?: string
) {
  const emoji = action === 'approve' ? '✅' : '❌';
  const actionText = action === 'approve' ? 'Approved' : 'Rejected';

  const blocks: any[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *Verification ${actionText}*`,
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
          text: `*Action:*\n${actionText}`,
        },
      ],
    },
  ];

  if (adminNotes) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Admin Notes:*\n${adminNotes}`,
      },
    });
  }

  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  console.log(`[sendSlackConfirmation] Confirmation sent for ${action}`);
}
