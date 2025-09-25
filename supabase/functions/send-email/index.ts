import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from 'npm:resend@4.0.0'

// Get allowed origins from environment or use default for development
const allowedOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Will be set dynamically based on request origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  console.log('=== SEND EMAIL FUNCTION CALLED ===')
  console.log('Method:', req.method)

  // Get request origin and set CORS headers dynamically
  const origin = req.headers.get('origin') || '';
  const headers = { ...corsHeaders };

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (Deno.env.get('ENVIRONMENT') === 'development') {
    headers['Access-Control-Allow-Origin'] = '*';
  } else {
    headers['Access-Control-Allow-Origin'] = allowedOrigins[0] || 'https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com';
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers
    })
  }

  try {
    console.log('Reading request payload...')
    const payload = await req.text()
    console.log('Payload length:', payload.length)
    
    let emailRequest: any
    try {
      emailRequest = JSON.parse(payload)
      console.log('Email request parsed successfully, type:', emailRequest.type)
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError.message)
      return new Response(JSON.stringify({
        error: 'Invalid JSON payload',
        details: parseError.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...headers },
      })
    }

    const { type, to, subject, template_data } = emailRequest
    console.log('Email type:', type, 'Has template data:', !!template_data)

    // Check if we have the RESEND_API_KEY
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment')
      return new Response(JSON.stringify({
        error: 'Email service not configured - missing API key'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...headers },
      })
    }

    // API key found, initializing Resend client
    const resend = new Resend(resendApiKey)

    // Generate email content based on type
    let html: string
    let emailSubject: string = subject || 'MadeToHike Notification'

    if (type === 'custom_verification') {
      console.log('Generating custom verification email')
      const userName = template_data?.user_name || 'Adventurer'
      const verificationUrl = template_data?.verification_url || ''
      const verificationToken = template_data?.verification_token || ''
      const userEmail = template_data?.user_email || ''

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
                Hi ${userName}, we're excited to have you join our community!
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
                    <code style="font-size: 18px; color: #1a73e8;">${verificationToken}</code>
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
      emailSubject = 'Verify Your MadeToHike Account'
      console.log('Custom verification email HTML generated')
    } else {
      console.error('Unsupported email type:', type)
      return new Response(JSON.stringify({
        error: `Unsupported email type: ${type}`
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...headers },
      })
    }

    console.log('=== SENDING EMAIL VIA RESEND ===')
    console.log(`Sending to: ${to}`)
    console.log(`Subject: ${emailSubject}`)

    try {
      const result = await resend.emails.send({
        from: 'MadeToHike <noreply@madetohike.com>',
        to: Array.isArray(to) ? to : [to],
        subject: emailSubject,
        html: html,
      })

      console.log('=== RESEND RESPONSE ===')
      console.log('Success:', JSON.stringify(result, null, 2))

      return new Response(JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        data: result.data,
        id: result.data?.id
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...headers },
      })

    } catch (resendError: any) {
      console.error('=== RESEND ERROR ===')
      console.error('Error details:', JSON.stringify(resendError, null, 2))
      console.error('Error message:', resendError.message)
      
      return new Response(JSON.stringify({
        error: 'Failed to send email via Resend',
        details: resendError.message,
        code: resendError.code || 'RESEND_ERROR'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...headers },
      })
    }

  } catch (error: any) {
    console.error('=== GENERAL ERROR IN SEND-EMAIL FUNCTION ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error',
      type: 'GENERAL_ERROR'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})