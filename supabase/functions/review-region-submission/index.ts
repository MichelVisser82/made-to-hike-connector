import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { Resend } from 'npm:resend@4.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify admin user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    const { submission_id, action, declined_reason } = await req.json();

    if (!submission_id || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: submission_id, action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (action === 'decline' && !declined_reason) {
      return new Response(
        JSON.stringify({ error: 'Declined reason is required when declining' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get submission details
    const { data: submission, error: submissionError } = await supabaseClient
      .from('user_submitted_regions')
      .select('*, submitted_by')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get guide profile and email
    const { data: guideProfile } = await supabaseClient
      .from('profiles')
      .select('email, name')
      .eq('id', submission.submitted_by)
      .single();

    // Update submission status
    const newStatus = action === 'approve' ? 'approved' : 'declined';
    const { error: updateError } = await supabaseClient
      .from('user_submitted_regions')
      .update({
        verification_status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        declined_reason: action === 'decline' ? declined_reason : null,
      })
      .eq('id', submission_id);

    if (updateError) {
      throw updateError;
    }

    // Find and update the associated ticket
    const regionDisplayName = submission.region 
      ? `${submission.country} - ${submission.region} - ${submission.subregion}`
      : `${submission.country} - ${submission.subregion}`;

    const { data: ticket } = await supabaseClient
      .from('tickets')
      .select('id, conversation_id')
      .eq('title', `Region Submission: ${regionDisplayName}`)
      .eq('category', 'region_submission')
      .single();

    if (ticket) {
      // Update ticket status
      const ticketStatus = action === 'approve' ? 'resolved' : 'closed';
      await supabaseClient
        .from('tickets')
        .update({
          status: ticketStatus,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', ticket.id);

      // Add a message to the conversation with the decision
      const decisionMessage = action === 'approve'
        ? `✅ **Region Approved**\n\nYour region submission has been approved and is now available for all guides to use.`
        : `❌ **Region Declined**\n\n**Reason:** ${declined_reason}\n\nYour tours using this region have been temporarily taken offline. Please update them with an approved region from your dashboard.`;

      await supabaseClient
        .from('messages')
        .insert({
          conversation_id: ticket.conversation_id,
          sender_id: user.id,
          sender_type: 'guide',
          sender_name: 'Admin',
          content: decisionMessage,
          message_type: 'text',
        });

      console.log(`Ticket ${ticketStatus} for region submission`);
    }

    // Send email notification if declined
    if (action === 'decline' && guideProfile?.email) {
      const regionName = submission.region 
        ? `${submission.country} - ${submission.region} - ${submission.subregion}`
        : `${submission.country} - ${submission.subregion}`;

      try {
        await resend.emails.send({
          from: 'MadeToHike <notifications@madetohike.com>',
          to: [guideProfile.email],
          subject: 'Region Submission Update - Action Required',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Region Submission Declined</h2>
              
              <p>Hello ${guideProfile.name || 'there'},</p>
              
              <p>Your submitted hiking region has been reviewed and unfortunately cannot be approved at this time.</p>
              
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Region Details</h3>
                <p style="margin: 8px 0;"><strong>Region:</strong> ${regionName}</p>
                <p style="margin: 8px 0;"><strong>Reason for decline:</strong></p>
                <p style="background: white; padding: 12px; border-left: 4px solid #dc2626; margin: 8px 0;">
                  ${declined_reason}
                </p>
              </div>
              
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">⚠️ Important: Your Tour Status</h3>
                <p>Any tours using this region have been temporarily taken offline to maintain data accuracy. Your tours are safely archived and you can access them from your dashboard.</p>
                <p><strong>Next Steps:</strong></p>
                <ul>
                  <li>Review the decline reason above</li>
                  <li>Edit your tours to use a different, approved region</li>
                  <li>Reactivate your tours once the region has been updated</li>
                </ul>
              </div>
              
              <p>You can update your tour regions by:</p>
              <ol>
                <li>Going to your Guide Dashboard</li>
                <li>Finding the archived tour(s)</li>
                <li>Editing the tour details</li>
                <li>Selecting an approved region from the dropdown</li>
                <li>Saving and reactivating your tour</li>
              </ol>
              
              <p>If you have questions or need assistance, please contact our support team.</p>
              
              <p style="margin-top: 32px;">
                Best regards,<br>
                The MadeToHike Team
              </p>
            </div>
          `,
        });
        console.log('Decline notification email sent to:', guideProfile.email);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send approval notification
    if (action === 'approve' && guideProfile?.email) {
      const regionName = submission.region 
        ? `${submission.country} - ${submission.region} - ${submission.subregion}`
        : `${submission.country} - ${submission.subregion}`;

      try {
        await resend.emails.send({
          from: 'MadeToHike <notifications@madetohike.com>',
          to: [guideProfile.email],
          subject: 'Region Submission Approved! 🎉',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">Region Submission Approved!</h2>
              
              <p>Hello ${guideProfile.name || 'there'},</p>
              
              <p>Great news! Your submitted hiking region has been reviewed and approved.</p>
              
              <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #86efac; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #059669;">✓ Approved Region</h3>
                <p style="margin: 8px 0;"><strong>${regionName}</strong></p>
                <p style="margin: 8px 0; color: #047857;">This region is now available for all guides to use when creating tours.</p>
              </div>
              
              <p>Thank you for contributing to our growing database of hiking regions!</p>
              
              <p style="margin-top: 32px;">
                Best regards,<br>
                The MadeToHike Team
              </p>
            </div>
          `,
        });
        console.log('Approval notification email sent to:', guideProfile.email);
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    }

    // Notify via Slack
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
    if (slackWebhookUrl) {
      const regionName = submission.region 
        ? `${submission.country} - ${submission.region} - ${submission.subregion}`
        : `${submission.country} - ${submission.subregion}`;

      const slackMessage = {
        text: `Region submission ${action === 'approve' ? '✅ approved' : '❌ declined'}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Region ${action === 'approve' ? '✅ Approved' : '❌ Declined'}*\n${regionName}\nReviewed by: ${user.email}`,
            },
          },
        ],
      };

      try {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage),
        });
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Region submission ${action === 'approve' ? 'approved' : 'declined'} successfully`,
        action,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in review-region-submission:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});