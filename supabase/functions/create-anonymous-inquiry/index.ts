import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnonymousInquiryRequest {
  tourId: string;
  guideId: string;
  email: string;
  name: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { tourId, guideId, email, name, message }: AnonymousInquiryRequest = await req.json();

    console.log('[create-anonymous-inquiry] Request:', { tourId, guideId, email, name });

    // Validate inputs
    if (!tourId || !guideId || !email || !name || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        tour_id: tourId,
        guide_id: guideId,
        anonymous_email: email,
        anonymous_name: name,
        conversation_type: 'tour_inquiry',
        status: 'active'
      })
      .select()
      .single();

    if (convError) {
      console.error('[create-anonymous-inquiry] Error creating conversation:', convError);
      throw convError;
    }

    console.log('[create-anonymous-inquiry] Conversation created:', conversation.id);

    // Create the initial message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'anonymous',
        sender_name: name,
        message_type: 'text',
        content: message,
        moderation_status: 'approved',
        is_automated: false
      });

    if (messageError) {
      console.error('[create-anonymous-inquiry] Error creating message:', messageError);
      throw messageError;
    }

    // Get tour and guide info for email
    const { data: tour } = await supabase
      .from('tours')
      .select('title')
      .eq('id', tourId)
      .single();

    const { data: guideProfile } = await supabase
      .from('guide_profiles')
      .select('display_name, user_id')
      .eq('user_id', guideId)
      .single();

    const { data: guideUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', guideId)
      .single();

    // Send email notification to guide
    if (guideUser?.email) {
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'new_anonymous_inquiry',
            to: guideUser.email,
            anonymousName: name,
            anonymousEmail: email,
            tourTitle: tour?.title || 'Unknown Tour',
            message: message,
            conversationId: conversation.id
          }
        });
        console.log('[create-anonymous-inquiry] Email sent to guide');
      } catch (emailError) {
        console.error('[create-anonymous-inquiry] Error sending email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        conversationId: conversation.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[create-anonymous-inquiry] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
