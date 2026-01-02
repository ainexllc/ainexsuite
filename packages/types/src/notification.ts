/**
 * Notification and Quick Action Types
 * For workspace header and global UI components
 */

import type { AppSlug } from './app-registry';

/**
 * Notification types
 */
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'reminder'
  | 'mention'
  | 'update'
  | 'space_invite'    // Invited to join a space
  | 'space_accepted'  // Someone accepted your invite
  | 'space_joined';   // New member joined your space

/**
 * Individual notification item
 */
export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  app?: AppSlug;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string; // Lucide icon name
  metadata?: Record<string, unknown>;
}

/**
 * Metadata for space_invite notifications
 */
export interface SpaceInviteMetadata {
  invitationId: string;
  spaceId: string;
  spaceName: string;
  spaceType: string;
  invitedBy: string;
  invitedByName?: string;
  invitedByPhoto?: string;
  role: string;
  expiresAt: number;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  showBadge: boolean;
  groupByApp: boolean;
  autoMarkRead: boolean;
}

/**
 * Quick action for the workspace header
 */
export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: string; // Lucide icon name
  shortcut?: string; // e.g., 'N' for Cmd+N
  app: AppSlug | 'global';
  category?: 'create' | 'navigate' | 'action';
}

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string; // Lucide icon name
  current?: boolean;
}

/**
 * Search result from command palette
 */
export interface CommandPaletteResult {
  id: string;
  type: 'action' | 'page' | 'item' | 'recent';
  title: string;
  description?: string;
  icon?: string;
  app?: AppSlug;
  url?: string;
  shortcut?: string;
  onSelect?: () => void;
}

/**
 * Command palette section
 */
export interface CommandPaletteSection {
  id: string;
  title: string;
  items: CommandPaletteResult[];
}

/**
 * Default quick actions per app
 */
export const DEFAULT_QUICK_ACTIONS: Record<AppSlug, QuickAction[]> = {
  main: [
    { id: 'go-to-app', label: 'Go to App', icon: 'Grid', app: 'main', category: 'navigate' },
  ],
  notes: [
    { id: 'new-note', label: 'New Note', description: 'Create a new note', icon: 'FileText', shortcut: 'N', app: 'notes', category: 'create' },
    { id: 'new-checklist', label: 'New Checklist', description: 'Create a checklist', icon: 'ListChecks', shortcut: 'C', app: 'notes', category: 'create' },
  ],
  journal: [
    { id: 'new-entry', label: 'New Entry', description: 'Write a journal entry', icon: 'BookOpen', shortcut: 'N', app: 'journal', category: 'create' },
    { id: 'new-reflection', label: 'Quick Reflection', description: 'Capture a quick thought', icon: 'MessageCircle', app: 'journal', category: 'create' },
  ],
  todo: [
    { id: 'new-task', label: 'New Task', description: 'Add a new task', icon: 'Plus', shortcut: 'N', app: 'todo', category: 'create' },
    { id: 'new-project', label: 'New Project', description: 'Create a project', icon: 'FolderPlus', app: 'todo', category: 'create' },
  ],
  health: [
    { id: 'log-metrics', label: 'Log Metrics', description: 'Record health metrics', icon: 'Heart', shortcut: 'L', app: 'health', category: 'create' },
  ],
  album: [
    { id: 'capture-moment', label: 'Capture Moment', description: 'Add a new moment', icon: 'Camera', shortcut: 'M', app: 'album', category: 'create' },
  ],
  habits: [
    { id: 'add-goal', label: 'Add Goal', description: 'Set a learning goal', icon: 'Target', shortcut: 'G', app: 'habits', category: 'create' },
  ],
  display: [
    { id: 'check-in', label: 'Check In', description: 'Daily health check-in', icon: 'Activity', shortcut: 'C', app: 'display', category: 'create' },
  ],
  track: [
    { id: 'add-subscription', label: 'Add Subscription', description: 'Track a subscription', icon: 'DollarSign', shortcut: 'S', app: 'track', category: 'create' },
  ],
  projects: [
    { id: 'new-board', label: 'New Board', description: 'Create a project board', icon: 'Layout', shortcut: 'B', app: 'projects', category: 'create' },
  ],
  workflow: [
    { id: 'new-workflow', label: 'New Workflow', description: 'Build a workflow', icon: 'GitBranch', shortcut: 'W', app: 'workflow', category: 'create' },
  ],
  calendar: [
    { id: 'new-event', label: 'New Event', description: 'Schedule an event', icon: 'CalendarPlus', shortcut: 'E', app: 'calendar', category: 'create' },
  ],
  admin: [
    { id: 'view-users', label: 'View Users', description: 'Manage users', icon: 'Users', app: 'admin', category: 'navigate' },
  ],
};

/**
 * Get quick actions for a specific app
 */
export function getQuickActionsForApp(app: AppSlug): QuickAction[] {
  return DEFAULT_QUICK_ACTIONS[app] || [];
}

/**
 * Get all quick actions across apps
 */
export function getAllQuickActions(): QuickAction[] {
  return Object.values(DEFAULT_QUICK_ACTIONS).flat();
}
