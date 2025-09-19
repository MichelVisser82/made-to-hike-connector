import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from 'npm:resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  type: string
  to: string | string[]
  subject?: string
  template_data?: any
  user?: any
  email_data?: any
}

serve(async (req) => {
  console.log('=== SEND EMAIL FUNCTION CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    const payload = await req.text()
    console.log('Payload received, length:', payload.length)
    
    let emailRequest: EmailRequest
    try {
      emailRequest = JSON.parse(payload) as EmailRequest
      console.log('Email request parsed:', { type: emailRequest.type, to: emailRequest.to })
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError.message)
      throw new Error(`Invalid JSON: ${parseError.message}`)
    }

    const { type, to, subject, template_data } = emailRequest
    console.log('Processing email type:', type)

    let html: string
    let emailSubject: string = subject || 'MadeToHike Notification'

    // Generate HTML based on email type
    switch (type) {
      case 'custom_verification':
        console.log('Generating custom verification email HTML')
        const userName = template_data?.user_name || 'Adventurer'
        const verificationUrl = template_data?.verification_url || ''
        const userEmail = template_data?.user_email || ''
        
        html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your MadeToHike Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; background-color: #f6f9fc;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <div style="text-align: center; padding: 32px 20px;">
            <h1 style="font-size: 32px; font-weight: bold; color: #1a73e8; margin: 0;">🏔️ MadeToHike</h1>
        </div>
        
        <div style="text-align: center; padding: 0 20px;">
            <h2 style="color: #1a1a1a; font-size: 32px; font-weight: bold; margin: 30px 0; line-height: 42px;">Welcome to MadeToHike!</h2>
            <p style="color: #666666; font-size: 18px; line-height: 28px; margin: 16px 0 32px;">
                Hi ${userName}, we're excited to have you join our community of hiking enthusiasts!
            </p>
        </div>

        <div style="padding: 0 20px;">
            <p style="color: #525252; font-size: 16px; line-height: 26px; margin: 16px 0;">
                To get started with discovering amazing hiking tours and connecting with expert guides, 
                please verify your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="background-color: #1a73e8; border-radius: 8px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; display: inline-block; padding: 16px 24px;">
                    Verify My Email
                </a>
            </div>

            <p style="color: #525252; font-size: 16px; line-height: 26px; margin: 16px 0;">
                Or copy and paste this link in your browser:
            </p>
            <p style="color: #1a73e8; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
            </p>
        </div>

        <div style="padding: 32px 20px; background-color: #f8f9fa; margin: 32px 0; border-radius: 8px;">
            <h3 style="color: #1a1a1a; font-size: 18px; font-weight: bold; margin: 0 0 16px;">What awaits you:</h3>
            <p style="color: #525252; font-size: 16px; line-height: 24px; margin: 8px 0;">🥾 Access to premium hiking tours</p>
            <p style="color: #525252; font-size: 16px; line-height: 24px; margin: 8px 0;">🗺️ Personalized route recommendations</p>
            <p style="color: #525252; font-size: 16px; line-height: 24px; margin: 8px 0;">👥 Connect with certified guides</p>
            <p style="color: #525252; font-size: 16px; line-height: 24px; margin: 8px 0;">📱 Track your hiking adventures</p>
        </div>

        <div style="padding: 20px; text-align: center;">
            <p style="color: #8898aa; font-size: 14px; line-height: 20px; margin: 12px 0;">
                This verification link will expire in 24 hours for security reasons.
            </p>
            <p style="color: #8898aa; font-size: 14px; line-height: 20px; margin: 12px 0;">
                If you didn't create an account with MadeToHike, you can safely ignore this email.
            </p>
            <p style="color: #8898aa; font-size: 12px; margin: 24px 0 0;">
                © 2025 MadeToHike. Happy hiking! 🏔️
            </p>
        </div>
    </div>
</body>
</html>`
        emailSubject = 'Verify Your MadeToHike Account'
        console.log('Custom verification email HTML generated')
        break

      default:
        console.error('Unsupported email type:', type)
        throw new Error(`Unsupported email type: ${type}`)
    }

    console.log('=== SENDING EMAIL VIA RESEND ===')
    console.log(`Sending ${type} email to: ${Array.isArray(to) ? to.join(', ') : to}`)

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'MadeToHike <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
      html,
    })

    if (error) {  
      console.error('Resend error:', JSON.stringify(error, null, 2))
      throw new Error(`Resend error: ${error.message || JSON.stringify(error)}`)
    }

    console.log('=== EMAIL SENT SUCCESSFULLY ===')
    console.log('Email data:', JSON.stringify(data, null, 2))

    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully',
      data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error: any) {
    console.error('=== ERROR IN SEND-EMAIL FUNCTION ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(JSON.stringify({
      error: {
        message: error.message || 'Email sending failed',
        type: 'EMAIL_SEND_ERROR'
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})