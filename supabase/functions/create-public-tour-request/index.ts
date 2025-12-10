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

    // Fetch all verified guides to notify
    // Future: Filter by region matching
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

        // Send email to each guide
        for (const guide of guideProfiles) {
          try {
            const guideDisplayName = guides?.find(g => g.user_id === guide.id)?.display_name || guide.name;
            
            await supabase.functions.invoke('send-email', {
              body: {
                to: guide.email,
                subject: `🏔️ New Custom Tour Request: ${requestData.trip_name}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #7C2D3A;">New Custom Tour Request</h2>
                    <p>Hi ${guideDisplayName},</p>
                    <p>A hiker is looking for a custom adventure in your region. Here are the details:</p>
                    
                    <div style="background: #f9f5f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <h3 style="color: #1f2937; margin-top: 0;">${requestData.trip_name}</h3>
                      
                      <p><strong>Region:</strong> ${regionLabel}</p>
                      <p><strong>Dates:</strong> ${requestData.preferred_dates}</p>
                      <p><strong>Duration:</strong> ${requestData.duration} days</p>
                      <p><strong>Group Size:</strong> ${requestData.group_size}</p>
                      <p><strong>Experience Level:</strong> ${requestData.experience_level}</p>
                      ${requestData.budget_per_person ? `<p><strong>Budget per Person:</strong> ${requestData.budget_per_person}</p>` : ''}
                      
                      <p><strong>Special Requests:</strong> ${formattedSpecialRequests}</p>
                      
                      <h4 style="color: #1f2937;">Trip Description:</h4>
                      <p style="white-space: pre-wrap;">${requestData.description}</p>
                      
                      ${requestData.additional_details ? `
                        <h4 style="color: #1f2937;">Additional Details:</h4>
                        <p style="white-space: pre-wrap;">${requestData.additional_details}</p>
                      ` : ''}
                    </div>
                    
                    <p>Log in to your dashboard to respond to this request and send a personalized proposal.</p>
                    
                    <a href="https://madetohike.com/dashboard" 
                       style="display: inline-block; background: #7C2D3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                      View Request in Dashboard
                    </a>
                    
                    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                      This is an automated notification from MadeToHike. The requester's details are kept private until you express interest.
                    </p>
                  </div>
                `
              }
            });
            console.log(`Email sent to guide: ${guide.email}`);
          } catch (emailError) {
            console.error(`Error sending email to ${guide.email}:`, emailError);
            // Continue with other guides even if one fails
          }
        }

        console.log(`Notified ${guideProfiles.length} guides`);
      }
    }

    // Send confirmation email to requester
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: requestData.requester_email,
          subject: `Your Custom Tour Request: ${requestData.trip_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #7C2D3A;">Request Received!</h2>
              <p>Hi ${requestData.requester_name},</p>
              <p>We've received your custom tour request and notified our certified guides in the ${regionLabel} region.</p>
              
              <div style="background: #f9f5f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Your Request: ${requestData.trip_name}</h3>
                <p><strong>Region:</strong> ${regionLabel}</p>
                <p><strong>Dates:</strong> ${requestData.preferred_dates}</p>
                <p><strong>Duration:</strong> ${requestData.duration} days</p>
                <p><strong>Group Size:</strong> ${requestData.group_size}</p>
              </div>
              
              <h3 style="color: #1f2937;">What happens next?</h3>
              <ul>
                <li>Guides will review your request and create personalized proposals</li>
                <li>You'll receive 3-5 proposals via email within 48 hours</li>
                <li>Compare pricing, itineraries, and guide credentials</li>
                <li>Message guides directly to ask questions</li>
                <li>Book when you find the perfect match!</li>
              </ul>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Questions? Reply to this email or contact us at info@madetohike.com
              </p>
            </div>
          `
        }
      });
      console.log('Confirmation email sent to requester');
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