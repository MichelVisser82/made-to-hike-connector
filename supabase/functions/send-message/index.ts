import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SendMessageRequest {
  conversationId: string;
  content: string;
  senderType: string;
  senderName?: string;
}

interface ModerationResult {
  moderatedContent: string;
  violations: string[];
  hasViolations: boolean;
}

// Phone number patterns (international formats)
const phonePatterns = [
  /\+?\d{1,4}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g,
  /\(\d{3}\)\s?\d{3}[-.]?\d{4}/g,
  /\d{2,5}[\s.-]\d{3}[\s.-]\d{3,4}/g,
  /\d{10,15}/g,
];

// URL pattern (exclude madetohike.com)
const urlPattern = /https?:\/\/(?!.*madetohike\.com)[\w.-]+\.[a-z]{2,}/gi;
const emailPattern = /[a-zA-Z0-9._%+-]+@(?!madetohike\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function moderateTextContent(content: string): ModerationResult {
  let moderated = content;
  const violations: string[] = [];

  // Detect phone numbers
  for (const pattern of phonePatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      matches.forEach(phone => {
        if (phone.replace(/\D/g, '').length >= 10) {
          moderated = moderated.replace(phone, '[PHONE REDACTED]');
          if (!violations.includes('phone_number_detected')) {
            violations.push('phone_number_detected');
          }
        }
      });
    }
  }

  // Detect external URLs
  const urlMatches = content.match(urlPattern);
  if (urlMatches && urlMatches.length > 0) {
    urlMatches.forEach(url => {
      moderated = moderated.replace(url, '[EXTERNAL LINK REDACTED]');
    });
    violations.push('external_url_detected');
  }

  // Detect email addresses
  const emailMatches = content.match(emailPattern);
  if (emailMatches && emailMatches.length > 0) {
    emailMatches.forEach(email => {
      moderated = moderated.replace(email, '[EMAIL REDACTED]');
    });
    violations.push('email_detected');
  }

  return {
    moderatedContent: moderated,
    violations,
    hasViolations: violations.length > 0
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { conversationId, content, senderType, senderName }: SendMessageRequest = await req.json();

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    let senderId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      senderId = user?.id || null;
    }

    console.log('Send message request:', { conversationId, senderId, senderType });

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Conversation fetch error:', convError);
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if sender is admin or guide for this conversation
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', senderId || '')
      .single();

    const isAdmin = userRole?.role === 'admin';
    const isGuideForConversation = senderType === 'guide' && conversation.guide_id === senderId;

    // Moderate content (skip for admins and guides for their conversations)
    let moderationResult: ModerationResult;
    let moderationStatus = 'approved';

    if (isAdmin || isGuideForConversation) {
      moderationResult = {
        moderatedContent: content,
        violations: [],
        hasViolations: false
      };
    } else {
      moderationResult = moderateTextContent(content);
      if (moderationResult.hasViolations) {
        moderationStatus = 'flagged';
      }
    }

    // Insert message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        sender_name: senderName,
        content: content,
        moderated_content: moderationResult.moderatedContent,
        moderation_status: moderationStatus,
        moderation_flags: moderationResult.violations
      })
      .select()
      .single();

    if (msgError) {
      console.error('Message insert error:', msgError);
      return new Response(
        JSON.stringify({ error: 'Failed to send message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Message created:', message.id);

    // Check for automated responses
    if (senderType === 'hiker' && conversation.conversation_type === 'tour_inquiry') {
      const { data: autoMessages } = await supabase
        .from('automated_messages')
        .select('*')
        .eq('guide_id', conversation.guide_id)
        .eq('trigger_type', 'new_inquiry')
        .eq('is_active', true);

      if (autoMessages && autoMessages.length > 0) {
        const autoMsg = autoMessages[0];
        
        // Send automated response after delay
        if (autoMsg.delay_minutes === 0) {
          await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              sender_id: conversation.guide_id,
              sender_type: 'guide',
              content: autoMsg.message_template,
              is_automated: true,
              moderation_status: 'approved'
            });
        }
      }
    }

    // Create ticket for admin support conversations
    if (conversation.conversation_type === 'admin_support') {
      const { data: existingTicket } = await supabase
        .from('tickets')
        .select('id')
        .eq('conversation_id', conversationId)
        .single();

      if (!existingTicket) {
        await supabase
          .from('tickets')
          .insert({
            conversation_id: conversationId,
            title: content.substring(0, 100),
            priority: 'medium',
            category: 'general'
          });

        console.log('Ticket created for conversation');
      }
    }

    // Send email notification
    try {
      const recipientId = senderType === 'hiker' ? conversation.guide_id : conversation.hiker_id;
      
      if (recipientId) {
        const { data: recipient } = await supabase
          .from('profiles')
          .select('email, name')
          .eq('id', recipientId)
          .single();

        if (recipient) {
          const { data: prefs } = await supabase
            .from('notification_preferences')
            .select('email_on_new_message')
            .eq('user_id', recipientId)
            .single();

          if (!prefs || prefs.email_on_new_message) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'new_message',
                to: recipient.email,
                subject: `New message from ${senderName || 'a user'}`,
                template_data: {
                  recipientName: recipient.name,
                  senderName: senderName || 'Someone',
                  messagePreview: moderationResult.moderatedContent.substring(0, 150),
                  conversationUrl: 'https://madetohike.com/dashboard?section=inbox'
                }
              }
            });
          }
        }
      }

      // Send email notification if guide or admin replied
      if (senderType === 'guide' || senderType === 'admin') {
        let recipientEmail = conversation.anonymous_email;
        let recipientName = conversation.anonymous_name || 'Guest';
        
        // If not anonymous, fetch email from profile
        if (!recipientEmail && conversation.hiker_id) {
          const { data: hikerProfile } = await supabase
            .from('profiles')
            .select('email, name')
            .eq('id', conversation.hiker_id)
            .single();
          
          if (hikerProfile) {
            recipientEmail = hikerProfile.email;
            recipientName = hikerProfile.name || 'there';
          }
        }
        
        if (recipientEmail) {
          const emailSubject = conversation.conversation_type === 'admin_support' 
            ? 'Update on your support ticket'
            : 'Reply to your hiking inquiry';
          
          // Check if recipient is anonymous (no hiker_id means anonymous user)
          const isAnonymous = !conversation.hiker_id;
          
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'new_message',
              to: recipientEmail,
              from: 'MadeToHike Support <support@madetohike.com>',
              subject: emailSubject,
              template_data: {
                recipientName,
                senderName: senderName || (senderType === 'admin' ? 'MadeToHike Support' : 'Your guide'),
                messagePreview: moderationResult.moderatedContent.substring(0, 150),
                conversationUrl: `https://madetohike.com/messages/${conversationId}`,
                isAnonymous: isAnonymous
              }
            }
          });
        }
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    return new Response(
      JSON.stringify({ 
        message,
        moderation: moderationResult.hasViolations ? {
          hasViolations: true,
          violations: moderationResult.violations
        } : null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in send-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
