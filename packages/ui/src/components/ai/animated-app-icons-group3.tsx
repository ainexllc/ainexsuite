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
// GROW APP ICONS - Personal Development (#14b8a6)
// ============================================================================

// ============================================================================
// 1. Grow Seedling - Growing plant animation
// ============================================================================

export function GrowSeedlingIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const growVariants: Variants = {
    idle: { scaleY: 0.7, opacity: 0.8 },
    animate: {
      scaleY: [0.7, 1, 0.7],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const leafVariants: Variants = {
    idle: { rotate: 0 },
    animate: (i: number) => ({
      rotate: [0, i * 5, 0],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 22v-8" />
      <motion.g variants={growVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originY: "22px" }}>
        <motion.path d="M12 14c-3-3-7-2-9 0" custom={-1} variants={leafVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "14px" }} />
        <motion.path d="M12 14c3-3 7-2 9 0" custom={1} variants={leafVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "14px" }} />
        <motion.path d="M12 10c-2-2-5-1.5-7 0" custom={-1} variants={leafVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "10px" }} />
        <motion.path d="M12 10c2-2 5-1.5 7 0" custom={1} variants={leafVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "10px" }} />
      </motion.g>
      <circle cx="12" cy="6" r="2" fill={color} />
      <path d="M20 22H4" strokeWidth={2} />
    </motion.svg>
  );
}

// ============================================================================
// 2. Grow Book - Page turning animation
// ============================================================================

export function GrowBookIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const pageVariants: Variants = {
    idle: { rotateY: 0 },
    animate: {
      rotateY: [0, 180, 0],
      transition: { duration: 2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" },
    },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: {
      opacity: [0.3, 0.8, 0.3],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <motion.path d="M12 2v20" variants={pageVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px" }} />
      <motion.rect x="8" y="7" width="8" height="2" rx="0.5" fill={color} opacity={0.3} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="8" y="11" width="6" height="2" rx="0.5" fill={color} opacity={0.3} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="8" y="15" width="8" height="2" rx="0.5" fill={color} opacity={0.3} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 3. Grow Stairs - Climbing progress animation
// ============================================================================

export function GrowStairsIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const stepVariants: Variants = {
    idle: { y: 0, x: 0 },
    animate: {
      y: [-16, -12, -8, -4, 0],
      x: [0, 4, 8, 12, 16],
      transition: { duration: 3, repeat: Infinity, repeatDelay: 0.5, ease: "linear" },
    },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: (i: number) => ({
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 20v-4h4v-4h4v-4h4V4" />
      <motion.rect x="6" y="16" width="4" height="4" fill={color} opacity={0.3} custom={0} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="10" y="12" width="4" height="4" fill={color} opacity={0.3} custom={1} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="14" y="8" width="4" height="4" fill={color} opacity={0.3} custom={2} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="18" y="4" width="4" height="4" fill={color} opacity={0.3} custom={3} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="4" cy="20" r="1.5" fill={color} variants={stepVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 4. Grow Trophy - Rising achievement
// ============================================================================

export function GrowTrophyIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const riseVariants: Variants = {
    idle: { y: 0, scale: 1 },
    animate: {
      y: [0, -3, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const sparkleVariants: Variants = {
    idle: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.4 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={riseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </motion.g>
      <motion.path d="M10 2l2 3 2-3" custom={0} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="5" cy="5" r="0.5" fill={color} custom={1} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="19" cy="5" r="0.5" fill={color} custom={2} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 5. Grow Target - Expanding goals
// ============================================================================

export function GrowTargetIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const expandVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: (i: number) => ({
      scale: [1, 1.15, 1],
      opacity: [1, 0.5, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  const arrowVariants: Variants = {
    idle: { pathLength: 1 },
    animate: {
      pathLength: [0, 1],
      transition: { duration: 1.5, repeat: Infinity, repeatDelay: 0.5 },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="10" custom={2} variants={expandVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="6" custom={1} variants={expandVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="2" custom={0} variants={expandVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} fill={color} />
      <motion.path d="M22 2l-10 10M22 2l-4 10M22 2l-10 4" variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// PULSE APP ICONS - Vitality Tracking (#ef4444)
// ============================================================================

// ============================================================================
// 6. Pulse Heartbeat - Pulsing heart rhythm
// ============================================================================

export function PulseHeartbeatIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const beatVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.15, 1, 1.05, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const waveVariants: Variants = {
    idle: { pathLength: 1 },
    animate: {
      pathLength: [0, 1],
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" fill={color} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" variants={beatVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M2 12h4l2-4 2 8 2-4h10" stroke="white" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} variants={waveVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 7. Pulse Wave - Energy wave animation
// ============================================================================

export function PulseWaveIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const waveVariants: Variants = {
    idle: { x: 0, opacity: 1 },
    animate: (i: number) => ({
      x: [0, 24],
      opacity: [0, 1, 0],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} opacity={0.3} />
      {[0, 1, 2].map((i) => (
        <motion.path key={i} d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" custom={i} variants={waveVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <circle cx="12" cy="12" r="2" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 8. Pulse Activity - Rising bars animation
// ============================================================================

export function PulseActivityIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleY: 0.3 },
    animate: (i: number) => ({
      scaleY: [0.3, 1, 0.3],
      transition: { duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" },
    }),
  };

  const bars = [
    { x: 4, baseHeight: 8 },
    { x: 8, baseHeight: 14 },
    { x: 12, baseHeight: 10 },
    { x: 16, baseHeight: 16 },
    { x: 20, baseHeight: 12 },
  ];

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth={1.5} />
      {bars.map((bar, i) => (
        <motion.rect key={i} x={bar.x - 1} y={20 - bar.baseHeight} width={2} height={bar.baseHeight} rx={1} fill={color} style={{ originY: "20px" }} custom={i} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 9. Pulse Energy - Radiating energy circles
// ============================================================================

export function PulseEnergyIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const radiateVariants: Variants = {
    idle: { scale: 0.8, opacity: 0 },
    animate: (i: number) => ({
      scale: [0.8, 1.4],
      opacity: [0.8, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" },
    }),
  };

  const coreVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="12" cy="12" r="6" stroke={color} strokeWidth={2} custom={i} variants={radiateVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <motion.circle cx="12" cy="12" r="4" fill={color} variants={coreVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </motion.svg>
  );
}

// ============================================================================
// 10. Pulse Bolt - Lightning energy flash
// ============================================================================

export function PulseBoltIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const flashVariants: Variants = {
    idle: { opacity: 0.5, scale: 1 },
    animate: {
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const sparkVariants: Variants = {
    idle: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" fill={color} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" variants={flashVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="6" cy="6" r="1" fill={color} custom={0} variants={sparkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="18" cy="10" r="1" fill={color} custom={1} variants={sparkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="14" cy="18" r="1" fill={color} custom={2} variants={sparkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// FIT APP ICONS - Workout Tracking (#3b82f6)
// ============================================================================

// ============================================================================
// 11. Fit Dumbbell - Lifting motion animation
// ============================================================================

export function FitDumbbellIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const liftVariants: Variants = {
    idle: { y: 0, rotate: 0 },
    animate: {
      y: [0, -4, 0],
      rotate: [-5, 5, -5],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={liftVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M6.5 6.5h11" />
        <path d="M6.5 17.5h11" />
        <rect x="4" y="4" width="2.5" height="16" rx="1" fill={color} />
        <rect x="17.5" y="4" width="2.5" height="16" rx="1" fill={color} />
        <rect x="2" y="6" width="2" height="12" rx="1" fill={color} />
        <rect x="20" y="6" width="2" height="12" rx="1" fill={color} />
        <rect x="6.5" y="11" width="11" height="2" rx="1" fill={color} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 12. Fit Running - Running person animation
// ============================================================================

export function FitRunningIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const runVariants: Variants = {
    idle: { x: 0 },
    animate: {
      x: [0, 2, 0, -2, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const legVariants: Variants = {
    idle: { rotate: 0 },
    animate: (i: number) => ({
      rotate: i === 0 ? [-20, 20, -20] : [20, -20, 20],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={runVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <circle cx="12" cy="5" r="2" fill={color} />
        <path d="M10 8h4l1 4-1 4" />
        <motion.path d="M14 12l-2 8" custom={0} variants={legVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "14px", originY: "12px" }} />
        <motion.path d="M12 12l1 8" custom={1} variants={legVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
        <path d="M10 8l-2 2" />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 13. Fit Bicycle - Pedaling wheel animation
// ============================================================================

export function FitBicycleIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const wheelVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="5.5" cy="17" r="3.5" />
      <circle cx="18.5" cy="17" r="3.5" />
      <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill={color} />
      <path d="M12 17V9l-2-3h4" />
      <path d="M17 14l-5-5" />
      <path d="M12 9l6 8" />
      <path d="M5.5 17L12 9" />
      <motion.g variants={wheelVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "5.5px", originY: "17px" }}>
        <line x1="5.5" y1="13.5" x2="5.5" y2="20.5" strokeWidth={1} />
        <line x1="2" y1="17" x2="9" y2="17" strokeWidth={1} />
      </motion.g>
      <motion.g variants={wheelVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "18.5px", originY: "17px" }}>
        <line x1="18.5" y1="13.5" x2="18.5" y2="20.5" strokeWidth={1} />
        <line x1="15" y1="17" x2="22" y2="17" strokeWidth={1} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 14. Fit Strength - Flexing muscle animation
// ============================================================================

export function FitStrengthIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const flexVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const pulseVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={flexVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <path d="M6 14.5a2 2 0 0 1-2-2V8a6 6 0 0 1 12 0v4.5a2 2 0 0 1-2 2" />
        <path d="M6 14.5V22M18 14.5V22" />
        <circle cx="12" cy="8" r="3" fill={color} opacity={0.3} />
        <motion.path d="M9 8c0-1.5 1-3 3-3s3 1.5 3 3" variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} strokeWidth={2} />
      </motion.g>
      <rect x="4" y="21" width="4" height="2" rx="1" fill={color} />
      <rect x="16" y="21" width="4" height="2" rx="1" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 15. Fit Timer - Countdown timer animation
// ============================================================================

export function FitTimerIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const handVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 3, repeat: Infinity, ease: "linear" },
    },
  };

  const tickVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: (i: number) => ({
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: { duration: 3, repeat: Infinity, delay: i * 0.25 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M9 2h6" />
      <path d="M12 2v2" />
      <motion.g variants={handVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "13px" }}>
        <line x1="12" y1="13" x2="12" y2="7" strokeWidth={2} />
      </motion.g>
      {[0, 1, 2, 3].map((i) => {
        const angle = (i * 90 * Math.PI) / 180;
        const x = 12 + 8 * Math.cos(angle - Math.PI / 2);
        const y = 13 + 8 * Math.sin(angle - Math.PI / 2);
        return <motion.circle key={i} cx={x} cy={y} r="1" fill={color} custom={i} variants={tickVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />;
      })}
    </motion.svg>
  );
}

// ============================================================================
// 6. Grow Mind - Brain with expanding rays
// ============================================================================

export function GrowMindIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const rayVariants: Variants = {
    idle: { scale: 1, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  const brainVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={brainVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M12 5a3 3 0 0 0-3 3c-1.5 0-3 1.5-3 3.5S7 15 8 15c0 1.5 1.5 4 4 4s4-2.5 4-4c1 0 2.5-1 2.5-3.5S16.5 8 15 8a3 3 0 0 0-3-3z" />
        <path d="M12 5v3M9 10.5h1.5M13.5 10.5H15" />
      </motion.g>
      <motion.line x1="12" y1="3" x2="12" y2="1" custom={0} variants={rayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "3px" }} />
      <motion.line x1="17" y1="6" x2="18.5" y2="4.5" custom={1} variants={rayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "17px", originY: "6px" }} />
      <motion.line x1="20" y1="11" x2="22" y2="11" custom={2} variants={rayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "20px", originY: "11px" }} />
      <motion.line x1="7" y1="6" x2="5.5" y2="4.5" custom={3} variants={rayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "7px", originY: "6px" }} />
      <motion.line x1="4" y1="11" x2="2" y2="11" custom={4} variants={rayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "4px", originY: "11px" }} />
    </motion.svg>
  );
}

// ============================================================================
// 7. Grow Habit - Circular progress streak
// ============================================================================

export function GrowHabitIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const circleVariants: Variants = {
    idle: { pathLength: 0.75 },
    animate: {
      pathLength: [0.75, 1, 0.75],
      rotate: [0, 360],
      transition: { duration: 3, repeat: Infinity, ease: "linear" },
    },
  };

  const checkVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: (i: number) => ({
      pathLength: [0, 1],
      opacity: [0, 1, 1, 0],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.5 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} opacity={0.3} />
      <motion.circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" variants={circleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.path d="M8 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" custom={0} variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="12" cy="4" r="1.5" fill={color} />
      <circle cx="20" cy="12" r="1.5" fill={color} />
      <circle cx="12" cy="20" r="1.5" fill={color} />
      <circle cx="4" cy="12" r="1.5" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 8. Grow Journal - Open book with pencil
// ============================================================================

export function GrowJournalIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const writeVariants: Variants = {
    idle: { x: 0, y: 0 },
    animate: {
      x: [0, 2, 0],
      y: [0, 2, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const lineVariants: Variants = {
    idle: { pathLength: 0 },
    animate: (i: number) => ({
      pathLength: [0, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M2 6h8M2 12h8M2 18h8" />
      <motion.path d="M5 6h3" custom={0} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} strokeWidth={2} opacity={0.6} />
      <motion.path d="M5 12h3" custom={1} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} strokeWidth={2} opacity={0.6} />
      <motion.path d="M5 18h3" custom={2} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} strokeWidth={2} opacity={0.6} />
      <path d="M11 2v20M11 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
      <motion.g variants={writeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M15 8l4-4M22 1l-3 3" />
        <path d="M15 8l-2 6 6-2 4-4-4-4-4 4z" fill={color} opacity={0.3} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 9. Grow Milestone - Flag on mountain peak
// ============================================================================

export function GrowMilestoneIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const flagVariants: Variants = {
    idle: { scaleX: 1 },
    animate: {
      scaleX: [1, 0.9, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const riseVariants: Variants = {
    idle: { y: 0, opacity: 0 },
    animate: {
      y: [0, -20],
      opacity: [0, 1, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M6 22V4l6-2 6 8-6 2-6-2v12" />
      <path d="M6 6c2 2 4 2 6 0s4-2 6 0" opacity={0.3} />
      <motion.path d="M6 4c2 2 4 2 6 0s4-2 6 0v8c-2-2-4-2-6 0s-4 2-6 0z" fill={color} opacity={0.3} variants={flagVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "6px" }} />
      <path d="M2 22h8" strokeWidth={2} />
      <motion.circle cx="6" cy="10" r="1" fill={color} custom={0} variants={riseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="10" cy="8" r="1" fill={color} custom={0.3} variants={riseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 10. Grow Reflection - Mirror/reflection effect
// ============================================================================

export function GrowReflectionIcon({ size = 24, color = "#14b8a6", isAnimating = true, className, style }: AnimatedIconProps) {
  const mirrorVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const rippleVariants: Variants = {
    idle: { scale: 0.8, opacity: 0 },
    animate: (i: number) => ({
      scale: [0.8, 1.2],
      opacity: [0.6, 0],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="8" r="3" fill={color} opacity={0.8} />
      <path d="M12 11c-3 0-5 2-5 4v1h10v-1c0-2-2-4-5-4z" fill={color} opacity={0.8} />
      <line x1="2" y1="18" x2="22" y2="18" strokeWidth={2} opacity={0.5} />
      <motion.g variants={mirrorVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <circle cx="12" cy="24" r="3" fill={color} opacity={0.3} transform="scale(1, -1) translate(0, -32)" />
        <path d="M12 27c-3 0-5-2-5-4v-1h10v1c0 2-2 4-5 4z" fill={color} opacity={0.3} transform="scale(1, -1) translate(0, -32)" />
      </motion.g>
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="12" cy="18" r="6" stroke={color} strokeWidth={1} fill="none" opacity={0.3} custom={i} variants={rippleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 16. Pulse Monitor - Heart rate monitor screen
// ============================================================================

export function PulseMonitorIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const waveVariants: Variants = {
    idle: { pathLength: 0, pathOffset: 0 },
    animate: {
      pathLength: [0, 1],
      pathOffset: [0, 1],
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  const blinkVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: {
      opacity: [0.3, 1, 0.3],
      transition: { duration: 1, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth={1.5} />
      <motion.path d="M4 12h2l1.5-3 3 6 1.5-3 1.5 0h9.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" variants={waveVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="19" cy="7" r="1.5" fill={color} variants={blinkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M4 4v16M20 4v16" stroke={color} strokeWidth={0.5} opacity={0.3} />
    </motion.svg>
  );
}

// ============================================================================
// 17. Pulse Alert - Warning with pulse
// ============================================================================

export function PulseAlertIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const ringVariants: Variants = {
    idle: { scale: 0.9, opacity: 0 },
    animate: (i: number) => ({
      scale: [0.9, 1.3],
      opacity: [0.8, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.5, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {[0, 1].map((i) => (
        <motion.path key={i} d="M12 2L2 20h20L12 2z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" custom={i} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      ))}
      <motion.path d="M12 2L2 20h20L12 2z" fill={color} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.3} variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth={2} strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="white" />
    </motion.svg>
  );
}

// ============================================================================
// 18. Pulse Recovery - Arrow curving up (recovery)
// ============================================================================

export function PulseRecoveryIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const arrowVariants: Variants = {
    idle: { pathLength: 0 },
    animate: {
      pathLength: [0, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const riseVariants: Variants = {
    idle: { y: 0, opacity: 0 },
    animate: (i: number) => ({
      y: [0, -10],
      opacity: [0, 1, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M4 20c0-6 2-10 8-12 6-2 8 2 8 8" opacity={0.3} />
      <motion.path d="M4 20c0-6 2-10 8-12 6-2 8 2 8 8" strokeWidth={2} variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M20 16l0-8-8 0" strokeWidth={2} />
      <motion.circle cx="8" cy="16" r="1.5" fill={color} custom={0} variants={riseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="1.5" fill={color} custom={1} variants={riseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="16" cy="10" r="1.5" fill={color} custom={2} variants={riseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 19. Pulse Zone - Zone meter animation
// ============================================================================

export function PulseZoneIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const needleVariants: Variants = {
    idle: { rotate: -60 },
    animate: {
      rotate: [-60, 60, -60],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const zoneVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: (i: number) => ({
      opacity: i === 1 ? [0.3, 1, 0.3] : 0.3,
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke={color} strokeWidth={1.5} opacity={0.3} />
      <motion.path d="M2 12c0-2.5 1-5 3-7" stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.3} custom={0} variants={zoneVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M5 5c2-2 4.5-3 7-3" stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.5} custom={1} variants={zoneVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M12 2c2.5 0 5 1 7 3" stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.3} custom={2} variants={zoneVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="12" y1="12" x2="12" y2="6" stroke={color} strokeWidth={2} strokeLinecap="round" variants={needleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <circle cx="12" cy="12" r="2" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 20. Pulse Streak - Fire/streak flame
// ============================================================================

export function PulseStreakIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const flameVariants: Variants = {
    idle: { scale: 1, y: 0 },
    animate: {
      scale: [1, 1.1, 0.95, 1],
      y: [0, -2, 0, -1, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const flickerVariants: Variants = {
    idle: { opacity: 0.7 },
    animate: (i: number) => ({
      opacity: [0.7, 1, 0.6, 1, 0.7],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.1 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.g variants={flameVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "20px" }}>
        <motion.path d="M12 2c-1 3-3 4-4 8 0 3 2 5 4 5s4-2 4-5c-1-4-3-5-4-8z" fill={color} opacity={0.8} custom={0} variants={flickerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        <motion.path d="M12 6c0 2-1 3-2 5 0 2 1 3 2 3s2-1 2-3c-1-2-2-3-2-5z" fill="#fbbf24" opacity={0.9} custom={1} variants={flickerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        <path d="M8 15c-2 0-3 1-3 3s1 3 3 3h8c2 0 3-1 3-3s-1-3-3-3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </motion.g>
      <path d="M9 22h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </motion.svg>
  );
}

// ============================================================================
// 21. Fit Yoga - Person in yoga pose
// ============================================================================

export function FitYogaIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const breatheVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.3, scale: 1 },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="10" fill={color} opacity={0.1} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.g variants={breatheVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <circle cx="12" cy="5" r="2" fill={color} />
        <path d="M12 7v4" />
        <path d="M12 11l-4 3v4l4-2" />
        <path d="M12 11l4 3v4l-4-2" />
        <circle cx="8" cy="18" r="1" fill={color} />
        <circle cx="16" cy="18" r="1" fill={color} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 22. Fit Swimming - Swimming figure
// ============================================================================

export function FitSwimmingIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const swimVariants: Variants = {
    idle: { x: 0, y: 0 },
    animate: {
      x: [0, 2, 0, -2, 0],
      y: [0, -1, 0, -1, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const waveVariants: Variants = {
    idle: { x: 0 },
    animate: (i: number) => ({
      x: [-24, 0],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "linear" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={swimVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <circle cx="10" cy="6" r="2" fill={color} />
        <path d="M10 8c-2 1-4 2-4 4h8c0-2-2-3-4-4z" />
        <path d="M6 12l-2 2M14 12l2 2" />
      </motion.g>
      {[0, 1].map((i) => (
        <motion.path key={i} d="M2 18c2-1 4-1 6 0s4 1 6 0 4-1 6 0" opacity={0.4} custom={i} variants={waveVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <path d="M2 22c2-1 4-1 6 0s4 1 6 0 4-1 6 0" opacity={0.6} />
    </motion.svg>
  );
}

// ============================================================================
// 23. Fit Calories - Flame with counter
// ============================================================================

export function FitCaloriesIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const burnVariants: Variants = {
    idle: { scale: 1, y: 0 },
    animate: {
      scale: [1, 1.1, 1],
      y: [0, -2, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const countVariants: Variants = {
    idle: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.g variants={burnVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "8px", originY: "16px" }}>
        <path d="M8 2c-1 3-2.5 4-3.5 7C4.5 12 6 14 8 14s3.5-2 3.5-5C10.5 6 9 5 8 2z" fill="#f97316" stroke="#f97316" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6c0 1.5-0.5 2.5-1 3.5 0 1.5 1 2.5 1 2.5s1-1 1-2.5C8.5 8.5 8 7.5 8 6z" fill="#fbbf24" />
      </motion.g>
      <rect x="14" y="5" width="8" height="12" rx="2" stroke={color} strokeWidth={1.5} />
      <motion.text x="18" y="13" fill={color} fontSize="8" fontWeight="bold" textAnchor="middle" variants={countVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        450
      </motion.text>
      <path d="M8 22c-2 0-3-1-3-2h6c0 1-1 2-3 2z" stroke={color} strokeWidth={1.5} fill={color} opacity={0.3} />
    </motion.svg>
  );
}

// ============================================================================
// 24. Fit Goal - Medal/badge shine
// ============================================================================

export function FitGoalIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const shineVariants: Variants = {
    idle: { opacity: 0, scale: 0.8 },
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 0.8],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4 },
    }),
  };

  const medalVariants: Variants = {
    idle: { y: 0, rotate: 0 },
    animate: {
      y: [0, -2, 0],
      rotate: [-2, 2, -2],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={medalVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "14px" }}>
        <circle cx="12" cy="14" r="6" fill={color} opacity={0.3} />
        <circle cx="12" cy="14" r="4" fill={color} opacity={0.6} />
        <path d="M8.5 8L12 2l3.5 6" strokeWidth={2} />
        <path d="M8.5 8v3" />
        <path d="M15.5 8v3" />
      </motion.g>
      <motion.path d="M10 14l1.5 1.5L14 13" stroke="white" strokeWidth={2} />
      <motion.line x1="12" y1="8" x2="12" y2="10" stroke={color} strokeWidth={2} custom={0} variants={shineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="6" y1="14" x2="8" y2="14" stroke={color} strokeWidth={2} custom={1} variants={shineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="16" y1="14" x2="18" y2="14" stroke={color} strokeWidth={2} custom={2} variants={shineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 25. Fit Rest - Pause/rest indicator
// ============================================================================

export function FitRestIcon({ size = 24, color = "#3b82f6", isAnimating = true, className, style }: AnimatedIconProps) {
  const breatheVariants: Variants = {
    idle: { scale: 1, opacity: 0.6 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 1, 0.6],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const pulseVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.2, 1],
      opacity: [0.5, 0, 0.5],
      transition: { duration: 2.5, repeat: Infinity, delay: i * 0.8, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {[0, 1].map((i) => (
        <motion.circle key={i} cx="12" cy="12" r="8" stroke={color} strokeWidth={1.5} custom={i} variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth={1.5} opacity={0.2} />
      <motion.g variants={breatheVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <rect x="9" y="8" width="2" height="8" rx="1" fill={color} />
        <rect x="13" y="8" width="2" height="8" rx="1" fill={color} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// PULSE DISPLAY APP ICONS (Screensaver/Display App)
// ============================================================================

// 31. Pulse Display - Glowing screen/monitor
export function PulseDisplayIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const glowVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: {
      opacity: [0.3, 0.7, 0.3],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const screenVariants: Variants = {
    idle: { fill: color, fillOpacity: 0.1 },
    animate: {
      fillOpacity: [0.1, 0.25, 0.1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.rect x="2" y="3" width="20" height="14" rx="2" stroke={color} strokeWidth={1.5} variants={screenVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="4" y="5" width="16" height="10" rx="1" fill={color} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M8 21h8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M12 17v4" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </motion.svg>
  );
}

// 32. Pulse Clock - Animated clock with rotating hands
export function PulseClockIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const hourVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 20, repeat: Infinity, ease: "linear" },
    },
  };

  const minuteVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 4, repeat: Infinity, ease: "linear" },
    },
  };

  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 0.2 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.2, 0.4, 0.2],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="10" fill={color} variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.5} fill="none" />
      <motion.line x1="12" y1="12" x2="12" y2="7" stroke={color} strokeWidth={2} strokeLinecap="round" variants={hourVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.line x1="12" y1="12" x2="12" y2="5" stroke={color} strokeWidth={1.5} strokeLinecap="round" variants={minuteVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </motion.svg>
  );
}

// 33. Pulse Widget - Grid of widgets with staggered appearance
export function PulseWidgetIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const widgetVariants: Variants = {
    idle: { opacity: 0.5, scale: 1 },
    animate: (i: number) => ({
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.rect x="3" y="3" width="7" height="7" rx="1.5" fill={color} custom={0} variants={widgetVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="14" y="3" width="7" height="7" rx="1.5" fill={color} custom={1} variants={widgetVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="3" y="14" width="7" height="7" rx="1.5" fill={color} custom={2} variants={widgetVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="14" y="14" width="7" height="7" rx="1.5" fill={color} custom={3} variants={widgetVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 34. Pulse Ambient - Soft ambient glow rings
export function PulseAmbientIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const ringVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: (i: number) => ({
      scale: [0.5, 1.5],
      opacity: [0.8, 0],
      transition: { duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" },
    }),
  };

  const coreVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="12" cy="12" r="8" stroke={color} strokeWidth={1} fill="none" custom={i} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <motion.circle cx="12" cy="12" r="4" fill={color} opacity={0.8} variants={coreVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 35. Pulse Frame - Photo frame with fade transition
export function PulseFrameIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const imageVariants: Variants = {
    idle: { opacity: 0.6 },
    animate: {
      opacity: [0.6, 1, 0.6],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const shimmerVariants: Variants = {
    idle: { x: -20, opacity: 0 },
    animate: {
      x: [-20, 30],
      opacity: [0, 0.5, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={1.5} />
      <motion.rect x="5" y="5" width="14" height="14" rx="1" fill={color} opacity={0.3} variants={imageVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="5" y="5" width="4" height="14" fill="white" opacity={0.3} variants={shimmerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="9" cy="9" r="2" fill={color} opacity={0.6} />
      <path d="M5 15l4-4 3 3 4-4 3 3v6H5v-4z" fill={color} opacity={0.5} />
    </motion.svg>
  );
}

// 36. Pulse Night - Moon and stars night mode
export function PulseNightIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const moonVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [-5, 5, -5],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const starVariants: Variants = {
    idle: { opacity: 0.5, scale: 1 },
    animate: (i: number) => ({
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.2, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={color} opacity={0.8} variants={moonVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.circle cx="19" cy="5" r="1" fill={color} custom={0} variants={starVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="16" cy="3" r="0.7" fill={color} custom={1} variants={starVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="21" cy="9" r="0.5" fill={color} custom={2} variants={starVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 37. Pulse Desk - Desktop display setup
export function PulseDeskIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const screenGlowVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: {
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const contentVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: {
      opacity: [0.5, 0.8, 0.5],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="2" y="4" width="20" height="12" rx="1" stroke={color} strokeWidth={1.5} />
      <motion.rect x="4" y="6" width="16" height="8" fill={color} variants={screenGlowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="6" y="8" width="5" height="2" rx="0.5" fill="white" opacity={0.6} variants={contentVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="6" y="11" width="8" height="1" rx="0.5" fill="white" opacity={0.4} variants={contentVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M8 16h8l1 4H7l1-4z" stroke={color} strokeWidth={1.5} fill="none" />
      <path d="M6 20h12" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </motion.svg>
  );
}

// 38. Pulse Smart - Smart display with live info
export function PulseSmartIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const infoVariants: Variants = {
    idle: { opacity: 0.6 },
    animate: (i: number) => ({
      opacity: [0.6, 1, 0.6],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" },
    }),
  };

  const dotVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.3, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="4" y="2" width="16" height="20" rx="2" stroke={color} strokeWidth={1.5} />
      <motion.circle cx="18" cy="4" r="1" fill="#22c55e" variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="6" y="5" width="8" height="4" rx="1" fill={color} opacity={0.3} custom={0} variants={infoVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="6" y="11" width="12" height="2" rx="0.5" fill={color} opacity={0.5} custom={1} variants={infoVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="6" y="15" width="10" height="2" rx="0.5" fill={color} opacity={0.4} custom={2} variants={infoVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="6" y="19" width="6" height="1" rx="0.5" fill={color} opacity={0.3} custom={3} variants={infoVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 39. Pulse Zen - Calming zen/meditation mode
export function PulseZenIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const breatheVariants: Variants = {
    idle: { scale: 1, opacity: 0.6 },
    animate: {
      scale: [1, 1.15, 1],
      opacity: [0.6, 0.9, 0.6],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const rippleVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: (i: number) => ({
      scale: [1, 2],
      opacity: [0.5, 0],
      transition: { duration: 4, repeat: Infinity, delay: i * 1.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="12" cy="12" r="5" stroke={color} strokeWidth={1} fill="none" custom={i} variants={rippleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <motion.circle cx="12" cy="12" r="5" fill={color} variants={breatheVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M12 7c-1.5 0-2.5 1-2.5 2.5S12 12 12 12s2.5-1 2.5-2.5S13.5 7 12 7z" fill="white" opacity={0.4} />
    </motion.svg>
  );
}

// 40. Pulse Slideshow - Rotating images/slides
export function PulseSlideshowIcon({ size = 24, color = "#ef4444", isAnimating = true, className, style }: AnimatedIconProps) {
  const slideVariants: Variants = {
    idle: { x: 0, opacity: 1 },
    animate: {
      x: [0, -3, 0, 3, 0],
      opacity: [1, 0.7, 1, 0.7, 1],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const arrowVariants: Variants = {
    idle: { x: 0 },
    animate: (dir: number) => ({
      x: [0, dir * 2, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.rect x="5" y="5" width="14" height="14" rx="2" fill={color} opacity={0.2} variants={slideVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <rect x="5" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth={1.5} />
      <motion.path d="M2 12l2-2v4l-2-2z" fill={color} custom={-1} variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M22 12l-2-2v4l2-2z" fill={color} custom={1} variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="10" cy="18" r="1" fill={color} opacity={0.4} />
      <circle cx="12" cy="18" r="1" fill={color} />
      <circle cx="14" cy="18" r="1" fill={color} opacity={0.4} />
    </motion.svg>
  );
}

// ============================================================================
// Export all icons as collections
// ============================================================================

export const GrowIcons = {
  Seedling: GrowSeedlingIcon,
  Book: GrowBookIcon,
  Stairs: GrowStairsIcon,
  Trophy: GrowTrophyIcon,
  Target: GrowTargetIcon,
  Mind: GrowMindIcon,
  Habit: GrowHabitIcon,
  Journal: GrowJournalIcon,
  Milestone: GrowMilestoneIcon,
  Reflection: GrowReflectionIcon,
} as const;

export const PulseIcons = {
  Heartbeat: PulseHeartbeatIcon,
  Wave: PulseWaveIcon,
  Activity: PulseActivityIcon,
  Energy: PulseEnergyIcon,
  Bolt: PulseBoltIcon,
  Monitor: PulseMonitorIcon,
  Alert: PulseAlertIcon,
  Recovery: PulseRecoveryIcon,
  Zone: PulseZoneIcon,
  Streak: PulseStreakIcon,
  // Display/Screensaver icons
  Display: PulseDisplayIcon,
  Clock: PulseClockIcon,
  Widget: PulseWidgetIcon,
  Ambient: PulseAmbientIcon,
  Frame: PulseFrameIcon,
  Night: PulseNightIcon,
  Desk: PulseDeskIcon,
  Smart: PulseSmartIcon,
  Zen: PulseZenIcon,
  Slideshow: PulseSlideshowIcon,
} as const;

export const FitIcons = {
  Dumbbell: FitDumbbellIcon,
  Running: FitRunningIcon,
  Bicycle: FitBicycleIcon,
  Strength: FitStrengthIcon,
  Timer: FitTimerIcon,
  Yoga: FitYogaIcon,
  Swimming: FitSwimmingIcon,
  Calories: FitCaloriesIcon,
  Goal: FitGoalIcon,
  Rest: FitRestIcon,
} as const;

export const AppIconsGroup3 = {
  Grow: GrowIcons,
  Pulse: PulseIcons,
  Fit: FitIcons,
} as const;

export type GrowIconName = keyof typeof GrowIcons;
export type PulseIconName = keyof typeof PulseIcons;
export type FitIconName = keyof typeof FitIcons;
