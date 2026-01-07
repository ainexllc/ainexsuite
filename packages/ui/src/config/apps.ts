export const SUITE_APPS = {
  notes: {
    name: 'Notes',
    slug: 'notes',
    description: 'Capture your thoughts and ideas',
    color: '#eab308', // yellow-500
  },
  journal: {
    name: 'Journal',
    slug: 'journal',
    description: 'Daily reflections and mood tracking',
    color: '#f97316', // orange-500
  },
  todo: {
    name: 'Todo',
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
  album: {
    name: 'Album',
    slug: 'album',
    description: 'Curate photos and memories into albums',
    color: '#ec4899', // pink-500
  },
  habits: {
    name: 'Habits',
    slug: 'habits',
    description: 'Build streaks and track daily habits',
    color: '#14b8a6', // teal-500
  },
  mosaic: {
    name: 'Mosaic',
    slug: 'mosaic',
    description: 'Unified dashboard with insights from all apps',
    color: '#ef4444', // red-500
  },
  fit: {
    name: 'Fit',
    slug: 'fit',
    description: 'Workout and fitness tracking',
    color: '#3b82f6', // blue-500
  },
  projects: {
    name: 'Project',
    slug: 'projects',
    description: 'Manage complex projects',
    color: '#6366f1', // indigo-500
  },
  flow: {
    name: 'Flow',
    slug: 'flow',
    description: 'Visual workflow builder like Miro',
    color: '#06b6d4', // cyan-500
  },
  calendar: {
    name: 'Calendar',
    slug: 'calendar',
    description: 'Schedule events and manage your agenda',
    color: '#0ea5e9', // sky-500
  },
  docs: {
    name: 'Docs',
    slug: 'docs',
    description: 'Create and edit rich documents',
    color: '#3b82f6', // blue-500
  },
  admin: {
    name: 'Admin',
    slug: 'admin',
    description: 'Platform admin and system settings',
    color: '#71717a', // zinc-500
    allowedEmails: ['hornld25@gmail.com'],
  },
  subs: {
    name: 'Subs',
    slug: 'subs',
    description: 'Track subscriptions and recurring bills',
    color: '#10b981', // emerald-500
  },
  tables: {
    name: 'Tables',
    slug: 'tables',
    description: 'Spreadsheets and data tables',
    color: '#10b981', // emerald-500
  },
} as const;

export type AppSlug = keyof typeof SUITE_APPS;

export function getAppUrl(slug: string, isDev: boolean = false): string {
  const portMap: Record<string, number> = {
    main: 3000,
    notes: 3001,
    journal: 3002,
    todo: 3003,
    health: 3004,
    album: 3005,
    habits: 3006,
    mosaic: 3007,
    fit: 3008,
    projects: 3009,
    flow: 3010,
    subs: 3011,
    docs: 3012,
    tables: 3013,
    calendar: 3014,
    admin: 3020,
  };

  if (isDev) {
    const port = portMap[slug] || 3000;
    return `http://localhost:${port}/workspace`;
  }

  // Main app uses the root domain in production
  if (slug === 'main') {
    return 'https://ainexspace.com/workspace';
  }

  // Map internal slugs to production domains (if different from slug)
  const domainMap: Record<string, string> = {
    // All apps now use their slug as domain
  };
  const domain = domainMap[slug] || slug;

  return `https://${domain}.ainexspace.com/workspace`;
}
