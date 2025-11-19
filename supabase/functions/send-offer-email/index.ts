import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { corsHeaders } from "../_shared/cors.ts";
import { OfferEmail } from "./_templates/offer-email.tsx";

const logStep = (step: string, details?: any) => {
  console.log(`[SEND-OFFER-EMAIL] ${step}`, details || '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { offer_id } = await req.json();
    
    if (!offer_id) {
      throw new Error('offer_id is required');
    }

    logStep("Fetching offer details", { offer_id });

    // Fetch offer with related data
    const { data: offer, error: offerError } = await supabase
      .from('tour_offers')
      .select(`
        *,
        guide:guide_id(name, email, phone),
        hiker:hiker_id(name, email)
      `)
      .eq('id', offer_id)
      .single();

    if (offerError || !offer) {
      throw new Error('Offer not found');
    }

    logStep("Offer fetched", { hiker_email: offer.hiker_email });

    // Generate accept/decline URLs - use the production URL
    const baseUrl = 'https://madetohike.com';
    const acceptUrl = `${baseUrl}/offer/accept?token=${offer.offer_token}`;
    const declineUrl = `${baseUrl}/offer/decline?token=${offer.offer_token}`;

    logStep("Rendering email template");

    // Render email
    const html = await renderAsync(
      React.createElement(OfferEmail, {
        guideName: offer.guide?.name || 'Your Guide',
        guideEmail: offer.guide?.email || '',
        guidePhone: offer.guide?.phone || '',
        hikerName: offer.hiker?.name || 'Valued Client',
        duration: offer.duration,
        date: offer.preferred_date,
        groupSize: offer.group_size,
        meetingPoint: offer.meeting_point,
        meetingTime: offer.meeting_time,
        pricePerPerson: offer.price_per_person,
        totalPrice: offer.total_price,
        currency: offer.currency,
        itinerary: offer.itinerary,
        includedItems: offer.included_items,
        personalNote: offer.personal_note,
        acceptUrl,
        declineUrl,
      })
    );

    logStep("Sending email", { to: offer.hiker_email });

    // Send email
    const { error: emailError } = await resend.emails.send({
      from: 'MadeToHike <bookings@madetohike.com>',
      to: [offer.hiker_email],
      subject: `Your Custom Tour Offer from ${offer.guide?.name || 'MadeToHike'}`,
      html,
    });

    if (emailError) {
      logStep("Email send error", emailError);
      throw emailError;
    }

    logStep("Email sent successfully");

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
