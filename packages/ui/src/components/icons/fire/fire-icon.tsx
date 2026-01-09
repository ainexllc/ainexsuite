"use client";

import { lazy, Suspense } from "react";
import { useQuality } from "../adaptive";
import { FireIconSVG } from "./fire-icon-svg";
import { FireIconCanvas } from "./fire-icon-canvas";

// Lazy load the 3D version to keep it out of initial bundle
const FireIcon3D = lazy(() =>
  import("./fire-icon-3d").then((mod) => ({ default: mod.FireIcon3D }))
);

export type FireIconIntensity = "calm" | "normal" | "intense";

export interface FireIconProps {
  /** Size in pixels */
  size?: number;
  /** Primary color (outer flame) */
  primaryColor?: string;
  /** Secondary color (middle flame) */
  secondaryColor?: string;
  /** Tertiary color (inner flame core) */
  tertiaryColor?: string;
  /** Glow color (for SVG version) */
  glowColor?: string;
  /** Whether to animate */
  isAnimating?: boolean;
  /** Animation intensity: calm, normal, intense */
  intensity?: FireIconIntensity;
  /** Number of flames: 1, 2, or 3 (SVG version only) */
  flameCount?: 1 | 2 | 3;
  /** Enable 3D rotation on hover (for canvas/3D versions) */
  rotateOnHover?: boolean;
  /** Force a specific rendering tier (useful for testing) */
  forceTier?: 0 | 1 | 2 | 3;
  /** Additional class names */
  className?: string;
}

// Priority-level color presets
export const FIRE_COLOR_PRESETS = {
  urgent: {
    primary: "#ef4444", // red-500
    secondary: "#f97316", // orange-500
    tertiary: "#fbbf24", // amber-400
    glow: "rgba(239, 68, 68, 0.6)",
  },
  high: {
    primary: "#f97316", // orange-500
    secondary: "#fb923c", // orange-400
    tertiary: "#fcd34d", // amber-300
    glow: "rgba(249, 115, 22, 0.5)",
  },
  medium: {
    primary: "#eab308", // yellow-500
    secondary: "#facc15", // yellow-400
    tertiary: "#fef08a", // yellow-200
    glow: "rgba(234, 179, 8, 0.4)",
  },
  low: {
    primary: "#22c55e", // green-500
    secondary: "#4ade80", // green-400
    tertiary: "#86efac", // green-300
    glow: "rgba(34, 197, 94, 0.3)",
  },
  blue: {
    primary: "#3b82f6", // blue-500
    secondary: "#60a5fa", // blue-400
    tertiary: "#93c5fd", // blue-300
    glow: "rgba(59, 130, 246, 0.5)",
  },
  purple: {
    primary: "#8b5cf6", // violet-500
    secondary: "#a78bfa", // violet-400
    tertiary: "#c4b5fd", // violet-300
    glow: "rgba(139, 92, 246, 0.5)",
  },
} as const;

export type FireColorPreset = keyof typeof FIRE_COLOR_PRESETS;

/**
 * Adaptive quality fire icon that automatically selects the best rendering
 * approach based on device capability.
 *
 * - Tier 0 (weak GPU/Data Saver): Enhanced SVG with Framer Motion
 * - Tier 1-2 (mid-range): Zdog canvas with pseudo-3D
 * - Tier 3 (high-end): React Three Fiber with true 3D and particles
 *
 * The 3D version is lazy-loaded to avoid impacting initial bundle size.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FireIcon size={24} />
 *
 * // With priority colors
 * <FireIcon {...FIRE_COLOR_PRESETS.urgent} intensity="intense" />
 *
 * // Force a specific tier for testing
 * <FireIcon forceTier={3} />
 * ```
 */
export function FireIcon({
  size = 24,
  primaryColor = "#ef4444",
  secondaryColor = "#f97316",
  tertiaryColor = "#fbbf24",
  glowColor: _glowColor = "rgba(239, 68, 68, 0.6)",
  isAnimating = true,
  intensity = "normal",
  flameCount = 3,
  rotateOnHover = true,
  forceTier,
  className,
}: FireIconProps) {
  const { tier: detectedTier, isLoading } = useQuality();

  // Use forced tier if provided, otherwise use detected tier
  const tier = forceTier ?? detectedTier;

  // Show SVG while loading (it's always available)
  if (isLoading && forceTier === undefined) {
    return (
      <FireIconSVG
        size={size}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
        isAnimating={isAnimating}
        flameCount={flameCount}
        className={className}
      />
    );
  }

  // Tier 3: Full 3D with React Three Fiber
  if (tier === 3) {
    return (
      <Suspense
        fallback={
          <FireIconSVG
            size={size}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tertiaryColor={tertiaryColor}
            isAnimating={isAnimating}
            flameCount={flameCount}
            className={className}
          />
        }
      >
        <FireIcon3D
          size={size}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          tertiaryColor={tertiaryColor}
          isAnimating={isAnimating}
          intensity={intensity}
          className={className}
        />
      </Suspense>
    );
  }

  // Tier 1-2: Canvas with Zdog
  if (tier >= 1) {
    return (
      <FireIconCanvas
        size={size}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
        isAnimating={isAnimating}
        intensity={intensity}
        rotateOnHover={rotateOnHover}
        className={className}
      />
    );
  }

  // Tier 0: Enhanced SVG
  return (
    <FireIconSVG
      size={size}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      tertiaryColor={tertiaryColor}
      isAnimating={isAnimating}
      flameCount={flameCount}
      className={className}
    />
  );
}

/**
 * Fire icon with a specific color preset applied
 */
export function FireIconWithPreset({
  preset,
  ...props
}: Omit<FireIconProps, "primaryColor" | "secondaryColor" | "tertiaryColor" | "glowColor"> & {
  preset: FireColorPreset;
}) {
  const colors = FIRE_COLOR_PRESETS[preset];
  return <FireIcon {...colors} {...props} />;
}
