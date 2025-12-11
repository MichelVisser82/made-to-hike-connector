import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  request_id: string;
  guide_id: string;
  response_type: "interested" | "declined" | "forwarded";
  decline_reason?: string;
  forwarded_to_email?: string;
  personal_note?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: RequestBody = await req.json();
    const { request_id, guide_id, response_type, decline_reason, forwarded_to_email, personal_note } = body;

    console.log(`Processing ${response_type} response for request ${request_id} by guide ${guide_id}`);

    // Fetch the public tour request
    const { data: request, error: requestError } = await supabase
      .from("public_tour_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (requestError || !request) {
      console.error("Request not found:", requestError);
      return new Response(
        JSON.stringify({ error: "Request not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch guide profile
    const { data: guideProfile } = await supabase
      .from("guide_profiles")
      .select("display_name, profile_image_url, slug")
      .eq("user_id", guide_id)
      .single();

    const guideName = guideProfile?.display_name || "A certified guide";

    // Check if guide already responded to this request
    const { data: existingResponse } = await supabase
      .from("guide_request_responses")
      .select("*")
      .eq("request_id", request_id)
      .eq("guide_id", guide_id)
      .single();

    if (existingResponse) {
      console.log("Guide already responded to this request:", existingResponse.response_type);
      
      // Allow changing response type (e.g., interested -> declined/forwarded, or declined -> forwarded)
      if (response_type !== existingResponse.response_type && (response_type === 'declined' || response_type === 'forwarded')) {
        console.log(`Updating response from '${existingResponse.response_type}' to '${response_type}'`);
        
        // Update the response record
        const { error: updateError } = await supabase
          .from("guide_request_responses")
          .update({
            response_type,
            decline_reason: decline_reason || null,
            forwarded_to_email: forwarded_to_email || null,
          })
          .eq("id", existingResponse.id);

        if (updateError) {
          console.error("Failed to update response:", updateError);
          return new Response(
            JSON.stringify({ error: "Failed to update response" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Close the existing conversation if there is one
        if (existingResponse.conversation_id) {
          await supabase
            .from("conversations")
            .update({ status: "closed" })
            .eq("id", existingResponse.conversation_id);

          // Add system message about the decline/forward
          const actionMessage = response_type === 'declined'
            ? `*${guideName} has declined this request.${decline_reason ? ` Reason: ${decline_reason}` : ''}*`
            : `*${guideName} has forwarded this request to another guide.${forwarded_to_email ? ` (${forwarded_to_email})` : ''}*`;

          await supabase.from("messages").insert({
            conversation_id: existingResponse.conversation_id,
            sender_id: guide_id,
            sender_type: "system",
            sender_name: "System",
            message_type: "system",
            content: actionMessage,
          });
        }

        // Send forwarding email if forwarded
        if (response_type === "forwarded" && forwarded_to_email) {
          try {
            await supabase.functions.invoke("send-email", {
              body: {
                type: "forwarded_tour_request",
                to: forwarded_to_email,
                forwarder_name: guideName,
                personal_note: personal_note || null,
                trip_name: request.trip_name,
                region: request.region,
                preferred_dates: request.preferred_dates,
                duration: request.duration,
                group_size: request.group_size,
                experience_level: request.experience_level,
                budget_per_person: request.budget_per_person,
                description: request.description,
                special_requests: request.special_requests,
                requester_name: request.requester_name,
              },
            });
            console.log(`Request forwarded to ${forwarded_to_email}`);
          } catch (emailError) {
            console.error("Failed to send forward email:", emailError);
          }
        }

        console.log(`Successfully updated response to ${response_type}`);
        return new Response(
          JSON.stringify({
            success: true,
            response_type,
            conversation_id: existingResponse.conversation_id,
            updated: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // If interested but no conversation was created (previous error), create it now
      if (existingResponse.response_type === 'interested' && !existingResponse.conversation_id) {
        console.log("Creating missing conversation for previous interested response");
        
        // Create the conversation now
        const { data: conversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            guide_id,
            hiker_id: request.requester_id || null,
            anonymous_email: request.requester_id ? null : request.requester_email,
            anonymous_name: request.requester_id ? null : request.requester_name,
            conversation_type: "custom_tour_request",
            status: "active",
            metadata: {
              public_request_id: request_id,
              trip_name: request.trip_name,
              tour_type: request.trip_name,
              region: request.region,
              preferred_dates: request.preferred_dates,
              preferred_date: request.preferred_dates,
              duration: request.duration,
              group_size: request.group_size,
              groupSize: request.group_size,
              experience_level: request.experience_level,
              hiker_level: request.experience_level,
              hikerLevel: request.experience_level,
              budget_per_person: request.budget_per_person,
              description: request.description,
              initial_message: request.description,
              initialMessage: request.description,
              special_requests: request.special_requests,
            },
          })
          .select()
          .single();

        if (convError) {
          console.error("Failed to create conversation:", convError);
          return new Response(
            JSON.stringify({ error: "Failed to create conversation" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update the response record with the conversation_id
        await supabase
          .from("guide_request_responses")
          .update({ conversation_id: conversation.id })
          .eq("id", existingResponse.id);

        // Create initial system message
        const systemMessage = `📋 **Custom Tour Request**

**Trip:** ${request.trip_name}
**Region:** ${request.region}
**Dates:** ${request.preferred_dates}
**Duration:** ${request.duration}
**Group Size:** ${request.group_size}
**Experience Level:** ${request.experience_level}
${request.budget_per_person ? `**Budget:** ${request.budget_per_person} per person` : ""}

**Description:**
${request.description}
${request.special_requests?.length ? `\n**Special Requests:** ${request.special_requests.join(", ")}` : ""}

---
*${guideName} has expressed interest in this request.*`;

        await supabase.from("messages").insert({
          conversation_id: conversation.id,
          sender_id: guide_id,
          sender_type: "guide",
          sender_name: guideName,
          message_type: "system",
          content: systemMessage,
        });

        console.log("Created missing conversation:", conversation.id);

        return new Response(
          JSON.stringify({
            success: true,
            response_type: "interested",
            conversation_id: conversation.id,
            already_responded: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return existing response info
      return new Response(
        JSON.stringify({
          success: true,
          response_type: existingResponse.response_type,
          conversation_id: existingResponse.conversation_id,
          already_responded: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the response
    const { error: responseError } = await supabase
      .from("guide_request_responses")
      .insert({
        request_id,
        guide_id,
        response_type,
        decline_reason: decline_reason || null,
        forwarded_to_email: forwarded_to_email || null,
      });

    if (responseError) {
      console.error("Failed to record response:", responseError);
      return new Response(
        JSON.stringify({ error: "Failed to record response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let conversationId: string | null = null;

    if (response_type === "interested") {
      // Create a conversation with the requester
      // Store metadata in format compatible with QuickOfferForm
      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          guide_id,
          hiker_id: request.requester_id || null,
          anonymous_email: request.requester_id ? null : request.requester_email,
          anonymous_name: request.requester_id ? null : request.requester_name,
          conversation_type: "custom_tour_request",
          status: "active",
          metadata: {
            public_request_id: request_id,
            // Store in both formats for compatibility
            trip_name: request.trip_name,
            tour_type: request.trip_name,
            region: request.region,
            preferred_dates: request.preferred_dates,
            preferred_date: request.preferred_dates,
            duration: request.duration,
            group_size: request.group_size,
            groupSize: request.group_size,
            experience_level: request.experience_level,
            hiker_level: request.experience_level,
            hikerLevel: request.experience_level,
            budget_per_person: request.budget_per_person,
            description: request.description,
            initial_message: request.description,
            initialMessage: request.description,
            special_requests: request.special_requests,
          },
        })
        .select()
        .single();

      if (convError) {
        console.error("Failed to create conversation:", convError);
        return new Response(
          JSON.stringify({ error: "Failed to create conversation" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      conversationId = conversation.id;

      // Update the guide_request_responses with the conversation_id
      await supabase
        .from("guide_request_responses")
        .update({ conversation_id: conversationId })
        .eq("request_id", request_id)
        .eq("guide_id", guide_id);

      // Create initial system message with request details
      const systemMessage = `📋 **Custom Tour Request**

**Trip:** ${request.trip_name}
**Region:** ${request.region}
**Dates:** ${request.preferred_dates}
**Duration:** ${request.duration}
**Group Size:** ${request.group_size}
**Experience Level:** ${request.experience_level}
${request.budget_per_person ? `**Budget:** ${request.budget_per_person} per person` : ""}

**Description:**
${request.description}
${request.special_requests?.length ? `\n**Special Requests:** ${request.special_requests.join(", ")}` : ""}

---
*${guideName} has expressed interest in this request.*`;

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: guide_id,
        sender_type: "guide",
        sender_name: guideName,
        message_type: "system",
        content: systemMessage,
      });

      // Note: No email sent to requester - they will see the conversation in their inbox
      console.log("Conversation created - requester will see it in their inbox");
    }

    if (response_type === "forwarded" && forwarded_to_email) {
      // Send forwarding email
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            type: "forwarded_tour_request",
            to: forwarded_to_email,
            forwarder_name: guideName,
            personal_note: personal_note || null,
            trip_name: request.trip_name,
            region: request.region,
            preferred_dates: request.preferred_dates,
            duration: request.duration,
            group_size: request.group_size,
            experience_level: request.experience_level,
            budget_per_person: request.budget_per_person,
            description: request.description,
            special_requests: request.special_requests,
            requester_name: request.requester_name,
          },
        });
        console.log(`Request forwarded to ${forwarded_to_email}`);
      } catch (emailError) {
        console.error("Failed to send forward email:", emailError);
      }
    }

    console.log(`Successfully processed ${response_type} response`);

    return new Response(
      JSON.stringify({
        success: true,
        response_type,
        conversation_id: conversationId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in respond-to-public-request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
