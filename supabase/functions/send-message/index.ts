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

interface VariableData {
  guestFirstName?: string;
  guestLastName?: string;
  guestFullName?: string;
  tourName?: string;
  tourDate?: string;
  guestCount?: number;
  guideName?: string;
}

const extractFirstName = (fullName: string | null | undefined): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || '';
};

const extractLastName = (fullName: string | null | undefined): string => {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

const formatMessageDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch {
    return '';
  }
};

const replaceTemplateVariables = (template: string, data: VariableData): string => {
  let result = template;
  
  const replacements: Record<string, string> = {
    '{guest-firstname}': data.guestFirstName || 'there',
    '{guest-lastname}': data.guestLastName || '',
    '{guest-fullname}': data.guestFullName || 'Guest',
    '{tour-name}': data.tourName || 'the tour',
    '{tour-date}': data.tourDate || 'your tour date',
    '{guest-count}': data.guestCount?.toString() || '1',
    '{guide-name}': data.guideName || 'your guide',
    '{meeting-point}': 'the meeting point',
    '{start-time}': '09:00',
  };
  
  Object.entries(replacements).forEach(([variable, value]) => {
    const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), value);
  });
  
  return result;
};

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

    console.log('Send message request:', { conversationId, senderType, content: content?.substring(0, 50) });

    // Validate required fields
    if (!conversationId || conversationId === 'undefined') {
      console.error('Missing or invalid conversationId:', conversationId);
      return new Response(
        JSON.stringify({ error: 'Conversation ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!content || content.trim() === '') {
      console.error('Missing or empty content');
      return new Response(
        JSON.stringify({ error: 'Message content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!senderType) {
      console.error('Missing senderType');
      return new Response(
        JSON.stringify({ error: 'Sender type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    let senderId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      senderId = user?.id || null;
    }

    console.log('Authenticated user:', senderId);

    // Fetch sender's actual name from profiles if authenticated
    let actualSenderName = senderName;
    if (senderId) {
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', senderId)
        .single();
      
      if (senderProfile?.name) {
        actualSenderName = senderProfile.name;
      }
    }

    // Get conversation details with tour info
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(`
        *,
        tours (
          id,
          title
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Conversation fetch error:', convError);
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch booking context for variable replacement
    let bookingData = null;
    let hikerProfile = null;
    let guideProfile = null;
    let variableData: VariableData = {};

    // Try to get booking from conversation's booking_id first
    if (conversation.booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('booking_date, participants')
        .eq('id', conversation.booking_id)
        .single();
      bookingData = booking;
    }

    // If no booking_id, try to find most recent booking by tour_id and hiker_id
    if (!bookingData && conversation.tour_id && conversation.hiker_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('booking_date, participants')
        .eq('tour_id', conversation.tour_id)
        .eq('hiker_id', conversation.hiker_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      bookingData = booking;
    }

    // Fetch hiker profile
    if (conversation.hiker_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', conversation.hiker_id)
        .single();
      hikerProfile = profile;
    }

    // Fetch guide profile
    if (conversation.guide_id) {
      const { data: profile } = await supabase
        .from('guide_profiles')
        .select('display_name')
        .eq('user_id', conversation.guide_id)
        .single();
      guideProfile = profile;
    }

    // Build variable data for replacement
    const fullName = hikerProfile?.name || conversation.anonymous_name || '';
    variableData = {
      guestFirstName: extractFirstName(fullName),
      guestLastName: extractLastName(fullName),
      guestFullName: fullName || 'Guest',
      tourName: conversation.tours?.title,
      tourDate: bookingData ? formatMessageDate(bookingData.booking_date) : undefined,
      guestCount: bookingData?.participants,
      guideName: guideProfile?.display_name,
    };

    // Replace variables in content
    const processedContent = replaceTemplateVariables(content, variableData);
    console.log('Variable replacement - Original:', content.substring(0, 100));
    console.log('Variable replacement - Processed:', processedContent.substring(0, 100));

    // Check if sender is admin or guide for this conversation
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', senderId || '')
      .single();

    const isAdmin = userRole?.role === 'admin';
    const isGuideForConversation = senderType === 'guide' && conversation.guide_id === senderId;

    // Moderate content (skip for admins and guides for their conversations)
    // Use processedContent for moderation
    let moderationResult: ModerationResult;
    let moderationStatus = 'approved';

    if (isAdmin || isGuideForConversation) {
      moderationResult = {
        moderatedContent: processedContent,
        violations: [],
        hasViolations: false
      };
    } else {
      moderationResult = moderateTextContent(processedContent);
      if (moderationResult.hasViolations) {
        moderationStatus = 'flagged';
      }
    }

    // Insert message with processed content
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        sender_name: actualSenderName,
        content: processedContent,
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
        
        // Send automated response after delay with variable replacement
        if (autoMsg.delay_minutes === 0) {
          const automatedContent = replaceTemplateVariables(autoMsg.message_template, variableData);
          console.log('Automated message - Original:', autoMsg.message_template.substring(0, 100));
          console.log('Automated message - Processed:', automatedContent.substring(0, 100));
          
          await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              sender_id: conversation.guide_id,
              sender_type: 'guide',
              content: automatedContent,
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
                subject: `New message from ${actualSenderName || 'a user'}`,
                template_data: {
                  recipientName: recipient.name,
                  senderName: actualSenderName || 'Someone',
                  messagePreview: moderationResult.moderatedContent.substring(0, 150),
                  conversationUrl: 'https://madetohike.com/dashboard?section=inbox'
                }
              }
            });
          }
        }
      }

      // Send email notification if guide or admin replied to anonymous inquiry or support ticket
      // Don't send if we already sent to authenticated user above
      if ((senderType === 'guide' || senderType === 'admin') && !recipientId) {
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
            ? `[Ticket ${conversation.id.substring(0, 8)}] Update on your support ticket`
            : 'Reply to your hiking inquiry';
          
          // Check if recipient is anonymous (no hiker_id means anonymous user)
          const isAnonymous = !conversation.hiker_id;
          
          // Use reply_to to direct responses to Slack channel
          const replyToAddress = Deno.env.get('SUPPORT_REPLY_EMAIL') || 'support@madetohike.com';
          
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'new_message',
              to: recipientEmail,
              from: 'MadeToHike Support <noreply@madetohike.com>',
              reply_to: replyToAddress,
              subject: emailSubject,
              template_data: {
                recipientName,
                senderName: actualSenderName || (senderType === 'admin' ? 'MadeToHike Support' : 'Your guide'),
                messagePreview: moderationResult.moderatedContent.substring(0, 150),
                conversationUrl: `https://madetohike.com/messages/${conversationId}`,
                isAnonymous: isAnonymous,
                conversationId: conversation.id
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
