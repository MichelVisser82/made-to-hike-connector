import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

serve(async (req) => {
  console.log('=== SEND EMAIL FUNCTION CALLED ===')
  console.log('Method:', req.method)

  if (req.method !== 'POST') {
    return new Response('not allowed', { status: 400 })
  }

  const payload = await req.text()
  const headers = Object.fromEntries(req.headers)
  
  try {
    const wh = new Webhook(hookSecret)
    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = wh.verify(payload, headers) as {
      user: {
        email: string
        id: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    console.log('=== WEBHOOK VERIFIED ===')
    console.log('User email:', user.email)
    console.log('Email action type:', email_action_type)

    let html: string
    let subject: string

    if (email_action_type === 'signup') {
      // Handle signup confirmation
      const verificationUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`
      
      html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your MadeToHike Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div style="text-align: center; padding: 20px;">
            <h1 style="color: #1a73e8; margin: 0;">🏔️ MadeToHike</h1>
        </div>
        
        <div style="text-align: center; padding: 20px;">
            <h2 style="color: #1a1a1a;">Welcome to MadeToHike!</h2>
            <p style="color: #666666; font-size: 16px;">
                We're excited to have you join our hiking community!
            </p>
        </div>

        <div style="padding: 20px;">
            <p style="color: #525252; font-size: 16px;">
                Please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #1a73e8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Verify My Email
                </a>
            </div>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="color: #525252; font-size: 14px; margin: 0;">
                    <strong>Your verification code:</strong><br>
                    <code style="font-size: 18px; color: #1a73e8;">${token}</code>
                </p>
            </div>

            <p style="color: #525252; font-size: 12px;">
                This verification link will expire in 24 hours for security reasons.
            </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #8898aa; font-size: 12px;">
            <p>© 2025 MadeToHike. Happy hiking! 🏔️</p>
        </div>
    </div>
</body>
</html>`
      subject = 'Verify Your MadeToHike Account'
    } else {
      // Handle other email types (recovery, etc.)
      html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>MadeToHike - ${email_action_type}</title>
</head>
<body style="font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1a73e8;">🏔️ MadeToHike</h1>
        <p>Please click the link below to continue:</p>
        <a href="${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
           style="background-color: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Continue
        </a>
        <p>Your verification code: <code>${token}</code></p>
    </div>
</body>
</html>`
      subject = `MadeToHike - ${email_action_type}`
    }

    console.log('=== SENDING EMAIL VIA RESEND ===')
    console.log(`Sending to: ${user.email}`)
    console.log(`Subject: ${subject}`)

    const { error } = await resend.emails.send({
      from: 'MadeToHike <noreply@madetohike.com>',
      to: [user.email],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('=== EMAIL SENT SUCCESSFULLY ===')
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('=== ERROR IN SEND EMAIL HOOK ===')
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message || 'Unknown error',
        },
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})