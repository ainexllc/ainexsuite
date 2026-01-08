'use client';

import { ReactNode } from 'react';
import { SpaceSwitcher, type SpaceItem } from '../spaces';

interface WorkspacePageLayoutProps {
  /**
   * AI Insights banner component (app-specific)
   */
  insightsBanner?: ReactNode;
  /**
   * Header content above the AI Insights banner (e.g., View Toggle)
   */
  header?: ReactNode;
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
    onManageSpaces?: () => void;
  };
  /**
   * Additional actions to show next to the composer (e.g., ViewToggle)
   */
  composerActions?: ReactNode;
  /**
   * Toolbar area below the composer (e.g., View Switchers, Filters)
   */
  toolbar?: ReactNode;
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
 * 3. Toolbar area (optional)
 * 4. Main content area
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
 *     onManageSpaces: () => setShowManageSpaces(true),
 *   }}
 *   toolbar={<ViewToggle />}
 * >
 *   <TaskList tasks={tasks} />
 * </WorkspacePageLayout>
 * ```
 */
export function WorkspacePageLayout({
  insightsBanner,
  header,
  composer,
  children,
  spaces,
  composerActions,
  toolbar,
  maxWidth = 'default',
  className = '',
}: WorkspacePageLayoutProps) {
  const hasComposerRow = composer || spaces || composerActions;

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto space-y-4 ${className}`}>
      {/* Header Area (Optional) */}
      {header && (
        <div className="flex justify-end">
          {header}
        </div>
      )}

      {/* AI Insights Banner - Full Width */}
      {insightsBanner}

      {/* Composer Row: Form + SpaceSwitcher + Actions */}
      {hasComposerRow && (
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          {/* Composer (left side, takes available space) */}
          {composer && (
            <div className="flex-1 min-w-0">
              {composer}
            </div>
          )}

          {/* Right side: SpaceSwitcher + Actions */}
          <div className="flex items-center gap-3 flex-shrink-0 order-first md:order-none w-full md:w-auto justify-end">
            {spaces && (
              <SpaceSwitcher
                spaces={spaces.items}
                currentSpaceId={spaces.currentSpaceId}
                onSpaceChange={spaces.onSpaceChange}
                onManageSpaces={spaces.onManageSpaces}
              />
            )}
            {composerActions}
          </div>
        </div>
      )}

      {/* Toolbar Area */}
      {toolbar && (
        <div className="relative z-20 w-full !mt-4 md:!mt-6">
          {toolbar}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}
