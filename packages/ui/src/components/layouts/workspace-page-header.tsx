'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface WorkspacePageHeaderProps {
  /**
   * The main title of the page (e.g. "Welcome to Notes")
   */
  title: React.ReactNode;
  /**
   * Optional description text below the title
   */
  description?: React.ReactNode;
  /**
   * Optional className to override styles
   */
  className?: string;
}

/**
 * WorkspacePageHeader
 *
 * Standardized page header for workspace pages.
 * Renders a title and optional description.
 * Uses theme tokens for colors.
 */
export function WorkspacePageHeader({
  title,
  description,
  className,
}: WorkspacePageHeaderProps) {
  return (
    <div className={clsx("mb-8", className)}>
      <h2 className="text-3xl font-bold text-text-primary mb-2">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
