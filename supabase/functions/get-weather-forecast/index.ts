import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, latitude, longitude, date } = await req.json();
    
    // Build location string with GPS coordinates if available
    let locationQuery = location;
    if (latitude && longitude) {
      locationQuery = `coordinates ${latitude}, ${longitude} (${location})`;
    }
    
    console.log('Fetching weather for:', { location: locationQuery, date, latitude, longitude });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `What is the weather forecast for ${locationQuery} on ${date}? 
                   Provide a hiking-specific summary including:
                   - Overall conditions (sunny, cloudy, rainy, etc.)
                   - Temperature (actual, high, low in Celsius)
                   - Any hiking considerations (wind, visibility, precipitation)
                   Keep it concise and practical for outdoor activities.`
        }],
        tools: [{
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Claude response:', JSON.stringify(data, null, 2));

    // Extract the LAST text block - this contains the actual forecast after web search
    const textBlocks = data.content.filter((c: any) => c.type === 'text');
    const weatherText = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1].text : '';
    
    console.log('Extracted weather text:', weatherText);
    
    if (!weatherText) {
      throw new Error('No text response from Claude');
    }
    
    // Validate that we have actual weather data, not just the "I'll search" message
    if (weatherText.includes("I'll search for") || weatherText.length < 50) {
      console.error('Got initial thinking response instead of weather data:', weatherText);
      throw new Error('Weather forecast not available - received incomplete response');
    }

    // Extract structured data from Claude's natural language response
    const parsed = parseWeatherResponse(weatherText);

    return new Response(JSON.stringify({ 
      success: true,
      weather: parsed,
      rawResponse: weatherText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching weather:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function parseWeatherResponse(text: string) {
  // Extract key information from Claude's response
  const tempMatch = text.match(/(\d+)°C/i);
  const highMatch = text.match(/high[:\s]+(\d+)°C/i);
  const lowMatch = text.match(/low[:\s]+(\d+)°C/i);
  
  let condition = 'Partly Cloudy';
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('sunny') || lowerText.includes('clear')) {
    condition = 'Sunny';
  } else if (lowerText.includes('rain') || lowerText.includes('shower')) {
    condition = 'Rainy';
  } else if (lowerText.includes('cloud')) {
    condition = 'Cloudy';
  } else if (lowerText.includes('snow')) {
    condition = 'Snow';
  } else if (lowerText.includes('storm')) {
    condition = 'Stormy';
  }
  
  return {
    condition,
    temperature: tempMatch ? parseInt(tempMatch[1]) : null,
    high: highMatch ? parseInt(highMatch[1]) : null,
    low: lowMatch ? parseInt(lowMatch[1]) : null,
    summary: text.split('\n').filter(line => line.trim())[0], // First non-empty line
    fullForecast: text
  };
}
