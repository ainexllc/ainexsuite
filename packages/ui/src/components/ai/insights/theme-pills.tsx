"use client";

import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { Hash } from "lucide-react";

// Color palette for pills (cycles through)
const PILL_COLORS = [
  { from: "#8b5cf6", to: "#6366f1" },
  { from: "#06b6d4", to: "#3b82f6" },
  { from: "#ec4899", to: "#8b5cf6" },
  { from: "#14b8a6", to: "#06b6d4" },
  { from: "#f59e0b", to: "#ec4899" },
  { from: "#6366f1", to: "#8b5cf6" },
];

export interface ThemePillsProps {
  /** Array of theme strings */
  themes: string[];
  /** Currently selected theme (for highlighting) */
  selectedTheme?: string | null;
  /** Click handler for theme selection */
  onThemeClick?: (theme: string) => void;
  /** Additional className */
  className?: string;
  /** Animation delay base */
  delay?: number;
}

/**
 * ThemePills - Floating animated theme tags
 *
 * Features:
 * - Glassmorphism pills with gradient borders
 * - Staggered float/bob animation
 * - Click to select/filter
 * - Color coded by index
 */
export function ThemePills({
  themes,
  selectedTheme,
  onThemeClick,
  className,
  delay = 0,
}: ThemePillsProps) {
  if (!themes || themes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className={cn("flex flex-wrap gap-2 sm:gap-3", className)}
    >
      {themes.map((theme, index) => {
        const colors = PILL_COLORS[index % PILL_COLORS.length];
        const isSelected = selectedTheme === theme;

        return (
          <motion.button
            key={theme}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.4,
              delay: delay * 0.1 + index * 0.05,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onThemeClick?.(theme)}
            className={cn(
              "relative group flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full",
              "transition-all duration-300",
              "backdrop-blur-md",
              isSelected
                ? "bg-white/20 border-2"
                : "bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30"
            )}
            style={{
              borderColor: isSelected ? colors.from : undefined,
              boxShadow: isSelected
                ? `0 0 20px ${colors.from}40, 0 0 40px ${colors.from}20`
                : undefined,
            }}
          >
            {/* Floating animation overlay */}
            <motion.div
              animate={{
                y: [0, -3, 0],
              }}
              transition={{
                duration: 3 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2,
              }}
              className="absolute inset-0 rounded-full pointer-events-none"
            />

            {/* Hash icon */}
            <Hash
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors duration-300"
              style={{ color: isSelected ? colors.from : "rgba(255,255,255,0.5)" }}
            />

            {/* Theme text */}
            <span
              className={cn(
                "text-xs sm:text-sm font-medium transition-colors duration-300",
                isSelected ? "text-white" : "text-white/70 group-hover:text-white"
              )}
            >
              {theme}
            </span>

            {/* Glow effect on hover/select */}
            <div
              className={cn(
                "absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 pointer-events-none",
                "group-hover:opacity-100",
                isSelected && "opacity-100"
              )}
              style={{
                background: `radial-gradient(ellipse at center, ${colors.from}20 0%, transparent 70%)`,
              }}
            />
          </motion.button>
        );
      })}
    </motion.div>
  );
}

// Export colors for use elsewhere
export { PILL_COLORS };
