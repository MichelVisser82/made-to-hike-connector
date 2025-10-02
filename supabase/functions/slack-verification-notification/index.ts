import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-slack-signature, x-slack-request-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')!;
const slackSigningSecret = Deno.env.get('SLACK_SIGNING_SECRET') || '';

interface VerificationNotificationRequest {
  verificationId: string;
  action?: 'send' | 'approve' | 'reject';
  adminNotes?: string;
}

// Verify Slack signature for security
async function verifySlackSignature(
  timestamp: string,
  body: string,
  signature: string
): Promise<boolean> {
  if (!slackSigningSecret) {
    console.warn('SLACK_SIGNING_SECRET not set, skipping signature verification');
    return true; // Allow in development
  }
  
  const time = parseInt(timestamp);
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Request is too old (>5 minutes)
  if (Math.abs(currentTime - time) > 300) {
    return false;
  }
  
  const sigBasestring = `v0:${timestamp}:${body}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(slackSigningSecret);
  const msgData = encoder.encode(sigBasestring);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, msgData);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  const mySignature = `v0=${hashHex}`;
  
  return mySignature === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const contentType = req.headers.get('content-type') || '';
    
    // Handle Slack interactive component callback
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const bodyText = await req.text();
      const timestamp = req.headers.get('x-slack-request-timestamp');
      const signature = req.headers.get('x-slack-signature');
      
      // Verify Slack signature
      const isValid = await verifySlackSignature(timestamp || '', bodyText, signature || '');
      if (!timestamp || !signature || !isValid) {
        console.error('Invalid Slack signature');
        return new Response('Unauthorized', { status: 401, headers: corsHeaders });
      }
      
      // Parse the payload
      const params = new URLSearchParams(bodyText);
      const payloadJson = params.get('payload');
      
      if (!payloadJson) {
        throw new Error('No payload found');
      }
      
      const payload = JSON.parse(payloadJson);
      const action = payload.actions[0];
      const verificationId = action.value;
      const actionType = action.action_id; // 'approve' or 'reject'
      
      console.log('Processing Slack action:', { verificationId, actionType });
      
      // Fetch verification details
      const { data: verification, error: verificationError } = await supabase
        .from('user_verifications')
        .select(`
          *,
          profiles!inner(email, name)
        `)
        .eq('id', verificationId)
        .single();

      if (verificationError) {
        throw new Error(`Failed to fetch verification: ${verificationError.message}`);
      }

      // Fetch guide profile
      const { data: guideProfile } = await supabase
        .from('guide_profiles')
        .select('display_name, profile_image_url, certifications, experience_years, location')
        .eq('user_id', verification.user_id)
        .single();
      
      // Update verification status
      const newStatus = actionType === 'approve' ? 'approved' : 'rejected';
      
      const { error: updateError } = await supabase
        .from('user_verifications')
        .update({
          verification_status: newStatus,
          admin_notes: `${actionType === 'approve' ? 'Approved' : 'Rejected'} via Slack`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      if (updateError) {
        throw new Error(`Failed to update verification: ${updateError.message}`);
      }

      // If approved, update guide profile
      if (actionType === 'approve') {
        const { error: profileError } = await supabase
          .from('guide_profiles')
          .update({ verified: true })
          .eq('user_id', verification.user_id);

        if (profileError) {
          console.error('Failed to update guide profile:', profileError);
        }
      }
      
      // Respond to Slack immediately with a message update
      const emoji = actionType === 'approve' ? '✅' : '❌';
      const statusText = actionType === 'approve' ? 'APPROVED' : 'REJECTED';
      const color = actionType === 'approve' ? '#36a64f' : '#ff0000';
      
      return new Response(
        JSON.stringify({
          replace_original: true,
          text: `${emoji} Verification ${statusText}`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: `${emoji} Verification ${statusText}`,
                emoji: true
              }
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Guide:*\n${guideProfile?.display_name || verification.profiles.name}`
                },
                {
                  type: "mrkdwn",
                  text: `*Email:*\n${verification.profiles.email}`
                },
                {
                  type: "mrkdwn",
                  text: `*Status:*\n${statusText}`
                },
                {
                  type: "mrkdwn",
                  text: `*Action By:*\n${payload.user.name}`
                }
              ]
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: actionType === 'approve' 
                  ? "✅ *The guide has been verified and can now create tours.*"
                  : "❌ *The verification has been rejected. The guide can resubmit with updated information.*"
              }
            }
          ],
          attachments: [
            {
              color: color,
              text: `Processed at ${new Date().toLocaleString()}`
            }
          ]
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Handle regular API call (send notification)
    const body: VerificationNotificationRequest = await req.json();
    const { verificationId, action = 'send', adminNotes } = body;

    console.log('Processing verification action:', { verificationId, action });

    // Fetch verification details
    const { data: verification, error: verificationError } = await supabase
      .from('user_verifications')
      .select(`
        *,
        profiles!inner(email, name)
      `)
      .eq('id', verificationId)
      .single();

    if (verificationError) {
      throw new Error(`Failed to fetch verification: ${verificationError.message}`);
    }

    // Fetch guide profile
    const { data: guideProfile } = await supabase
      .from('guide_profiles')
      .select('display_name, profile_image_url, certifications, experience_years, location')
      .eq('user_id', verification.user_id)
      .single();

    if (action === 'send') {
      // Send notification to Slack
      await sendSlackNotification(verification, guideProfile);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Notification sent to Slack' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'approve' || action === 'reject') {
      // Update verification status
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error: updateError } = await supabase
        .from('user_verifications')
        .update({
          verification_status: newStatus,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', verificationId);

      if (updateError) {
        throw new Error(`Failed to update verification: ${updateError.message}`);
      }

      // If approved, update guide profile
      if (action === 'approve') {
        const { error: profileError } = await supabase
          .from('guide_profiles')
          .update({ verified: true })
          .eq('user_id', verification.user_id);

        if (profileError) {
          console.error('Failed to update guide profile:', profileError);
        }
      }

      // Send confirmation to Slack
      await sendSlackConfirmation(verification, guideProfile, newStatus, adminNotes);

      return new Response(
        JSON.stringify({ success: true, message: `Verification ${newStatus}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error('Error in slack-verification-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function sendSlackNotification(verification: any, guideProfile: any) {
  const certifications = guideProfile?.certifications || [];
  const priorityCerts = certifications.filter((cert: any) => 
    ['IFMGA', 'UIAGM', 'IVBV', 'BMG'].includes(cert.type)
  );

  // Format certification text with verification status
  const certificationText = certifications.length > 0
    ? certifications.map((cert: any, index: number) => {
        const verificationStatus = cert.verified ? '✅ Verified' : '⏳ Pending Verification';
        return `${index + 1}. *${cert.title || cert.type || 'Unknown Certification'}*\n   Status: ${verificationStatus}`;
      }).join('\n\n')
    : 'No certifications listed';

  const dashboardUrl = `https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/admin`;

  // Build blocks array
  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🏔️ New Guide Verification Request",
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Guide Name:*\n${guideProfile?.display_name || verification.profiles.name}`
        },
        {
          type: "mrkdwn",
          text: `*Email:*\n${verification.profiles.email}`
        },
        {
          type: "mrkdwn",
          text: `*Location:*\n${guideProfile?.location || 'Not specified'}`
        },
        {
          type: "mrkdwn",
          text: `*Experience:*\n${guideProfile?.experience_years || verification.experience_years || 0} years`
        },
        {
          type: "mrkdwn",
          text: `*Priority:*\n${priorityCerts.length > 0 ? '🔴 High (IFMGA/UIAGM)' : '🟡 Standard'}`
        },
        {
          type: "mrkdwn",
          text: `*Company:*\n${verification.company_name || 'Not specified'}`
        }
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Certifications:*\n${certificationText}`
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Additional Info:*\n• License: ${verification.license_number || 'N/A'}\n• Insurance: ${verification.insurance_info || 'N/A'}`
      }
    }
  ];

  // Add verification documents as embedded images
  const verificationDocs = verification.verification_documents || [];
  if (verificationDocs.length > 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Verification Documents:*"
      }
    });

    // Add each document as an image block
    verificationDocs.forEach((doc: string, index: number) => {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${doc}`;
      const fileName = doc.split('/').pop() || `Document ${index + 1}`;
      
      blocks.push({
        type: "image",
        image_url: publicUrl,
        alt_text: fileName,
        title: {
          type: "plain_text",
          text: fileName
        }
      });
    });
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Verification Documents:* No documents uploaded"
      }
    });
  }

  // Add divider and action buttons
  blocks.push(
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "⚠️ *Action Required:* Please review and approve or reject this verification."
      }
    },
    {
      type: "actions",
      block_id: "verification_actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "✅ Approve",
            emoji: true
          },
          style: "primary",
          action_id: "approve",
          value: verification.id
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "❌ Reject",
            emoji: true
          },
          style: "danger",
          action_id: "reject",
          value: verification.id
        }
      ]
    }
  );

  const message = {
    blocks: blocks
  };

  const response = await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.statusText}`);
  }

  console.log('Slack notification sent successfully');
}

async function sendSlackConfirmation(
  verification: any,
  guideProfile: any,
  status: string,
  adminNotes?: string
) {
  const emoji = status === 'approved' ? '✅' : '❌';
  const color = status === 'approved' ? '#36a64f' : '#ff0000';
  
  const message = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${emoji} *Verification ${status.toUpperCase()}*\n\n*Guide:* ${guideProfile?.display_name || verification.profiles.name}\n*Email:* ${verification.profiles.email}${adminNotes ? `\n*Admin Notes:* ${adminNotes}` : ''}`
        }
      }
    ],
    attachments: [
      {
        color: color,
        text: status === 'approved' 
          ? 'The guide has been verified and can now create tours.'
          : 'The guide verification has been rejected. They can resubmit with updated information.'
      }
    ]
  };

  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });

  console.log('Slack confirmation sent successfully');
}
