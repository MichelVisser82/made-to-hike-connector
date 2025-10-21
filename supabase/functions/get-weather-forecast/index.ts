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
    const { location, latitude, longitude, date } = await req.json();
    
    if (!latitude || !longitude) {
      throw new Error('GPS coordinates are required for weather forecast');
    }

    console.log('Fetching weather from Open-Meteo:', { latitude, longitude, location, date });

    // Open-Meteo API call
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max',
      timezone: 'auto',
      start_date: date,
      end_date: date
    });

    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Open-Meteo API error:', response.status, errorText);
      
      // Check if error is due to date being out of range
      if (errorText.includes('out of allowed range')) {
        throw new Error('Weather forecasts are only available for the next 16 days. Please check closer to your tour date.');
      }
      
      throw new Error(`Unable to fetch weather forecast`);
    }

    const data = await response.json();
    console.log('Open-Meteo response:', JSON.stringify(data, null, 2));

    if (!data.daily || data.daily.time.length === 0) {
      throw new Error('No weather data available for the specified date');
    }

    // Parse the weather data
    const parsed = parseOpenMeteoResponse(data, location);

    return new Response(JSON.stringify({ 
      success: true,
      weather: parsed,
      rawResponse: JSON.stringify(data)
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
