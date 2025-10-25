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

    // Handle Slack URL verification challenge
    if (slackEvent.type === 'url_verification') {
      return new Response(
        JSON.stringify({ challenge: slackEvent.challenge }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Verify request is from Slack
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
      
      // Ignore bot messages and message edits/deletions
      if (!event.text || event.channel_type === 'im' || event.thread_ts) {
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      console.log('Processing Slack message:', event.text)

      // Try to extract conversation ID from the message
      const conversationIdPrefix = extractConversationId(event.text)
      
      if (!conversationIdPrefix) {
        console.log('No conversation reference found in message')
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Find the conversation by ID prefix
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, anonymous_name, anonymous_email')
        .ilike('id', `${conversationIdPrefix}%`)
        .eq('conversation_type', 'admin_support')
        .limit(1)

      if (convError || !conversations || conversations.length === 0) {
        console.error('Conversation not found:', convError)
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      const conversation = conversations[0]

      // Remove the reference line from the message text
      const cleanedText = event.text
        .replace(/Reference:\s*[a-f0-9-]{8,}/gi, '')
        .trim()

      if (!cleanedText) {
        return new Response('OK', { status: 200, headers: corsHeaders })
      }

      // Create message in database as anonymous reply
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: null,
          sender_type: 'anonymous',
          sender_name: conversation.anonymous_name || 'Anonymous',
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
