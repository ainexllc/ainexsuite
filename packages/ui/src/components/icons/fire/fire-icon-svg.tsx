"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "../../../lib/utils";
import { useMemo } from "react";

export interface FireIconSVGProps {
  /** Size in pixels */
  size?: number;
  /** Primary color (outer flame) */
  primaryColor?: string;
  /** Secondary color (middle flame) */
  secondaryColor?: string;
  /** Tertiary color (inner flame core) */
  tertiaryColor?: string;
  /** Whether to animate */
  isAnimating?: boolean;
  /** Number of flame tongues: 1, 2, or 3 (intertwined) */
  flameCount?: 1 | 2 | 3;
  /** Additional class names */
  className?: string;
}

// Default fire colors (red/orange/yellow)
const DEFAULT_COLORS = {
  primary: "#ef4444",
  secondary: "#f97316",
  tertiary: "#fbbf24",
};

/**
 * Clean SVG fire icon with slow flicker animation.
 * Multiple flame tongues are intertwined, sharing a common base.
 *
 * Features:
 * - Slow, subtle polygon morphing animation
 * - 1, 2, or 3 intertwined flame tongues
 * - Configurable colors
 */
export function FireIconSVG({
  size = 24,
  primaryColor = DEFAULT_COLORS.primary,
  secondaryColor = DEFAULT_COLORS.secondary,
  tertiaryColor = DEFAULT_COLORS.tertiary,
  isAnimating = true,
  flameCount = 1,
  className,
}: FireIconSVGProps) {
  // Slower animation timing
  const timing = {
    outer: 1.8,
    middle: 1.6,
    inner: 1.4,
  };

  // Single flame (center) - the main flame shape
  const mainFlameOuter: Variants = useMemo(
    () => ({
      idle: {
        d: "M12 2 L16 8 L17 14 L14 20 L10 20 L7 14 L8 8 Z",
      },
      animate: {
        d: [
          "M12 2 L16 8 L17 14 L14 20 L10 20 L7 14 L8 8 Z",
          "M12 1.5 L16.5 7.5 L17.5 13.5 L14 20 L10 20 L6.5 13.5 L7.5 7.5 Z",
          "M12 2.5 L15.5 8.5 L16.5 14 L14 20 L10 20 L7.5 14 L8.5 8.5 Z",
          "M12 2 L16 8 L17 14 L14 20 L10 20 L7 14 L8 8 Z",
        ],
        transition: {
          duration: timing.outer,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    }),
    [timing.outer]
  );

  const mainFlameMiddle: Variants = useMemo(
    () => ({
      idle: {
        d: "M12 5 L15 10 L15 15 L12 19 L9 15 L9 10 Z",
      },
      animate: {
        d: [
          "M12 5 L15 10 L15 15 L12 19 L9 15 L9 10 Z",
          "M12 4.5 L15.5 9.5 L15.5 14.5 L12 19 L8.5 14.5 L8.5 9.5 Z",
          "M12 5.5 L14.5 10.5 L14.5 15 L12 19 L9.5 15 L9.5 10.5 Z",
          "M12 5 L15 10 L15 15 L12 19 L9 15 L9 10 Z",
        ],
        transition: {
          duration: timing.middle,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1,
        },
      },
    }),
    [timing.middle]
  );

  const mainFlameInner: Variants = useMemo(
    () => ({
      idle: {
        d: "M12 8 L14 12 L13 17 L12 18 L11 17 L10 12 Z",
      },
      animate: {
        d: [
          "M12 8 L14 12 L13 17 L12 18 L11 17 L10 12 Z",
          "M12 7.5 L14.5 11.5 L13.5 16.5 L12 18 L10.5 16.5 L9.5 11.5 Z",
          "M12 8.5 L13.5 12.5 L12.5 17 L12 18 L11.5 17 L10.5 12.5 Z",
          "M12 8 L14 12 L13 17 L12 18 L11 17 L10 12 Z",
        ],
        transition: {
          duration: timing.inner,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        },
      },
    }),
    [timing.inner]
  );

  // Left flame tongue - wide spread, leaning far left
  const leftFlameOuter: Variants = useMemo(
    () => ({
      idle: {
        d: "M5 5 L2 10 L2 15 L5 20 L9 20 L8 14 L7 9 Z",
      },
      animate: {
        d: [
          "M5 5 L2 10 L2 15 L5 20 L9 20 L8 14 L7 9 Z",
          "M4.5 4 L1.5 9.5 L1.5 14.5 L5 20 L9 20 L8.5 13.5 L7.5 8.5 Z",
          "M5.5 6 L2.5 10.5 L2.5 15.5 L5 20 L9 20 L7.5 14.5 L6.5 9.5 Z",
          "M5 5 L2 10 L2 15 L5 20 L9 20 L8 14 L7 9 Z",
        ],
        transition: {
          duration: timing.outer * 1.1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.15,
        },
      },
    }),
    [timing.outer]
  );

  const leftFlameInner: Variants = useMemo(
    () => ({
      idle: {
        d: "M5.5 8 L3.5 11 L3.5 15 L5.5 19 L8 19 L7.5 14 L6.5 10 Z",
      },
      animate: {
        d: [
          "M5.5 8 L3.5 11 L3.5 15 L5.5 19 L8 19 L7.5 14 L6.5 10 Z",
          "M5 7 L3 10.5 L3 14.5 L5.5 19 L8 19 L8 13.5 L7 9.5 Z",
          "M6 9 L4 11.5 L4 15.5 L5.5 19 L8 19 L7 14.5 L6 10.5 Z",
          "M5.5 8 L3.5 11 L3.5 15 L5.5 19 L8 19 L7.5 14 L6.5 10 Z",
        ],
        transition: {
          duration: timing.middle * 1.1,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.25,
        },
      },
    }),
    [timing.middle]
  );

  // Center flame tongue - tallest, straight up in middle
  const centerFlameOuter: Variants = useMemo(
    () => ({
      idle: {
        d: "M12 1 L15 8 L15 14 L13 20 L11 20 L9 14 L9 8 Z",
      },
      animate: {
        d: [
          "M12 1 L15 8 L15 14 L13 20 L11 20 L9 14 L9 8 Z",
          "M12 0 L15.5 7.5 L15.5 13.5 L13 20 L11 20 L8.5 13.5 L8.5 7.5 Z",
          "M12 2 L14.5 8.5 L14.5 14.5 L13 20 L11 20 L9.5 14.5 L9.5 8.5 Z",
          "M12 1 L15 8 L15 14 L13 20 L11 20 L9 14 L9 8 Z",
        ],
        transition: {
          duration: timing.outer,
          repeat: Infinity,
          ease: "easeInOut",
        },
      },
    }),
    [timing.outer]
  );

  const centerFlameInner: Variants = useMemo(
    () => ({
      idle: {
        d: "M12 4 L14 9 L14 14 L12 19 L10 14 L10 9 Z",
      },
      animate: {
        d: [
          "M12 4 L14 9 L14 14 L12 19 L10 14 L10 9 Z",
          "M12 3 L14.5 8.5 L14.5 13.5 L12 19 L9.5 13.5 L9.5 8.5 Z",
          "M12 5 L13.5 9.5 L13.5 14.5 L12 19 L10.5 14.5 L10.5 9.5 Z",
          "M12 4 L14 9 L14 14 L12 19 L10 14 L10 9 Z",
        ],
        transition: {
          duration: timing.middle,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1,
        },
      },
    }),
    [timing.middle]
  );

  // Right flame tongue - wide spread, leaning far right
  const rightFlameOuter: Variants = useMemo(
    () => ({
      idle: {
        d: "M19 5 L22 10 L22 15 L19 20 L15 20 L16 14 L17 9 Z",
      },
      animate: {
        d: [
          "M19 5 L22 10 L22 15 L19 20 L15 20 L16 14 L17 9 Z",
          "M19.5 4 L22.5 9.5 L22.5 14.5 L19 20 L15 20 L15.5 13.5 L16.5 8.5 Z",
          "M18.5 6 L21.5 10.5 L21.5 15.5 L19 20 L15 20 L16.5 14.5 L17.5 9.5 Z",
          "M19 5 L22 10 L22 15 L19 20 L15 20 L16 14 L17 9 Z",
        ],
        transition: {
          duration: timing.outer * 1.15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        },
      },
    }),
    [timing.outer]
  );

  const rightFlameInner: Variants = useMemo(
    () => ({
      idle: {
        d: "M18.5 8 L20.5 11 L20.5 15 L18.5 19 L16 19 L16.5 14 L17.5 10 Z",
      },
      animate: {
        d: [
          "M18.5 8 L20.5 11 L20.5 15 L18.5 19 L16 19 L16.5 14 L17.5 10 Z",
          "M19 7 L21 10.5 L21 14.5 L18.5 19 L16 19 L16 13.5 L17 9.5 Z",
          "M18 9 L20 11.5 L20 15.5 L18.5 19 L16 19 L17 14.5 L18 10.5 Z",
          "M18.5 8 L20.5 11 L20.5 15 L18.5 19 L16 19 L16.5 14 L17.5 10 Z",
        ],
        transition: {
          duration: timing.middle * 1.15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        },
      },
    }),
    [timing.middle]
  );

  // Render based on flame count
  const renderFlames = () => {
    if (flameCount === 1) {
      // Single flame - just the main center flame
      return (
        <>
          <motion.path
            variants={mainFlameOuter}
            initial="idle"
            animate={isAnimating ? "animate" : "idle"}
            fill={primaryColor}
          />
          <motion.path
            variants={mainFlameMiddle}
            initial="idle"
            animate={isAnimating ? "animate" : "idle"}
            fill={secondaryColor}
          />
          <motion.path
            variants={mainFlameInner}
            initial="idle"
            animate={isAnimating ? "animate" : "idle"}
            fill={tertiaryColor}
          />
        </>
      );
    }

    if (flameCount === 2) {
      // Two flames - center and right
      return (
        <>
          {/* Right flame */}
          <motion.path
            variants={rightFlameOuter}
            initial="idle"
            animate={isAnimating ? "animate" : "idle"}
            fill={primaryColor}
          />
          <motion.path
            variants={rightFlameInner}
            initial="idle"
            animate={isAnimating ? "animate" : "idle"}
            fill={secondaryColor}
          />
          {/* Center flame */}
          <motion.path
            variants={centerFlameOuter}
            initial="idle"
            animate={isAnimating ? "animate" : "idle"}
            fill={primaryColor}
          />
          <motion.path
            variants={centerFlameInner}
            initial="idle"
            animate={isAnimating ? "animate" : "idle"}
            fill={tertiaryColor}
          />
        </>
      );
    }

    // Three flames - left, center, right (distinct tongues fanning out)
    return (
      <>
        {/* Left flame tongue */}
        <motion.path
          variants={leftFlameOuter}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={primaryColor}
        />
        <motion.path
          variants={leftFlameInner}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={secondaryColor}
        />
        {/* Right flame tongue */}
        <motion.path
          variants={rightFlameOuter}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={primaryColor}
        />
        <motion.path
          variants={rightFlameInner}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={secondaryColor}
        />
        {/* Center flame tongue (front, tallest) */}
        <motion.path
          variants={centerFlameOuter}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={primaryColor}
        />
        <motion.path
          variants={centerFlameInner}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          fill={tertiaryColor}
        />
      </>
    );
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
      >
        {renderFlames()}
      </svg>
    </div>
  );
}
