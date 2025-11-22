/**
 * Shared App Navigation Configuration
 * Used across all Suite apps to provide consistent navigation
 */

export interface AppConfig {
  name: string;
  slug: string;
  description: string;
  color: string;
  devPort: number;
  prodUrl: string;
}

export const SUITE_APPS: Record<string, AppConfig> = {
  notes: {
    name: 'Notes',
    slug: 'notes',
    description: 'Quickly capture thoughts, ideas, and meeting notes. AI-powered organization.',
    color: 'from-blue-500 to-blue-600',
    devPort: 3001,
    prodUrl: 'https://notes.ainexsuite.com',
  },
  journey: {
    name: 'Journey',
    slug: 'journey',
    description: 'Reflect on your daily experiences with guided prompts and mood tracking.',
    color: 'from-purple-500 to-purple-600',
    devPort: 3002,
    prodUrl: 'https://journey.ainexsuite.com',
  },
  todo: {
    name: 'Tasks',
    slug: 'todo',
    description: 'Manage to-dos and projects. Never miss a deadline with smart priorities.',
    color: 'from-green-500 to-green-600',
    devPort: 3003,
    prodUrl: 'https://tasks.ainexsuite.com',
  },
  track: {
    name: 'Track',
    slug: 'track',
    description: 'Build better habits with visual streaks and progress analytics.',
    color: 'from-orange-500 to-orange-600',
    devPort: 3004,
    prodUrl: 'https://track.ainexsuite.com',
  },
  moments: {
    name: 'Moments',
    slug: 'moments',
    description: 'Capture life\'s beautiful moments. Create a visual timeline of memories.',
    color: 'from-yellow-500 to-yellow-600',
    devPort: 3005,
    prodUrl: 'https://moments.ainexsuite.com',
  },
  grow: {
    name: 'Grow',
    slug: 'grow',
    description: 'Track your learning journey, set goals, and master new skills.',
    color: 'from-teal-500 to-teal-600',
    devPort: 3006,
    prodUrl: 'https://grow.ainexsuite.com',
  },
  pulse: {
    name: 'Pulse',
    slug: 'pulse',
    description: 'Monitor health metrics, wellness trends, and vital signs.',
    color: 'from-red-500 to-red-600',
    devPort: 3007,
    prodUrl: 'https://pulse.ainexsuite.com',
  },
  fit: {
    name: 'Fit',
    slug: 'fit',
    description: 'Record workouts and track fitness progress. Visualize your gains.',
    color: 'from-blue-500 to-blue-600',
    devPort: 3008,
    prodUrl: 'https://fit.ainexsuite.com',
  },
  projects: {
    name: 'Projects',
    slug: 'projects',
    description: 'Visual whiteboard with sticky notes for creative team collaboration.',
    color: 'from-pink-500 to-pink-600',
    devPort: 3009,
    prodUrl: 'https://projects.ainexsuite.com',
  },
  workflow: {
    name: 'Workflow',
    slug: 'workflow',
    description: 'Build and automate visual workflows with drag-and-drop simplicity.',
    color: 'from-cyan-500 to-cyan-600',
    devPort: 3010,
    prodUrl: 'https://workflow.ainexsuite.com',
  },
  calendar: {
    name: 'Calendar',
    slug: 'calendar',
    description: 'Unified calendar for all your events and schedules.',
    color: 'from-violet-500 to-violet-600',
    devPort: 3012,
    prodUrl: 'https://calendar.ainexsuite.com',
  },
  admin: {
    name: 'Admin',
    slug: 'admin',
    description: 'Administrative dashboard for system management.',
    color: 'from-slate-500 to-slate-600',
    devPort: 3011,
    prodUrl: 'https://admin.ainexsuite.com',
  },
};

/**
 * Get URL for an app based on environment
 */
export function getAppUrl(slug: string, isDev: boolean = process.env.NODE_ENV === 'development'): string {
  const app = SUITE_APPS[slug];
  if (!app) {
    console.warn(`App with slug "${slug}" not found in SUITE_APPS`);
    return '';
  }
  return isDev ? `http://localhost:${app.devPort}` : app.prodUrl;
}

/**
 * Get all apps as array
 */
export function getAllApps(): AppConfig[] {
  return Object.values(SUITE_APPS);
}

/**
 * Get app by slug
 */
export function getApp(slug: string): AppConfig | undefined {
  return SUITE_APPS[slug];
}
