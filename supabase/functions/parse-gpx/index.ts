import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    // Parse GPX using DOMParser
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(fileContent, 'text/xml');

    // Check for parsing errors
    const parserError = gpxDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid GPX file format');
    }

    // Extract trackpoints
    const trackpoints: Array<{ lat: number; lng: number; elevation?: number }> = [];
    const trkpts = gpxDoc.querySelectorAll('trkpt');
    let hasElevationData = false;
    
    trkpts.forEach((trkpt) => {
      const lat = parseFloat(trkpt.getAttribute('lat') || '0');
      const lng = parseFloat(trkpt.getAttribute('lon') || '0');
      const eleElement = trkpt.querySelector('ele');
      const elevation = eleElement ? parseFloat(eleElement.textContent || '0') : undefined;

      if (elevation !== undefined && elevation !== 0) {
        hasElevationData = true;
      }

      trackpoints.push({ lat, lng, elevation });
    });

    console.log(`[parse-gpx] Has elevation data: ${hasElevationData}`);

    // Extract waypoints
    const waypoints: Array<{ name: string; description?: string; lat: number; lng: number; elevation?: number }> = [];
    const wpts = gpxDoc.querySelectorAll('wpt');
    
    wpts.forEach((wpt) => {
      const lat = parseFloat(wpt.getAttribute('lat') || '0');
      const lng = parseFloat(wpt.getAttribute('lon') || '0');
      const nameElement = wpt.querySelector('name');
      const descElement = wpt.querySelector('desc');
      const eleElement = wpt.querySelector('ele');
      
      waypoints.push({
        name: nameElement?.textContent || 'Unnamed',
        description: descElement?.textContent || undefined,
        lat,
        lng,
        elevation: eleElement ? parseFloat(eleElement.textContent || '0') : undefined
      });
    });

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

    // Upload GPX file to storage
    const fileName = `${tourId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('guide-documents')
      .upload(fileName, file, {
        contentType: 'application/gpx+xml',
        upsert: false
      });

    if (uploadError) {
      console.error('[parse-gpx] Upload error:', uploadError);
      throw new Error('Failed to upload GPX file');
    }

    // Rate limiting check
    const uploadKey = `gpx_uploads:${user.id}`;
    const { data: rateLimitData } = await supabase
      .from('kv_store')
      .select('value')
      .eq('key', uploadKey)
      .single();

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let uploads: number[] = rateLimitData?.value ? JSON.parse(rateLimitData.value as string) : [];
    uploads = uploads.filter(t => now - t < oneHour);

    if (uploads.length >= 10) {
      throw new Error('Rate limit exceeded. Maximum 10 uploads per hour.');
    }

    uploads.push(now);
    await supabase.from('kv_store').upsert({
      key: uploadKey,
      value: JSON.stringify(uploads),
      expires_at: new Date(now + oneHour).toISOString()
    });

    // Save metadata to database
    await supabase
      .from('tour_gpx_files')
      .upsert({
        tour_id: tourId,
        original_filename: file.name,
        storage_path: fileName,
        total_distance_km: parseFloat(totalDistance.toFixed(2)),
        total_elevation_gain_m: Math.round(elevationGain),
        total_points: trackpoints.length
      }, {
        onConflict: 'tour_id'
      });

    // Return parsed data with elevation warning if needed
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
