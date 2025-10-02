import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')!;

interface VerificationNotificationRequest {
  verificationId: string;
  action?: 'send' | 'approve' | 'reject';
  adminNotes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

  // Format certification text with verification status and document info
  const certificationText = certifications.length > 0
    ? certifications.map((cert: any, index: number) => {
        const verificationStatus = cert.verified ? '✅ Verified' : '⏳ Pending Verification';
        const documentInfo = cert.document_url 
          ? `<${cert.document_url}|View Document>` 
          : 'No document uploaded';
        return `${index + 1}. *${cert.title || cert.type || 'Unknown Certification'}*\n   Status: ${verificationStatus} | ${documentInfo}`;
      }).join('\n\n')
    : 'No certifications listed';

  // Format verification documents
  const verificationDocs = verification.verification_documents || [];
  const documentsText = verificationDocs.length > 0
    ? verificationDocs.map((doc: string, index: number) => {
        const fileName = doc.split('/').pop() || 'Document';
        return `${index + 1}. <${supabaseUrl}/storage/v1/object/public/${doc}|${fileName}>`;
      }).join('\n')
    : 'No documents uploaded';

  const dashboardUrl = `https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/admin`;

  const message = {
    blocks: [
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
          text: `*Verification Documents:*\n${documentsText}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Additional Info:*\n• License: ${verification.license_number || 'N/A'}\n• Insurance: ${verification.insurance_info || 'N/A'}`
        }
      },
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "⚠️ *Action Required:* Please review and approve/reject this verification in the admin dashboard."
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Open Admin Dashboard",
            emoji: true
          },
          style: "primary",
          url: dashboardUrl
        }
      }
    ]
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
