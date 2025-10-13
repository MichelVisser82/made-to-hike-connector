import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SlackNotifyRequest {
  ticketId?: string;
  action?: 'create' | 'update' | 'assign';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    const slackBotToken = Deno.env.get('SLACK_BOT_TOKEN');

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { ticketId, action }: SlackNotifyRequest = await req.json();

    if (!slackWebhook && !slackBotToken) {
      console.log('Slack integration not configured, skipping notification');
      return new Response(
        JSON.stringify({ message: 'Slack not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        conversations!inner(
          *,
          tours(title),
          profiles!conversations_hiker_id_fkey(name, email)
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !ticket) {
      console.error('Ticket not found:', ticketError);
      return new Response(
        JSON.stringify({ error: 'Ticket not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const conversation = ticket.conversations;
    const tour = conversation.tours;
    const hiker = conversation.profiles;

    // Build Slack message
    const slackMessage = {
      text: `🎫 New Support Ticket: ${ticket.ticket_number}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🎫 ${ticket.ticket_number}: ${ticket.title}`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Priority:*\n${ticket.priority.toUpperCase()}`
            },
            {
              type: "mrkdwn",
              text: `*Status:*\n${ticket.status}`
            },
            {
              type: "mrkdwn",
              text: `*Tour:*\n${tour?.title || 'N/A'}`
            },
            {
              type: "mrkdwn",
              text: `*From:*\n${hiker?.name || conversation.anonymous_name || 'Anonymous'}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Message:*\n${ticket.title}`
          }
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "Claim Ticket"
              },
              style: "primary",
              value: ticket.id,
              action_id: "claim_ticket"
            },
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Conversation"
              },
              url: `${supabaseUrl.replace('https://', 'https://app.')}/dashboard?conversation=${conversation.id}`,
              action_id: "view_conversation"
            }
          ]
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Created: <!date^${Math.floor(new Date(ticket.created_at).getTime() / 1000)}^{date_short_pretty} at {time}|${ticket.created_at}>`
            }
          ]
        }
      ]
    };

    // Send to Slack
    const slackResponse = await fetch(slackWebhook!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage)
    });

    if (!slackResponse.ok) {
      console.error('Slack API error:', await slackResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to send Slack notification' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get thread_ts from response if creating new thread
    const slackData = await slackResponse.json();
    
    if (action === 'create' && slackData.ts) {
      // Store thread_ts for future updates
      await supabase
        .from('tickets')
        .update({ slack_thread_ts: slackData.ts })
        .eq('id', ticketId);
    }

    console.log('Slack notification sent for ticket:', ticket.ticket_number);

    return new Response(
      JSON.stringify({ success: true, threadTs: slackData.ts }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in slack-notify:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
