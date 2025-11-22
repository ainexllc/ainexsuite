// Coordinates for default zipcode 66221 (Overland Park, Kansas)
const DEFAULT_LOCATION = {
  name: 'Overland Park',
  latitude: 38.95,
  longitude: -94.61,
};

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity?: number;
  windSpeed?: number;
}

// Map WMO codes to weather conditions and icons
const getWeatherInfo = (code: number): { condition: string; icon: string } => {
  // WMO Weather interpretation codes
  if (code === 0) return { condition: 'Clear', icon: '☀️' };
  if (code === 1 || code === 2) return { condition: 'Cloudy', icon: '⛅' };
  if (code === 3) return { condition: 'Overcast', icon: '☁️' };
  if (code === 45 || code === 48) return { condition: 'Foggy', icon: '🌫️' };
  if (code === 51 || code === 53 || code === 55) return { condition: 'Drizzle', icon: '🌦️' };
  if (code === 61 || code === 63 || code === 65) return { condition: 'Rain', icon: '🌧️' };
  if (code === 71 || code === 73 || code === 75) return { condition: 'Snow', icon: '❄️' };
  if (code === 80 || code === 81 || code === 82) return { condition: 'Showers', icon: '🌧️' };
  if (code === 85 || code === 86) return { condition: 'Snow Showers', icon: '🌨️' };
  if (code === 95 || code === 96 || code === 99) return { condition: 'Thunderstorm', icon: '⛈️' };
  return { condition: 'Unknown', icon: '🌡️' };
};

export async function getWeather(
  latitude = DEFAULT_LOCATION.latitude,
  longitude = DEFAULT_LOCATION.longitude,
  location = DEFAULT_LOCATION.name,
  isCelsius = false
): Promise<WeatherData> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m');
    url.searchParams.set('temperature_unit', isCelsius ? 'celsius' : 'fahrenheit');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.statusText}`);
    }

    const data = await response.json();
    const current = data.current;

    const { condition, icon } = getWeatherInfo(current.weather_code);

    return {
      temperature: Math.round(current.temperature_2m),
      condition,
      icon,
      location,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    throw error;
  }
}
