import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bookingReference } = await req.json();
    
    if (!bookingReference) {
      return new Response(
        JSON.stringify({ error: 'Booking reference required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, booking_reference, date_slot_id, participants, status')
      .eq('booking_reference', bookingReference)
      .single();

    if (fetchError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cancel the booking
    const { error: cancelError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id);

    if (cancelError) {
      console.error('Error cancelling booking:', cancelError);
      throw cancelError;
    }

    // Release the held spots if booking wasn't already cancelled
    if (booking.status !== 'cancelled') {
      const { data: dateSlot } = await supabase
        .from('tour_date_slots')
        .select('spots_booked')
        .eq('id', booking.date_slot_id)
        .single();

      if (dateSlot) {
        const newSpotsBooked = Math.max(0, dateSlot.spots_booked - booking.participants);
        
        await supabase
          .from('tour_date_slots')
          .update({ spots_booked: newSpotsBooked })
          .eq('id', booking.date_slot_id);

        console.log(`Released ${booking.participants} spots for ${bookingReference}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Booking ${bookingReference} cancelled successfully`,
        spotsReleased: booking.status !== 'cancelled' ? booking.participants : 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cancel-booking-admin:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
