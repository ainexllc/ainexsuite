"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

export type AppShellProps = {
  /** Main content of the app */
  children: ReactNode;
  /** Top navigation component */
  topNav?: ReactNode;
  /** Footer component (optional) */
  footer?: ReactNode;
  /** Additional className for wrapper */
  className?: string;
  /** Background gradient/effects */
  showGradient?: boolean;
};

export function AppShell({
  children,
  topNav,
  footer,
  className,
  showGradient = true,
}: AppShellProps) {
  return (
    <div
      className={clsx(
        "relative min-h-screen overflow-hidden bg-surface-base",
        className,
      )}
    >
      <div className="relative z-10 flex min-h-screen flex-col text-ink-900">
        {/* Top Navigation */}
        {topNav}

        {/* Orange gradient glow (optional) */}
        {showGradient && (
          <div className="pointer-events-none fixed inset-x-0 top-16 z-20 h-3 bg-gradient-to-b from-orange-400/45 via-orange-400/15 to-transparent blur-md" />
        )}

        {/* Main Content */}
        <main className={clsx("flex-1 overflow-x-hidden", topNav && "pt-16")}>
          {children}
        </main>

        {/* Footer */}
        {footer}
      </div>
    </div>
  );
}

/**
 * Centered content container for consistent max-width and padding
 */
export function AppShellContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx("centered-shell", className)}>
      {children}
    </div>
  );
}
