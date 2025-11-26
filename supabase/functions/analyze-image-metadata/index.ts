import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageAnalysisRequest {
  imageBase64: string;
  filename: string;
  gpsData?: {
    latitude: number;
    longitude: number;
    location?: string;
  };
}

interface ImageMetadataSuggestions {
  category: string;
  tags: string[];
  alt_text: string;
  description: string;
  usage_context: string[];
  priority: number;
  gps?: {
    latitude: number;
    longitude: number;
    location?: string;
  };
}

// Function to determine location based on GPS coordinates using database regions
async function getLocationFromGPS(
  latitude: number, 
  longitude: number,
  supabaseClient: any
): Promise<string | null> {
  try {
    // Query hiking_regions table for regions with GPS bounds
    const { data: regions, error } = await supabaseClient
      .from('hiking_regions')
      .select('country, region, subregion, gps_bounds')
      .not('gps_bounds', 'is', null);

    if (error || !regions || regions.length === 0) {
      console.log('No regions with GPS bounds found');
      return null;
    }

    // Check for exact match within boundaries
    for (const region of regions) {
      const bounds = region.gps_bounds as any;
      if (!bounds || !bounds.latMin || !bounds.latMax || !bounds.lngMin || !bounds.lngMax) continue;

      if (latitude >= bounds.latMin && latitude <= bounds.latMax && 
          longitude >= bounds.lngMin && longitude <= bounds.lngMax) {
        // Return hierarchical format: country-subregion
        const countryLower = region.country.toLowerCase().replace(/\s+/g, '-');
        const subregionLower = region.subregion.toLowerCase().replace(/\s+/g, '-');
        return `${countryLower}-${subregionLower}`;
      }
    }

    // Find closest region as fallback
    let closestRegion = regions[0];
    let minDistance = Number.MAX_VALUE;

    for (const region of regions) {
      const bounds = region.gps_bounds as any;
      if (!bounds) continue;

      const centerLat = (bounds.latMin + bounds.latMax) / 2;
      const centerLng = (bounds.lngMin + bounds.lngMax) / 2;
      const distance = Math.sqrt(
        Math.pow(latitude - centerLat, 2) + 
        Math.pow(longitude - centerLng, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }
    }

    const countryLower = closestRegion.country.toLowerCase().replace(/\s+/g, '-');
    const subregionLower = closestRegion.subregion.toLowerCase().replace(/\s+/g, '-');
    return `${countryLower}-${subregionLower}`;
  } catch (error) {
    console.error('Error fetching location from GPS:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let gpsData: { latitude: number; longitude: number; location?: string } | undefined;

  try {
    const requestData: ImageAnalysisRequest = await req.json();
    const { imageBase64, filename } = requestData;
    gpsData = requestData.gpsData;

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Create Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Retry logic for API calls
    let response: Response | undefined;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 800,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this hiking image and return ONLY a JSON object with these fields:
- category: one of [hero, landscape, hiking, portrait, detail, equipment, nature, mountains, trails, adventure]
- tags: array of 3-5 relevant tags
- alt_text: accessibility description (max 100 chars)
- description: detailed description (max 200 chars)
- usage_context: array of 1-2 contexts [landing, tours, gallery, background]
- priority: number 1-10${gpsData ? `\n- gps: {latitude: ${gpsData.latitude}, longitude: ${gpsData.longitude}, location: "estimated location name"}` : ''}

Filename: ${filename}${gpsData ? `\nGPS: ${gpsData.latitude}, ${gpsData.longitude}` : ''}`
                  },
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: imageBase64
                    }
                  }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          break;
        }

        if (response.status === 529 && retryCount < maxRetries - 1) {
          // Exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`API overloaded, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retryCount++;
          continue;
        }

        const errorText = await response.text();
        console.error('Claude API error:', errorText);
        throw new Error(`Claude API error: ${response.status}`);
      } catch (error) {
        if (retryCount === maxRetries - 1) {
          throw error;
        }
        retryCount++;
        const delay = Math.pow(2, retryCount - 1) * 1000;
        console.log(`Request failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!response) {
      throw new Error('Failed to get response after retries');
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const result = await response.json();
    const analysisText = result.content[0].text;
    
    // Parse the JSON response from Claude
    let suggestions: ImageMetadataSuggestions;
    try {
      // Extract JSON from Claude's response (it might have extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }
      suggestions = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', analysisText);
      // Fallback suggestions
      suggestions = {
        category: 'landscape',
        tags: ['hiking', 'outdoor', 'adventure', 'nature'],
        alt_text: 'Outdoor hiking scene',
        description: 'A scenic outdoor image perfect for hiking and adventure content',
        usage_context: ['gallery', 'tours'],
        priority: 5,
        ...(gpsData && { gps: gpsData })
      };
    }

    // Add hierarchical location tags based on GPS if available
    if (gpsData) {
      const location = await getLocationFromGPS(gpsData.latitude, gpsData.longitude, supabaseClient);
      if (location) {
        // Add hierarchical location tag
        const locationTag = `location:${location}`;
        if (!suggestions.tags.includes(locationTag)) {
          suggestions.tags.push(locationTag);
        }
        
        // Also add subregion-only tag for backwards compatibility
        const subregion = location.split('-').pop();
        if (subregion && subregion !== location && !suggestions.tags.includes(subregion)) {
          suggestions.tags.push(subregion);
        }
        
        // Add GPS info with detected location
        suggestions.gps = {
          ...gpsData,
          location: location
        };
      }
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-image-metadata function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Generate fallback suggestions with location if GPS is available
    let fallbackTags = ['hiking', 'outdoor', 'adventure'];
    let fallbackGps = gpsData;
    
    if (gpsData) {
      try {
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        const location = await getLocationFromGPS(gpsData.latitude, gpsData.longitude, supabaseClient);
        if (location) {
          fallbackTags.push(`location:${location}`);
          const subregion = location.split('-').pop();
          if (subregion && subregion !== location) {
            fallbackTags.push(subregion);
          }
          fallbackGps = {
            ...gpsData,
            location: location
          };
        }
      } catch (locationError) {
        console.error('Failed to get fallback location:', locationError);
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      suggestions: {
        category: 'landscape',
        tags: fallbackTags,
        alt_text: 'Outdoor adventure image',
        description: 'An image suitable for hiking and outdoor adventure content',
        usage_context: ['gallery'],
        priority: 5,
        ...(fallbackGps && { gps: fallbackGps })
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});