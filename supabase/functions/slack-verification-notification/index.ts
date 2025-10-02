import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Version: 4.0.0 - Secure JWT-authenticated architecture
const FUNCTION_VERSION = '4.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL') ?? '';

console.log(`[slack-verification-notification] Version ${FUNCTION_VERSION} initialized (JWT required)`);

interface RequestPayload {
  verificationId: string;
  action: 'send' | 'approve' | 'reject';
  adminNotes?: string;
}

serve(async (req: Request) => {
  try {
    console.log(`[${FUNCTION_VERSION}] Request received:`, req.method);

    // Extract JWT from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user identity
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('[auth-error]', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
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
      return new Response(
        JSON.stringify({ error: 'Verification not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: userRole } = await serviceSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!userRole;

    // Handle different actions
    if (action === 'send') {
      // Validate: user owns verification OR is admin
      if (verification.user_id !== user.id && !isAdmin) {
        console.error('[ownership-error] User does not own verification');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: You can only send notifications for your own verifications' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Validate: verification status is pending
      if (verification.verification_status !== 'pending') {
        console.error('[status-error] Verification is not pending:', verification.verification_status);
        return new Response(
          JSON.stringify({ error: 'Can only send notifications for pending verifications' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
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
        return new Response(
          JSON.stringify({ error: 'Guide profile not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      await sendSlackNotification(verification, guideProfile, serviceSupabase);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Slack notification sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );

    } else if (action === 'approve' || action === 'reject') {
      // Only admins can approve/reject
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Only admins can approve/reject verifications' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Fetch guide profile
      const { data: guideProfile } = await serviceSupabase
        .from('guide_profiles')
        .select('*')
        .eq('user_id', verification.user_id)
        .single();

      await handleVerificationAction(verification, guideProfile, action, adminNotes, serviceSupabase);
      
      return new Response(
        JSON.stringify({ success: true, message: `Verification ${action}d` }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[edge-function-error]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function sendSlackNotification(verification: any, guideProfile: any, supabase: any) {
  console.log(`[sendSlackNotification] Starting v${FUNCTION_VERSION}`);
  
  const certifications = guideProfile?.certifications || [];
  const priorityCerts = certifications.filter((cert: any) => 
    cert.verificationPriority === 1 || cert.verificationPriority === 2
  );

  console.log(`[sendSlackNotification] Found ${priorityCerts.length} priority certs`);

  // Generate signed URLs for certification documents
  const certsWithUrls = await Promise.all(
    priorityCerts.map(async (cert: any) => {
      if (cert.documentPath) {
        try {
          const { data: signedUrlData } = await supabase.storage
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
      const priorityEmoji = cert.verificationPriority === 1 ? '🔴' : '🟡';
      const certText = `${priorityEmoji} *${cert.title}*\nPriority: ${cert.verificationPriority} | Status: ${cert.verificationStatus || 'pending'}`;
      
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
  adminNotes: string | undefined,
  supabase: any
) {
  console.log(`[handleVerificationAction] ${action} for verification:`, verification.id);

  const newStatus = action === 'approve' ? 'verified' : 'rejected';

  // Update verification status
  const { error: updateError } = await supabase
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

    const { error: profileError } = await supabase
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
