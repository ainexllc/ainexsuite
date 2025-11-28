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
    name: 'Task',
    slug: 'todo',
    description: 'Manage tasks and projects',
    color: '#8b5cf6', // violet-500
  },
  health: {
    name: 'Health',
    slug: 'health',
    description: 'Track body metrics and wellness',
    color: '#10b981', // emerald-500
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
  project: {
    name: 'Project',
    slug: 'project',
    description: 'Manage complex projects',
    color: '#6366f1', // indigo-500
  },
  workflow: {
    name: 'Workflow',
    slug: 'workflow',
    description: 'Automate your daily tasks',
    color: '#06b6d4', // cyan-500
  },
  calendar: {
    name: 'Calendar',
    slug: 'calendar',
    description: 'Schedule events and appointments',
    color: '#0ea5e9', // sky-500
  },
  admin: {
    name: 'Admin',
    slug: 'admin',
    description: 'Manage platform settings',
    color: '#71717a', // zinc-500
    allowedEmails: ['hornld25@gmail.com'],
  },
  track: {
    name: 'Track',
    slug: 'track',
    description: 'Manage recurring expenses',
    color: '#10b981', // emerald-500
  },
} as const;

export type AppSlug = keyof typeof SUITE_APPS;

export function getAppUrl(slug: string, isDev: boolean = false): string {
  const portMap: Record<string, number> = {
    main: 3000,
    notes: 3001,
    journey: 3002,
    todo: 3003,
    health: 3004,
    moments: 3005,
    grow: 3006,
    pulse: 3007,
    fit: 3008,
    project: 3009,
    workflow: 3010,
    calendar: 3014,
    admin: 3020,
    track: 3015,
  };

  if (isDev) {
    const port = portMap[slug] || 3000;
    return `http://localhost:${port}/workspace`;
  }

  // Main app uses the root domain in production
  if (slug === 'main') {
    return 'https://ainexsuite.com/workspace';
  }

  // Map internal slugs to production domains
  const domainMap: Record<string, string> = {
    todo: 'task', // todo app uses task.ainexsuite.com in production
  };
  const domain = domainMap[slug] || slug;

  return `https://${domain}.ainexsuite.com/workspace`;
}
