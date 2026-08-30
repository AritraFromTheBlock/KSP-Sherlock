import React, { useEffect, useState } from 'react';
import { Sun, CloudSun, Cloud, CloudRain, CloudLightning, CloudFog, Wind, Droplets, MapPin, RefreshCw } from 'lucide-react';

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  code: number;
}

export const WeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData>({
    temp: 24,
    humidity: 68,
    windSpeed: 12,
    condition: 'Partly Cloudy',
    code: 2,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const fetchWeather = async () => {
    setLoading(true);
    setError(false);
    try {
      // Open-Meteo API for Bengaluru (Lat: 12.9716, Long: 77.5946)
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=12.9716&longitude=77.5946&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m'
      );
      if (!res.ok) throw new Error('Failed to fetch weather');
      const data = await res.json();
      
      const current = data.current;
      const code = current.weather_code;
      
      setWeather({
        temp: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        condition: getWeatherConditionText(code),
        code: code,
      });
    } catch (e) {
      console.error('Weather fetch error:', e);
      setError(true);
      // Fallback data for Bengaluru in case of network issue
      setWeather({
        temp: 24,
        humidity: 68,
        windSpeed: 12,
        condition: 'Partly Cloudy',
        code: 2,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherConditionText = (code: number): string => {
    if (code === 0) return 'Clear Sky';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Light Drizzle';
    if (code >= 61 && code <= 65) return 'Rainy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Partly Cloudy';
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0 || code === 1) return <Sun className="h-7 w-7 text-amber-400" />;
    if (code === 2) return <CloudSun className="h-7 w-7 text-amber-300" />;
    if (code === 3) return <Cloud className="h-7 w-7 text-slate-300" />;
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return <CloudRain className="h-7 w-7 text-blue-400" />;
    if (code >= 95) return <CloudLightning className="h-7 w-7 text-amber-400" />;
    if (code >= 45 && code <= 48) return <CloudFog className="h-7 w-7 text-slate-400" />;
    return <CloudSun className="h-7 w-7 text-amber-300" />;
  };

  return (
    <div className="rounded-xl border border-edge/80 bg-panel/90 p-4 sm:p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
      {/* Location & Status Header */}
      <div className="flex items-center justify-between border-b border-edge/50 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-neon-bright" />
          <span className="font-display font-bold text-sm text-slate-200 tracking-wide">
            Bengaluru, KA
          </span>
        </div>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="text-slate-400 hover:text-neon-bright transition-colors"
          title="Refresh Weather"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Weather Display */}
      {weather && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-void border border-edge/60">
                {getWeatherIcon(weather.code)}
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-slate-100 leading-none">
                  {weather.temp}°C
                </div>
                <div className="font-body text-xs text-slate-400 mt-1">
                  {weather.condition}
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Metrics */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-edge/40 text-xs font-mono">
            <div className="flex items-center gap-2 bg-void/60 px-3 py-2 rounded-lg border border-edge/50">
              <Droplets className="h-3.5 w-3.5 text-blue-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Humidity</div>
                <div className="font-bold text-slate-200">{weather.humidity}%</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-void/60 px-3 py-2 rounded-lg border border-edge/50">
              <Wind className="h-3.5 w-3.5 text-teal-400" />
              <div>
                <div className="text-[10px] text-slate-500 uppercase">Wind Speed</div>
                <div className="font-bold text-slate-200">{weather.windSpeed} km/h</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
