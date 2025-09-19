import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'
import { WelcomeEmail } from './_templates/welcome-email.tsx'
import { BookingConfirmationEmail } from './_templates/booking-confirmation-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: 'verification' | 'welcome' | 'booking_confirmation' | 'custom'
  to: string | string[]
  subject?: string
  template_data?: any
  // For Supabase auth webhooks
  user?: {
    email: string
    id: string
  }
  email_data?: {
    token: string
    token_hash: string
    redirect_to: string
    email_action_type: string
    site_url: string
  }
}

Deno.serve(async (req) => {
  console.log('Generic email function called')
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Processing email request')

    let emailRequest: EmailRequest

    // Check if this is a webhook from Supabase (verification emails)
    if (hookSecret && headers['webhook-signature']) {
      console.log('Processing Supabase auth webhook')
      const wh = new Webhook(hookSecret)
      const webhookData = wh.verify(payload, headers) as any
      
      // Convert Supabase webhook to our format
      emailRequest = {
        type: 'verification',
        to: webhookData.user.email,
        user: webhookData.user,
        email_data: webhookData.email_data
      }
    } else {
      // Direct API call
      console.log('Processing direct email request')
      emailRequest = JSON.parse(payload) as EmailRequest
    }

    const { type, to, subject, template_data, user, email_data } = emailRequest

    let html: string
    let emailSubject: string = subject || 'MadeToHike Notification'

    // Generate HTML based on email type
    switch (type) {
      case 'verification':
        if (!user || !email_data) {
          throw new Error('Missing user or email_data for verification email')
        }
        html = await renderAsync(
          React.createElement(VerificationEmail, {
            supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
            token: email_data.token,
            token_hash: email_data.token_hash,
            redirect_to: email_data.redirect_to || `${Deno.env.get('SUPABASE_URL')}/`,
            email_action_type: email_data.email_action_type,
            user_email: user.email,
          })
        )
        emailSubject = 'Verify Your MadeToHike Account'
        break

      case 'welcome':
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            user_name: template_data?.user_name || 'Adventurer',
            ...template_data
          })
        )
        emailSubject = subject || 'Welcome to MadeToHike! 🏔️'
        break

      case 'booking_confirmation':
        html = await renderAsync(
          React.createElement(BookingConfirmationEmail, {
            booking_id: template_data?.booking_id,
            tour_title: template_data?.tour_title,
            booking_date: template_data?.booking_date,
            guide_name: template_data?.guide_name,
            meeting_point: template_data?.meeting_point,
            total_price: template_data?.total_price,
            currency: template_data?.currency || 'EUR',
            ...template_data
          })
        )
        emailSubject = subject || 'Your MadeToHike Booking Confirmation'
        break

      case 'custom':
        // For custom HTML emails
        html = template_data?.html || '<p>Hello from MadeToHike!</p>'
        break

      default:
        throw new Error(`Unsupported email type: ${type}`)
    }

    console.log(`Sending ${type} email to: ${Array.isArray(to) ? to.join(', ') : to}`)

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'MadeToHike <noreply@madetohike.com>',
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
      html,
    })

    if (error) {  
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(JSON.stringify({ success: true, data, type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error: any) {
    console.error('Error in send-email function:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})