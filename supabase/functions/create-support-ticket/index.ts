import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, category, userId } = await req.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        conversation_type: 'admin_support',
        hiker_id: userId || null,
        anonymous_email: userId ? null : email,
        anonymous_name: userId ? null : name,
        status: 'active',
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      throw new Error('Failed to create support conversation');
    }

    // Create initial message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: userId || null,
        sender_type: userId ? 'hiker' : 'anonymous',
        sender_name: name,
        content: message,
        message_type: 'text',
      });

    if (msgError) {
      console.error('Error creating message:', msgError);
      throw new Error('Failed to create support message');
    }

    // Create support ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        conversation_id: conversation.id,
        title: subject,
        category: category || 'general',
        priority: 'medium',
        status: 'open',
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      throw new Error('Failed to create support ticket');
    }

    // Send confirmation email to user
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'MadeToHike Support <support@madetohike.com>',
            to: [email],
            subject: `Support Ticket Created: ${ticket.ticket_number}`,
            html: `
              <h1>Support Ticket Received</h1>
              <p>Hi ${name},</p>
              <p>We've received your support request and our team will get back to you as soon as possible.</p>
              <p><strong>Ticket Number:</strong> ${ticket.ticket_number}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${category || 'General'}</p>
              <hr>
              <p><strong>Your Message:</strong></p>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <hr>
              <p>You can track your ticket status in your dashboard, or simply reply to this email.</p>
              <p>Best regards,<br>The MadeToHike Support Team</p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Send Slack notification to admin
    const slackWebhook = Deno.env.get('SLACK_WEBHOOK_URL');
    if (slackWebhook) {
      try {
        await fetch(slackWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🎫 New Support Ticket: ${ticket.ticket_number}`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: `🎫 New Support Ticket`,
                },
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Ticket Number:*\n${ticket.ticket_number}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Category:*\n${category || 'General'}`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*From:*\n${name} (${email})`,
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Subject:*\n${subject}`,
                  },
                ],
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Message:*\n${message}`,
                },
              },
            ],
          }),
        });
      } catch (slackError) {
        console.error('Error sending Slack notification:', slackError);
        // Don't fail the request if Slack fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticketNumber: ticket.ticket_number,
        ticketId: ticket.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in create-support-ticket function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
