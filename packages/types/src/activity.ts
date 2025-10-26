/**
 * Activity Feed Types
 * For tracking user actions across all apps
 */

import { MetadataRecord, SearchableApp } from './search';

/**
 * Activity action types
 */
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'completed'
  | 'archived'
  | 'pinned';

/**
 * Activity item representing a user action
 */
export interface Activity {
  id: string;
  ownerId: string;
  app: SearchableApp;
  action: ActivityAction;
  itemType: string; // 'note', 'task', 'entry', etc.
  itemId: string;
  itemTitle: string;
  metadata?: MetadataRecord;
  timestamp: number;
  createdAt: number;
}

/**
 * Input for creating an activity
 */
export interface CreateActivityInput {
  app: SearchableApp;
  action: ActivityAction;
  itemType: string;
  itemId: string;
  itemTitle: string;
  metadata?: MetadataRecord;
}

/**
 * Activity feed query parameters
 */
export interface ActivityQuery {
  limit?: number;
  apps?: SearchableApp[];
  actions?: ActivityAction[];
  startAfter?: number;
}

/**
 * Activity feed response
 */
export interface ActivityFeedResponse {
  activities: Activity[];
  hasMore: boolean;
  lastTimestamp?: number;
}

/**
 * Get human-readable activity description
 */
export function getActivityDescription(activity: Activity): string {
  const actionVerbs: Record<ActivityAction, string> = {
    created: 'created',
    updated: 'updated',
    deleted: 'deleted',
    completed: 'completed',
    archived: 'archived',
    pinned: 'pinned',
  };

  const itemTypeNames: Record<string, string> = {
    note: 'note',
    entry: 'journey entry',
    task: 'task',
    habit: 'habit',
    moment: 'moment',
    goal: 'learning goal',
    skill: 'skill',
    resource: 'resource',
    metric: 'health metric',
    workout: 'workout',
  };

  const verb = actionVerbs[activity.action];
  const itemName = itemTypeNames[activity.itemType] || activity.itemType;

  return `${verb} ${itemName}`;
}

/**
 * Get activity icon name (lucide-react icon)
 */
export function getActivityIcon(activity: Activity): string {
  const icons: Record<ActivityAction, string> = {
    created: 'Plus',
    updated: 'Edit',
    deleted: 'Trash2',
    completed: 'CheckCircle',
    archived: 'Archive',
    pinned: 'Pin',
  };

  return icons[activity.action] || 'Activity';
}

/**
 * Get activity color class
 */
export function getActivityColor(activity: Activity): string {
  const colors: Record<ActivityAction, string> = {
    created: 'text-green-500',
    updated: 'text-blue-500',
    deleted: 'text-red-500',
    completed: 'text-purple-500',
    archived: 'text-gray-500',
    pinned: 'text-yellow-500',
  };

  return colors[activity.action] || 'text-ink-600';
}

/**
 * Format activity timestamp
 */
export function formatActivityTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}
