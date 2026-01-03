export interface IconBundle {
  id: string;
  name: string;
  price: number;
  description: string;
  icons: string[]; // lucide icon names
}

export const ICON_BUNDLES: IconBundle[] = [
  {
    id: 'fitness',
    name: 'Fitness Pack',
    price: 4.99,
    description: 'Gym, run, yoga icons for your fitness habits',
    icons: ['activity', 'dumbbell', 'heart-pulse', 'run', 'weights', 'yoga'], // placeholder, expand to 40
  },
  {
    id: 'nature',
    name: 'Nature Pack',
    price: 3.99,
    description: 'Trees, flowers, outdoor icons',
    icons: ['leaf', 'tree', 'sun', 'cloud', 'flower', 'mountain'],
  },
  {
    id: 'productivity',
    name: 'Productivity Pack',
    price: 3.99,
    description: 'Work, focus, task icons',
    icons: ['calendar', 'clipboard-list', 'clock', 'notebook', 'pen-tool'],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness Pack',
    price: 3.99,
    description: 'Meditation, zen icons',
    icons: ['brain', 'leaf', 'moon', 'sparkles', 'zen'],
  },
  {
    id: 'fun',
    name: 'Fun Pack',
    price: 2.99,
    description: 'Playful icons for joy habits',
    icons: ['gamepad-2', 'music', 'star', 'gift', 'party'],
  },
];
