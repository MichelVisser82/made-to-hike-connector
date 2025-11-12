import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting abandoned bookings cleanup...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find bookings that are:
    // 1. Created more than 30 minutes ago
    // 2. Have payment_status = 'pending'
    // 3. Have no stripe_payment_intent_id (never started payment)
    // 4. Not already cancelled
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: abandonedBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, booking_reference, tour_id, date_slot_id, participants, hiker_id, created_at')
      .eq('payment_status', 'pending')
      .is('stripe_payment_intent_id', null)
      .neq('status', 'cancelled')
      .lt('created_at', thirtyMinutesAgo);

    if (fetchError) {
      console.error('Error fetching abandoned bookings:', fetchError);
      throw fetchError;
    }

    if (!abandonedBookings || abandonedBookings.length === 0) {
      console.log('No abandoned bookings found');
      return new Response(
        JSON.stringify({ message: 'No abandoned bookings to clean up', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${abandonedBookings.length} abandoned bookings to clean up`);

    let successCount = 0;
    let errorCount = 0;

    for (const booking of abandonedBookings) {
      try {
        console.log(`Processing abandoned booking: ${booking.booking_reference}`);

        // Cancel the booking
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Failed to cancel booking ${booking.booking_reference}:`, updateError);
          errorCount++;
          continue;
        }

        // Release the held spots
        const { data: dateSlot } = await supabase
          .from('tour_date_slots')
          .select('spots_booked')
          .eq('id', booking.date_slot_id)
          .single();

        if (dateSlot) {
          const newSpotsBooked = Math.max(0, dateSlot.spots_booked - booking.participants);
          
          const { error: slotError } = await supabase
            .from('tour_date_slots')
            .update({ spots_booked: newSpotsBooked })
            .eq('id', booking.date_slot_id);

          if (slotError) {
            console.error(`Failed to update slots for ${booking.booking_reference}:`, slotError);
          } else {
            console.log(`Released ${booking.participants} spots for booking ${booking.booking_reference}`);
          }
        }

        successCount++;
        console.log(`Successfully cleaned up booking: ${booking.booking_reference}`);

      } catch (bookingError) {
        console.error(`Error processing booking ${booking.booking_reference}:`, bookingError);
        errorCount++;
      }
    }

    console.log(`Cleanup complete: ${successCount} successful, ${errorCount} failed`);

    return new Response(
      JSON.stringify({
        message: 'Abandoned bookings cleanup completed',
        total: abandonedBookings.length,
        successful: successCount,
        failed: errorCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cleanup-abandoned-bookings:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
