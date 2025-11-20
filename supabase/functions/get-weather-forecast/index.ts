import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { location, latitude, longitude, date } = await req.json();
    
    if (!latitude || !longitude) {
      throw new Error('GPS coordinates are required for weather forecast');
    }

    console.log('Fetching weather from Open-Meteo:', { latitude, longitude, location, date });

    // Try Open-Meteo first (for next 16 days)
    try {
      const params = new URLSearchParams({
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max',
        timezone: 'auto',
        start_date: date,
        end_date: date
      });

      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

      if (response.ok) {
        const data = await response.json();
        
        if (data.daily && data.daily.time.length > 0) {
          const parsed = parseOpenMeteoResponse(data, location);
          
          return new Response(JSON.stringify({ 
            success: true,
            source: 'open-meteo',
            isForecast: true,
            weather: parsed
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        const errorText = await response.text();
        console.log('Open-Meteo unavailable:', errorText);
        
        // If out of range, fall back to Claude
        if (errorText.includes('out of allowed range')) {
          console.log('Date beyond 16-day range, using Claude fallback');
        }
      }
    } catch (openMeteoError) {
      console.log('Open-Meteo error, falling back to Claude:', openMeteoError);
    }

    // Claude fallback for dates beyond 16 days
    console.log('Using Claude for seasonal weather outlook');
    
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();

    const claudePrompt = `You are a hiking weather advisor. For the location at GPS coordinates ${latitude}, ${longitude} (${location}) in ${month} ${year}, provide a seasonal weather outlook for hikers.

IMPORTANT: Start with a clear disclaimer that this is a seasonal outlook based on typical conditions for this region and month, not a specific forecast. Mention that accurate forecasts will be available 16 days before the date.

Then include:
1. Typical weather conditions for this region in ${month}
2. Expected temperature ranges (highs/lows in Celsius)
3. Common precipitation patterns
4. Hiking-specific considerations and recommendations
5. Seasonal hazards or gear requirements

Be specific to this location and month. Keep it concise and practical for hikers planning their trip.`;

    // Retry logic for Claude API with exponential backoff
    let claudeResponse;
    let lastError;
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 1024,
            messages: [{
              role: 'user',
              content: claudePrompt
            }]
          })
        });

        if (claudeResponse.ok) {
          break; // Success, exit retry loop
        }

        const errorText = await claudeResponse.text();
        console.error(`Claude API error (attempt ${attempt + 1}/${maxRetries}):`, claudeResponse.status, errorText);
        
        // If overloaded (529) or rate limited (429), retry with exponential backoff
        if ((claudeResponse.status === 529 || claudeResponse.status === 429) && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        lastError = errorText;
        break; // Non-retryable error or max retries reached
      } catch (fetchError) {
        console.error(`Claude API fetch error (attempt ${attempt + 1}/${maxRetries}):`, fetchError);
        lastError = fetchError;
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If Claude API failed after retries, return a helpful fallback message
    if (!claudeResponse || !claudeResponse.ok) {
      console.error('Claude API unavailable after retries, returning generic seasonal outlook');
      
      return new Response(JSON.stringify({
        success: true,
        source: 'fallback',
        isForecast: false,
        weather: {
          location: location || 'Selected location',
          date: date,
          high: null,
          low: null,
          condition: 'Seasonal Outlook',
          description: `**Seasonal Weather Information**\n\nWeather forecasts are available up to 16 days in advance. For your selected date in ${month} ${year}, please check back closer to your trip date for accurate conditions.\n\n**Planning Tips:**\n- Check the forecast 2 weeks before your trip\n- Research typical conditions for ${location} in ${month}\n- Prepare for variable mountain weather\n- Pack layers and rain gear as a precaution\n\nFor the most accurate forecast, we recommend checking again 10-14 days before your adventure.`,
          icon: 'cloud',
          source: 'fallback'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const claudeData = await claudeResponse.json();
    const seasonalOutlook = claudeData.content[0].text;

    return new Response(JSON.stringify({ 
      success: true,
      source: 'claude-seasonal',
      isForecast: false,
      weather: {
        condition: 'Seasonal Outlook',
        temperature: null,
        high: null,
        low: null,
        summary: `Seasonal weather outlook for ${location} in ${month}`,
        fullForecast: seasonalOutlook
      }
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

function parseOpenMeteoResponse(data: any, location: string) {
  const daily = data.daily;
  
  // WMO Weather codes mapping
  const weatherCodeMap: { [key: number]: string } = {
    0: 'Sunny',
    1: 'Partly Cloudy',
    2: 'Partly Cloudy',
    3: 'Cloudy',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rainy',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    85: 'Light Snow Showers',
    86: 'Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Hail'
  };

  const weatherCode = daily.weathercode[0];
  const condition = weatherCodeMap[weatherCode] || 'Partly Cloudy';
  const high = Math.round(daily.temperature_2m_max[0]);
  const low = Math.round(daily.temperature_2m_min[0]);
  const temperature = Math.round((high + low) / 2);
  const precipitation = daily.precipitation_sum[0];
  const windSpeed = Math.round(daily.windspeed_10m_max[0]);

  // Build hiking-specific summary
  let summary = `${condition} with temperatures between ${low}°C and ${high}°C in ${location}.`;
  
  const considerations = [];
  if (precipitation > 0) {
    considerations.push(`${precipitation}mm precipitation expected`);
  }
  if (windSpeed > 20) {
    considerations.push(`Strong winds up to ${windSpeed} km/h`);
  }
  if (weatherCode >= 95) {
    considerations.push('Thunderstorms possible - consider rescheduling');
  } else if (weatherCode >= 71) {
    considerations.push('Snow expected - bring appropriate gear');
  } else if (weatherCode >= 61) {
    considerations.push('Rain expected - waterproof gear recommended');
  }

  const fullForecast = considerations.length > 0 
    ? `${summary}\n\nHiking considerations: ${considerations.join(', ')}.`
    : `${summary} Good conditions for hiking.`;

  return {
    condition,
    temperature,
    high,
    low,
    summary,
    fullForecast
  };
}
