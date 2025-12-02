import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ContactFormData {
  name: string
  email: string
  userType: string
  subject: string
  message: string
  consent: boolean
}

const userTypeLabels: Record<string, string> = {
  'hiker': 'Hiker / Adventure Seeker',
  'prospective-guide': 'Prospective Guide',
  'current-guide': 'Current Guide',
  'partner': 'Business Partner / Media',
  'other': 'Other'
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData: ContactFormData = await req.json()
    const { name, email, userType, subject, message, consent } = formData

    // Validate required fields
    if (!name || !email || !userType || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL')
    const supportEmail = Deno.env.get('SUPPORT_REPLY_EMAIL') || 'support@madetohike.com'

    const userTypeLabel = userTypeLabels[userType] || userType
    const timestamp = new Date().toISOString()

    // Send Slack notification
    if (slackWebhookUrl) {
      try {
        const slackMessage = {
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "📬 New Contact Form Submission",
                emoji: true
              }
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*From:*\n${name}`
                },
                {
                  type: "mrkdwn",
                  text: `*Email:*\n${email}`
                },
                {
                  type: "mrkdwn",
                  text: `*User Type:*\n${userTypeLabel}`
                },
                {
                  type: "mrkdwn",
                  text: `*Subject:*\n${subject}`
                }
              ]
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `*Message:*\n${message}`
              }
            },
            {
              type: "context",
              elements: [
                {
                  type: "mrkdwn",
                  text: `✅ Privacy consent given | Received at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Amsterdam' })} CET`
                }
              ]
            },
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: {
                    type: "plain_text",
                    text: "Reply via Email",
                    emoji: true
                  },
                  url: `mailto:${email}?subject=Re: ${encodeURIComponent(subject)}`,
                  style: "primary"
                }
              ]
            }
          ]
        }

        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackMessage)
        })

        console.log('Slack notification sent successfully')
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError)
        // Don't fail the request if Slack fails
      }
    }

    // Send emails via Resend
    if (resendApiKey) {
      const resend = new Resend(resendApiKey)

      // Email to team
      try {
        await resend.emails.send({
          from: 'MadeToHike <noreply@madetohike.com>',
          to: [supportEmail],
          replyTo: email,
          subject: `[Contact Form] ${subject}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #7C2D3A; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background: #f9f9f9; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #7C2D3A; }
                .message-box { background: white; padding: 15px; border-left: 4px solid #7C2D3A; margin-top: 20px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Contact Form Submission</h1>
                </div>
                <div class="content">
                  <div class="field">
                    <span class="label">From:</span> ${name} (${email})
                  </div>
                  <div class="field">
                    <span class="label">User Type:</span> ${userTypeLabel}
                  </div>
                  <div class="field">
                    <span class="label">Subject:</span> ${subject}
                  </div>
                  <div class="message-box">
                    <span class="label">Message:</span>
                    <p>${message.replace(/\n/g, '<br>')}</p>
                  </div>
                  <div class="field" style="margin-top: 15px;">
                    <span class="label">Privacy Consent:</span> ✅ Yes
                  </div>
                </div>
                <div class="footer">
                  <p>Received: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Amsterdam' })} CET</p>
                  <p>Reply directly to this email to respond to ${name}.</p>
                </div>
              </div>
            </body>
            </html>
          `
        })

        console.log('Team notification email sent')
      } catch (emailError) {
        console.error('Failed to send team email:', emailError)
      }

      // Confirmation email to user
      try {
        await resend.emails.send({
          from: 'MadeToHike <noreply@madetohike.com>',
          to: [email],
          subject: `We received your message - ${subject}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #7C2D3A; color: white; padding: 30px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; }
                .content { padding: 30px; background: white; }
                .highlight { background: #FDF8F3; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background: #f5f5f5; }
                a { color: #7C2D3A; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Thank You for Reaching Out!</h1>
                </div>
                <div class="content">
                  <p>Hi ${name},</p>
                  <p>We've received your message and wanted to let you know that a member of our team will get back to you soon.</p>
                  
                  <div class="highlight">
                    <strong>Expected Response Time:</strong><br>
                    During business hours (Mon-Fri, 9:00-18:00 CET), we typically respond within 2 hours.
                  </div>
                  
                  <p><strong>Your Message:</strong></p>
                  <p style="color: #666; font-style: italic;">"${subject}"</p>
                  
                  <p>In the meantime, you might find helpful information in our <a href="https://madetohike.com/help">Help Center</a>.</p>
                  
                  <p>Best regards,<br>The MadeToHike Team</p>
                </div>
                <div class="footer">
                  <p>MadeToHike - Connecting Adventurers with Certified Mountain Guides</p>
                  <p><a href="https://madetohike.com">madetohike.com</a></p>
                </div>
              </div>
            </body>
            </html>
          `
        })

        console.log('Confirmation email sent to user')
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Your message has been sent successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process your request. Please try again.' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
