import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    // Use dedicated verification webhook for verification actions, fallback to general
    const slackVerificationWebhook = Deno.env.get('SLACK_VERIFICATION_WEBHOOK_URL');
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`[slack-interactive-handler] Using ${slackVerificationWebhook ? 'dedicated verification' : 'general'} Slack webhook for verifications`);

    const body = await req.text();
    console.log('[slack-interactive-handler] Received payload');
    
    const payload = JSON.parse(new URLSearchParams(body).get('payload') || '{}');

    // Handle different action types
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      console.log('[slack-interactive-handler] Action:', action.action_id);

      // Handle Guide Verification Actions
      if (action.action_id === 'approve_verification' || action.action_id === 'reject_verification') {
        const isApproval = action.action_id === 'approve_verification';
        const actionType = isApproval ? 'approve' : 'reject';
        
        let valueData;
        try {
          valueData = JSON.parse(action.value);
        } catch (e) {
          console.error('[slack-interactive-handler] Failed to parse action value:', action.value);
          return new Response(
            JSON.stringify({ text: '❌ Error: Invalid action data' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { verificationId, userId } = valueData;
        console.log(`[slack-interactive-handler] ${actionType} verification:`, verificationId, 'for user:', userId);

        // Fetch verification record
        const { data: verification, error: verificationError } = await supabase
          .from('user_verifications')
          .select('*')
          .eq('id', verificationId)
          .single();

        if (verificationError || !verification) {
          console.error('[slack-interactive-handler] Verification not found:', verificationError);
          return new Response(
            JSON.stringify({ text: '❌ Verification not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if already processed
        if (verification.verification_status === 'verified' || verification.verification_status === 'rejected') {
          return new Response(
            JSON.stringify({ text: `ℹ️ This verification has already been ${verification.verification_status}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch guide profile
        const { data: guideProfile, error: guideError } = await supabase
          .from('guide_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (guideError || !guideProfile) {
          console.error('[slack-interactive-handler] Guide profile not found:', guideError);
          return new Response(
            JSON.stringify({ text: '❌ Guide profile not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const newStatus = isApproval ? 'verified' : 'rejected';
        const slackUserId = payload.user?.id;
        const slackUserName = payload.user?.name || 'Unknown';
        const adminNotes = `${isApproval ? 'Approved' : 'Rejected'} via Slack by ${slackUserName}`;

        // Update verification status
        const { error: updateError } = await supabase
          .from('user_verifications')
          .update({
            verification_status: newStatus,
            admin_notes: adminNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', verificationId);

        if (updateError) {
          console.error('[slack-interactive-handler] Update verification error:', updateError);
          return new Response(
            JSON.stringify({ text: '❌ Failed to update verification status' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // If approved, update certifications in guide profile
        if (isApproval) {
          const certifications = guideProfile?.certifications || [];
          const updatedCerts = certifications.map((cert: any) => {
            // Mark all pending certifications as verified
            if (!cert.verified && !cert.verifiedDate) {
              return { 
                ...cert, 
                verified: true,
                verifiedDate: new Date().toISOString(),
                verificationStatus: 'verified'
              };
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
            .eq('user_id', userId);

          if (profileError) {
            console.error('[slack-interactive-handler] Update profile error:', profileError);
            // Don't fail the whole operation, verification status is already updated
          }
        }

        console.log(`[slack-interactive-handler] Successfully ${actionType}d verification for ${guideProfile.display_name}`);

        // Send confirmation message to Slack
        const emoji = isApproval ? '✅' : '❌';
        const actionText = isApproval ? 'Approved' : 'Rejected';

        const confirmationBlocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${emoji} *Guide Verification ${actionText}*`,
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
                text: `*Action:*\n${actionText} by <@${slackUserId}>`,
              },
            ],
          },
        ];

        // Send confirmation to Slack webhook (use dedicated verification webhook if available)
        const verificationWebhookUrl = slackVerificationWebhook || slackWebhookUrl;
        await fetch(verificationWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocks: confirmationBlocks }),
        });

        return new Response(
          JSON.stringify({ 
            text: `${emoji} Guide "${guideProfile.display_name}" has been ${actionText.toLowerCase()} by <@${slackUserId}>` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle Support Ticket Actions
      const ticketId = action.value;

      if (action.action_id === 'claim_ticket') {
        await supabase
          .from('tickets')
          .update({
            status: 'assigned',
            assigned_to: payload.user.id
          })
          .eq('id', ticketId);

        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticketId,
            action: 'claimed',
            actor_id: payload.user.id,
            actor_name: payload.user.name,
            note: `Ticket claimed by ${payload.user.name}`
          });

        return new Response(
          JSON.stringify({ text: `Ticket claimed by <@${payload.user.id}>` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action.action_id === 'resolve_ticket') {
        await supabase
          .from('tickets')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticketId,
            action: 'resolved',
            actor_id: payload.user.id,
            actor_name: payload.user.name,
            note: `Ticket resolved by ${payload.user.name}`
          });

        return new Response(
          JSON.stringify({ text: `Ticket resolved by <@${payload.user.id}>` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Error in slack-interactive-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
