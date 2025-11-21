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
    const url = new URL(req.url);
    
    // Parse request body
    const body = await req.json();
    const { action } = body;

    console.log('Received request with action:', action);

    // Action-based routing
    switch (action) {
      case 'create_token':
        return await createToken(supabase, body, url);
      
      case 'send_invitation':
        return await sendInvitation(supabase, body);
      
      case 'send_reminder':
        return await sendReminder(supabase, body);
      
      case 'validate_token':
        return await validateToken(supabase, body.token);
      
      case 'get_participants_status':
        return await getParticipantsStatus(supabase, body.booking_id);
      
      case 'submit_waiver':
        return await submitWaiver(supabase, body);
      
      case 'submit_insurance':
        return await submitInsurance(supabase, body);
      
      case 'submit_emergency_contact':
        return await submitEmergencyContact(supabase, body);
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }), 
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Generate secure token and hash it
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create new participant token
async function createToken(supabase: any, body: any, url: URL) {
  const { bookingId, participantIndex, email, name } = body;

  if (!bookingId || participantIndex === undefined || !email || !name) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Generate token
  const token = generateSecureToken();
  const tokenHash = await hashToken(token);

  // Check if token already exists for this participant
  const { data: existingToken } = await supabase
    .from('participant_tokens')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('participant_index', participantIndex)
    .single();

  let data, error;

  if (existingToken) {
    // Update existing token with new hash and reset expiration
    const result = await supabase
      .from('participant_tokens')
      .update({
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        participant_email: email,
        participant_name: name,
      })
      .eq('id', existingToken.id)
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  } else {
    // Create new token
    const result = await supabase
      .from('participant_tokens')
      .insert({
        booking_id: bookingId,
        participant_index: participantIndex,
        participant_email: email,
        participant_name: name,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();
    
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('Error creating/updating token:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const participantLink = `${url.origin}/participant/${token}`;

  return new Response(JSON.stringify({
    success: true,
    token_id: data.id,
    link: participantLink,
    token: token // Only returned once, never stored
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Send invitation email
async function sendInvitation(supabase: any, body: any) {
  const { tokenId, tourName, tourDates, guideName, primaryBookerName, bookingReference, frontendUrl } = body;

  if (!tokenId) {
    return new Response(JSON.stringify({ error: 'Missing tokenId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get token details
  const { data: tokenData, error: tokenError } = await supabase
    .from('participant_tokens')
    .select(`
      *,
      bookings:booking_id (
        booking_reference,
        tours:tour_id (
          title,
          guide_profiles:guide_id (
            display_name
          )
        )
      )
    `)
    .eq('id', tokenId)
    .single();

  if (tokenError || !tokenData) {
    return new Response(JSON.stringify({ error: 'Token not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Generate fresh token for link (we don't store raw tokens)
  const token = generateSecureToken();
  const tokenHash = await hashToken(token);
  
  // Update token hash
  await supabase
    .from('participant_tokens')
    .update({ token_hash: tokenHash })
    .eq('id', tokenId);

  const participantLink = `${frontendUrl || 'https://madetohike.com'}/participant/${token}`;

  // Extract data from nested structure
  const booking = tokenData.bookings;
  const tour = booking?.tours;
  const guide = tour?.guide_profiles;

  // Log data for debugging
  console.log('Token data:', {
    participant_name: tokenData.participant_name,
    booking: booking,
    tour: tour,
    guide: guide
  });

  console.log('Email data being sent:', {
    participantName: tokenData.participant_name,
    primaryBooker: primaryBookerName,
    tourTitle: tourName || tour?.title,
    tourDates: tourDates,
    guideName: guideName || guide?.display_name,
    bookingReference: bookingReference || booking?.booking_reference,
    participantLink
  });

  // Send email via send-email edge function with correct field names
  const emailResponse = await supabase.functions.invoke('send-email', {
    body: {
      type: 'participant_invitation',
      to: tokenData.participant_email,
      subject: `Complete Your Tour Documents for ${tourName || tour?.title}`,
      data: {
        participantName: tokenData.participant_name,
        primaryBooker: primaryBookerName,
        tourTitle: tourName || tour?.title,
        tourDates: tourDates,
        guideName: guideName || guide?.display_name,
        bookingReference: bookingReference || booking?.booking_reference,
        participantLink
      }
    }
  });

  return new Response(JSON.stringify({
    success: true,
    emailSent: !emailResponse.error,
    sentAt: new Date().toISOString()
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Send reminder email
async function sendReminder(supabase: any, body: any) {
  const { tokenId, tourName, daysUntilTour, primaryBookerName, frontendUrl } = body;

  if (!tokenId) {
    return new Response(JSON.stringify({ error: 'Missing tokenId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get token details with booking info
  const { data: tokenData, error: tokenError } = await supabase
    .from('participant_tokens')
    .select(`
      *,
      bookings:booking_id (
        tours:tour_id (
          title
        )
      )
    `)
    .eq('id', tokenId)
    .single();

  if (tokenError || !tokenData) {
    return new Response(JSON.stringify({ error: 'Token not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Generate fresh token for link
  const token = generateSecureToken();
  const tokenHash = await hashToken(token);
  
  // Update token hash and reminder count
  await supabase
    .from('participant_tokens')
    .update({ 
      token_hash: tokenHash,
      reminder_sent_at: new Date().toISOString(),
      reminder_count: (tokenData.reminder_count || 0) + 1
    })
    .eq('id', tokenId);

  const participantLink = `${frontendUrl || 'https://madetohike.com'}/participant/${token}`;

  // Extract tour title from nested structure
  const tour = tokenData.bookings?.tours;

  // Send reminder email with correct field names
  const emailResponse = await supabase.functions.invoke('send-email', {
    body: {
      type: 'participant_reminder',
      to: tokenData.participant_email,
      subject: `Reminder: Complete Your Tour Documents for ${tourName || tour?.title}`,
      data: {
        participantName: tokenData.participant_name,
        tourTitle: tourName || tour?.title,
        daysUntilTour,
        participantLink
      }
    }
  });

  return new Response(JSON.stringify({
    success: true,
    emailSent: !emailResponse.error,
    sentAt: new Date().toISOString()
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Validate token and return participant/booking data
async function validateToken(supabase: any, token: string) {
  if (!token) {
    return new Response(JSON.stringify({ 
      valid: false,
      error: 'Token required' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('Validating token:', token.substring(0, 10) + '...');

  const tokenHash = await hashToken(token);

  // Find token record with booking and tour data - use order by to get most recent
  const { data: tokenRecords, error } = await supabase
    .from('participant_tokens')
    .select(`
      *,
      bookings:booking_id (
        *,
        tours:tour_id (*)
      )
    `)
    .eq('token_hash', tokenHash)
    .order('created_at', { ascending: false });

  console.log('Token lookup result:', { found: !!tokenRecords?.length, count: tokenRecords?.length, error: error?.message });

  if (error || !tokenRecords || tokenRecords.length === 0) {
    return new Response(JSON.stringify({ 
      valid: false,
      error: 'Invalid or expired token' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Use the most recent token if multiple exist
  const tokenRecord = tokenRecords[0];

  // Check expiration
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return new Response(JSON.stringify({ 
      valid: false,
      error: 'Token has expired' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update last accessed
  await supabase
    .from('participant_tokens')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', tokenRecord.id);

  console.log('Returning valid token data for participant:', tokenRecord.participant_name);

  return new Response(JSON.stringify({
    valid: true,
    booking: tokenRecord.bookings,
    tour: tokenRecord.bookings?.tours,
    participantIndex: tokenRecord.participant_index,
    participantName: tokenRecord.participant_name,
    participantEmail: tokenRecord.participant_email,
    completionStatus: {
      waiver: tokenRecord.waiver_completed,
      insurance: tokenRecord.insurance_completed,
      emergencyContact: tokenRecord.emergency_contact_completed
    }
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Get all participants status for a booking
async function getParticipantsStatus(supabase: any, bookingId: string) {
  if (!bookingId) {
    return new Response(JSON.stringify({ error: 'Booking ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data, error } = await supabase
    .from('participant_tokens')
    .select('*')
    .eq('booking_id', bookingId)
    .order('participant_index');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Calculate status for each participant
  const participants = data.map((token: any) => {
    let status = 'not_started';
    if (token.completed_at) {
      status = 'complete';
    } else if (token.waiver_completed || token.insurance_completed || token.emergency_contact_completed) {
      status = 'in_progress';
    } else if (token.last_accessed_at) {
      status = 'in_progress';
    } else if (token.created_at) {
      status = 'invited';
    }

    return {
      // New clean fields
      id: token.id,
      name: token.participant_name,
      email: token.participant_email,
      status,
      invitedAt: token.created_at,
      completedAt: token.completed_at,
      waiverStatus: token.waiver_completed,
      insuranceStatus: token.insurance_completed,
      emergencyContactStatus: token.emergency_contact_completed,
      reminderCount: token.reminder_count,
      lastReminderAt: token.reminder_sent_at,
      
      // Compatibility fields for current frontend
      participant_index: token.participant_index,
      token_id: token.id,
      waiver_completed: token.waiver_completed,
      insurance_completed: token.insurance_completed,
      emergency_contact_completed: token.emergency_contact_completed,
      invited_at: token.created_at,
      completed_at: token.completed_at,
    };
  });

  return new Response(JSON.stringify({ participants }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Submit waiver data
async function submitWaiver(supabase: any, body: any) {
  try {
    // Support both new and legacy field names for robustness
    const waiverData = body.waiverData || body.waiver_data || body.waiver || body.data;
    const token = body.token;

    console.log('=== submitWaiver START ===');
    console.log('Incoming body keys:', Object.keys(body || {}));
    console.log('Has token:', !!token);
    console.log('Has waiverData:', !!waiverData);
    console.log('WaiverData keys:', waiverData ? Object.keys(waiverData) : 'null');

    if (!token || !waiverData) {
      console.error('Missing required fields', { hasToken: !!token, hasWaiverData: !!waiverData });
      return new Response(JSON.stringify({ error: 'Missing required fields: token or waiverData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 1: Hashing token...');
    const tokenHash = await hashToken(token);
    
    console.log('Step 2: Looking up token in DB...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('participant_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError) {
      console.error('Token lookup error:', tokenError);
      return new Response(JSON.stringify({ error: 'Invalid token: ' + tokenError.message }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!tokenData) {
      console.error('Token not found in database');
      return new Response(JSON.stringify({ error: 'Token not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 3: Found token:', tokenData.id);

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.error('Token expired at', tokenData.expires_at);
      return new Response(JSON.stringify({ error: 'Token has expired' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 4: Upserting participant documents...');
    const { data: docData, error: docError } = await supabase
      .from('participant_documents')
      .upsert({
        participant_token_id: tokenData.id,
        booking_id: tokenData.booking_id,
        waiver_data: waiverData,
        waiver_signature_url: waiverData.signatureDataUrl || null,
        waiver_submitted_at: new Date().toISOString()
      }, {
        onConflict: 'participant_token_id'
      })
      .select()
      .single();

    if (docError) {
      console.error('Error upserting participant_documents:', docError);
      return new Response(JSON.stringify({ error: 'Database error: ' + docError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 5: Document upserted successfully:', docData?.id);

    console.log('Step 6: Updating participant_tokens...');
    const { error: updateError } = await supabase
      .from('participant_tokens')
      .update({ 
        waiver_completed: true,
        used_at: tokenData.used_at || new Date().toISOString()
      })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error updating participant_tokens:', updateError);
    }

    console.log('Step 7: Checking completion status...');
    await checkAndMarkComplete(supabase, tokenData.id);

    console.log('=== submitWaiver SUCCESS ===');

    return new Response(JSON.stringify({
      success: true,
      message: 'Waiver submitted successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('=== submitWaiver EXCEPTION ===', error);
    return new Response(JSON.stringify({ error: 'Server error: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
// Submit insurance data
async function submitInsurance(supabase: any, body: any) {
  try {
    const insuranceData = body.insuranceData || body.insurance_data || body.insurance || body.data;
    const token = body.token;
    const documentUrl = body.documentUrl;

    console.log('=== submitInsurance START ===');
    console.log('Incoming body keys:', Object.keys(body || {}));
    console.log('Has token:', !!token);
    console.log('Has insuranceData:', !!insuranceData);

    if (!token || !insuranceData) {
      console.error('Missing required fields', { hasToken: !!token, hasInsuranceData: !!insuranceData });
      return new Response(JSON.stringify({ error: 'Missing required fields: token or insuranceData' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 1: Hashing token...');
    const tokenHash = await hashToken(token);
    
    console.log('Step 2: Looking up token in DB...');
    const { data: tokenData, error: tokenError } = await supabase
      .from('participant_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .single();

    if (tokenError) {
      console.error('Token lookup error:', tokenError);
      return new Response(JSON.stringify({ error: 'Invalid token: ' + tokenError.message }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!tokenData) {
      console.error('Token not found in database');
      return new Response(JSON.stringify({ error: 'Token not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 3: Found token:', tokenData.id);

    // Check if token has expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.error('Token expired at', tokenData.expires_at);
      return new Response(JSON.stringify({ error: 'Token has expired' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 4: Upserting insurance document...');
    const { error: docError } = await supabase
      .from('participant_documents')
      .upsert({
        participant_token_id: tokenData.id,
        booking_id: tokenData.booking_id,
        insurance_provider: insuranceData.provider,
        insurance_policy_number: insuranceData.policyNumber,
        insurance_emergency_number: insuranceData.emergencyNumber,
        insurance_document_url: documentUrl || null,
        insurance_submitted_at: new Date().toISOString()
      }, {
        onConflict: 'participant_token_id'
      });

    if (docError) {
      console.error('Error upserting insurance:', docError);
      return new Response(JSON.stringify({ error: 'Database error: ' + docError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Step 5: Insurance document saved');

    console.log('Step 6: Updating participant_tokens...');
    const { error: updateError } = await supabase
      .from('participant_tokens')
      .update({ 
        insurance_completed: true,
        used_at: tokenData.used_at || new Date().toISOString()
      })
      .eq('id', tokenData.id);

    if (updateError) {
      console.error('Error updating token:', updateError);
    }

    console.log('Step 7: Checking completion status...');
    await checkAndMarkComplete(supabase, tokenData.id);

    console.log('=== submitInsurance SUCCESS ===');

    return new Response(JSON.stringify({
      success: true,
      message: 'Insurance submitted successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('=== submitInsurance EXCEPTION ===', error);
    return new Response(JSON.stringify({ error: 'Server error: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Submit emergency contact data
async function submitEmergencyContact(supabase: any, body: any) {
  const { token, emergencyContactData } = body;

  if (!token || !emergencyContactData) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log('Submitting emergency contact for token:', token.substring(0, 10) + '...');

  // Validate token
  const tokenHash = await hashToken(token);
  const { data: tokenData, error: tokenError } = await supabase
    .from('participant_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .single();

  if (tokenError || !tokenData) {
    console.error('Token validation failed:', tokenError);
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check if token has expired
  if (new Date(tokenData.expires_at) < new Date()) {
    return new Response(JSON.stringify({ error: 'Token has expired' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Upsert participant documents
  const { error: docError } = await supabase
    .from('participant_documents')
    .upsert({
      participant_token_id: tokenData.id,
      booking_id: tokenData.booking_id,
      emergency_contact_name: emergencyContactData.name,
      emergency_contact_phone: emergencyContactData.phone,
      emergency_contact_relationship: emergencyContactData.relationship,
      emergency_contact_submitted_at: new Date().toISOString()
    }, {
      onConflict: 'participant_token_id'
    });

  if (docError) {
    console.error('Error saving emergency contact:', docError);
    return new Response(JSON.stringify({ error: docError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update token to mark emergency contact as completed
  const { error: updateError } = await supabase
    .from('participant_tokens')
    .update({ 
      emergency_contact_completed: true,
      used_at: tokenData.used_at || new Date().toISOString()
    })
    .eq('id', tokenData.id);

  if (updateError) {
    console.error('Error updating token:', updateError);
  }

  // Check if all documents are complete and update completed_at
  await checkAndMarkComplete(supabase, tokenData.id);

  console.log('Emergency contact submitted successfully');

  return new Response(JSON.stringify({
    success: true,
    message: 'Emergency contact submitted successfully'
  }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Helper function to check if all documents are complete and mark as complete
async function checkAndMarkComplete(supabase: any, tokenId: string) {
  const { data: tokenData } = await supabase
    .from('participant_tokens')
    .select('waiver_completed, insurance_completed, emergency_contact_completed, completed_at')
    .eq('id', tokenId)
    .single();

  if (tokenData && 
      tokenData.waiver_completed && 
      tokenData.insurance_completed && 
      tokenData.emergency_contact_completed &&
      !tokenData.completed_at) {
    // All documents complete - mark as completed
    await supabase
      .from('participant_tokens')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', tokenId);
    
    console.log('All documents complete - marked participant as complete');
  }
}
