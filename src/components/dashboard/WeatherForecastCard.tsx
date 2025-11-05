import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherData {
  condition: string;
  temperature: number | null;
  high: number | null;
  low: number | null;
  summary: string;
  fullForecast: string;
}

interface WeatherForecastCardProps {
  location: string;
  latitude: number;
  longitude: number;
  date: string; // YYYY-MM-DD format
}

const WeatherForecastCard = ({ location, latitude, longitude, date }: WeatherForecastCardProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForecast, setIsForecast] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, [location, latitude, longitude, date]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('get-weather-forecast', {
        body: {
          location,
          latitude,
          longitude,
          date
        }
      });

      if (functionError) throw functionError;

      if (data?.success) {
        setWeather(data.weather);
        setIsForecast(data.isForecast);
      } else {
        throw new Error(data?.error || 'Failed to fetch weather');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unable to load weather forecast');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="w-8 h-8 text-charcoal/40" />;
    
    const condition = weather.condition.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) {
      return <Sun className="w-8 h-8 text-gold" />;
    } else if (condition.includes('rain') || condition.includes('shower')) {
      return <CloudRain className="w-8 h-8 text-sage" />;
    } else if (condition.includes('snow')) {
      return <CloudSnow className="w-8 h-8 text-sage" />;
    } else if (condition.includes('storm')) {
      return <AlertTriangle className="w-8 h-8 text-burgundy" />;
    } else if (condition.includes('wind')) {
      return <Wind className="w-8 h-8 text-charcoal/60" />;
    }
    return <Cloud className="w-8 h-8 text-charcoal/60" />;
  };

  if (loading) {
    return (
      <Card className="border-burgundy/10">
        <CardContent className="pt-6">
          <div className="text-sm text-charcoal/60 mb-3">WEATHER FORECAST</div>
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-burgundy/10">
        <CardContent className="pt-6">
          <div className="text-sm text-charcoal/60 mb-2">WEATHER FORECAST</div>
          <div className="text-sm text-charcoal/60">
            Unable to load weather forecast
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  return (
    <Card className="border-burgundy/10">
      <CardContent className="pt-6">
        <div className="text-sm text-charcoal/60 mb-3">
          {isForecast ? 'WEATHER FORECAST' : 'SEASONAL OUTLOOK'}
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {getWeatherIcon()}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-baseline gap-3">
              <div className="font-medium text-charcoal text-lg">
                {weather.condition}
              </div>
              {weather.high !== null && weather.low !== null && (
                <div className="text-sm text-charcoal/60">
                  {weather.low}°C - {weather.high}°C
                </div>
              )}
            </div>
            
            <div className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-wrap">
              {weather.fullForecast}
            </div>

            {!isForecast && (
              <div className="mt-3 pt-3 border-t border-burgundy/10">
                <div className="text-xs text-charcoal/60 italic">
                  💡 Accurate weather forecasts will be available 16 days before the tour date
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherForecastCard;
