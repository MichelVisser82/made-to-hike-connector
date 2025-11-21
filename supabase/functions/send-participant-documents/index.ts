import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { tourId, tourDate, guideEmail } = await req.json();

    console.log('Generating participant documents PDF for:', { tourId, tourDate, guideEmail });

    // Fetch tour details
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('title, slug, duration, meeting_point')
      .eq('id', tourId)
      .single();

    if (tourError) throw tourError;

    // Fetch bookings with participant details
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        id,
        booking_reference,
        booking_date,
        participants,
        participants_details,
        waiver_data,
        waiver_uploaded_at,
        insurance_uploaded_at,
        hiker:profiles!bookings_hiker_id_fkey (
          id,
          name,
          email,
          phone,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relationship
        )
      `)
      .eq('tour_id', tourId)
      .in('status', ['confirmed', 'pending', 'pending_confirmation']);

    if (tourDate) {
      bookingsQuery = bookingsQuery.eq('booking_date', tourDate);
    }

    const { data: bookings, error: bookingsError } = await bookingsQuery;
    if (bookingsError) throw bookingsError;

    // Fetch participant tokens for detailed status
    const bookingIds = (bookings || []).map(b => b.id);
    const { data: tokens } = await supabase
      .from('participant_tokens')
      .select('*')
      .in('booking_id', bookingIds);

    // Create token map
    const tokensByBooking = new Map<string, Map<number, any>>();
    (tokens || []).forEach((token: any) => {
      if (!tokensByBooking.has(token.booking_id)) {
        tokensByBooking.set(token.booking_id, new Map());
      }
      tokensByBooking.get(token.booking_id)!.set(token.participant_index, token);
    });

    // Generate HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; }
          h1 { color: #7c2d3e; font-size: 28px; margin-bottom: 10px; }
          h2 { color: #7c2d3e; font-size: 20px; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #7c2d3e; padding-bottom: 5px; }
          h3 { color: #4a5568; font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
          .header { margin-bottom: 30px; }
          .info-row { margin: 5px 0; }
          .label { font-weight: bold; color: #4a5568; }
          .participant-card { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #7c2d3e; }
          .status-complete { color: #059669; font-weight: bold; }
          .status-pending { color: #d97706; font-weight: bold; }
          .status-missing { color: #dc2626; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .section { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Participant Documents Summary</h1>
          <div class="info-row"><span class="label">Tour:</span> ${tour.title}</div>
          <div class="info-row"><span class="label">Date:</span> ${tourDate || 'Multiple dates'}</div>
          <div class="info-row"><span class="label">Duration:</span> ${tour.duration}</div>
          <div class="info-row"><span class="label">Meeting Point:</span> ${tour.meeting_point}</div>
          <div class="info-row"><span class="label">Generated:</span> ${new Date().toLocaleString()}</div>
        </div>
    `;

    let totalParticipants = 0;
    let completedWaivers = 0;
    let completedInsurance = 0;

    for (const booking of bookings || []) {
      const bookingTokens = tokensByBooking.get(booking.id);
      const participants = booking.participants_details || [];
      totalParticipants += participants.length;

      htmlContent += `
        <h2>Booking: ${booking.booking_reference}</h2>
        <div class="section">
          <div class="info-row"><span class="label">Primary Contact:</span> ${booking.hiker.name}</div>
          <div class="info-row"><span class="label">Email:</span> ${booking.hiker.email}</div>
          ${booking.hiker.phone ? `<div class="info-row"><span class="label">Phone:</span> ${booking.hiker.phone}</div>` : ''}
          ${booking.hiker.emergency_contact_name ? `
            <div class="info-row"><span class="label">Emergency Contact:</span> ${booking.hiker.emergency_contact_name} 
            (${booking.hiker.emergency_contact_relationship || 'N/A'}) - ${booking.hiker.emergency_contact_phone || 'No phone'}</div>
          ` : ''}
        </div>
      `;

      participants.forEach((participant: any, idx: number) => {
        const token = bookingTokens?.get(idx);
        const waiverComplete = token?.waiver_completed || (idx === 0 && booking.waiver_uploaded_at);
        const insuranceComplete = token?.insurance_completed || (idx === 0 && booking.insurance_uploaded_at);

        if (waiverComplete) completedWaivers++;
        if (insuranceComplete) completedInsurance++;

        htmlContent += `
          <div class="participant-card">
            <h3>${participant.firstName} ${participant.surname}${idx === 0 ? ' (Lead)' : ''}</h3>
            <div class="info-row"><span class="label">Age:</span> ${participant.age || 'N/A'}</div>
            <div class="info-row"><span class="label">Experience:</span> ${participant.experience || 'N/A'}</div>
            ${participant.medicalConditions ? `<div class="info-row"><span class="label">Medical:</span> ${participant.medicalConditions}</div>` : ''}
            
            <div style="margin-top: 10px;">
              <div class="info-row">
                <span class="label">Waiver Status:</span> 
                <span class="${waiverComplete ? 'status-complete' : 'status-missing'}">
                  ${waiverComplete ? '✓ Signed' : '✗ Pending'}
                </span>
              </div>
              <div class="info-row">
                <span class="label">Insurance Status:</span> 
                <span class="${insuranceComplete ? 'status-complete' : 'status-missing'}">
                  ${insuranceComplete ? '✓ Verified' : '✗ Pending'}
                </span>
              </div>
            </div>

            ${participant.participantEmail ? `<div class="info-row"><span class="label">Email:</span> ${participant.participantEmail}</div>` : ''}
            ${participant.participantPhone ? `<div class="info-row"><span class="label">Phone:</span> ${participant.participantPhone}</div>` : ''}
          </div>
        `;
      });
    }

    // Add summary
    htmlContent += `
        <h2>Summary</h2>
        <table>
          <tr>
            <th>Metric</th>
            <th>Count</th>
          </tr>
          <tr>
            <td>Total Participants</td>
            <td>${totalParticipants}</td>
          </tr>
          <tr>
            <td>Waivers Completed</td>
            <td>${completedWaivers} / ${totalParticipants}</td>
          </tr>
          <tr>
            <td>Insurance Verified</td>
            <td>${completedInsurance} / ${totalParticipants}</td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Convert HTML to base64 for PDF generation (using external service or library)
    // For now, we'll send the HTML directly as an attachment
    const htmlBase64 = btoa(unescape(encodeURIComponent(htmlContent)));

    // Send email with HTML attachment via send-email function
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        type: 'guide_participant_documents',
        to: guideEmail,
        subject: `Participant Documents - ${tour.title}${tourDate ? ` (${new Date(tourDate).toLocaleDateString()})` : ''}`,
        data: {
          tourTitle: tour.title,
          tourDate: tourDate || 'Multiple dates',
          totalParticipants,
          completedWaivers,
          completedInsurance,
          htmlAttachment: htmlBase64,
          fileName: `participant-documents-${tour.slug}-${tourDate || 'all'}.html`
        }
      }
    });

    if (emailError) {
      console.error('Email sending error:', emailError);
      throw emailError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Participant documents sent successfully',
        totalParticipants,
        completedWaivers,
        completedInsurance
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error sending participant documents:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});