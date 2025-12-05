import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PIXEL_ID = '861880582922484';
const API_VERSION = 'v21.0';

// SHA-256 hash function for user data (required by Facebook)
async function hashData(data: string): Promise<string> {
  if (!data) return '';
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  clientUserAgent?: string;
  clientIpAddress?: string;
  fbc?: string; // Click ID cookie
  fbp?: string; // Browser ID cookie
}

interface CustomData {
  value?: number;
  currency?: string;
  contentIds?: string[];
  contentType?: string;
  contentName?: string;
  numItems?: number;
  searchString?: string;
  status?: string;
}

interface EventPayload {
  eventName: string;
  eventId?: string; // For deduplication with pixel
  eventSourceUrl?: string;
  userData?: UserData;
  customData?: CustomData;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('META_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('[facebook-capi] META_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Facebook CAPI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: EventPayload = await req.json();
    const { eventName, eventId, eventSourceUrl, userData, customData } = payload;

    if (!eventName) {
      return new Response(
        JSON.stringify({ error: 'eventName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[facebook-capi] Processing ${eventName} event`, { eventId });

    // Hash user data as required by Facebook
    const hashedUserData: Record<string, any> = {};
    
    if (userData?.email) {
      hashedUserData.em = [await hashData(userData.email)];
    }
    if (userData?.phone) {
      hashedUserData.ph = [await hashData(userData.phone.replace(/[^0-9]/g, ''))];
    }
    if (userData?.firstName) {
      hashedUserData.fn = [await hashData(userData.firstName)];
    }
    if (userData?.lastName) {
      hashedUserData.ln = [await hashData(userData.lastName)];
    }
    if (userData?.city) {
      hashedUserData.ct = [await hashData(userData.city)];
    }
    if (userData?.country) {
      hashedUserData.country = [await hashData(userData.country)];
    }
    if (userData?.postalCode) {
      hashedUserData.zp = [await hashData(userData.postalCode)];
    }
    // Don't hash these fields
    if (userData?.clientUserAgent) {
      hashedUserData.client_user_agent = userData.clientUserAgent;
    }
    if (userData?.clientIpAddress) {
      hashedUserData.client_ip_address = userData.clientIpAddress;
    }
    if (userData?.fbc) {
      hashedUserData.fbc = userData.fbc;
    }
    if (userData?.fbp) {
      hashedUserData.fbp = userData.fbp;
    }

    // Build custom data
    const customDataPayload: Record<string, any> = {};
    if (customData?.value !== undefined) {
      customDataPayload.value = String(customData.value);
    }
    if (customData?.currency) {
      customDataPayload.currency = customData.currency.toUpperCase();
    }
    if (customData?.contentIds?.length) {
      customDataPayload.content_ids = customData.contentIds;
    }
    if (customData?.contentType) {
      customDataPayload.content_type = customData.contentType;
    }
    if (customData?.contentName) {
      customDataPayload.content_name = customData.contentName;
    }
    if (customData?.numItems !== undefined) {
      customDataPayload.num_items = customData.numItems;
    }
    if (customData?.searchString) {
      customDataPayload.search_string = customData.searchString;
    }
    if (customData?.status) {
      customDataPayload.status = customData.status;
    }

    // Build Facebook event payload
    const eventTime = Math.floor(Date.now() / 1000);
    const fbEvent: Record<string, any> = {
      event_name: eventName,
      event_time: eventTime,
      action_source: 'website',
      user_data: hashedUserData,
    };

    if (eventId) {
      fbEvent.event_id = eventId;
    }
    if (eventSourceUrl) {
      fbEvent.event_source_url = eventSourceUrl;
    }
    if (Object.keys(customDataPayload).length > 0) {
      fbEvent.custom_data = customDataPayload;
    }

    const fbPayload = {
      data: [fbEvent],
    };

    console.log(`[facebook-capi] Sending event to Facebook`, { 
      eventName, 
      eventId,
      hasUserData: Object.keys(hashedUserData).length > 0,
      hasCustomData: Object.keys(customDataPayload).length > 0
    });

    // Send to Facebook Conversions API
    const fbResponse = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fbPayload),
      }
    );

    const fbResult = await fbResponse.json();

    if (!fbResponse.ok) {
      console.error('[facebook-capi] Facebook API error:', fbResult);
      return new Response(
        JSON.stringify({ error: 'Facebook API error', details: fbResult }),
        { status: fbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[facebook-capi] Event sent successfully`, { 
      eventName, 
      eventsReceived: fbResult.events_received,
      fbtrace_id: fbResult.fbtrace_id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        eventsReceived: fbResult.events_received,
        fbtraceId: fbResult.fbtrace_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[facebook-capi] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
