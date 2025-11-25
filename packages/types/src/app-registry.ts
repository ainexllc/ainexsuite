/**
 * App Registry - Complete list of all AINexSuite applications
 * Single source of truth for app configuration and metadata
 */

export type AppSlug =
  | 'main'
  | 'notes'
  | 'journey'
  | 'todo'
  | 'track'
  | 'moments'
  | 'grow'
  | 'pulse'
  | 'fit'
  | 'projects'
  | 'workflow';

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
  category: 'productivity' | 'health' | 'creative' | 'system';
  features: string[];
  status: 'active' | 'beta' | 'coming-soon';
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
    prodUrl: 'https://www.ainexsuite.com',
    devPort: 3000,
    category: 'system',
    features: ['Dashboard', 'Activity Feed', 'App Switcher', 'Universal Search'],
    status: 'active',
  },
  notes: {
    name: 'Notes',
    slug: 'notes',
    description: 'Quickly capture your thoughts, ideas, and notes. Organize with labels and AI-powered search.',
    icon: 'FileText',
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-500',
    devUrl: 'http://localhost:3001',
    prodUrl: 'https://notes.ainexsuite.com',
    devPort: 3001,
    category: 'productivity',
    features: ['Quick Capture', 'Labels', 'AI Search', 'Rich Text Editor'],
    status: 'active',
  },
  journey: {
    name: 'Journey',
    slug: 'journey',
    description: 'Reflect on your daily experiences with guided prompts. Track mood and emotional growth.',
    icon: 'BookOpen',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-500',
    devUrl: 'http://localhost:3002',
    prodUrl: 'https://journey.ainexsuite.com',
    devPort: 3002,
    category: 'health',
    features: ['Daily Journaling', 'Mood Tracking', 'Guided Prompts', 'Emotional Insights'],
    status: 'active',
  },
  todo: {
    name: 'Task',
    slug: 'todo',
    description: 'Manage your to-dos and projects. Set priorities, due dates, and never miss a deadline.',
    icon: 'CheckSquare',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    devUrl: 'http://localhost:3003',
    prodUrl: 'https://task.ainexsuite.com',
    devPort: 3003,
    category: 'productivity',
    features: ['Task Management', 'Projects', 'Due Dates', 'Priorities'],
    status: 'active',
  },
  track: {
    name: 'Track',
    slug: 'track',
    description: 'Build and maintain great habits with visual streaks and progress tracking.',
    icon: 'TrendingUp',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500',
    devUrl: 'http://localhost:3004',
    prodUrl: 'https://track.ainexsuite.com',
    devPort: 3004,
    category: 'productivity',
    features: ['Habit Tracking', 'Streak Visualization', 'Progress Charts', 'Reminders'],
    status: 'active',
  },
  moments: {
    name: 'Moments',
    slug: 'moments',
    description: 'Capture life\'s beautiful moments with photos and captions. Create a visual timeline.',
    icon: 'Camera',
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500',
    devUrl: 'http://localhost:3005',
    prodUrl: 'https://moments.ainexsuite.com',
    devPort: 3005,
    category: 'creative',
    features: ['Photo Gallery', 'Timeline View', 'Captions', 'Albums'],
    status: 'active',
  },
  grow: {
    name: 'Grow',
    slug: 'grow',
    description: 'Track your learning journey and skill development. Set goals and celebrate milestones.',
    icon: 'GraduationCap',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    devUrl: 'http://localhost:3006',
    prodUrl: 'https://grow.ainexsuite.com',
    devPort: 3006,
    category: 'productivity',
    features: ['Learning Paths', 'Skill Trees', 'Goal Setting', 'Progress Tracking'],
    status: 'active',
  },
  pulse: {
    name: 'Pulse',
    slug: 'pulse',
    description: 'Monitor your health metrics and wellness trends. Track symptoms, medications, and vitals.',
    icon: 'Activity',
    color: 'red',
    gradient: 'from-red-500 to-orange-500',
    devUrl: 'http://localhost:3007',
    prodUrl: 'https://pulse.ainexsuite.com',
    devPort: 3007,
    category: 'health',
    features: ['Health Metrics', 'Symptom Tracker', 'Medications', 'Vital Signs'],
    status: 'active',
  },
  fit: {
    name: 'Fit',
    slug: 'fit',
    description: 'Record workouts, track fitness progress, and achieve your health goals.',
    icon: 'Dumbbell',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-500',
    devUrl: 'http://localhost:3008',
    prodUrl: 'https://fit.ainexsuite.com',
    devPort: 3008,
    category: 'health',
    features: ['Workout Logging', 'Exercise Library', 'Progress Charts', 'Personal Records'],
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
    prodUrl: 'https://project.ainexsuite.com',
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
    prodUrl: 'https://workflow.ainexsuite.com',
    devPort: 3010,
    category: 'productivity',
    features: ['Visual Builder', 'Automation', 'Triggers', 'Conditions'],
    status: 'active',
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
