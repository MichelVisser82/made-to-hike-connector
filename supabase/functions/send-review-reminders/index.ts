import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = Date.now();
    
    // Find reviews that need reminders
    // First reminder: 24 hours after creation (reminder_sent_count = 0)
    // Second reminder: 48 hours after creation (reminder_sent_count = 1)
    // Final reminder: 4 days after creation (reminder_sent_count = 2)

    const { data: reviewsNeedingReminders, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        hiker_id,
        guide_id,
        review_type,
        booking_id,
        created_at,
        expires_at,
        reminder_sent_count,
        tours!inner (
          id,
          title,
          guide_id
        ),
        bookings!inner (
          id,
          hiker_id,
          booking_date
        )
      `)
      .eq('review_status', 'draft')
      .lt('reminder_sent_count', 3);

    if (reviewsError) throw reviewsError;

    console.log(`Checking ${reviewsNeedingReminders?.length || 0} reviews for reminders`);

    const results = [];

    for (const review of reviewsNeedingReminders || []) {
      try {
        const createdAt = new Date(review.created_at).getTime();
        const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

        let shouldSend = false;
        let notificationType: 'first_reminder' | 'second_reminder' | 'final_reminder' | null = null;

        // Determine which reminder to send
        if (review.reminder_sent_count === 0 && hoursSinceCreation >= 24) {
          shouldSend = true;
          notificationType = 'first_reminder';
        } else if (review.reminder_sent_count === 1 && hoursSinceCreation >= 48) {
          shouldSend = true;
          notificationType = 'second_reminder';
        } else if (review.reminder_sent_count === 2 && hoursSinceCreation >= 96) { // 4 days
          shouldSend = true;
          notificationType = 'final_reminder';
        }

        if (shouldSend && notificationType) {
          // Update reminder tracking
          await supabase
            .from('reviews')
            .update({
              reminder_sent_count: review.reminder_sent_count + 1,
              last_reminder_sent_at: new Date().toISOString()
            })
            .eq('id', review.id);

          // Create notification record
          const recipientId = review.review_type === 'hiker_to_guide' ? review.hiker_id : review.guide_id;
          const recipientType = review.review_type === 'hiker_to_guide' ? 'hiker' : 'guide';

          await supabase.from('review_notifications').insert({
            booking_id: review.booking_id,
            recipient_id: recipientId,
            recipient_type: recipientType,
            notification_type: notificationType
          });

          // Fetch recipient profile data
          const { data: recipientProfile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', recipientId)
            .single();

          if (recipientProfile?.email) {
            const expiresDate = new Date(review.expires_at).toLocaleDateString('en-US', { 
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            const bookingDate = new Date(review.bookings.booking_date).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            });
            const reviewUrl = `https://ab369f57-f214-4187-b9e3-10bb8b4025d9.lovableproject.com/dashboard?section=inbox&tab=reviews&bookingId=${review.booking_id}`;

            // Send reminder email
            try {
              await supabase.functions.invoke('send-email', {
                body: {
                  type: 'review_reminder',
                  to: recipientProfile.email,
                  data: {
                    recipientName: recipientProfile.name,
                    recipientType: recipientType,
                    tourTitle: review.tours.title,
                    bookingDate: bookingDate,
                    reviewUrl: reviewUrl,
                    expiresDate: expiresDate,
                    reminderType: notificationType
                  }
                }
              });
              console.log(`Sent ${notificationType} email to ${recipientProfile.email} for review ${review.id}`);
            } catch (error) {
              console.error(`Failed to send reminder email:`, error);
            }
          }

          results.push({
            review_id: review.id,
            reminder_type: notificationType,
            success: true
          });
        }
      } catch (error) {
        console.error(`Error sending reminder for review ${review.id}:`, error);
        results.push({
          review_id: review.id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: results.length,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in send-review-reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
