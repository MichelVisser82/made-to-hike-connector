import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface NotifyDateChangePayload {
  tourId: string;
  oldDate: string;
  newDate: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { tourId, oldDate, newDate }: NotifyDateChangePayload = await req.json();

    console.log('Tour date change notification triggered:', { tourId, oldDate, newDate });

    // Get tour details
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select(`
        title,
        guide_id,
        guide_profiles!tours_guide_id_fkey (
          display_name
        )
      `)
      .eq('id', tourId)
      .single();

    if (tourError || !tour) {
      console.error('Error fetching tour:', tourError);
      return new Response(JSON.stringify({ error: 'Tour not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all bookings for this tour on the old date
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        hiker_email,
        profiles!bookings_hiker_id_fkey (
          name
        )
      `)
      .eq('tour_id', tourId)
      .eq('booking_date', oldDate)
      .in('status', ['pending', 'confirmed']);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch bookings' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${bookings?.length || 0} bookings to notify`);

    // Send notification to each hiker
    const notifications = [];
    if (bookings && bookings.length > 0) {
      for (const booking of bookings) {
        try {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'tour_date_change_notification',
              to: booking.hiker_email,
              data: {
                hikerName: booking.profiles?.name || 'Hiker',
                tourTitle: tour.title,
                oldDate: new Date(oldDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                newDate: new Date(newDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }),
                guideName: tour.guide_profiles?.display_name || 'Your Guide',
                bookingReference: booking.booking_reference,
              }
            }
          });
          
          notifications.push({ 
            bookingId: booking.id, 
            email: booking.hiker_email, 
            status: 'sent' 
          });
          console.log(`Notification sent to ${booking.hiker_email}`);
        } catch (emailError) {
          console.error(`Error sending to ${booking.hiker_email}:`, emailError);
          notifications.push({ 
            bookingId: booking.id, 
            email: booking.hiker_email, 
            status: 'failed',
            error: emailError.message 
          });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      notificationsSent: notifications.length,
      details: notifications
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in notify-tour-date-change:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
