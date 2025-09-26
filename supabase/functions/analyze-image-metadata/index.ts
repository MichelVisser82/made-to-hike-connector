import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let gpsData: { latitude: number; longitude: number } | undefined;

  try {
    const requestData: ImageAnalysisRequest = await req.json();
    const { imageBase64, filename } = requestData;
    gpsData = requestData.gpsData;

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

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
            model: 'claude-3-5-sonnet-20241022',
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

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-image-metadata function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      suggestions: {
        category: 'landscape',
        tags: ['hiking', 'outdoor', 'adventure'],
        alt_text: 'Outdoor adventure image',
        description: 'An image suitable for hiking and outdoor adventure content',
        usage_context: ['gallery'],
        priority: 5,
        ...(gpsData && { gps: gpsData })
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});