import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to extract value from XML tag
function extractTagValue(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

// Helper function to extract attribute value
function extractAttribute(element: string, attr: string): string | null {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, 'i');
  const match = element.match(regex);
  return match ? match[1] : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const tourId = formData.get('tourId') as string;

    if (!file || !tourId) {
      throw new Error('Missing file or tourId');
    }

    console.log(`[parse-gpx] Processing file: ${file.name} for tour: ${tourId}`);

    // Verify user owns this tour
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('guide_id')
      .eq('id', tourId)
      .single();

    if (tourError || !tour || tour.guide_id !== user.id) {
      throw new Error('Unauthorized to modify this tour');
    }

    // Read file content
    const fileContent = await file.text();
    
    // Parse trackpoints using regex
    const trackpoints: Array<{ lat: number; lng: number; elevation?: number }> = [];
    const trkptRegex = /<trkpt[^>]*lat=["']([^"']*)["'][^>]*lon=["']([^"']*)["'][^>]*>([\s\S]*?)<\/trkpt>/gi;
    let trkptMatch;
    let hasElevationData = false;
    
    while ((trkptMatch = trkptRegex.exec(fileContent)) !== null) {
      const lat = parseFloat(trkptMatch[1]);
      const lng = parseFloat(trkptMatch[2]);
      const content = trkptMatch[3];
      
      const eleValue = extractTagValue(content, 'ele');
      const elevation = eleValue ? parseFloat(eleValue) : undefined;

      if (elevation !== undefined && elevation !== 0) {
        hasElevationData = true;
      }

      trackpoints.push({ lat, lng, elevation });
    }

    console.log(`[parse-gpx] Has elevation data: ${hasElevationData}`);

    // Parse waypoints using regex
    const waypoints: Array<{ name: string; description?: string; lat: number; lng: number; elevation?: number }> = [];
    const wptRegex = /<wpt[^>]*lat=["']([^"']*)["'][^>]*lon=["']([^"']*)["'][^>]*>([\s\S]*?)<\/wpt>/gi;
    let wptMatch;
    
    while ((wptMatch = wptRegex.exec(fileContent)) !== null) {
      const lat = parseFloat(wptMatch[1]);
      const lng = parseFloat(wptMatch[2]);
      const content = wptMatch[3];
      
      const name = extractTagValue(content, 'name') || 'Unnamed';
      const description = extractTagValue(content, 'desc') || undefined;
      const eleValue = extractTagValue(content, 'ele');
      const elevation = eleValue ? parseFloat(eleValue) : undefined;
      
      waypoints.push({ name, description, lat, lng, elevation });
    }

    console.log(`[parse-gpx] Extracted ${trackpoints.length} trackpoints and ${waypoints.length} waypoints`);

    if (trackpoints.length === 0) {
      throw new Error('No trackpoints found in GPX file');
    }

    // Calculate basic statistics
    let totalDistance = 0;
    let elevationGain = 0;
    let elevationLoss = 0;

    for (let i = 1; i < trackpoints.length; i++) {
      const lat1 = trackpoints[i - 1].lat * Math.PI / 180;
      const lat2 = trackpoints[i].lat * Math.PI / 180;
      const deltaLat = (trackpoints[i].lat - trackpoints[i - 1].lat) * Math.PI / 180;
      const deltaLng = (trackpoints[i].lng - trackpoints[i - 1].lng) * Math.PI / 180;

      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += 6371 * c; // Earth radius in km

      if (trackpoints[i].elevation !== undefined && trackpoints[i - 1].elevation !== undefined) {
        const diff = trackpoints[i].elevation! - trackpoints[i - 1].elevation!;
        if (diff > 0) elevationGain += diff;
        else elevationLoss += Math.abs(diff);
      }
    }

    // Calculate bounding box
    const lats = trackpoints.map(p => p.lat);
    const lngs = trackpoints.map(p => p.lng);
    const center = {
      lat: (Math.max(...lats) + Math.min(...lats)) / 2,
      lng: (Math.max(...lngs) + Math.min(...lngs)) / 2
    };

    // Calculate radius
    const maxLat = Math.max(...lats);
    const minLat = Math.min(...lats);
    const maxLng = Math.max(...lngs);
    const minLng = Math.min(...lngs);
    const deltaLat = (maxLat - center.lat) * Math.PI / 180;
    const deltaLng = (maxLng - center.lng) * Math.PI / 180;
    const radius = 6371 * Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);

    console.log(`[parse-gpx] Successfully parsed GPX file with ${trackpoints.length} points`);

    // Return parsed data immediately - no storage upload needed
    return new Response(
      JSON.stringify({
        trackpoints,
        waypoints,
        hasElevationData,
        needsElevationFetch: !hasElevationData,
        analysis: {
          totalDistance: parseFloat(totalDistance.toFixed(2)),
          elevationGain: Math.round(elevationGain),
          elevationLoss: Math.round(elevationLoss),
          boundingBox: {
            center,
            radius: parseFloat(radius.toFixed(2)),
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs)
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[parse-gpx] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
