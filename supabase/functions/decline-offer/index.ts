import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  console.log(`[DECLINE-OFFER] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, reason } = await req.json();
    
    if (!token) {
      throw new Error('Token is required');
    }

    logStep("Fetching offer", { token });

    // Fetch offer
    const { data: offer, error: offerError } = await supabase
      .from('tour_offers')
      .select('*, guide:guide_id(name, email)')
      .eq('offer_token', token)
      .single();

    if (offerError || !offer) {
      throw new Error('Offer not found');
    }

    // Check offer can be declined
    if (offer.offer_status !== 'pending' && offer.offer_status !== 'payment_pending') {
      throw new Error(`Offer is ${offer.offer_status}`);
    }

    logStep("Updating offer status");

    // Update offer
    await supabase
      .from('tour_offers')
      .update({ 
        offer_status: 'declined',
        declined_at: new Date().toISOString(),
      })
      .eq('id', offer.id);

    // Create system message
    const declineMessage = reason 
      ? `Client declined the offer. Reason: ${reason}`
      : 'Client declined the offer.';

    await supabase.from('messages').insert({
      conversation_id: offer.conversation_id,
      sender_id: offer.hiker_id,
      sender_type: 'system',
      content: declineMessage,
      message_type: 'system',
      is_automated: true,
    });

    logStep("Offer declined");

    // TODO: Send email to guide about declination
    // This can be added later

    return new Response(JSON.stringify({ success: true }), {
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
