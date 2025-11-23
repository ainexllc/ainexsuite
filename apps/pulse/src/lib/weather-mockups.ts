/**
 * Weather Tile Customization Modal Mockups
 * 10 functional mockup configurations with dummy data for preview/testing
 */

export interface WeatherTileMockup {
  id: string;
  name: string;
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

export const WEATHER_MOCKUPS: WeatherTileMockup[] = [
  {
    id: 'mockup-sunny-california',
    name: 'Sunny California',
    location: 'San Diego, CA',
    temperature: 72,
    condition: 'Clear',
    icon: '☀️',
    humidity: 45,
    windSpeed: 8,
    description: 'Beautiful sunny day in Southern California'
  },
  {
    id: 'mockup-rainy-seattle',
    name: 'Rainy Seattle',
    location: 'Seattle, WA',
    temperature: 48,
    condition: 'Rain',
    icon: '🌧️',
    humidity: 85,
    windSpeed: 12,
    description: 'Typical Pacific Northwest rainy day'
  },
  {
    id: 'mockup-snowy-denver',
    name: 'Snowy Denver',
    location: 'Denver, CO',
    temperature: 28,
    condition: 'Snow',
    icon: '❄️',
    humidity: 65,
    windSpeed: 18,
    description: 'Winter snowstorm in the Rocky Mountains'
  },
  {
    id: 'mockup-hot-arizona',
    name: 'Hot Arizona',
    location: 'Phoenix, AZ',
    temperature: 105,
    condition: 'Clear',
    icon: '☀️',
    humidity: 20,
    windSpeed: 5,
    description: 'Extremely hot desert conditions'
  },
  {
    id: 'mockup-stormy-florida',
    name: 'Stormy Florida',
    location: 'Miami, FL',
    temperature: 82,
    condition: 'Thunderstorm',
    icon: '⛈️',
    humidity: 92,
    windSpeed: 25,
    description: 'Severe thunderstorm with heavy rain'
  },
  {
    id: 'mockup-cloudy-new-york',
    name: 'Cloudy New York',
    location: 'New York, NY',
    temperature: 52,
    condition: 'Cloudy',
    icon: '⛅',
    humidity: 60,
    windSpeed: 10,
    description: 'Overcast day in the city that never sleeps'
  },
  {
    id: 'mockup-foggy-san-francisco',
    name: 'Foggy San Francisco',
    location: 'San Francisco, CA',
    temperature: 58,
    condition: 'Foggy',
    icon: '🌫️',
    humidity: 88,
    windSpeed: 14,
    description: 'Famous San Francisco fog rolling in'
  },
  {
    id: 'mockup-drizzle-boston',
    name: 'Drizzle Boston',
    location: 'Boston, MA',
    temperature: 45,
    condition: 'Drizzle',
    icon: '🌦️',
    humidity: 75,
    windSpeed: 9,
    description: 'Light mist and drizzle throughout the day'
  },
  {
    id: 'mockup-windy-chicago',
    name: 'Windy Chicago',
    location: 'Chicago, IL',
    temperature: 38,
    condition: 'Clear',
    icon: '☀️',
    humidity: 40,
    windSpeed: 22,
    description: 'Blustery windy day - the Windy City lives up to its name'
  },
  {
    id: 'mockup-humid-houston',
    name: 'Humid Houston',
    location: 'Houston, TX',
    temperature: 88,
    condition: 'Cloudy',
    icon: '⛅',
    humidity: 95,
    windSpeed: 7,
    description: 'Hot and incredibly humid Texas summer day'
  }
];

/**
 * Get a mockup by ID
 */
export function getMockupById(id: string): WeatherTileMockup | undefined {
  return WEATHER_MOCKUPS.find(mockup => mockup.id === id);
}

/**
 * Get all mockup names for a selection list
 */
export function getMockupNames(): Array<{ id: string; name: string }> {
  return WEATHER_MOCKUPS.map(mockup => ({
    id: mockup.id,
    name: mockup.name
  }));
}

/**
 * Get a random mockup
 */
export function getRandomMockup(): WeatherTileMockup {
  return WEATHER_MOCKUPS[Math.floor(Math.random() * WEATHER_MOCKUPS.length)];
}
