import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  console.log(`[CREATE-TOUR-OFFER] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    // Decode JWT payload (Supabase already verified JWT before invoking function)
    let userId: string | null = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] ?? '')) as { sub?: string };
      userId = payload.sub ?? null;
    } catch (err) {
      logStep('JWT decode error', err);
      throw new Error('Unauthorized');
    }

    if (!userId) {
      logStep('No user id in JWT payload');
      throw new Error('Unauthorized');
    }

    logStep('User authenticated', { user_id: userId });

    // Create client with service role key for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const offerData = await req.json();
    logStep("Received offer data", { conversation_id: offerData.conversation_id });
    
    // Validate required fields
    if (!offerData.conversation_id || !offerData.guide_id || !offerData.hiker_email) {
      throw new Error('Missing required fields');
    }

    // Verify user is the guide
    if (userId !== offerData.guide_id) {
      throw new Error('Unauthorized: User is not the guide');
    }

    // Generate secure token
    const offerToken = crypto.randomUUID();
    logStep("Generated offer token");
    
    // Create a tour record for this custom offer
    logStep("Creating tour record for custom offer");
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .insert({
        guide_id: offerData.guide_id,
        title: `Custom Tour - ${offerData.duration}`,
        description: offerData.itinerary,
        duration: offerData.duration,
        price: offerData.total_price,
        currency: offerData.currency || 'EUR',
        group_size: offerData.group_size,
        difficulty: 'moderate',
        meeting_point: offerData.meeting_point,
        meeting_point_lat: offerData.meeting_point_lat,
        meeting_point_lng: offerData.meeting_point_lng,
        region: 'Custom',
        is_active: false, // Custom tours are not publicly listed
        itinerary: { days: [{ day: 1, description: offerData.itinerary }] },
      })
      .select()
      .single();

    if (tourError) {
      logStep("Tour creation error", tourError);
      throw tourError;
    }

    logStep("Tour created", { tour_id: tour.id });
    
    // Insert offer with tour_id
    const { data: offer, error: insertError } = await supabase
      .from('tour_offers')
      .insert({
        conversation_id: offerData.conversation_id,
        guide_id: offerData.guide_id,
        hiker_id: offerData.hiker_id,
        hiker_email: offerData.hiker_email,
        tour_id: tour.id,
        offer_status: 'pending',
        price_per_person: offerData.price_per_person,
        total_price: offerData.total_price,
        currency: offerData.currency || 'EUR',
        duration: offerData.duration,
        preferred_date: offerData.preferred_date,
        group_size: offerData.group_size,
        meeting_point: offerData.meeting_point,
        meeting_time: offerData.meeting_time,
        itinerary: offerData.itinerary,
        included_items: offerData.included_items,
        personal_note: offerData.personal_note,
        offer_token: offerToken,
      })
      .select()
      .single();

    if (insertError) {
      logStep("Insert error", insertError);
      throw insertError;
    }

    logStep("Offer created", { offer_id: offer.id });

    // Send email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-offer-email', {
        body: { offer_id: offer.id },
      });

      if (emailError) {
        logStep("Email error (non-fatal)", emailError);
        // Continue anyway - offer is created
      } else {
        logStep("Email sent successfully");
      }
    } catch (emailErr) {
      logStep("Email exception (non-fatal)", emailErr);
    }

    // Create system message in conversation
    const { error: messageError } = await supabase.from('messages').insert({
      conversation_id: offerData.conversation_id,
      sender_id: offerData.guide_id,
      sender_type: 'system',
      content: `Tour offer sent to client. Total: €${offerData.total_price} for ${offerData.group_size} ${offerData.group_size === 1 ? 'person' : 'people'}.`,
      message_type: 'system',
      is_automated: true,
    });

    if (messageError) {
      logStep("Message insert error (non-fatal)", messageError);
    }

    logStep("Offer process completed");

    return new Response(JSON.stringify({ success: true, offer }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logStep("ERROR", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
