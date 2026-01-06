/**
 * App Registry - Complete list of all AINexSuite applications
 * Single source of truth for app configuration and metadata
 */

export type AppSlug =
  | 'main'
  | 'notes'
  | 'journal'
  | 'todo'
  | 'health'
  | 'fit'
  | 'album'
  | 'habits'
  | 'display'
  | 'projects'
  | 'workflow'
  | 'calendar'
  | 'subs'
  | 'admin';

export interface AppConfig {
  name: string;
  slug: AppSlug;
  description: string;
  icon: string; // Icon name from lucide-react
  color: string; // Tailwind color name
  gradient: string; // Tailwind gradient classes
  devUrl: string;
  prodUrl: string;
  devPort: number;
  category: 'productivity' | 'health' | 'creative' | 'system' | 'admin';
  features: string[];
  status: 'active' | 'beta' | 'coming-soon';
  /** Email addresses that have access to this app (if restricted) */
  allowedEmails?: string[];
}

/**
 * Complete registry of all AINexSuite applications
 */
export const APP_REGISTRY: Record<AppSlug, AppConfig> = {
  main: {
    name: 'Suite Hub',
    slug: 'main',
    description: 'Your central dashboard to access all apps and view unified activity',
    icon: 'Grid',
    color: 'blue',
    gradient: 'from-blue-500 to-sky-500',
    devUrl: 'http://localhost:3000',
    prodUrl: 'https://www.ainexspace.com',
    devPort: 3000,
    category: 'system',
    features: ['Dashboard', 'Activity Feed', 'App Switcher', 'Universal Search'],
    status: 'active',
  },
  notes: {
    name: 'Notes',
    slug: 'notes',
    description: 'Quickly capture your thoughts, ideas, and notes. Organize with labels and AI-powered search.',
    icon: 'NotesStickyIcon',
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
    devUrl: 'http://localhost:3001',
    prodUrl: 'https://notes.ainexspace.com',
    devPort: 3001,
    category: 'productivity',
    features: ['Quick Capture', 'Labels', 'AI Search', 'Rich Text Editor'],
    status: 'active',
  },
  journal: {
    name: 'Journal',
    slug: 'journal',
    description: 'Reflect on your daily experiences with guided prompts. Track mood and emotional growth.',
    icon: 'BookOpen',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    devUrl: 'http://localhost:3002',
    prodUrl: 'https://journal.ainexspace.com',
    devPort: 3002,
    category: 'health',
    features: ['Daily Journaling', 'Mood Tracking', 'Guided Prompts', 'Emotional Insights'],
    status: 'active',
  },
  todo: {
    name: 'Todo',
    slug: 'todo',
    description: 'Manage your to-dos and projects. Set priorities, due dates, and never miss a deadline.',
    icon: 'CheckSquare',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    devUrl: 'http://localhost:3003',
    prodUrl: 'https://todo.ainexspace.com',
    devPort: 3003,
    category: 'productivity',
    features: ['Task Management', 'Projects', 'Due Dates', 'Priorities'],
    status: 'active',
  },
  health: {
    name: 'Health',
    slug: 'health',
    description: 'Track medications, symptoms, lab results, and appointments. Monitor sleep, mood, and vitals.',
    icon: 'Heart',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    devUrl: 'http://localhost:3004',
    prodUrl: 'https://health.ainexspace.com',
    devPort: 3004,
    category: 'health',
    features: ['Medications', 'Symptoms', 'Lab Results', 'Appointments', 'Sleep', 'Vitals'],
    status: 'active',
  },
  fit: {
    name: 'Fit',
    slug: 'fit',
    description: 'Track workouts, nutrition, recipes, and body metrics. Reach your fitness goals with AI assistance.',
    icon: 'Dumbbell',
    color: 'blue',
    gradient: 'from-blue-500 to-green-500',
    devUrl: 'http://localhost:3008',
    prodUrl: 'https://fit.ainexspace.com',
    devPort: 3008,
    category: 'health',
    features: ['Workouts', 'Nutrition', 'Recipes', 'Supplements', 'Body Metrics', 'Personal Records'],
    status: 'active',
  },
  album: {
    name: 'Album',
    slug: 'album',
    description: 'Capture life\'s beautiful moments with photos and captions. Create a visual timeline.',
    icon: 'Camera',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    devUrl: 'http://localhost:3005',
    prodUrl: 'https://album.ainexspace.com',
    devPort: 3005,
    category: 'creative',
    features: ['Photo Gallery', 'Timeline View', 'Captions', 'Albums'],
    status: 'active',
  },
  habits: {
    name: 'Habits',
    slug: 'habits',
    description: 'Build better habits and track your daily routines. Set goals and celebrate milestones.',
    icon: 'GraduationCap',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    devUrl: 'http://localhost:3006',
    prodUrl: 'https://habits.ainexspace.com',
    devPort: 3006,
    category: 'productivity',
    features: ['Habit Tracking', 'Daily Routines', 'Goal Setting', 'Progress Tracking'],
    status: 'active',
  },
  display: {
    name: 'Display',
    slug: 'display',
    description: 'Dashboard displays for world clocks, weather, and ambient information.',
    icon: 'Activity',
    color: 'red',
    gradient: 'from-red-500 to-orange-500',
    devUrl: 'http://localhost:3007',
    prodUrl: 'https://display.ainexspace.com',
    devPort: 3007,
    category: 'productivity',
    features: ['World Clocks', 'Dashboard Display', 'Ambient Info'],
    status: 'active',
  },
  projects: {
    name: 'Project',
    slug: 'projects',
    description: 'Visual project whiteboard with sticky notes and kanban boards for team collaboration.',
    icon: 'Layers',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    devUrl: 'http://localhost:3009',
    prodUrl: 'https://project.ainexspace.com',
    devPort: 3009,
    category: 'productivity',
    features: ['Whiteboard', 'Sticky Notes', 'Kanban Boards', 'Collaboration'],
    status: 'active',
  },
  workflow: {
    name: 'Workflow',
    slug: 'workflow',
    description: 'Build visual workflows with drag-and-drop simplicity. Automate processes and tasks.',
    icon: 'GitBranch',
    color: 'purple',
    gradient: 'from-purple-600 to-indigo-600',
    devUrl: 'http://localhost:3010',
    prodUrl: 'https://workflow.ainexspace.com',
    devPort: 3010,
    category: 'productivity',
    features: ['Visual Builder', 'Automation', 'Triggers', 'Conditions'],
    status: 'active',
  },
  calendar: {
    name: 'Calendar',
    slug: 'calendar',
    description: 'Schedule events, manage appointments, and stay organized with your calendar.',
    icon: 'Calendar',
    color: 'sky',
    gradient: 'from-sky-500 to-blue-500',
    devUrl: 'http://localhost:3014',
    prodUrl: 'https://calendar.ainexspace.com',
    devPort: 3014,
    category: 'productivity',
    features: ['Events', 'Scheduling', 'Reminders', 'Multiple Views'],
    status: 'active',
  },
  subs: {
    name: 'Subs',
    slug: 'subs',
    description: 'Manage subscriptions and recurring bills. Track your money and spending.',
    icon: 'DollarSign',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    devUrl: 'http://localhost:3015',
    prodUrl: 'https://subs.ainexspace.com',
    devPort: 3015,
    category: 'productivity',
    features: ['Subscriptions', 'Recurring Bills', 'Spending Tracker', 'Budget'],
    status: 'active',
  },
  admin: {
    name: 'Admin',
    slug: 'admin',
    description: 'Manage users, settings, and configuration for the AINexSuite platform.',
    icon: 'Settings',
    color: 'zinc',
    gradient: 'from-zinc-500 to-slate-600',
    devUrl: 'http://localhost:3020',
    prodUrl: 'https://admin.ainexspace.com',
    devPort: 3020,
    category: 'admin',
    features: ['User Management', 'App Configuration', 'Analytics', 'Settings'],
    status: 'active',
    allowedEmails: ['hornld25@gmail.com'],
  },
};

/**
 * Get all apps as an array
 */
export function getAllApps(): AppConfig[] {
  return Object.values(APP_REGISTRY);
}

/**
 * Get app by slug
 */
export function getAppBySlug(slug: AppSlug): AppConfig | undefined {
  return APP_REGISTRY[slug];
}

/**
 * Get apps by category
 */
export function getAppsByCategory(category: AppConfig['category']): AppConfig[] {
  return getAllApps().filter(app => app.category === category);
}

/**
 * Get apps by status
 */
export function getAppsByStatus(status: AppConfig['status']): AppConfig[] {
  return getAllApps().filter(app => app.status === status);
}

/**
 * Get active apps (excluding Suite Hub)
 */
export function getActiveApps(): AppConfig[] {
  return getAllApps().filter(app => app.slug !== 'main' && app.status === 'active');
}
