"use client";

import { motion, type Variants } from "framer-motion";

// ============================================================================
// Types
// ============================================================================

export interface AnimatedIconProps {
  size?: number;
  color?: string;
  secondaryColor?: string;
  isAnimating?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// TODO APP ICONS (Color: #8b5cf6)
// ============================================================================

// ============================================================================
// 1. Todo Check - Animated checkbox completion
// ============================================================================

export function TodoCheckIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const checkVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }
    },
  };

  const boxVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.rect x="3" y="3" width="18" height="18" rx="2" variants={boxVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M9 12l2 2 4-4" variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 2. Todo List - Scrolling list items
// ============================================================================

export function TodoListIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const itemVariants: Variants = {
    idle: { opacity: 0.5, x: 0 },
    animate: (i: number) => ({
      opacity: [0.5, 1, 0.5],
      x: [0, 2, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" opacity={0.3} />
      <motion.line x1="7" y1="8" x2="17" y2="8" custom={0} variants={itemVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="7" y1="12" x2="17" y2="12" custom={1} variants={itemVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="7" y1="16" x2="14" y2="16" custom={2} variants={itemVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 3. Todo Priority - Pulsing flag
// ============================================================================

export function TodoPriorityIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const flagVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const waveVariants: Variants = {
    idle: { d: "M8 4h10l-2 3 2 3H8z" },
    animate: {
      d: ["M8 4h10l-2 3 2 3H8z", "M8 4h9l-1 3 1 3H8z", "M8 4h10l-2 3 2 3H8z"],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="4" y1="4" x2="4" y2="22" stroke={color} />
      <motion.path variants={waveVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} fill={color} stroke="none" />
      <motion.path d="M8 4h10l-2 3 2 3H8z" variants={flagVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} opacity={0.5} />
    </motion.svg>
  );
}

// ============================================================================
// 4. Todo Target - Focusing on goal
// ============================================================================

export function TodoTargetIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const ringVariants: Variants = {
    idle: { scale: 1, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [1, 1.15, 1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="10" custom={0} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="6" custom={1} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="12" cy="12" r="2" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 5. Todo Progress - Filling circle
// ============================================================================

export function TodoProgressIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const progressVariants: Variants = {
    idle: { pathLength: 0 },
    animate: {
      pathLength: [0, 0.75],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const percentVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} opacity={0.2} />
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        style={{
          transformOrigin: "center",
          transform: "rotate(-90deg)"
        }}
        variants={progressVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <motion.text x="12" y="14" textAnchor="middle" fontSize="8" fill={color} stroke="none" fontWeight="bold" variants={percentVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>75%</motion.text>
    </motion.svg>
  );
}

// ============================================================================
// 6. Todo Calendar - Calendar with checkmark
// ============================================================================

export function TodoCalendarIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const checkVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: [0, 1, 1],
      opacity: [0, 1, 1],
      transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }
    },
  };

  const dayVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <motion.circle cx="12" cy="15" r="3" variants={dayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M10.5 15l1 1 2-2" variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} strokeWidth={1.5} />
    </motion.svg>
  );
}

// ============================================================================
// 7. Todo Repeat - Circular arrows for recurring
// ============================================================================

export function TodoRepeatIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const rotateVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [0, 360],
      transition: { duration: 3, repeat: Infinity, ease: "linear" }
    },
  };

  const arrowVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g
        variants={rotateVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      >
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <motion.path d="M7 23l-4-4 4-4" variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        <motion.path d="M21 13v2a4 4 0 0 1-4 4H3" variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 8. Todo Tag - Label tag animation
// ============================================================================

export function TodoTagIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const tagVariants: Variants = {
    idle: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.05, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const dotVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.3, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.path
        d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"
        variants={tagVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      />
      <motion.circle cx="7" cy="7" r="1.5" fill={color} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 9. Todo Subtask - Nested list items
// ============================================================================

export function TodoSubtaskIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const itemVariants: Variants = {
    idle: { x: 0, opacity: 0.5 },
    animate: (i: number) => ({
      x: [0, 3, 0],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  const checkVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.2, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="2" opacity={0.3} />
      <motion.circle cx="6" cy="7" r="1" fill={color} custom={0} variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="9" y1="7" x2="18" y2="7" custom={0} variants={itemVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="8" cy="12" r="1" fill={color} custom={1} variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="11" y1="12" x2="18" y2="12" custom={1} variants={itemVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="8" cy="17" r="1" fill={color} custom={2} variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="11" y1="17" x2="15" y2="17" custom={2} variants={itemVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 10. Todo Due Date - Clock with urgency pulse
// ============================================================================

export function TodoDueDateIcon({ size = 24, color = "#8b5cf6", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: {
      scale: [1, 1.4, 1.4],
      opacity: [0.5, 0, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeOut" }
    },
  };

  const handVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [0, 360],
      transition: { duration: 4, repeat: Infinity, ease: "linear" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="10" variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} fill={color} stroke="none" />
      <circle cx="12" cy="12" r="10" />
      <motion.polyline
        points="12 6 12 12 16 14"
        variants={handVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      />
    </motion.svg>
  );
}

// ============================================================================
// HEALTH APP ICONS (Color: #10b981)
// ============================================================================

// ============================================================================
// 6. Health Heart - Beating pulse
// ============================================================================

export function HealthHeartIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const beatVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.15, 1, 1.05, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        fill={color}
        opacity={0.3}
        variants={beatVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      />
      <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        variants={beatVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      />
    </motion.svg>
  );
}

// ============================================================================
// 7. Health Pulse - ECG line animation
// ============================================================================

export function HealthPulseIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [0, 1],
      opacity: [0.5, 1],
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2 12h4l2-6 4 12 3-9 2 3h5" opacity={0.3} />
      <motion.path
        d="M2 12h4l2-6 4 12 3-9 2 3h5"
        variants={pulseVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <circle cx="22" cy="12" r="1" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 8. Health Activity - Rising bars
// ============================================================================

export function HealthActivityIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleY: 0.3 },
    animate: (i: number) => ({
      scaleY: [0.3, 1, 0.3],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
    }),
  };

  const heights = [8, 12, 6, 14, 10, 7];

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth={2} />
      {heights.map((h, i) => (
        <motion.rect
          key={i}
          x={4 + i * 3}
          y={20 - h}
          width={2}
          height={h}
          rx={0.5}
          fill={color}
          style={{ originY: "20px" }}
          custom={i}
          variants={barVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
        />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 9. Health Scale - Balancing weight
// ============================================================================

export function HealthScaleIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const tiltVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [-5, 5, -5],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="12" y1="2" x2="12" y2="10" />
      <motion.g
        variants={tiltVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "10px" }}
      >
        <line x1="4" y1="10" x2="20" y2="10" />
        <circle cx="4" cy="10" r="2" fill={color} />
        <circle cx="20" cy="10" r="2" fill={color} />
      </motion.g>
      <rect x="8" y="18" width="8" height="4" rx="1" />
    </motion.svg>
  );
}

// ============================================================================
// 10. Health Vitals - Monitoring display
// ============================================================================

export function HealthVitalsIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const blinkVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const numberVariants: Variants = {
    idle: { opacity: 0.7 },
    animate: {
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.05, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 10h2l1-2 2 4 1-2h2" opacity={0.5} />
      <motion.path
        d="M6 10h2l1-2 2 4 1-2h2"
        variants={blinkVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <motion.text x="16" y="12" textAnchor="middle" fontSize="5" fill={color} stroke="none" fontWeight="bold" variants={numberVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>98</motion.text>
      <motion.circle cx="19" cy="16" r="1" fill={color} variants={blinkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 11. Health Sleep - Moon/stars sleep animation
// ============================================================================

export function HealthSleepIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const moonVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const starVariants: Variants = {
    idle: { opacity: 0.3, scale: 0.8 },
    animate: (i: number) => ({
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1, 0.8],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill={color}
        opacity={0.3}
        variants={moonVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <motion.circle cx="18" cy="6" r="1" fill={color} custom={0} variants={starVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="22" cy="10" r="1" fill={color} custom={1} variants={starVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="20" cy="14" r="1" fill={color} custom={2} variants={starVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 12. Health Nutrition - Apple/food with glow
// ============================================================================

export function HealthNutritionIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const glowVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: {
      scale: [1, 1.3, 1.3],
      opacity: [0.4, 0, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeOut" }
    },
  };

  const leafVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [0, -10, 10, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="14" r="8" fill={color} opacity={0.2} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} stroke="none" />
      <path d="M12 2v5" opacity={0.5} />
      <motion.path
        d="M12 2c2 0 4 2 4 4s-2 2-4 2"
        variants={leafVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "4px" }}
      />
      <circle cx="12" cy="14" r="6" fill={color} opacity={0.3} />
      <path d="M12 8c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
    </motion.svg>
  );
}

// ============================================================================
// 13. Health Water - Water droplet fill
// ============================================================================

export function HealthWaterIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const fillVariants: Variants = {
    idle: { y: 20 },
    animate: {
      y: [20, 0, 20],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const rippleVariants: Variants = {
    idle: { scaleX: 1, opacity: 0.5 },
    animate: {
      scaleX: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      <clipPath id="droplet-clip">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </clipPath>
      <motion.rect
        x="4"
        y="0"
        width="16"
        height="24"
        fill={color}
        opacity={0.4}
        clipPath="url(#droplet-clip)"
        variants={fillVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <motion.ellipse cx="12" cy="15" rx="4" ry="1" fill={color} opacity={0.3} variants={rippleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 14. Health Steps - Footprints walking
// ============================================================================

export function HealthStepsIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const stepVariants: Variants = {
    idle: { opacity: 0.3, scale: 0.9 },
    animate: (i: number) => ({
      opacity: [0.3, 1, 0.3],
      scale: [0.9, 1, 0.9],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none" className={className} style={style}>
      <motion.g custom={0} variants={stepVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <ellipse cx="7" cy="5" rx="2" ry="2.5" />
        <ellipse cx="5.5" cy="8" rx="0.8" ry="1" />
        <ellipse cx="6.5" cy="9" rx="0.8" ry="1" />
        <ellipse cx="7.5" cy="9.5" rx="0.8" ry="1" />
        <ellipse cx="8.5" cy="9" rx="0.8" ry="1" />
      </motion.g>
      <motion.g custom={1} variants={stepVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <ellipse cx="16" cy="11" rx="2" ry="2.5" />
        <ellipse cx="14.5" cy="14" rx="0.8" ry="1" />
        <ellipse cx="15.5" cy="15" rx="0.8" ry="1" />
        <ellipse cx="16.5" cy="15.5" rx="0.8" ry="1" />
        <ellipse cx="17.5" cy="15" rx="0.8" ry="1" />
      </motion.g>
      <motion.g custom={2} variants={stepVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <ellipse cx="8" cy="16" rx="2" ry="2.5" />
        <ellipse cx="6.5" cy="19" rx="0.8" ry="1" />
        <ellipse cx="7.5" cy="20" rx="0.8" ry="1" />
        <ellipse cx="8.5" cy="20.5" rx="0.8" ry="1" />
        <ellipse cx="9.5" cy="20" rx="0.8" ry="1" />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 15. Health Meditation - Lotus flower breathing
// ============================================================================

export function HealthMeditationIcon({ size = 24, color = "#10b981", isAnimating = true, className, style }: AnimatedIconProps) {
  const breatheVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const petalVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.05, 1],
      transition: { duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g
        variants={breatheVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      >
        <motion.path d="M12 2c0 3-2 5-4 5s-3-2-3-5c0 0 2 1 3.5 1S12 2 12 2z" fill={color} opacity={0.3} custom={0} variants={petalVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        <motion.path d="M12 2c0 3 2 5 4 5s3-2 3-5c0 0-2 1-3.5 1S12 2 12 2z" fill={color} opacity={0.3} custom={1} variants={petalVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        <motion.path d="M2 12c3 0 5 2 5 4s-2 3-5 3c0 0 1-2 1-3.5S2 12 2 12z" fill={color} opacity={0.3} custom={2} variants={petalVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        <motion.path d="M22 12c-3 0-5 2-5 4s2 3 5 3c0 0-1-2-1-3.5S22 12 22 12z" fill={color} opacity={0.3} custom={3} variants={petalVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        <circle cx="12" cy="12" r="3" fill={color} opacity={0.5} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// MOMENTS APP ICONS (Color: #ec4899)
// ============================================================================

// ============================================================================
// 11. Moments Camera - Shutter animation
// ============================================================================

export function MomentsCameraIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const shutterVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 0.8, 1],
      opacity: [1, 0.3, 1],
      transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }
    },
  };

  const flashVariants: Variants = {
    idle: { opacity: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 0.8],
      transition: { duration: 0.3, repeat: Infinity, repeatDelay: 2.2, ease: "easeOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <motion.circle
        cx="12"
        cy="13"
        r="4"
        variants={shutterVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <motion.circle
        cx="12"
        cy="13"
        r="6"
        fill={color}
        stroke="none"
        variants={flashVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
    </motion.svg>
  );
}

// ============================================================================
// 12. Moments Photo - Fading in image
// ============================================================================

export function MomentsPhotoIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const photoVariants: Variants = {
    idle: { opacity: 0.3, scale: 0.95 },
    animate: {
      opacity: [0.3, 1, 0.3],
      scale: [0.95, 1, 0.95],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" opacity={0.5} />
      <polyline points="21 15 16 10 5 21" opacity={0.5} />
      <motion.g
        variants={photoVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      >
        <circle cx="8.5" cy="8.5" r="1.5" fill={color} />
        <polyline points="21 15 16 10 5 21" />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 13. Moments Album - Flipping pages
// ============================================================================

export function MomentsAlbumIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const pageVariants: Variants = {
    idle: { rotateY: 0, opacity: 1 },
    animate: {
      rotateY: [0, -90, 0],
      opacity: [1, 0.3, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ perspective: 1000, ...style }} className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" opacity={0.3} />
      <motion.path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        variants={pageVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <motion.line x1="10" y1="8" x2="16" y2="8" variants={pageVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="10" y1="12" x2="16" y2="12" variants={pageVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 14. Moments Timeline - Moving through memories
// ============================================================================

export function MomentsTimelineIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const dotVariants: Variants = {
    idle: { scale: 1, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  const lineVariants: Variants = {
    idle: { pathLength: 0 },
    animate: {
      pathLength: [0, 1],
      transition: { duration: 2.5, repeat: Infinity, ease: "linear" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth={2} opacity={0.3} />
      <motion.line
        x1="12"
        y1="2"
        x2="12"
        y2="22"
        stroke={color}
        strokeWidth={2}
        variants={lineVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      {[6, 12, 18].map((cy, i) => (
        <motion.circle
          key={i}
          cx="12"
          cy={cy}
          r="3"
          fill={color}
          custom={i}
          variants={dotVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
        />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 15. Moments Star - Favoriting memories
// ============================================================================

export function MomentsStarIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const starVariants: Variants = {
    idle: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const sparkleVariants: Variants = {
    idle: { opacity: 0, scale: 0 },
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        variants={starVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      />
      <motion.circle cx="4" cy="4" r="1" fill={color} stroke="none" custom={0} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="20" cy="6" r="1" fill={color} stroke="none" custom={1} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="6" cy="20" r="1" fill={color} stroke="none" custom={2} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 16. Moments Video - Play button with film reel
// ============================================================================

export function MomentsVideoIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const playVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const reelVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [0, 360],
      transition: { duration: 4, repeat: Infinity, ease: "linear" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <motion.polygon
        points="10 8 16 12 10 16 10 8"
        fill={color}
        variants={playVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      />
      <motion.g
        variants={reelVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "5px", originY: "5px" }}
      >
        <circle cx="5" cy="5" r="1.5" opacity={0.5} />
      </motion.g>
      <motion.g
        variants={reelVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "19px", originY: "5px" }}
      >
        <circle cx="19" cy="5" r="1.5" opacity={0.5} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 17. Moments Location - Map pin with pulse
// ============================================================================

export function MomentsLocationIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: {
      scale: [1, 1.6, 1.6],
      opacity: [0.6, 0, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeOut" }
    },
  };

  const pinVariants: Variants = {
    idle: { y: 0 },
    animate: {
      y: [0, -3, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="10" r="8" variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} fill={color} stroke="none" />
      <motion.g
        variants={pinVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={color} opacity={0.3} />
        <circle cx="12" cy="10" r="3" fill={color} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 18. Moments Heart - Favorite heart animation
// ============================================================================

export function MomentsHeartIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const heartVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.2, 1],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const rippleVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: (i: number) => ({
      scale: [1, 1.4],
      opacity: [0.6, 0],
      transition: { duration: 1.2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        custom={0}
        variants={rippleVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        fill="none"
        style={{ originX: "12px", originY: "12px" }}
      />
      <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        custom={1}
        variants={rippleVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        fill="none"
        style={{ originX: "12px", originY: "12px" }}
      />
      <motion.path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        variants={heartVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      />
    </motion.svg>
  );
}

// ============================================================================
// 19. Moments Share - Share arrows expanding
// ============================================================================

export function MomentsShareIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const nodeVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.15, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
  };

  const lineVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: (i: number) => ({
      pathLength: [0, 1],
      opacity: [0, 1, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="18" cy="5" r="3" opacity={0.3} />
      <circle cx="6" cy="12" r="3" opacity={0.3} />
      <circle cx="18" cy="19" r="3" opacity={0.3} />
      <motion.line x1="8.59" y1="13.51" x2="15.42" y2="17.49" custom={0} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="15.41" y1="6.51" x2="8.59" y2="10.49" custom={1} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="18" cy="5" r="3" variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="6" cy="12" r="3" variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="18" cy="19" r="3" variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 20. Moments Filter - Photo filter layers
// ============================================================================

export function MomentsFilterIcon({ size = 24, color = "#ec4899", isAnimating = true, className, style }: AnimatedIconProps) {
  const layerVariants: Variants = {
    idle: { opacity: 0.3, x: 0, y: 0 },
    animate: (i: number) => ({
      opacity: [0.3, 0.8, 0.3],
      x: [0, i * 1, 0],
      y: [0, -i * 1, 0],
      transition: { duration: 2.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  const adjustVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [0, 180, 360],
      transition: { duration: 3, repeat: Infinity, ease: "linear" }
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="8" custom={2} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="6" custom={1} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="4" custom={0} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.g
        variants={adjustVariants}
        initial="idle"
        animate={isAnimating ? "animate" : "idle"}
        style={{ originX: "12px", originY: "12px" }}
      >
        <line x1="12" y1="2" x2="12" y2="6" opacity={0.5} />
        <line x1="12" y1="18" x2="12" y2="22" opacity={0.5} />
        <line x1="2" y1="12" x2="6" y2="12" opacity={0.5} />
        <line x1="18" y1="12" x2="22" y2="12" opacity={0.5} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// Export all icons as a collection
// ============================================================================

export const AnimatedAppIconsGroup2 = {
  // Todo App Icons
  TodoCheck: TodoCheckIcon,
  TodoList: TodoListIcon,
  TodoPriority: TodoPriorityIcon,
  TodoTarget: TodoTargetIcon,
  TodoProgress: TodoProgressIcon,
  TodoCalendar: TodoCalendarIcon,
  TodoRepeat: TodoRepeatIcon,
  TodoTag: TodoTagIcon,
  TodoSubtask: TodoSubtaskIcon,
  TodoDueDate: TodoDueDateIcon,

  // Health App Icons
  HealthHeart: HealthHeartIcon,
  HealthPulse: HealthPulseIcon,
  HealthActivity: HealthActivityIcon,
  HealthScale: HealthScaleIcon,
  HealthVitals: HealthVitalsIcon,
  HealthSleep: HealthSleepIcon,
  HealthNutrition: HealthNutritionIcon,
  HealthWater: HealthWaterIcon,
  HealthSteps: HealthStepsIcon,
  HealthMeditation: HealthMeditationIcon,

  // Moments App Icons
  MomentsCamera: MomentsCameraIcon,
  MomentsPhoto: MomentsPhotoIcon,
  MomentsAlbum: MomentsAlbumIcon,
  MomentsTimeline: MomentsTimelineIcon,
  MomentsStar: MomentsStarIcon,
  MomentsVideo: MomentsVideoIcon,
  MomentsLocation: MomentsLocationIcon,
  MomentsHeart: MomentsHeartIcon,
  MomentsShare: MomentsShareIcon,
  MomentsFilter: MomentsFilterIcon,
} as const;

export type AnimatedAppIconGroup2Name = keyof typeof AnimatedAppIconsGroup2;
