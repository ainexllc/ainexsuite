"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

export interface InsightCardProps {
  /** Card title */
  title?: string;
  /** Icon to display (can be animated icon component) */
  icon?: ReactNode;
  /** Card content */
  children: ReactNode;
  /** Gradient colors for glow effect */
  gradient?: { from: string; to: string };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show glow effect */
  glow?: boolean;
  /** Additional className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Animation delay for staggered entrance */
  delay?: number;
}

/**
 * InsightCard - Glassmorphism container for insight sections
 *
 * Features:
 * - Dark glass background with blur
 * - Optional gradient border glow
 * - Animated entrance
 * - Responsive sizing
 */
export function InsightCard({
  title,
  icon,
  children,
  gradient = { from: "#8b5cf6", to: "#6366f1" },
  size = "md",
  glow = true,
  className,
  onClick,
  delay = 0,
}: InsightCardProps) {
  const sizeClasses = {
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-5",
    lg: "p-5 sm:p-6",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      onClick={onClick}
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-black/40 backdrop-blur-xl",
        "border border-white/10",
        onClick && "cursor-pointer hover:bg-black/50 transition-colors",
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: glow
          ? `0 0 20px ${gradient.from}20, 0 0 40px ${gradient.from}10, inset 0 1px 0 rgba(255,255,255,0.05)`
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Gradient border glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-xl opacity-30 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${gradient.from}20 0%, transparent 50%, ${gradient.to}20 100%)`,
          }}
        />
      )}

      {/* Header with icon and title */}
      {(icon || title) && (
        <div className="flex items-center gap-2 mb-3">
          {icon && (
            <span
              className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5"
              style={{ color: gradient.from }}
            >
              {icon}
            </span>
          )}
          {title && (
            <span
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider"
              style={{ color: gradient.from }}
            >
              {title}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
