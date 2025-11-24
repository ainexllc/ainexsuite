export const SUITE_APPS = {
  notes: {
    name: 'Notes',
    slug: 'notes',
    description: 'Capture your thoughts and ideas',
    color: '#eab308', // yellow-500
  },
  journey: {
    name: 'Journey',
    slug: 'journey',
    description: 'Plan your path and track progress',
    color: '#f97316', // orange-500
  },
  todo: {
    name: 'Todo',
    slug: 'todo',
    description: 'Manage tasks and projects',
    color: '#8b5cf6', // violet-500
  },
  track: {
    name: 'Track',
    slug: 'track',
    description: 'Monitor habits and goals',
    color: '#22c55e', // green-500
  },
  moments: {
    name: 'Moments',
    slug: 'moments',
    description: 'Cherish your memories',
    color: '#ec4899', // pink-500
  },
  grow: {
    name: 'Grow',
    slug: 'grow',
    description: 'Personal development tools',
    color: '#14b8a6', // teal-500
  },
  pulse: {
    name: 'Pulse',
    slug: 'pulse',
    description: 'Health and vitality tracking',
    color: '#ef4444', // red-500
  },
  fit: {
    name: 'Fit',
    slug: 'fit',
    description: 'Workout and fitness tracking',
    color: '#3b82f6', // blue-500
  },
  projects: {
    name: 'Projects',
    slug: 'projects',
    description: 'Manage complex projects',
    color: '#6366f1', // indigo-500
  },
  workflow: {
    name: 'Workflow',
    slug: 'workflow',
    description: 'Automate your daily tasks',
    color: '#06b6d4', // cyan-500
  },
} as const;

export type AppSlug = keyof typeof SUITE_APPS;

export function getAppUrl(slug: string, isDev: boolean = false): string {
  const portMap: Record<string, number> = {
    main: 3000,
    notes: 3001,
    journey: 3002,
    todo: 3003,
    track: 3004,
    moments: 3005,
    grow: 3006,
    pulse: 3007,
    fit: 3008,
    projects: 3009,
    workflow: 3010,
    admin: 3011,
  };

  if (isDev) {
    const port = portMap[slug] || 3000;
    return `http://localhost:${port}/workspace`;
  }

  return `https://${slug}.ainexsuite.com/workspace`;
}
