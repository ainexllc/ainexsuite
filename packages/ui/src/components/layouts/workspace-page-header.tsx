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
   * Optional extra content to display (e.g. buttons, insights panel)
   */
  children?: React.ReactNode;
  /**
   * Optional className to override styles
   */
  className?: string;
}

/**
 * WorkspacePageHeader
 *
 * Standardized page header for workspace pages.
 * Renders a title, optional description, and any children (like AI insights).
 * Uses theme tokens for colors.
 */
export function WorkspacePageHeader({
  title,
  description,
  children,
  className,
}: WorkspacePageHeaderProps) {
  return (
    <section className={clsx("space-y-6", className)}>
      <div>
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-lg text-text-muted">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
