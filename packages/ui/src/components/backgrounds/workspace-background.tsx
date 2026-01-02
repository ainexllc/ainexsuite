'use client';

import { useMemo } from 'react';
import { useAppTheme } from '@ainexsuite/theme';

interface WorkspaceBackgroundProps {
  /**
   * Override the accent color (otherwise reads from --color-secondary CSS variable)
   */
  accentColor?: string;
  /**
   * Background style variant
   * - 'glow': Soft radial glow from top
   * - 'aurora': Northern lights style with multiple subtle layers
   * - 'minimal': Very subtle, single gradient
   * - 'grid': Subtle grid pattern with accent color highlights
   * - 'dots': Dot matrix pattern
   * - 'mesh': Animated mesh gradient
   */
  variant?: 'glow' | 'aurora' | 'minimal' | 'grid' | 'dots' | 'mesh';
  /**
   * Intensity of the effect (0.0 - 1.0)
   * @default 0.25
   */
  intensity?: number;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(249, 115, 22, ${alpha})`; // fallback orange
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * WorkspaceBackground Component
 *
 * A unified background gradient component for all app workspaces.
 * Automatically reads the secondary accent color from AppColorProvider CSS variables.
 *
 * The gradient blends the app's secondary accent color with the background
 * to create a subtle, atmospheric effect that works in both light and dark modes.
 *
 * @example
 * ```tsx
 * // Default - reads from AppColorProvider
 * <WorkspaceBackground />
 *
 * // Custom color override
 * <WorkspaceBackground accentColor="#22c55e" />
 *
 * // Different variants
 * <WorkspaceBackground variant="aurora" />
 * <WorkspaceBackground variant="minimal" intensity={0.1} />
 * ```
 */
export function WorkspaceBackground({
  accentColor,
  variant = 'glow',
  intensity = 0.25,
}: WorkspaceBackgroundProps) {
  // Use global theme context for consistent background across all apps
  const appTheme = useAppTheme();

  // Compute color synchronously to avoid double-render flickering on high refresh rate displays
  // Uses global backgroundAccentColor for consistency across all apps
  const color = useMemo(() => {
    if (accentColor) return accentColor;
    if (appTheme?.backgroundAccentColor && !appTheme.loading) return appTheme.backgroundAccentColor;
    return '#f97316'; // fallback orange
  }, [accentColor, appTheme?.backgroundAccentColor, appTheme?.loading]);

  // Render based on variant
  if (variant === 'minimal') {
    return (
      <div
        className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-50"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${hexToRgba(color, intensity)}, transparent 70%)`,
          contain: 'strict',
        }}
      />
    );
  }

  if (variant === 'aurora') {
    return (
      <>
        {/* Base gradient - more subtle in light mode */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-40"
          style={{
            background: `
              radial-gradient(ellipse 100% 40% at 50% 0%, ${hexToRgba(color, intensity * 0.8)}, transparent 50%),
              radial-gradient(ellipse 60% 30% at 70% 10%, ${hexToRgba(color, intensity * 0.5)}, transparent 40%),
              radial-gradient(ellipse 50% 25% at 30% 5%, ${hexToRgba(color, intensity * 0.4)}, transparent 35%)
            `,
            contain: 'strict',
          }}
        />
        {/* Subtle animated shimmer - very subtle in light mode */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-20 dark:opacity-30"
          style={{
            background: `radial-gradient(ellipse 40% 20% at 60% 0%, ${hexToRgba(color, intensity * 0.6)}, transparent 50%)`,
            contain: 'strict',
          }}
        />
      </>
    );
  }

  // Grid variant - subtle grid pattern with accent highlights
  if (variant === 'grid') {
    return (
      <>
        {/* Grid pattern - visible in both modes */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(${hexToRgba(color, intensity * 0.15)} 1px, transparent 1px),
              linear-gradient(90deg, ${hexToRgba(color, intensity * 0.15)} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            contain: 'strict',
          }}
        />
        {/* Accent glow at intersections - top area */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-50"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 0%, ${hexToRgba(color, intensity * 0.3)}, transparent 50%)`,
            contain: 'strict',
          }}
        />
        {/* Vignette effect - only in dark mode */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-0"
          style={{
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.4) 100%)',
            contain: 'strict',
          }}
        />
      </>
    );
  }

  // Dots variant - dot matrix pattern
  if (variant === 'dots') {
    return (
      <>
        {/* Dot pattern - subtle in light mode */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-40"
          style={{
            backgroundImage: `radial-gradient(${hexToRgba(color, intensity * 0.4)} 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            contain: 'strict',
          }}
        />
        {/* Top highlight */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-50"
          style={{
            background: `radial-gradient(ellipse 70% 35% at 50% 0%, ${hexToRgba(color, intensity * 0.2)}, transparent 50%)`,
            contain: 'strict',
          }}
        />
      </>
    );
  }

  // Mesh variant - animated mesh gradient
  if (variant === 'mesh') {
    return (
      <>
        {/* Animated mesh background - more subtle in light mode */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-50"
          style={{
            background: `
              radial-gradient(at 40% 20%, ${hexToRgba(color, intensity * 0.4)} 0px, transparent 50%),
              radial-gradient(at 80% 0%, ${hexToRgba(color, intensity * 0.3)} 0px, transparent 50%),
              radial-gradient(at 0% 50%, ${hexToRgba(color, intensity * 0.2)} 0px, transparent 50%),
              radial-gradient(at 80% 50%, ${hexToRgba(color, intensity * 0.15)} 0px, transparent 50%),
              radial-gradient(at 0% 100%, ${hexToRgba(color, intensity * 0.1)} 0px, transparent 50%)
            `,
            contain: 'strict',
          }}
        />
        {/* Noise texture overlay for depth */}
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            contain: 'strict',
          }}
        />
      </>
    );
  }

  // Default: 'glow' variant
  return (
    <>
      {/* Main radial gradient from top - subtle in light mode */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 dark:opacity-100 opacity-50"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${hexToRgba(color, intensity)}, transparent 60%)`,
          contain: 'strict',
        }}
      />
      {/* Subtle corner accent */}
      <div
        className="pointer-events-none fixed -top-20 -right-20 h-[400px] w-[400px] -z-10 rounded-full blur-[120px] dark:opacity-100 opacity-40"
        style={{
          backgroundColor: hexToRgba(color, intensity * 0.6),
          contain: 'layout paint',
        }}
      />
      {/* Very subtle bottom glow for depth */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 h-[200px] -z-10 dark:opacity-100 opacity-30"
        style={{
          background: `linear-gradient(to top, ${hexToRgba(color, intensity * 0.05)}, transparent)`,
          contain: 'strict',
        }}
      />
    </>
  );
}
