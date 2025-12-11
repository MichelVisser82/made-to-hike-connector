import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublicTourRequest {
  requester_id: string | null;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  trip_name: string;
  region: string;
  preferred_dates: string;
  duration: string;
  group_size: string;
  experience_level: string;
  budget_per_person: string | null;
  description: string;
  special_requests: string[];
  additional_details: string | null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestData: PublicTourRequest = await req.json();
    
    // Validate required fields
    if (!requestData.requester_name || !requestData.requester_email) {
      throw new Error('Name and email are required');
    }

    if (!requestData.trip_name || !requestData.region || !requestData.description) {
      throw new Error('Trip name, region, and description are required');
    }

    console.log('Creating public tour request:', {
      requester_email: requestData.requester_email,
      trip_name: requestData.trip_name,
      region: requestData.region
    });

    // Insert the request into the database
    const { data: request, error: insertError } = await supabase
      .from('public_tour_requests')
      .insert({
        requester_id: requestData.requester_id,
        requester_name: requestData.requester_name,
        requester_email: requestData.requester_email,
        requester_phone: requestData.requester_phone,
        trip_name: requestData.trip_name,
        region: requestData.region,
        preferred_dates: requestData.preferred_dates,
        duration: requestData.duration,
        group_size: requestData.group_size,
        experience_level: requestData.experience_level,
        budget_per_person: requestData.budget_per_person,
        description: requestData.description,
        special_requests: requestData.special_requests || [],
        additional_details: requestData.additional_details,
        status: 'open'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting request:', insertError);
      throw insertError;
    }

    console.log('Request created:', request.id);

    // Get region label for emails
    const regionLabels: Record<string, string> = {
      dolomites: "Dolomites, Italy",
      pyrenees: "Pyrenees, France/Spain",
      highlands: "Scottish Highlands, UK",
      alps: "Swiss Alps",
      flexible: "All Regions"
    };
    const regionLabel = regionLabels[requestData.region] || requestData.region;

    // Format special requests for email
    const specialRequestsLabels: Record<string, string> = {
      dietary: "Dietary requirements",
      accessibility: "Accessibility needs",
      photography: "Photography focused",
      wildlife: "Wildlife observation",
      cultural: "Cultural experiences",
      luxury: "Luxury accommodations",
      camping: "Camping/refuge based",
      family: "Family-friendly"
    };
    
    const formattedSpecialRequests = requestData.special_requests
      ?.map(sr => specialRequestsLabels[sr] || sr)
      .join(", ") || "None specified";

    // Fetch all verified guides to notify
    const { data: guides, error: guidesError } = await supabase
      .from('guide_profiles')
      .select('user_id, display_name')
      .eq('verified', true);

    if (guidesError) {
      console.error('Error fetching guides:', guidesError);
    }

    // Get guide emails from profiles
    const guideUserIds = guides?.map(g => g.user_id) || [];
    
    if (guideUserIds.length > 0) {
      const { data: guideProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', guideUserIds);

      if (profilesError) {
        console.error('Error fetching guide profiles:', profilesError);
      } else if (guideProfiles && guideProfiles.length > 0) {
        // Send email to each guide using template system
        for (const guide of guideProfiles) {
          try {
            const guideDisplayName = guides?.find(g => g.user_id === guide.id)?.display_name || guide.name;
            
            const { error: emailError } = await supabase.functions.invoke('send-email', {
              body: {
                type: 'public_tour_request_guide_notification',
                to: guide.email,
                guide_name: guideDisplayName,
                trip_name: requestData.trip_name,
                region: regionLabel,
                preferred_dates: requestData.preferred_dates,
                duration: requestData.duration,
                group_size: requestData.group_size,
                experience_level: requestData.experience_level,
                budget_per_person: requestData.budget_per_person,
                description: requestData.description,
                special_requests: formattedSpecialRequests,
                additional_details: requestData.additional_details
              }
            });

            if (emailError) {
              console.error(`Error sending email to ${guide.email}:`, emailError);
            } else {
              console.log(`Email sent to guide: ${guide.email}`);
            }
          } catch (emailError) {
            console.error(`Error sending email to ${guide.email}:`, emailError);
            // Continue with other guides even if one fails
          }
        }

        console.log(`Notified ${guideProfiles.length} guides`);
      }
    }

    // Send confirmation email to requester using template system
    try {
      const { error: confirmEmailError } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'public_tour_request_confirmation',
          to: requestData.requester_email,
          requester_name: requestData.requester_name,
          trip_name: requestData.trip_name,
          region: regionLabel,
          preferred_dates: requestData.preferred_dates,
          duration: requestData.duration,
          group_size: requestData.group_size
        }
      });

      if (confirmEmailError) {
        console.error('Error sending confirmation email:', confirmEmailError);
      } else {
        console.log('Confirmation email sent to requester');
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if confirmation email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        request_id: request.id,
        message: 'Custom tour request created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in create-public-tour-request:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
