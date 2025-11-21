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

  // Store in database
  const { data, error } = await supabase
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

  if (error) {
    console.error('Error creating token:', error);
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
  const { tokenId, tourName, tourDates, guideName, primaryBookerName } = body;

  if (!tokenId) {
    return new Response(JSON.stringify({ error: 'Missing tokenId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get token details
  const { data: tokenData, error: tokenError } = await supabase
    .from('participant_tokens')
    .select('*')
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

  const participantLink = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.app')}/participant/${token}`;

  // Send email via send-email edge function
  const emailResponse = await supabase.functions.invoke('send-email', {
    body: {
      to: tokenData.participant_email,
      subject: `Complete Your Tour Documents for ${tourName}`,
      templateType: 'participant_invitation',
      templateData: {
        participantName: tokenData.participant_name,
        primaryBookerName,
        tourName,
        tourDates,
        guideName,
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
  const { tokenId, tourName, daysUntilTour, primaryBookerName } = body;

  if (!tokenId) {
    return new Response(JSON.stringify({ error: 'Missing tokenId' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Get token details
  const { data: tokenData, error: tokenError } = await supabase
    .from('participant_tokens')
    .select('*')
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

  const participantLink = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.app')}/participant/${token}`;

  // Send reminder email
  const emailResponse = await supabase.functions.invoke('send-email', {
    body: {
      to: tokenData.participant_email,
      subject: `Reminder: Complete Your Tour Documents for ${tourName}`,
      templateType: 'participant_reminder',
      templateData: {
        participantName: tokenData.participant_name,
        tourName,
        daysUntilTour,
        primaryBookerName,
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
    return new Response(JSON.stringify({ error: 'Token required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const tokenHash = await hashToken(token);

  // Find token record with booking and tour data
  const { data: tokenRecord, error } = await supabase
    .from('participant_tokens')
    .select(`
      *,
      bookings:booking_id (
        *,
        tours:tour_id (*)
      )
    `)
    .eq('token_hash', tokenHash)
    .single();

  if (error || !tokenRecord) {
    return new Response(JSON.stringify({ 
      valid: false,
      error: 'Invalid or expired token' 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check expiration
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return new Response(JSON.stringify({ 
      valid: false,
      error: 'Token has expired' 
    }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Update last accessed
  await supabase
    .from('participant_tokens')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', tokenRecord.id);

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
      lastReminderAt: token.reminder_sent_at
    };
  });

  return new Response(JSON.stringify({ participants }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
