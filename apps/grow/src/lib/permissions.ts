// Permission utilities for habit management in shared spaces

import { Space, Habit } from '../types/models';

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a user can create habits in a space
 * - Personal/Couple: Any member can create
 * - Family: Only adults can create
 * - Squad: Depends on habitCreationPolicy setting
 */
export function canCreateHabit(space: Space, userId: string): PermissionResult {
  const member = space.members.find(m => m.uid === userId);

  if (!member) {
    return { allowed: false, reason: 'Not a member of this space' };
  }

  switch (space.type) {
    case 'personal':
      return { allowed: true };

    case 'couple':
      // Either partner can create
      return { allowed: true };

    case 'family':
      // Only adults can create habits
      if (member.ageGroup === 'child') {
        return { allowed: false, reason: 'Only adults can create habits' };
      }
      return { allowed: true };

    case 'squad': {
      // Check the space's habit creation policy
      const policy = space.habitCreationPolicy || 'admin_only';
      if (policy === 'anyone') {
        return { allowed: true };
      }
      // admin_only policy
      if (member.role === 'admin') {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Only admins can create habits' };
    }

    default:
      return { allowed: true };
  }
}

/**
 * Check if a user can edit a habit
 * Same rules as create, plus habit creator can always edit their own habits
 */
export function canEditHabit(space: Space, habit: Habit, userId: string): PermissionResult {
  // Habit creator can always edit
  if (habit.createdBy === userId) {
    return { allowed: true };
  }

  // Admins can edit any habit
  const member = space.members.find(m => m.uid === userId);
  if (member?.role === 'admin') {
    return { allowed: true };
  }

  // Fall back to create permissions
  return canCreateHabit(space, userId);
}

/**
 * Check if a user can delete a habit
 * Same rules as edit
 */
export function canDeleteHabit(space: Space, habit: Habit, userId: string): PermissionResult {
  return canEditHabit(space, habit, userId);
}

/**
 * Check if a member is an adult in the space
 * Defaults to true if ageGroup is not set (backwards compatibility)
 */
export function isAdultMember(space: Space, uid: string): boolean {
  const member = space.members.find(m => m.uid === uid);
  return member?.ageGroup !== 'child';
}

/**
 * Check if a user is a space admin
 */
export function isSpaceAdmin(space: Space, uid: string): boolean {
  const member = space.members.find(m => m.uid === uid);
  return member?.role === 'admin';
}

/**
 * Check if a user is the space creator
 */
export function isSpaceCreator(space: Space, uid: string): boolean {
  return space.createdBy === uid;
}

/**
 * Check if a user can manage space settings (e.g., habit creation policy)
 * Only space admins can change settings
 */
export function canManageSpaceSettings(space: Space, uid: string): boolean {
  return isSpaceAdmin(space, uid);
}

/**
 * Get all adult members in a space
 */
export function getAdultMembers(space: Space) {
  return space.members.filter(m => m.ageGroup !== 'child');
}

/**
 * Get all child members in a space
 */
export function getChildMembers(space: Space) {
  return space.members.filter(m => m.ageGroup === 'child');
}
