import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'
import { corsHeaders } from '../_shared/cors.ts'

const SLACK_SIGNING_SECRET = Deno.env.get('SLACK_SIGNING_SECRET')

interface SlackEvent {
  type: string
  event?: {
    type: string
    channel?: string
    user?: string
    text?: string
    ts?: string
    thread_ts?: string
    channel_type?: string
  }
  challenge?: string
}

// Verify Slack request signature
async function verifySlackRequest(
  timestamp: string,
  body: string,
  signature: string
): Promise<boolean> {
  if (!SLACK_SIGNING_SECRET) return false

  const encoder = new TextEncoder()
  const data = encoder.encode(`v0:${timestamp}:${body}`)
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SLACK_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data)
  const computedSignature = `v0=${Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}`
  
  return computedSignature === signature
}

// Extract conversation ID from message text
function extractConversationId(text: string): string | null {
  // Look for pattern like "Reference: 1416837b" in the message
  const match = text.match(/Reference:\s*([a-f0-9-]{8})/i)
  return match ? match[1] : null
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const slackEvent: SlackEvent = JSON.parse(body)

    console.log('Received Slack event:', JSON.stringify(slackEvent))

    // Handle Slack URL verification challenge FIRST (no signature check needed)
    if (slackEvent.type === 'url_verification') {
      console.log('Handling URL verification challenge')
      return new Response(
        slackEvent.challenge,
        { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/plain' 
          } 
        }
      )
    }

    // Verify request is from Slack for all other events
    const timestamp = req.headers.get('x-slack-request-timestamp')
    const signature = req.headers.get('x-slack-signature')
    
    if (!timestamp || !signature) {
      console.error('Missing Slack headers')
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check timestamp to prevent replay attacks (within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000)
    if (Math.abs(currentTime - parseInt(timestamp)) > 60 * 5) {
      console.error('Request timestamp too old')
      return new Response('Request timestamp too old', { status: 401, headers: corsHeaders })
    }

    const isValid = await verifySlackRequest(timestamp, body, signature)
    if (!isValid) {
      console.error('Invalid Slack signature')
      return new Response('Invalid signature', { status: 401, headers: corsHeaders })
    }

    // Handle message events
    if (slackEvent.type === 'event_callback' && slackEvent.event?.type === 'message') {
      const event = slackEvent.event
      
      console.log('Received message event:', JSON.stringify(event))
      
      // Check if this is an email attachment (reply via email)
      let messageText = event.text || ''
      if (!messageText && event.files && event.files.length > 0) {
        const emailFile = event.files.find((f: any) => f.filetype === 'email' && f.plain_text)
        if (emailFile) {
          messageText = emailFile.plain_text
          console.log('Found email attachment with plain_text')
        }
      }
      
      // Ignore messages with no content or DMs
      if (!messageText || event.channel_type === 'im') {
        console.log('Ignoring message: no text or is DM')
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      console.log('Processing Slack message:', messageText)

      // Try to extract conversation ID from the message
      const conversationIdPrefix = extractConversationId(messageText)
      
      if (!conversationIdPrefix) {
        console.log('No conversation reference found in message')
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Find the conversation by ID prefix
      // Fetch admin_support conversations and filter by prefix in JavaScript
      const { data: allConversations, error: convError } = await supabase
        .from('conversations')
        .select('id, anonymous_name, anonymous_email')
        .eq('conversation_type', 'admin_support')

      if (convError || !allConversations) {
        console.error('Error fetching conversations:', convError)
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Filter by UUID prefix (first 8 chars)
      const conversations = allConversations.filter(c => 
        c.id.toLowerCase().startsWith(conversationIdPrefix.toLowerCase())
      )

      if (conversations.length === 0) {
        console.log('No conversation found with ID prefix:', conversationIdPrefix)
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      const conversation = conversations[0]

      // Remove the reference line and email quote from the message text
      const cleanedText = messageText
        .replace(/Reference:\s*[a-f0-9-]{8,}/gi, '')
        .replace(/Op .* schreef .*/gs, '') // Remove Dutch email quote
        .replace(/On .* wrote:/gs, '') // Remove English email quote
        .replace(/^>.*$/gm, '') // Remove quoted lines
        .replace(/--\s*$/s, '') // Remove email signature separator
        .trim()

      if (!cleanedText) {
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Create message in database as admin support reply
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: null,
          sender_type: 'admin',
          sender_name: 'Support Team',
          message_type: 'text',
          content: cleanedText,
          moderated_content: cleanedText,
          moderation_status: 'approved',
          is_automated: false
        })

      if (msgError) {
        console.error('Error creating message:', msgError)
        return new Response('Error creating message', { status: 500, headers: corsHeaders })
      }

      console.log('Message created successfully for conversation:', conversation.id)
    }

    return new Response('OK', { status: 200, headers: corsHeaders })

  } catch (error: any) {
    console.error('Slack webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
