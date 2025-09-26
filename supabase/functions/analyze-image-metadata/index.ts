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
}

interface ImageMetadataSuggestions {
  category: string;
  tags: string[];
  alt_text: string;
  description: string;
  usage_context: string[];
  priority: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, filename }: ImageAnalysisRequest = await req.json();

    if (!anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this image for a hiking/outdoor adventure website and provide metadata suggestions. The image filename is: ${filename}

Please provide your response as a JSON object with these fields:
- category: one of [hero, landscape, hiking, portrait, detail, equipment, nature, mountains, trails, adventure]
- tags: array of 3-6 relevant tags for SEO and searchability
- alt_text: descriptive alt text for accessibility (max 125 chars)
- description: detailed description for content management (max 255 chars)
- usage_context: array of 1-3 contexts where this image would work best [landing, tours, about, contact, search, booking, testimonials, gallery, background]
- priority: number 1-10 based on visual impact and usefulness (10 being highest)

Focus on hiking, outdoor adventure, nature, and travel themes. Be specific and actionable.`
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
        priority: 5
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
        priority: 5
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});