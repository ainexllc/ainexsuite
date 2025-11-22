// Coordinates for default zipcode 66221 (Overland Park, Kansas)
const DEFAULT_LOCATION = {
  zipcode: '66221',
  name: 'Overland Park',
  latitude: 38.95,
  longitude: -94.61,
};

// Zipcode to coordinates mapping (common US zipcodes)
const ZIPCODE_COORDS: Record<string, { name: string; latitude: number; longitude: number }> = {
  '66221': { name: 'Overland Park, KS', latitude: 38.95, longitude: -94.61 },
  '10001': { name: 'New York, NY', latitude: 40.75, longitude: -73.99 },
  '90001': { name: 'Los Angeles, CA', latitude: 33.97, longitude: -118.25 },
  '60601': { name: 'Chicago, IL', latitude: 41.88, longitude: -87.63 },
  '77001': { name: 'Houston, TX', latitude: 29.76, longitude: -95.37 },
  '85001': { name: 'Phoenix, AZ', latitude: 33.45, longitude: -112.07 },
  '19101': { name: 'Philadelphia, PA', latitude: 39.95, longitude: -75.17 },
  '78201': { name: 'San Antonio, TX', latitude: 29.43, longitude: -98.49 },
  '92101': { name: 'San Diego, CA', latitude: 32.72, longitude: -117.16 },
  '75201': { name: 'Dallas, TX', latitude: 32.78, longitude: -96.80 },
  '94102': { name: 'San Francisco, CA', latitude: 37.79, longitude: -122.42 },
  '73301': { name: 'Austin, TX', latitude: 30.27, longitude: -97.74 },
  '89101': { name: 'Las Vegas, NV', latitude: 36.16, longitude: -115.14 },
  '98101': { name: 'Seattle, WA', latitude: 47.60, longitude: -122.33 },
  '80202': { name: 'Denver, CO', latitude: 39.74, longitude: -104.99 },
};

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  humidity?: number;
  windSpeed?: number;
}

// Get location coordinates from zipcode
export function getLocationFromZipcode(zipcode: string) {
  const normalized = zipcode.trim();
  return ZIPCODE_COORDS[normalized] || null;
}

// Map WMO codes to weather conditions and icons
const getWeatherInfo = (code: number): { condition: string; icon: string } => {
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

export async function getWeather(zipcode?: string, isCelsius = false): Promise<WeatherData> {
  let latitude = DEFAULT_LOCATION.latitude;
  let longitude = DEFAULT_LOCATION.longitude;
  let location = DEFAULT_LOCATION.name;

  if (zipcode) {
    const coords = getLocationFromZipcode(zipcode);
    if (coords) {
      latitude = coords.latitude;
      longitude = coords.longitude;
      location = coords.name;
    }
  }
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
