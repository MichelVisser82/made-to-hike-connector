import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== SEND EMAIL FUNCTION CALLED ===')
  console.log('Method:', req.method)

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
    console.log('Reading request payload...')
    const payload = await req.text()
    console.log('Payload length:', payload.length)
    
    let emailRequest: any
    try {
      emailRequest = JSON.parse(payload)
      console.log('Email request parsed successfully, type:', emailRequest.type)
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError.message)
      console.error('Raw payload first 200 chars:', payload.substring(0, 200))
      return new Response(JSON.stringify({
        error: 'Invalid JSON payload',
        details: parseError.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { type, to, subject, template_data } = emailRequest
    console.log('Email details:', { type, to, hasTemplateData: !!template_data })

    // Check if we have the RESEND_API_KEY
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment')
      return new Response(JSON.stringify({
        error: 'Email service not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    console.log('RESEND_API_KEY found, proceeding with email send')
    
    // For now, let's just return success without actually sending
    // to isolate the issue
    console.log('Mock email send successful')
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Email sent successfully (mock)',
      type: type,
      to: to
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error: any) {
    console.error('=== ERROR IN SEND-EMAIL FUNCTION ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(JSON.stringify({
      error: error.message || 'Unknown error',
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})