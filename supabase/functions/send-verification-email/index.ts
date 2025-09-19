import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

interface EmailData {
  token: string
  token_hash: string
  redirect_to: string
  email_action_type: string
  site_url: string
}

interface User {
  email: string
  id: string
}

interface WebhookPayload {
  user: User
  email_data: EmailData
}

Deno.serve(async (req) => {
  console.log('Verification email function called')
  
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)
    
    console.log('Processing email request for user verification')

    // If there's no webhook secret, process the request directly (for testing)
    let webhookData: WebhookPayload

    if (hookSecret) {
      console.log('Verifying webhook signature')
      const wh = new Webhook(hookSecret)
      webhookData = wh.verify(payload, headers) as WebhookPayload
    } else {
      console.log('No webhook secret found, processing payload directly')
      webhookData = JSON.parse(payload) as WebhookPayload
    }

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type },
    } = webhookData

    console.log(`Sending verification email to: ${user.email}`)

    // Render the React email template
    const html = await renderAsync(
      React.createElement(VerificationEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to: redirect_to || `${Deno.env.get('SUPABASE_URL')}/`,
        email_action_type,
        user_email: user.email,
      })
    )

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'MadeToHike <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Verify Your MadeToHike Account',
      html,
    })

    if (error) {  
      console.error('Resend error:', error)
      throw error
    }

    console.log('Verification email sent successfully:', data)

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Error in send-verification-email function:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})