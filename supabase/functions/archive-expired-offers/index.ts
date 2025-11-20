import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsHeaders } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  console.log(`[ARCHIVE-EXPIRED-OFFERS] ${step}`, details || '');
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

    const now = new Date().toISOString();
    logStep("Checking for expired offers", { currentTime: now });

    // Find expired pending offers
    const { data: expiredOffers, error: fetchError } = await supabase
      .from('tour_offers')
      .select('id, tour_id, conversation_id, expires_at, hiker_email')
      .eq('offer_status', 'pending')
      .lt('expires_at', now);

    if (fetchError) {
      logStep("Error fetching expired offers", fetchError);
      throw fetchError;
    }

    logStep(`Found ${expiredOffers?.length || 0} expired offers to process`);

    let archivedCount = 0;
    const errors: any[] = [];

    // Process each expired offer
    for (const offer of expiredOffers || []) {
      try {
        logStep(`Processing expired offer`, { offer_id: offer.id, tour_id: offer.tour_id });

        // Update offer status to 'expired'
        const { error: offerUpdateError } = await supabase
          .from('tour_offers')
          .update({ offer_status: 'expired' })
          .eq('id', offer.id);

        if (offerUpdateError) {
          logStep("Error updating offer status", offerUpdateError);
          errors.push({ offer_id: offer.id, error: offerUpdateError });
          continue;
        }

        // Archive the associated tour
        if (offer.tour_id) {
          const { error: tourUpdateError } = await supabase
            .from('tours')
            .update({ archived: true })
            .eq('id', offer.tour_id);

          if (tourUpdateError) {
            logStep("Error archiving tour", tourUpdateError);
            errors.push({ offer_id: offer.id, tour_id: offer.tour_id, error: tourUpdateError });
            continue;
          }
        }

        // Insert system message to conversation
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            conversation_id: offer.conversation_id,
            sender_type: 'system',
            content: 'This custom tour offer has expired after 7 days without acceptance.',
            message_type: 'system',
            is_automated: true,
          });

        if (messageError) {
          logStep("Error inserting system message", messageError);
          // Non-fatal, continue
        }

        archivedCount++;
        logStep(`Successfully archived offer ${offer.id}`);

      } catch (offerError) {
        logStep(`Error processing offer ${offer.id}`, offerError);
        errors.push({ offer_id: offer.id, error: offerError });
      }
    }

    const summary = {
      total_expired: expiredOffers?.length || 0,
      successfully_archived: archivedCount,
      errors: errors.length,
      error_details: errors
    };

    logStep("Archival complete", summary);

    return new Response(JSON.stringify(summary), {
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
