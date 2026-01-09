/**
 * Space Query Helpers
 *
 * Shared utilities for building space-filtered Firestore queries.
 * These helpers ensure consistent query patterns across all apps.
 */

import { where, type QueryConstraint } from 'firebase/firestore';

/**
 * Personal space ID constant - same as in @ainexsuite/types
 * Duplicated here to avoid circular dependency
 */
export const PERSONAL_SPACE_ID = 'personal';

/**
 * Check if a spaceId represents personal content.
 * Handles legacy content that may have undefined/null spaceId.
 */
export function isPersonalSpace(spaceId: string | undefined | null): boolean {
  return !spaceId || spaceId === PERSONAL_SPACE_ID || spaceId.endsWith('_personal');
}

/**
 * Get the effective spaceId for creating new content.
 * Ensures we never store undefined/null, always explicit ID.
 */
export function getEffectiveSpaceId(spaceId: string | undefined | null): string {
  return spaceId && spaceId !== PERSONAL_SPACE_ID ? spaceId : PERSONAL_SPACE_ID;
}

/**
 * Get Firestore query constraints for space-filtered content.
 *
 * For personal space:
 * - Filters by spaceId='personal' AND ownerId=userId
 *
 * For shared spaces:
 * - Filters by spaceId=spaceId only (access controlled by Firestore rules)
 *
 * @example
 * ```typescript
 * const constraints = getSpaceQueryConstraints(currentSpaceId, userId);
 * const q = query(collection(db, 'tasks'), ...constraints, orderBy('createdAt', 'desc'));
 * ```
 */
export function getSpaceQueryConstraints(
  spaceId: string | undefined | null,
  userId: string
): QueryConstraint[] {
  if (isPersonalSpace(spaceId)) {
    return [
      where('spaceId', '==', PERSONAL_SPACE_ID),
      where('ownerId', '==', userId),
    ];
  }
  return [where('spaceId', '==', spaceId)];
}

/**
 * Build a query constraint for spaceId only (without ownerId).
 * Use when you only need to filter by space (e.g., for shared content
 * where membership is validated by Firestore rules).
 */
export function getSpaceIdConstraint(spaceId: string | undefined | null): QueryConstraint {
  const effectiveId = getEffectiveSpaceId(spaceId);
  return where('spaceId', '==', effectiveId);
}

/**
 * Check if content should be visible to user in current space context.
 *
 * @example
 * ```typescript
 * const visibleTasks = tasks.filter(task =>
 *   isContentVisibleInSpace(task, currentSpaceId, userId)
 * );
 * ```
 */
export function isContentVisibleInSpace(
  content: {
    spaceId?: string | null;
    ownerId: string;
    sharedWithUserIds?: string[];
  },
  currentSpaceId: string | undefined | null,
  userId: string
): boolean {
  const effectiveCurrentSpace = getEffectiveSpaceId(currentSpaceId);
  const contentSpace = getEffectiveSpaceId(content.spaceId);

  // Personal space: content must belong to personal space AND be owned by user
  if (effectiveCurrentSpace === PERSONAL_SPACE_ID) {
    return contentSpace === PERSONAL_SPACE_ID && content.ownerId === userId;
  }

  // Shared space: content must belong to the same space
  return contentSpace === effectiveCurrentSpace;
}

/**
 * Get the space document data to include when creating new content.
 * This ensures content is properly tagged with space information.
 *
 * @example
 * ```typescript
 * const newTask = {
 *   title: 'My Task',
 *   ...getSpaceContentData(currentSpaceId, userId, space?.memberUids),
 *   createdAt: Timestamp.now(),
 * };
 * ```
 */
export function getSpaceContentData(
  spaceId: string | undefined | null,
  ownerId: string,
  memberUids?: string[]
): {
  spaceId: string;
  ownerId: string;
  sharedWithUserIds?: string[];
} {
  const effectiveSpaceId = getEffectiveSpaceId(spaceId);

  return {
    spaceId: effectiveSpaceId,
    ownerId,
    // Only include sharedWithUserIds for shared spaces
    ...(effectiveSpaceId !== PERSONAL_SPACE_ID && memberUids
      ? { sharedWithUserIds: memberUids }
      : {}),
  };
}

/**
 * Migration helper: Get spaceId for legacy content that may not have one.
 * Returns 'personal' for content created before space system was implemented.
 */
export function getLegacySpaceId(
  content: { spaceId?: string | null; ownerId?: string },
  _fallbackOwnerId?: string
): string {
  // If content has a spaceId, use it
  if (content.spaceId) {
    return content.spaceId;
  }
  // Otherwise, default to personal
  return PERSONAL_SPACE_ID;
}
