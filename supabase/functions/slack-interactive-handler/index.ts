import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.text();
    const payload = JSON.parse(new URLSearchParams(body).get('payload') || '{}');

    // Handle different action types
    if (payload.type === 'block_actions') {
      const action = payload.actions[0];
      const ticketId = action.value;

      if (action.action_id === 'claim_ticket') {
        await supabase
          .from('tickets')
          .update({
            status: 'assigned',
            assigned_to: payload.user.id
          })
          .eq('id', ticketId);

        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticketId,
            action: 'claimed',
            actor_id: payload.user.id,
            actor_name: payload.user.name,
            note: `Ticket claimed by ${payload.user.name}`
          });

        return new Response(
          JSON.stringify({ text: `Ticket claimed by <@${payload.user.id}>` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (action.action_id === 'resolve_ticket') {
        await supabase
          .from('tickets')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticketId,
            action: 'resolved',
            actor_id: payload.user.id,
            actor_name: payload.user.name,
            note: `Ticket resolved by ${payload.user.name}`
          });

        return new Response(
          JSON.stringify({ text: `Ticket resolved by <@${payload.user.id}>` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('OK', { headers: corsHeaders });

  } catch (error) {
    console.error('Error in slack-interactive-handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
