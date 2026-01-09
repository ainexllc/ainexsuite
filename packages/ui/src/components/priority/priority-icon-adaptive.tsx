"use client";

import { cn } from "../../lib/utils";
import { FireIcon, FIRE_COLOR_PRESETS, type FireIconIntensity } from "../icons/fire";

export type PriorityLevel = "urgent" | "high" | "medium" | "low" | "none";

export interface AdaptivePriorityIconProps {
  priority: PriorityLevel;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  isAnimating?: boolean;
  className?: string;
  showOnlyHighPriority?: boolean;
  /** Force a specific rendering tier (useful for testing) */
  forceTier?: 0 | 1 | 2 | 3;
}

// Size mapping in pixels
const SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

// Map priority to color preset
const PRIORITY_TO_PRESET: Record<PriorityLevel, keyof typeof FIRE_COLOR_PRESETS | null> = {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
  none: null,
};

// Map priority to animation intensity
const PRIORITY_TO_INTENSITY: Record<PriorityLevel, FireIconIntensity> = {
  urgent: "intense",
  high: "normal",
  medium: "calm",
  low: "calm",
  none: "calm",
};

/**
 * Adaptive priority icon that uses the new tiered rendering system.
 * Automatically selects SVG, Canvas (Zdog), or 3D (R3F) based on device capability.
 *
 * This is the recommended replacement for the original PriorityIcon when you want
 * high-quality 3D fire effects on capable devices.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AdaptivePriorityIcon priority="urgent" />
 *
 * // Larger size for hero display
 * <AdaptivePriorityIcon priority="high" size="2xl" />
 *
 * // Force 3D rendering for testing
 * <AdaptivePriorityIcon priority="urgent" forceTier={3} />
 * ```
 */
export function AdaptivePriorityIcon({
  priority,
  size = "sm",
  isAnimating = true,
  className,
  showOnlyHighPriority = true,
  forceTier,
}: AdaptivePriorityIconProps) {
  // Don't render for low priority or none if showOnlyHighPriority is true
  if (showOnlyHighPriority && (priority === "low" || priority === "none" || priority === "medium")) {
    return null;
  }

  // Don't render for none priority
  if (priority === "none") {
    return null;
  }

  const preset = PRIORITY_TO_PRESET[priority];
  if (!preset) return null;

  const colors = FIRE_COLOR_PRESETS[preset];
  const pixelSize = SIZE_MAP[size];
  const intensity = PRIORITY_TO_INTENSITY[priority];

  return (
    <div className={cn("inline-flex items-center justify-center flex-shrink-0", className)}>
      <FireIcon
        size={pixelSize}
        primaryColor={colors.primary}
        secondaryColor={colors.secondary}
        tertiaryColor={colors.tertiary}
        glowColor={colors.glow}
        isAnimating={isAnimating}
        intensity={intensity}
        flameCount={3}
        forceTier={forceTier}
      />
    </div>
  );
}

/**
 * Adaptive priority badge with label
 */
export function AdaptivePriorityBadge({
  priority,
  showLabel = true,
  size = "sm",
  className,
  forceTier,
}: {
  priority: PriorityLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  forceTier?: 0 | 1 | 2 | 3;
}) {
  if (priority === "none") return null;

  const preset = PRIORITY_TO_PRESET[priority];
  if (!preset) return null;

  const colors = FIRE_COLOR_PRESETS[preset];

  const labels: Record<PriorityLevel, string> = {
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
    none: "",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base",
        className
      )}
      style={{
        backgroundColor: `${colors.primary}20`,
        color: colors.primary,
      }}
    >
      <AdaptivePriorityIcon
        priority={priority}
        size={size}
        showOnlyHighPriority={false}
        forceTier={forceTier}
      />
      {showLabel && <span className="font-medium">{labels[priority]}</span>}
    </div>
  );
}
