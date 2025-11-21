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
      .in('status', ['confirmed', 'pending', 'pending_confirmation', 'completed']);

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

    // Fetch participant documents with full details
    const { data: participantDocs } = await supabase
      .from('participant_documents')
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

    // Create participant documents map
    const docsByTokenId = new Map<string, any>();
    (participantDocs || []).forEach((doc: any) => {
      docsByTokenId.set(doc.participant_token_id, doc);
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
          h4 { color: #7c2d3e; font-size: 14px; margin-top: 15px; margin-bottom: 8px; }
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
        const docs = token ? docsByTokenId.get(token.id) : null;
        const waiver = docs?.waiver_data || {};
        const waiverComplete = token?.waiver_completed || (idx === 0 && booking.waiver_uploaded_at);
        const insuranceComplete = token?.insurance_completed || (idx === 0 && booking.insurance_uploaded_at);

        if (waiverComplete) completedWaivers++;
        if (insuranceComplete) completedInsurance++;

        // Calculate age from DOB if available
        let age = participant.age;
        if (!age && waiver.dateOfBirth) {
          const dob = new Date(waiver.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
        }

        htmlContent += `
          <div class="participant-card">
            <h3>${participant.firstName} ${participant.surname}${idx === 0 ? ' (Lead)' : ''}</h3>
            <div class="info-row"><span class="label">Age:</span> ${age || 'Not provided'}</div>
            <div class="info-row"><span class="label">Experience:</span> ${participant.experience || waiver.hikingExperience || 'Not provided'}</div>
            ${(participant.medicalConditions || waiver.medicalConditions) ? `<div class="info-row"><span class="label">Medical:</span> ${participant.medicalConditions || waiver.medicalConditions}</div>` : ''}
        `;

        // Waiver Section
        if (waiver && Object.keys(waiver).length > 0) {
          htmlContent += `
            <h4 style="color: #7c2d3e; margin-top: 15px; margin-bottom: 8px;">📋 Waiver Information</h4>
            <div style="background: white; padding: 10px; border-radius: 4px;">
              ${waiver.fullName ? `<div class="info-row"><span class="label">Full Name:</span> ${waiver.fullName}</div>` : ''}
              ${waiver.dateOfBirth ? `<div class="info-row"><span class="label">Date of Birth:</span> ${new Date(waiver.dateOfBirth).toLocaleDateString()}</div>` : ''}
              ${waiver.nationality ? `<div class="info-row"><span class="label">Nationality:</span> ${waiver.nationality}</div>` : ''}
              ${waiver.address || waiver.city || waiver.country ? `
                <div class="info-row"><span class="label">Address:</span> ${[waiver.address, waiver.city, waiver.country].filter(Boolean).join(', ')}</div>
              ` : ''}
              ${waiver.phone ? `<div class="info-row"><span class="label">Phone:</span> ${waiver.phone}</div>` : ''}
              ${waiver.email ? `<div class="info-row"><span class="label">Email:</span> ${waiver.email}</div>` : ''}
              ${waiver.medicalConditions ? `<div class="info-row"><span class="label">Medical Conditions:</span> ${waiver.medicalConditions}</div>` : ''}
              ${waiver.hikingExperience ? `<div class="info-row"><span class="label">Hiking Experience:</span> ${waiver.hikingExperience}</div>` : ''}
              
              ${waiver.emergencyContactName || waiver.emergencyContactPhone || waiver.emergencyContactRelationship ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                  <strong style="color: #7c2d3e;">Emergency Contact (from Waiver):</strong>
                  ${waiver.emergencyContactName ? `<div class="info-row"><span class="label">Name:</span> ${waiver.emergencyContactName}</div>` : ''}
                  ${waiver.emergencyContactPhone ? `<div class="info-row"><span class="label">Phone:</span> ${waiver.emergencyContactPhone}</div>` : ''}
                  ${waiver.emergencyContactRelationship ? `<div class="info-row"><span class="label">Relationship:</span> ${waiver.emergencyContactRelationship}</div>` : ''}
                </div>
              ` : ''}
              
              ${waiver.signature ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                  <div class="info-row"><span class="label">Digital Signature:</span></div>
                  <img src="${waiver.signature}" style="max-width: 300px; height: auto; border: 1px solid #e5e7eb; margin-top: 8px; background: white;" alt="Participant signature" />
                </div>
              ` : ''}
              ${docs?.waiver_submitted_at ? `<div class="info-row" style="margin-top: 8px;"><span class="label">Submitted:</span> ${new Date(docs.waiver_submitted_at).toLocaleString()}</div>` : ''}
              
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                ${waiver.hasReadTerms ? `<div class="info-row">✓ Read and accepted terms and conditions</div>` : ''}
                ${waiver.acceptsRisks ? `<div class="info-row">✓ Acknowledges and accepts inherent risks</div>` : ''}
                ${waiver.releasesLiability ? `<div class="info-row">✓ Releases liability and waives claims</div>` : ''}
              </div>
            </div>
          `;
        } else if (waiverComplete) {
          htmlContent += `
            <h4 style="color: #7c2d3e; margin-top: 15px; margin-bottom: 8px;">📋 Waiver Information</h4>
            <div style="background: white; padding: 10px; border-radius: 4px;">
              <div class="status-complete">✓ Waiver signed but details not available (legacy submission)</div>
            </div>
          `;
        } else {
          htmlContent += `
            <h4 style="color: #7c2d3e; margin-top: 15px; margin-bottom: 8px;">📋 Waiver Information</h4>
            <div style="background: white; padding: 10px; border-radius: 4px;">
              <div class="status-missing">✗ Waiver not submitted</div>
            </div>
          `;
        }

        // Insurance Section
        if (docs?.insurance_provider || docs?.insurance_policy_number || insuranceComplete) {
          htmlContent += `
            <h4 style="color: #7c2d3e; margin-top: 15px; margin-bottom: 8px;">🏥 Travel Insurance</h4>
            <div style="background: white; padding: 10px; border-radius: 4px;">
          `;
          
          if (docs?.insurance_provider || docs?.insurance_policy_number) {
            htmlContent += `
              ${docs.insurance_provider ? `<div class="info-row"><span class="label">Provider:</span> ${docs.insurance_provider}</div>` : ''}
              ${docs.insurance_policy_number ? `<div class="info-row"><span class="label">Policy Number:</span> ${docs.insurance_policy_number}</div>` : ''}
              ${docs.insurance_emergency_number ? `<div class="info-row"><span class="label">Emergency Contact Number:</span> ${docs.insurance_emergency_number}</div>` : ''}
              ${docs.insurance_document_url ? `<div class="info-row"><span class="label">Document:</span> <a href="${docs.insurance_document_url}" style="color: #7c2d3e; text-decoration: underline;">View Insurance Document</a></div>` : ''}
              ${docs.insurance_submitted_at ? `<div class="info-row"><span class="label">Submitted:</span> ${new Date(docs.insurance_submitted_at).toLocaleString()}</div>` : ''}
            `;
          } else if (insuranceComplete) {
            htmlContent += `<div class="status-complete">✓ Insurance verified but details not available (legacy submission)</div>`;
          }
          
          htmlContent += `</div>`;
        } else {
          htmlContent += `
            <h4 style="color: #7c2d3e; margin-top: 15px; margin-bottom: 8px;">🏥 Travel Insurance</h4>
            <div style="background: white; padding: 10px; border-radius: 4px;">
              <div class="status-missing">✗ Insurance not submitted</div>
            </div>
          `;
        }

        // Emergency Contact Section (from participant_documents)
        if (docs?.emergency_contact_name) {
          htmlContent += `
            <h4 style="color: #7c2d3e; margin-top: 15px; margin-bottom: 8px;">🚨 Emergency Contact (Primary)</h4>
            <div style="background: white; padding: 10px; border-radius: 4px;">
              <div class="info-row"><span class="label">Name:</span> ${docs.emergency_contact_name}</div>
              ${docs.emergency_contact_phone ? `<div class="info-row"><span class="label">Phone:</span> ${docs.emergency_contact_phone}</div>` : ''}
              ${docs.emergency_contact_relationship ? `<div class="info-row"><span class="label">Relationship:</span> ${docs.emergency_contact_relationship}</div>` : ''}
              ${docs.emergency_contact_submitted_at ? `<div class="info-row"><span class="label">Submitted:</span> ${new Date(docs.emergency_contact_submitted_at).toLocaleString()}</div>` : ''}
            </div>
          `;
        }

        htmlContent += `</div>`;
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