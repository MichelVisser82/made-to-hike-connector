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
  console.log('=== VERIFICATION EMAIL FUNCTION CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  if (req.method !== 'POST') {
    console.log('Returning 405 - Method not allowed')
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('=== STARTING PROCESSING ===')
    const payload = await req.text()
    console.log('Payload received, length:', payload.length)
    
    const headers = Object.fromEntries(req.headers)
    console.log('Headers received:', Object.keys(headers))
    
    // Check environment variables
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    console.log('Environment check - RESEND_API_KEY:', resendKey ? 'present' : 'MISSING')
    console.log('Environment check - SUPABASE_URL:', supabaseUrl ? 'present' : 'MISSING')
    console.log('Environment check - HOOK_SECRET:', hookSecret ? 'present' : 'MISSING')

    if (!resendKey) {
      throw new Error('RESEND_API_KEY environment variable is missing')
    }

    console.log('=== PARSING WEBHOOK DATA ===')
    let webhookData: WebhookPayload

    if (hookSecret) {
      console.log('Verifying webhook signature with secret')
      try {
        const wh = new Webhook(hookSecret)
        webhookData = wh.verify(payload, headers) as WebhookPayload
        console.log('Webhook signature verified successfully')
      } catch (webhookError: any) {
        console.error('Webhook verification failed:', webhookError.message)
        throw new Error(`Webhook verification failed: ${webhookError.message}`)
      }
    } else {
      console.log('No webhook secret found, processing payload directly')
      try {
        webhookData = JSON.parse(payload) as WebhookPayload
        console.log('Payload parsed successfully')
      } catch (parseError: any) {
        console.error('Failed to parse payload:', parseError.message)
        throw new Error(`Failed to parse payload: ${parseError.message}`)
      }
    }

    console.log('=== EXTRACTING EMAIL DATA ===')
    const { user, email_data } = webhookData
    console.log('User email:', user?.email || 'MISSING')
    console.log('Email data keys:', email_data ? Object.keys(email_data) : 'MISSING')

    if (!user?.email) {
      throw new Error('User email is missing from webhook data')
    }

    const { token, token_hash, redirect_to, email_action_type } = email_data || {}
    console.log('Token present:', !!token)
    console.log('Token hash present:', !!token_hash)
    console.log('Email action type:', email_action_type)

    console.log('=== RENDERING EMAIL TEMPLATE ===')
    const html = await renderAsync(
      React.createElement(VerificationEmail, {
        supabase_url: supabaseUrl || 'https://ohecxwxumzpfcfsokfkg.supabase.co',
        token: token || '',
        token_hash: token_hash || '',
        redirect_to: redirect_to || `${supabaseUrl}/`,
        email_action_type: email_action_type || 'signup',
        user_email: user.email,
      })
    )
    console.log('Email template rendered, HTML length:', html.length)

    console.log('=== SENDING EMAIL VIA RESEND ===')
    const { data, error } = await resend.emails.send({
      from: 'MadeToHike <noreply@madetohike.com>',
      to: [user.email],
      subject: 'Verify Your MadeToHike Account',
      html,
    })

    if (error) {  
      console.error('Resend error details:', JSON.stringify(error, null, 2))
      throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`)
    }

    console.log('=== EMAIL SENT SUCCESSFULLY ===')
    console.log('Resend response:', JSON.stringify(data, null, 2))

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('=== ERROR IN VERIFICATION EMAIL FUNCTION ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'UNKNOWN_ERROR',
          details: error.stack || 'No stack trace available'
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})