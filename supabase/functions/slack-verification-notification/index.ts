import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Version: 3.0.0 - Complete backend refactor with database triggers
const FUNCTION_VERSION = '3.0.0';

// Create single service role client at module level
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL') ?? '';
const slackSigningSecret = Deno.env.get('SLACK_SIGNING_SECRET') ?? '';

const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

console.log(`[slack-verification-notification] Version ${FUNCTION_VERSION} initialized`);

interface RequestPayload {
  verificationId: string;
  action: 'send' | 'approve' | 'reject';
  adminNotes?: string;
}

serve(async (req: Request) => {
  try {
    console.log(`[${FUNCTION_VERSION}] Request received:`, req.method);

    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, content-type',
        },
      });
    }

    // Only parse JSON for POST requests
    const payload: RequestPayload = await req.json();
    console.log(`[${FUNCTION_VERSION}] Payload:`, JSON.stringify(payload, null, 2));

    const { verificationId, action, adminNotes } = payload;

    if (!verificationId) {
      throw new Error('verificationId is required');
    }

    // Fetch verification record with related data
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

    console.log(`[${FUNCTION_VERSION}] Verification found for user:`, verification.user_id);

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

    console.log(`[${FUNCTION_VERSION}] Guide profile found:`, guideProfile.display_name);

    // Handle different actions
    if (action === 'send') {
      await sendSlackNotification(verification, guideProfile);
      return new Response(
        JSON.stringify({ success: true, message: 'Slack notification sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else if (action === 'approve' || action === 'reject') {
      await handleVerificationAction(verification, guideProfile, action, adminNotes);
      return new Response(
        JSON.stringify({ success: true, message: `Verification ${action}d` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error: any) {
    console.error('[edge-function-error]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function sendSlackNotification(verification: any, guideProfile: any) {
  console.log(`[sendSlackNotification] Starting v${FUNCTION_VERSION}`);
  
  const certifications = guideProfile?.certifications || [];
  const priorityCerts = certifications.filter((cert: any) => 
    cert.priority === 1 || cert.priority === 2
  );

  console.log(`[sendSlackNotification] Found ${priorityCerts.length} priority certs`);

  // Generate signed URLs for certification documents
  const certsWithUrls = await Promise.all(
    priorityCerts.map(async (cert: any) => {
      if (cert.documentPath) {
        try {
          const { data: signedUrlData } = await serviceSupabase.storage
            .from('guide-documents')
            .createSignedUrl(cert.documentPath, 604800); // 7 days

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

  // Add certifications section
  if (certsWithUrls.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*Priority Certifications for Review:*',
      },
    });

    certsWithUrls.forEach((cert: any) => {
      const priorityEmoji = cert.priority === 1 ? '🔴' : '🟡';
      const certText = `${priorityEmoji} *${cert.title}*\nPriority: ${cert.priority} | Status: ${cert.verificationStatus || 'pending'}`;
      
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
  adminNotes?: string
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
      if (cert.priority === 1 || cert.priority === 2) {
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
