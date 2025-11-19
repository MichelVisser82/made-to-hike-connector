import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomTourRequest {
  guide_id: string;
  hiker_id?: string;
  anonymous_name?: string;
  anonymous_email?: string;
  tour_id?: string | null;
  metadata: {
    group_size: string;
    hiker_level: string;
    preferred_date?: string;
    initial_message: string;
    tour_type?: string;
    region?: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: CustomTourRequest = await req.json();
    const { guide_id, hiker_id, anonymous_name, anonymous_email, tour_id, metadata } = requestData;

    // Validate required fields
    if (!guide_id) {
      throw new Error('Guide ID is required');
    }

    if (!hiker_id && (!anonymous_name || !anonymous_email)) {
      throw new Error('Either hiker_id or anonymous contact info is required');
    }

    if (!metadata?.initial_message || !metadata?.group_size || !metadata?.hiker_level) {
      throw new Error('Missing required metadata fields');
    }

    console.log('Creating custom tour request conversation:', {
      guide_id,
      hiker_id,
      anonymous_name,
      tour_id
    });

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        guide_id,
        hiker_id: hiker_id || null,
        anonymous_name,
        anonymous_email,
        tour_id: tour_id || null,
        conversation_type: 'custom_tour_request',
        status: 'active',
        metadata: metadata,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      throw convError;
    }

    console.log('Conversation created:', conversation.id);

    // Fetch tour name if tour_id is provided
    let tourName = null;
    if (tour_id) {
      const { data: tourData } = await supabase
        .from('tours')
        .select('title')
        .eq('id', tour_id)
        .single();
      tourName = tourData?.title;
    }

    // Format the initial message with all request details
    const tourInfo = tour_id 
      ? `\n**Selected Tour**: ${tourName || 'Unknown Tour'}` 
      : '\n**Request Type**: Custom Tour';
    const customTourDetails = !tour_id && (metadata.tour_type || metadata.region)
      ? `\n**Tour Type**: ${metadata.tour_type || 'Not specified'}\n**Preferred Region**: ${metadata.region || 'Not specified'}`
      : '';
    
    const messageContent = `**Custom Tour Request**

${tourInfo}${customTourDetails}
**Preferred Date**: ${metadata.preferred_date ? new Date(metadata.preferred_date).toLocaleDateString() : 'Flexible'}
**Group Size**: ${metadata.group_size}
**Experience Level**: ${metadata.hiker_level}

**Message from Hiker**:
${metadata.initial_message}

---
*This is a custom tour request. Please respond with your availability and a personalized proposal.*`;

    // Create initial message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: hiker_id || null,
        sender_type: hiker_id ? 'hiker' : 'anonymous',
        sender_name: anonymous_name || null,
        content: messageContent,
        message_type: 'text',
        moderation_status: 'approved',
        is_automated: false,
      });

    if (msgError) {
      console.error('Error creating message:', msgError);
      throw msgError;
    }

    console.log('Initial message created');

    // Fetch guide profile for email notification
    const { data: guideProfile, error: guideError } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', guide_id)
      .single();

    if (guideError) {
      console.error('Error fetching guide profile:', guideError);
    } else if (guideProfile) {
      // Send email notification to guide
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: guideProfile.email,
            subject: 'New Custom Tour Request',
            html: `
              <h2>New Custom Tour Request</h2>
              <p>Hi ${guideProfile.name},</p>
              <p>You have received a new custom tour request from ${anonymous_name || 'a hiker'}.</p>
              <p><strong>Group Size:</strong> ${metadata.group_size}</p>
              <p><strong>Experience Level:</strong> ${metadata.hiker_level}</p>
              <p><strong>Preferred Date:</strong> ${metadata.preferred_date ? new Date(metadata.preferred_date).toLocaleDateString() : 'Flexible'}</p>
              <p><strong>Message:</strong></p>
              <p>${metadata.initial_message}</p>
              <p>Please log in to your dashboard to respond to this request.</p>
            `
          }
        });
        console.log('Email notification sent to guide');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: conversation.id,
        message: 'Custom tour request created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-custom-tour-request:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
