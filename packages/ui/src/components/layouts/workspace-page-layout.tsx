'use client';

import { ReactNode } from 'react';
import { SpaceSwitcher, type SpaceItem } from '../spaces';

interface WorkspacePageLayoutProps {
  /**
   * AI Insights banner component (app-specific)
   */
  insightsBanner?: ReactNode;
  /**
   * Main composer/form field for creating new items
   */
  composer?: ReactNode;
  /**
   * Main content area (lists, grids, etc.)
   */
  children: ReactNode;
  /**
   * Space management props (optional)
   */
  spaces?: {
    items: SpaceItem[];
    currentSpaceId: string | null;
    onSpaceChange: (spaceId: string) => void;
    onCreateSpace?: () => void;
  };
  /**
   * Additional actions to show next to the composer (e.g., ViewToggle)
   */
  composerActions?: ReactNode;
  /**
   * Maximum width variant
   * @default 'default'
   */
  maxWidth?: 'narrow' | 'default' | 'wide' | 'full';
  /**
   * Additional class names
   */
  className?: string;
}

const maxWidthClasses = {
  narrow: 'max-w-4xl',
  default: 'max-w-7xl',
  wide: 'max-w-[1440px]',
  full: 'max-w-full',
};

/**
 * WorkspacePageLayout - Standardized layout for workspace page content
 *
 * Provides consistent structure across all apps:
 * 1. AI Insights Banner (full width, collapsible)
 * 2. Composer row with SpaceSwitcher and actions
 * 3. Main content area
 *
 * @example
 * ```tsx
 * <WorkspacePageLayout
 *   insightsBanner={<TaskInsights />}
 *   composer={<SmartTaskInput />}
 *   spaces={{
 *     items: spaces,
 *     currentSpaceId,
 *     onSpaceChange: setCurrentSpace,
 *     onCreateSpace: () => setShowEditor(true),
 *   }}
 *   composerActions={<ViewToggle />}
 * >
 *   <TaskList tasks={tasks} />
 * </WorkspacePageLayout>
 * ```
 */
export function WorkspacePageLayout({
  insightsBanner,
  composer,
  children,
  spaces,
  composerActions,
  maxWidth = 'default',
  className = '',
}: WorkspacePageLayoutProps) {
  const hasComposerRow = composer || spaces || composerActions;

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto space-y-6 ${className}`}>
      {/* AI Insights Banner - Full Width */}
      {insightsBanner}

      {/* Composer Row: Form + SpaceSwitcher + Actions */}
      {hasComposerRow && (
        <div className="flex items-start justify-between gap-4">
          {/* Composer (left side, takes available space) */}
          {composer && (
            <div className="flex-1 min-w-0">
              {composer}
            </div>
          )}

          {/* Right side: SpaceSwitcher + Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {spaces && (
              <SpaceSwitcher
                spaces={spaces.items}
                currentSpaceId={spaces.currentSpaceId}
                onSpaceChange={spaces.onSpaceChange}
                onCreateSpace={spaces.onCreateSpace}
              />
            )}
            {composerActions}
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}
    </div>
  );
}
