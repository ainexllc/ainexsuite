"use client";

import { cn } from "../../lib/utils";
import { FireIcon, FIRE_COLOR_PRESETS, type FireIconIntensity } from "../icons/fire";

export type PriorityLevel = "urgent" | "high" | "medium" | "low" | "none";

export interface PriorityIconProps {
  priority: PriorityLevel;
  size?: "sm" | "md" | "lg";
  isAnimating?: boolean;
  className?: string;
  showOnlyHighPriority?: boolean;
}

// Re-export colors for backwards compatibility
export const PRIORITY_COLORS = {
  urgent: FIRE_COLOR_PRESETS.urgent,
  high: FIRE_COLOR_PRESETS.high,
  medium: FIRE_COLOR_PRESETS.medium,
  low: FIRE_COLOR_PRESETS.low,
  none: {
    primary: "#71717a", // zinc-500
    secondary: "#a1a1aa", // zinc-400
    tertiary: "#d4d4d8", // zinc-300
    glow: "transparent",
  },
};

const SIZE_MAP = {
  sm: 14,
  md: 18,
  lg: 24,
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
 * Three-tongue animated flame priority icon
 * Uses the FireIcon with flameCount=3 and priority-based colors
 */
export function PriorityIcon({
  priority,
  size = "sm",
  isAnimating = true,
  className,
  showOnlyHighPriority = true,
}: PriorityIconProps) {
  // Don't render for low priority or none if showOnlyHighPriority is true
  if (showOnlyHighPriority && (priority === "low" || priority === "none" || priority === "medium")) {
    return null;
  }

  // Don't render for none priority
  if (priority === "none") {
    return null;
  }

  const colors = PRIORITY_COLORS[priority];
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
        flameCount={1}
        forceTier={0}
      />
    </div>
  );
}

/**
 * Simple priority badge with label
 */
export function PriorityBadge({
  priority,
  showLabel = true,
  size = "sm",
  className,
}: {
  priority: PriorityLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  if (priority === "none") return null;

  const colors = PRIORITY_COLORS[priority];
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
      <PriorityIcon priority={priority} size={size} showOnlyHighPriority={false} />
      {showLabel && <span className="font-medium">{labels[priority]}</span>}
    </div>
  );
}
