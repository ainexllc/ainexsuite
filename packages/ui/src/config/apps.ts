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
  projects: {
    name: 'Project',
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
  smarthub: {
    name: 'Smart',
    slug: 'smarthub',
    description: 'Connect your world',
    color: '#0ea5e9', // sky-500
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
    projects: 3009,
    workflow: 3010,
    admin: 3011,
    smarthub: 3012,
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
    smarthub: 'smart', // smarthub uses smart.ainexsuite.com
    projects: 'project', // projects app uses project.ainexsuite.com
  };
  const domain = domainMap[slug] || slug;

  return `https://${domain}.ainexsuite.com/workspace`;
}
