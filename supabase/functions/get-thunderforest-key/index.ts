import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const THUNDERFOREST_API_KEY = Deno.env.get('THUNDERFOREST_API_KEY');
    
    if (!THUNDERFOREST_API_KEY) {
      throw new Error('THUNDERFOREST_API_KEY not configured');
    }

    return new Response(
      JSON.stringify({ key: THUNDERFOREST_API_KEY }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching Thunderforest key:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
