"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";

export interface ProgressRingProps {
  /** Current value */
  value: number;
  /** Maximum value (for percentage calculation) */
  max?: number;
  /** Label below the number */
  label: string;
  /** Gradient colors */
  gradient?: { from: string; to: string };
  /** Size of the ring */
  size?: "sm" | "md" | "lg";
  /** Whether to animate the count */
  animateCount?: boolean;
  /** Additional className */
  className?: string;
  /** Animation delay */
  delay?: number;
}

/**
 * ProgressRing - Circular stat indicator with animated stroke
 *
 * Features:
 * - SVG ring with gradient stroke
 * - Animated stroke-dashoffset
 * - Counting number animation
 * - Pulsing glow effect
 */
export function ProgressRing({
  value,
  max = 100,
  label,
  gradient = { from: "#8b5cf6", to: "#6366f1" },
  size = "md",
  animateCount = true,
  className,
  delay = 0,
}: ProgressRingProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const sizeConfig = {
    sm: { size: 80, stroke: 6, fontSize: "text-xl", labelSize: "text-[10px]" },
    md: { size: 100, stroke: 8, fontSize: "text-2xl", labelSize: "text-xs" },
    lg: { size: 120, stroke: 10, fontSize: "text-3xl", labelSize: "text-sm" },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Animate counting
  useEffect(() => {
    if (!animateCount) {
      setDisplayValue(value);
      return;
    }

    const duration = 1000;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, animateCount]);

  const gradientId = `ring-gradient-${delay}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      className={cn("flex flex-col items-center", className)}
    >
      <div className="relative">
        {/* Glow effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full blur-lg"
          style={{
            background: `radial-gradient(circle, ${gradient.from}40 0%, transparent 70%)`,
          }}
        />

        <svg
          width={config.size}
          height={config.size}
          className="transform -rotate-90"
        >
          {/* Gradient definition */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradient.from} />
              <stop offset="100%" stopColor={gradient.to} />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={config.stroke}
          />

          {/* Progress ring */}
          <motion.circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: delay * 0.1, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 6px ${gradient.from})`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn("font-bold text-white", config.fontSize)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: delay * 0.1 + 0.2 }}
          >
            {displayValue}
          </motion.span>
        </div>
      </div>

      {/* Label */}
      <motion.span
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: delay * 0.1 + 0.3 }}
        className={cn(
          "mt-2 font-medium uppercase tracking-wider text-white/60",
          config.labelSize
        )}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}
