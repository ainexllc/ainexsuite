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
// 1. AI Brain - Pulsing neural activity
// ============================================================================

export function AIBrainIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 0.7 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <motion.circle cx="12" cy="12" r="2" fill={color} variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M12 8v4M12 16v-4M9 10l3 2M15 10l-3 2" variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 2. Neural Network - Connecting nodes animation
// ============================================================================

export function NeuralNetworkIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const nodeVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  const lineVariants: Variants = {
    idle: { pathLength: 1, opacity: 0.5 },
    animate: {
      pathLength: [0, 1],
      opacity: [0.3, 1, 0.3],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.line x1="4" y1="12" x2="10" y2="6" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="4" y1="12" x2="10" y2="18" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="10" y1="6" x2="14" y2="12" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="10" y1="18" x2="14" y2="12" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="14" y1="12" x2="20" y2="12" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      {[[4, 12], [10, 6], [10, 18], [14, 12], [20, 12]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r={2.5} fill={color} custom={i} variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 3. AI Chat - Typing indicator bubbles
// ============================================================================

export function AIChatIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const dotVariants: Variants = {
    idle: { y: 0 },
    animate: (i: number) => ({
      y: [0, -3, 0],
      transition: { duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      {[8, 12, 16].map((cx, i) => (
        <motion.circle key={i} cx={cx} cy={10} r={1.5} fill={color} stroke="none" custom={i} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 4. AI Sparkle - Twinkling stars effect
// ============================================================================

export function AISparkleIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const sparkleVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: (i: number) => ({
      scale: [1, 1.2, 0.8, 1],
      opacity: [1, 0.5, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} style={style}>
      <motion.path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" custom={0} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M19 2L19.75 4.25L22 5L19.75 5.75L19 8L18.25 5.75L16 5L18.25 4.25L19 2Z" custom={1} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M5 16L5.75 18.25L8 19L5.75 19.75L5 22L4.25 19.75L2 19L4.25 18.25L5 16Z" custom={2} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 5. AI Robot - Waving antenna
// ============================================================================

export function AIRobotIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const antennaVariants: Variants = {
    idle: { rotate: 0 },
    animate: { rotate: [-15, 15, -15], transition: { duration: 1, repeat: Infinity, ease: "easeInOut" } },
  };

  const eyeVariants: Variants = {
    idle: { scaleY: 1 },
    animate: { scaleY: [1, 0.1, 1], transition: { duration: 3, repeat: Infinity, repeatDelay: 2 } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g style={{ originX: "12px", originY: "6px" }} variants={antennaVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <line x1="12" y1="6" x2="12" y2="2" />
        <circle cx="12" cy="2" r="1" fill={color} />
      </motion.g>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <motion.circle cx="9" cy="12" r="1.5" fill={color} variants={eyeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="15" cy="12" r="1.5" fill={color} variants={eyeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <line x1="9" y1="16" x2="15" y2="16" />
      <rect x="6" y="20" width="12" height="2" rx="1" />
    </motion.svg>
  );
}

// ============================================================================
// 6. AI Circuit - Flowing electricity
// ============================================================================

export function AICircuitIcon({ size = 24, color = "currentColor", secondaryColor, isAnimating = true, className, style }: AnimatedIconProps) {
  const flowVariants: Variants = {
    idle: { pathLength: 1 },
    animate: { pathLength: [0, 1], transition: { duration: 1.5, repeat: Infinity, ease: "linear" } },
  };
  const glowColor = secondaryColor || color;

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M4 12h4l2-4 4 8 2-4h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.3} />
      <motion.path d="M4 12h4l2-4 4 8 2-4h4" stroke={glowColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" variants={flowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="4" cy="12" r="2" fill={color} />
      <circle cx="20" cy="12" r="2" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 7. AI Processing - Spinning segments
// ============================================================================

export function AIProcessingIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.g animate={isAnimating ? { rotate: 360 } : {}} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ originX: "12px", originY: "12px" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <motion.rect key={i} x="11" y="2" width="2" height="5" rx="1" fill={color} style={{ transform: `rotate(${angle}deg)`, transformOrigin: "12px 12px" }} initial={{ opacity: 0.3 + i * 0.1 }} animate={isAnimating ? { opacity: [0.3, 1, 0.3] } : {}} transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }} />
        ))}
      </motion.g>
      <circle cx="12" cy="12" r="3" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 8. AI Magic Wand - Sparkling tip
// ============================================================================

export function AIMagicWandIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const sparkVariants: Variants = {
    idle: { scale: 0, opacity: 0 },
    animate: (i: number) => ({ scale: [0, 1, 0], opacity: [0, 1, 0], transition: { duration: 1, repeat: Infinity, delay: i * 0.3 } }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M15 4V2M15 4v2M13 4h4M21 12h-2M21 12h2M21 10v4" />
      <path d="M3 21l10-10M13 11l1.5-1.5" />
      <motion.circle cx="5" cy="5" r="1" fill={color} custom={0} variants={sparkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="8" cy="3" r="0.75" fill={color} custom={1} variants={sparkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="3" cy="8" r="0.75" fill={color} custom={2} variants={sparkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 9. AI Lightbulb - Glowing idea
// ============================================================================

export function AILightbulbIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const glowVariants: Variants = {
    idle: { opacity: 0.5, scale: 1 },
    animate: { opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const rayVariants: Variants = {
    idle: { pathLength: 0.5, opacity: 0.5 },
    animate: { pathLength: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5], transition: { duration: 1.5, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.circle cx="12" cy="9" r="6" fill={color} opacity={0.2} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.9V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.1A7 7 0 0 0 12 2z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {["M2 9h2", "M20 9h2", "M5 2l1.5 1.5", "M19 2l-1.5 1.5"].map((d, i) => (
        <motion.path key={i} d={d} stroke={color} strokeWidth={1.5} strokeLinecap="round" variants={rayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 10. AI Voice - Sound wave animation
// ============================================================================

export function AIVoiceIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleY: 0.5 },
    animate: (i: number) => ({ scaleY: [0.4, 1, 0.4], transition: { duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" } }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} style={style}>
      {[4, 8, 12, 16, 20].map((x, i) => (
        <motion.rect key={i} x={x - 1} y={6} width={2} height={12} rx={1} style={{ originY: "12px" }} custom={i} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 11. AI Eye - Scanning animation
// ============================================================================

export function AIEyeIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const pupilVariants: Variants = {
    idle: { x: 0 },
    animate: { x: [-2, 2, -2], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const scanLineVariants: Variants = {
    idle: { opacity: 0 },
    animate: { opacity: [0, 0.5, 0], scaleX: [0.5, 1, 0.5], transition: { duration: 1.5, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.5} />
      <motion.circle cx="12" cy="12" r="2" fill={color} variants={pupilVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth={1} variants={scanLineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 12. AI Code - Typing cursor
// ============================================================================

export function AICodeIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const cursorVariants: Variants = {
    idle: { opacity: 1 },
    animate: { opacity: [1, 0, 1], transition: { duration: 1, repeat: Infinity } },
  };

  const typeVariants: Variants = {
    idle: { width: 0 },
    animate: { width: [0, 6, 0], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
      <line x1="10" y1="10" x2="14" y2="10" opacity={0.5} />
      <motion.rect x="10" y="13" height="2" rx="0.5" fill={color} stroke="none" variants={typeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="16" y1="12" x2="16" y2="16" strokeWidth={2} variants={cursorVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 13. AI Atom - Orbiting electrons
// ============================================================================

export function AIAtomIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const orbitVariants: Variants = {
    idle: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 3, repeat: Infinity, ease: "linear" } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} className={className} style={style}>
      <circle cx="12" cy="12" r="2" fill={color} />
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" />
      <motion.g variants={orbitVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <circle cx="21" cy="12" r="1.5" fill={color} />
      </motion.g>
      <motion.g animate={isAnimating ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }} style={{ originX: "12px", originY: "12px" }}>
        <circle cx="16.5" cy="4" r="1.5" fill={color} />
      </motion.g>
      <motion.g animate={isAnimating ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 2 }} style={{ originX: "12px", originY: "12px" }}>
        <circle cx="7.5" cy="20" r="1.5" fill={color} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 14. AI Target - Focusing crosshairs
// ============================================================================

export function AITargetIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: { scale: [1, 1.2, 1], opacity: [1, 0.5, 1], transition: { duration: 1.5, repeat: Infinity } },
  };

  const focusVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 0.9, 1], transition: { duration: 1, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="10" variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="6" variants={focusVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="12" cy="12" r="2" fill={color} />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </motion.svg>
  );
}

// ============================================================================
// 15. AI Learning - Continuous refresh
// ============================================================================

export function AILearningIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g animate={isAnimating ? { rotate: 360 } : {}} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ originX: "12px", originY: "12px" }}>
        <path d="M21 12a9 9 0 1 1-9-9" />
        <path d="M21 3v9h-9" />
      </motion.g>
      <circle cx="12" cy="12" r="3" fill={color} opacity={0.3} />
      <path d="M10 11c0-1 .5-2 2-2s2 1 2 2-.5 1.5-2 2v1" />
      <circle cx="12" cy="15" r="0.5" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 16. AI Shield - Protection pulse
// ============================================================================

export function AIShieldIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 0.3 },
    animate: { scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3], transition: { duration: 2, repeat: Infinity } },
  };

  const checkVariants: Variants = {
    idle: { pathLength: 1 },
    animate: { pathLength: [0, 1], transition: { duration: 1, repeat: Infinity, repeatDelay: 2 } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.path d="M12 2l8 4v6c0 5.5-3.8 10-8 11-4.2-1-8-5.5-8-11V6l8-4z" fill={color} variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M12 2l8 4v6c0 5.5-3.8 10-8 11-4.2-1-8-5.5-8-11V6l8-4z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <motion.path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 17. AI Analytics - Growing bars
// ============================================================================

export function AIAnalyticsIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleY: 1 },
    animate: (i: number) => ({ scaleY: [0.3, 1, 0.3], transition: { duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" } }),
  };

  const bars = [
    { x: 4, height: 8 },
    { x: 9, height: 14 },
    { x: 14, height: 10 },
    { x: 19, height: 16 },
  ];

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <line x1="2" y1="20" x2="22" y2="20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      {bars.map((bar, i) => (
        <motion.rect key={i} x={bar.x - 1.5} y={20 - bar.height} width={3} height={bar.height} rx={1} fill={color} style={{ originY: "20px" }} custom={i} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <motion.path d="M4 16l5-6 5 4 6-8" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" animate={isAnimating ? { strokeDashoffset: [20, 0] } : {}} transition={{ duration: 2, repeat: Infinity }} />
    </motion.svg>
  );
}

// ============================================================================
// 18. AI Cloud - Floating animation
// ============================================================================

export function AICloudIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const floatVariants: Variants = {
    idle: { y: 0 },
    animate: { y: [-2, 2, -2], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  };

  const dataVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: (i: number) => ({ opacity: [0.5, 1, 0.5], y: [0, -2, 0], transition: { duration: 1, repeat: Infinity, delay: i * 0.2 } }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" variants={floatVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} className={className} style={style}>
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {[[10, 13], [13, 11], [16, 14]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r={1} fill={color} custom={i} variants={dataVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 19. AI DNA - Rotating helix
// ============================================================================

export function AIDNAIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const helixVariants: Variants = {
    idle: { rotateY: 0 },
    animate: { rotateY: 360, transition: { duration: 4, repeat: Infinity, ease: "linear" } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ perspective: 100, ...style }} className={className}>
      <motion.g variants={helixVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M8 2c-2 4-2 8 0 12s2 8 0 12" />
        <path d="M16 2c2 4 2 8 0 12s-2 8 0 12" />
        <line x1="8" y1="5" x2="16" y2="5" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="8" y1="11" x2="16" y2="11" />
        <line x1="9" y1="14" x2="15" y2="14" />
        <line x1="8" y1="17" x2="16" y2="17" />
        <line x1="9" y1="20" x2="15" y2="20" />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 20. AI Compass - Orienting needle
// ============================================================================

export function AICompassIcon({ size = 24, color = "currentColor", isAnimating = true, className, style }: AnimatedIconProps) {
  const needleVariants: Variants = {
    idle: { rotate: 0 },
    animate: { rotate: [-20, 20, -10, 10, 0], transition: { duration: 2, repeat: Infinity, repeatDelay: 1, ease: "easeOut" } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="10" />
      <text x="12" y="5" textAnchor="middle" fontSize="4" fill={color} stroke="none">N</text>
      <text x="12" y="21" textAnchor="middle" fontSize="4" fill={color} stroke="none">S</text>
      <text x="4" y="13" textAnchor="middle" fontSize="4" fill={color} stroke="none">W</text>
      <text x="20" y="13" textAnchor="middle" fontSize="4" fill={color} stroke="none">E</text>
      <motion.g variants={needleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <polygon points="12,6 14,12 12,14 10,12" fill={color} stroke="none" />
        <polygon points="12,18 14,12 12,10 10,12" fill={color} opacity={0.5} stroke="none" />
      </motion.g>
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// Export all icons as a collection
// ============================================================================

export const AnimatedAIIcons = {
  Brain: AIBrainIcon,
  NeuralNetwork: NeuralNetworkIcon,
  Chat: AIChatIcon,
  Sparkle: AISparkleIcon,
  Robot: AIRobotIcon,
  Circuit: AICircuitIcon,
  Processing: AIProcessingIcon,
  MagicWand: AIMagicWandIcon,
  Lightbulb: AILightbulbIcon,
  Voice: AIVoiceIcon,
  Eye: AIEyeIcon,
  Code: AICodeIcon,
  Atom: AIAtomIcon,
  Target: AITargetIcon,
  Learning: AILearningIcon,
  Shield: AIShieldIcon,
  Analytics: AIAnalyticsIcon,
  Cloud: AICloudIcon,
  DNA: AIDNAIcon,
  Compass: AICompassIcon,
} as const;

export type AnimatedAIIconName = keyof typeof AnimatedAIIcons;
