"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "../../lib/utils";

export type PriorityLevel = "urgent" | "high" | "medium" | "low" | "none";

export interface PriorityIconProps {
  priority: PriorityLevel;
  size?: "sm" | "md" | "lg";
  isAnimating?: boolean;
  className?: string;
  showOnlyHighPriority?: boolean;
}

const PRIORITY_COLORS: Record<PriorityLevel, { primary: string; secondary: string; tertiary: string; glow: string }> = {
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

/**
 * Low-poly animated burning flame priority icon
 * Used across all apps to indicate task/item priority
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

  const colors = PRIORITY_COLORS[priority];
  const pixelSize = SIZE_MAP[size];

  // More intense animation for urgent priority
  const isUrgent = priority === "urgent";
  const isHigh = priority === "high";

  // Low-poly flame polygon animations - vertices shift to create flicker
  const outerFlameVariants: Variants = {
    idle: {
      d: "M12 2 L16 8 L17 14 L14 18 L10 18 L7 14 L8 8 Z",
    },
    animate: {
      d: isUrgent
        ? [
            "M12 2 L16 8 L17 14 L14 18 L10 18 L7 14 L8 8 Z",
            "M12 1 L17 7 L18 13 L14 18 L10 18 L6 13 L7 7 Z",
            "M12 3 L15 9 L16 14 L14 18 L10 18 L8 14 L9 9 Z",
            "M12 1 L16 8 L17 13 L14 18 L10 18 L7 13 L8 8 Z",
            "M12 2 L16 8 L17 14 L14 18 L10 18 L7 14 L8 8 Z",
          ]
        : [
            "M12 2 L16 8 L17 14 L14 18 L10 18 L7 14 L8 8 Z",
            "M12 2.5 L15.5 8.5 L16.5 14 L14 18 L10 18 L7.5 14 L8.5 8.5 Z",
            "M12 2 L16 8 L17 14 L14 18 L10 18 L7 14 L8 8 Z",
          ],
      transition: {
        duration: isUrgent ? 0.3 : 0.5,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const middleFlameVariants: Variants = {
    idle: {
      d: "M12 5 L15 10 L15 15 L12 17 L9 15 L9 10 Z",
    },
    animate: {
      d: isUrgent
        ? [
            "M12 5 L15 10 L15 15 L12 17 L9 15 L9 10 Z",
            "M12 4 L15.5 9 L16 14 L12 17 L8 14 L8.5 9 Z",
            "M12 6 L14 11 L14 15 L12 17 L10 15 L10 11 Z",
            "M12 4.5 L15 10 L15.5 14.5 L12 17 L8.5 14.5 L9 10 Z",
            "M12 5 L15 10 L15 15 L12 17 L9 15 L9 10 Z",
          ]
        : [
            "M12 5 L15 10 L15 15 L12 17 L9 15 L9 10 Z",
            "M12 5.5 L14.5 10.5 L14.5 15 L12 17 L9.5 15 L9.5 10.5 Z",
            "M12 5 L15 10 L15 15 L12 17 L9 15 L9 10 Z",
          ],
      transition: {
        duration: isUrgent ? 0.25 : 0.4,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const innerFlameVariants: Variants = {
    idle: {
      d: "M12 8 L14 12 L13 16 L12 16.5 L11 16 L10 12 Z",
    },
    animate: {
      d: isUrgent
        ? [
            "M12 8 L14 12 L13 16 L12 16.5 L11 16 L10 12 Z",
            "M12 7 L14.5 11 L13.5 15 L12 16.5 L10.5 15 L9.5 11 Z",
            "M12 9 L13.5 12.5 L12.5 16 L12 16.5 L11.5 16 L10.5 12.5 Z",
            "M12 7.5 L14 11.5 L13 15.5 L12 16.5 L11 15.5 L10 11.5 Z",
            "M12 8 L14 12 L13 16 L12 16.5 L11 16 L10 12 Z",
          ]
        : [
            "M12 8 L14 12 L13 16 L12 16.5 L11 16 L10 12 Z",
            "M12 8.5 L13.5 12 L12.5 15.5 L12 16.5 L11.5 15.5 L10.5 12 Z",
            "M12 8 L14 12 L13 16 L12 16.5 L11 16 L10 12 Z",
          ],
      transition: {
        duration: isUrgent ? 0.2 : 0.35,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Glow effect for urgent/high
  const glowVariants: Variants = {
    idle: {
      opacity: 0,
    },
    animate: {
      opacity: isUrgent ? [0.4, 0.7, 0.4] : isHigh ? [0.3, 0.5, 0.3] : [0.2, 0.3, 0.2],
      scale: [1, 1.2, 1],
      transition: {
        duration: isUrgent ? 0.4 : 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Spark particles for urgent priority - diamond shaped for low-poly feel
  const sparkVariants: Variants = {
    idle: { opacity: 0, y: 0 },
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      y: [0, -6, -12],
      x: [0, i === 0 ? -3 : i === 1 ? 0 : 3, i === 0 ? -2 : i === 1 ? 0 : 2],
      rotate: [0, 45, 90],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        delay: i * 0.15,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center flex-shrink-0", className)}>
      {/* Glow effect behind the flame */}
      {(isUrgent || isHigh) && (
        <motion.div
          className="absolute rounded-sm"
          style={{
            background: `radial-gradient(${colors.glow}, transparent 70%)`,
            width: pixelSize * 1.8,
            height: pixelSize * 1.8,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
          variants={glowVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
        />
      )}

      <motion.svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 24 24"
        fill="none"
        style={{ filter: isUrgent ? `drop-shadow(0 0 2px ${colors.glow})` : undefined }}
      >
        {/* Outer flame - darkest */}
        <motion.path
          variants={outerFlameVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={colors.primary}
        />

        {/* Middle flame - medium */}
        <motion.path
          variants={middleFlameVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={colors.secondary}
        />

        {/* Inner flame - brightest core */}
        <motion.path
          variants={innerFlameVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={colors.tertiary}
        />

        {/* Base ember - small polygon with opacity animation only */}
        {/* Note: polygon points cannot be animated by Framer Motion */}
        <motion.polygon
          points="10,19 12,18 14,19 12,20"
          fill={colors.primary}
          animate={
            isAnimating
              ? {
                  opacity: [0.5, 0.8, 0.5],
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "12px 19px" }}
        />
      </motion.svg>

      {/* Spark particles for urgent priority - diamond shaped */}
      {isUrgent && isAnimating && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 3,
                height: 3,
                backgroundColor: colors.tertiary,
                top: "15%",
                left: "50%",
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
              custom={i}
              variants={sparkVariants}
              initial="idle"
              animate="animate"
            />
          ))}
        </>
      )}
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
