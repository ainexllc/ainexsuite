"use client";

import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

// Mood color mapping
const MOOD_COLORS: Record<string, { from: string; to: string; glow: string }> = {
  creative: { from: "#a855f7", to: "#6366f1", glow: "#a855f7" },
  focused: { from: "#3b82f6", to: "#06b6d4", glow: "#3b82f6" },
  productive: { from: "#10b981", to: "#14b8a6", glow: "#10b981" },
  stressed: { from: "#f97316", to: "#ef4444", glow: "#f97316" },
  reflective: { from: "#8b5cf6", to: "#6366f1", glow: "#8b5cf6" },
  energized: { from: "#f59e0b", to: "#eab308", glow: "#f59e0b" },
  overwhelmed: { from: "#ef4444", to: "#ec4899", glow: "#ef4444" },
  neutral: { from: "#64748b", to: "#475569", glow: "#64748b" },
};

export interface MoodOrbProps {
  /** Current mood state */
  mood?: string;
  /** Size of the orb */
  size?: "sm" | "md" | "lg";
  /** Whether to show the mood label */
  showLabel?: boolean;
  /** Additional className */
  className?: string;
  /** Animation delay */
  delay?: number;
}

/**
 * MoodOrb - Animated mood visualization
 *
 * Features:
 * - Gradient sphere with mood-based colors
 * - Pulsing glow animation
 * - Floating particles
 * - Mood label below
 */
export function MoodOrb({
  mood = "neutral",
  size = "md",
  showLabel = true,
  className,
  delay = 0,
}: MoodOrbProps) {
  const colors = MOOD_COLORS[mood.toLowerCase()] || MOOD_COLORS.neutral;

  const sizeConfig = {
    sm: { orb: 80, container: "w-24 h-28" },
    md: { orb: 120, container: "w-36 h-40" },
    lg: { orb: 160, container: "w-48 h-52" },
  };

  const config = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center",
        config.container,
        className
      )}
    >
      {/* Orb container */}
      <div className="relative">
        {/* Outer glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full blur-xl"
          style={{
            width: config.orb * 1.5,
            height: config.orb * 1.5,
            left: -(config.orb * 0.25),
            top: -(config.orb * 0.25),
            background: `radial-gradient(circle, ${colors.glow}50 0%, transparent 70%)`,
          }}
        />

        {/* Main orb */}
        <motion.div
          animate={{
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative rounded-full"
          style={{
            width: config.orb,
            height: config.orb,
            background: `radial-gradient(circle at 30% 30%, ${colors.from} 0%, ${colors.to} 100%)`,
            boxShadow: `
              0 0 ${config.orb / 4}px ${colors.glow}40,
              0 0 ${config.orb / 2}px ${colors.glow}20,
              inset 0 0 ${config.orb / 3}px rgba(255,255,255,0.1),
              inset -${config.orb / 6}px -${config.orb / 6}px ${config.orb / 3}px rgba(0,0,0,0.3)
            `,
          }}
        >
          {/* Highlight */}
          <div
            className="absolute rounded-full"
            style={{
              width: config.orb * 0.3,
              height: config.orb * 0.2,
              top: config.orb * 0.15,
              left: config.orb * 0.2,
              background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)",
              filter: "blur(4px)",
            }}
          />

          {/* Inner glow ring */}
          <motion.div
            animate={{
              opacity: [0.5, 0.8, 0.5],
              rotate: [0, 360],
            }}
            transition={{
              opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
            className="absolute inset-2 rounded-full"
            style={{
              border: `1px solid ${colors.from}40`,
            }}
          />

          {/* Floating particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
                x: [0, i % 2 === 0 ? 5 : -5, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
              className="absolute rounded-full"
              style={{
                width: 4 + i * 2,
                height: 4 + i * 2,
                background: colors.from,
                top: `${30 + i * 15}%`,
                left: `${20 + i * 20}%`,
                boxShadow: `0 0 8px ${colors.from}`,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Mood label */}
      {showLabel && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: delay * 0.1 + 0.3 }}
          className="mt-3 text-sm sm:text-base font-semibold uppercase tracking-wider"
          style={{ color: colors.from }}
        >
          {mood}
        </motion.span>
      )}
    </motion.div>
  );
}

// Export mood colors for use in other components
export { MOOD_COLORS };
