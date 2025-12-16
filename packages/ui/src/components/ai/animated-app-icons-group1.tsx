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
// MAIN APP ICONS - Color: #f97316
// ============================================================================

// ============================================================================
// 1. Main Dashboard - Expanding grid
// ============================================================================

export function MainDashboardIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const gridVariants: Variants = {
    idle: { scale: 1, opacity: 0.7 },
    animate: (i: number) => ({
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      {[[6.5, 6.5], [17.5, 6.5], [6.5, 17.5], [17.5, 17.5]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r={1.5} fill={color} custom={i} variants={gridVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 2. Main Home - Pulsing house with glowing door
// ============================================================================

export function MainHomeIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const glowVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: { opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
      <motion.rect x="9.5" y="13" width="5" height="8" fill={color} opacity={0.3} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="12" cy="17" r={0.5} fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 3. Main Hub - Connecting spokes animation
// ============================================================================

export function MainHubIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const spokeVariants: Variants = {
    idle: { pathLength: 1, opacity: 0.5 },
    animate: (i: number) => ({
      pathLength: [0, 1],
      opacity: [0.3, 1, 0.3],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  const nodeVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <circle cx="12" cy="12" r={8} stroke={color} strokeWidth={1.5} opacity={0.3} />
      {[[12, 4], [19.8, 12], [12, 20], [4.2, 12]].map(([x, y], i) => (
        <motion.line key={i} x1="12" y1="12" x2={x} y2={y} stroke={color} strokeWidth={1.5} custom={i} variants={spokeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <circle cx="12" cy="12" r={3} fill={color} />
      {[[12, 4], [19.8, 12], [12, 20], [4.2, 12]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r={2} fill={color} custom={i} variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 4. Main Overview - Scanning layers
// ============================================================================

export function MainOverviewIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const layerVariants: Variants = {
    idle: { y: 0, opacity: 0.5 },
    animate: (i: number) => ({
      y: [-1, 1, -1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.rect x="3" y="5" width="18" height="3" rx="1" custom={0} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="3" y="10.5" width="18" height="3" rx="1" custom={1} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="3" y="16" width="18" height="3" rx="1" custom={2} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="7" cy="6.5" r={1} fill={color} custom={0} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="7" cy="12" r={1} fill={color} custom={1} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="7" cy="17.5" r={1} fill={color} custom={2} variants={layerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 5. Main Suite - Rotating modules
// ============================================================================

export function MainSuiteIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const rotateVariants: Variants = {
    idle: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 8, repeat: Infinity, ease: "linear" } },
  };

  const moduleVariants: Variants = {
    idle: { scale: 1, opacity: 0.7 },
    animate: (i: number) => ({
      scale: [1, 1.15, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.5 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.g variants={rotateVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <rect x="4" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth={1.5} />
        <rect x="14" y="4" width="6" height="6" rx="1" stroke={color} strokeWidth={1.5} />
        <rect x="4" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth={1.5} />
        <rect x="14" y="14" width="6" height="6" rx="1" stroke={color} strokeWidth={1.5} />
      </motion.g>
      <circle cx="12" cy="12" r={2.5} fill={color} />
      {[[7, 7], [17, 7], [7, 17], [17, 17]].map(([cx, cy], i) => (
        <motion.circle key={i} cx={cx} cy={cy} r={1.2} fill={color} custom={i} variants={moduleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 6. Main Notifications - Bell with badge animation
// ============================================================================

export function MainNotificationsIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const bellVariants: Variants = {
    idle: { rotate: 0 },
    animate: { rotate: [-10, 10, -10, 10, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 } },
  };

  const badgeVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    animate: { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8], transition: { duration: 1.5, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={bellVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "4px" }}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </motion.g>
      <motion.circle cx="18" cy="6" r={3} fill={color} stroke="white" strokeWidth={1.5} variants={badgeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.text x="18" y="7.5" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">3</motion.text>
    </motion.svg>
  );
}

// ============================================================================
// 7. Main Search - Magnifying glass with pulse
// ============================================================================

export function MainSearchIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 0.3 },
    animate: { scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const handleVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="11" cy="11" r={7} fill={color} variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="11" cy="11" r={7} />
      <motion.line x1="21" y1="21" x2="16.65" y2="16.65" variants={handleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 8. Main Settings - Gear rotation
// ============================================================================

export function MainSettingsIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const rotateVariants: Variants = {
    idle: { rotate: 0 },
    animate: { rotate: 360, transition: { duration: 8, repeat: Infinity, ease: "linear" } },
  };

  const centerVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.2, 1], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={rotateVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r={4} />
      </motion.g>
      <motion.circle cx="12" cy="12" r={2} fill={color} variants={centerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 9. Main Stats - Chart bars growing
// ============================================================================

export function MainStatsIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleY: 1 },
    animate: (i: number) => ({
      scaleY: [1, 1.3, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: (i: number) => ({
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <motion.rect x="16" y="10" width="4" height="10" fill={color} custom={2} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="10" y="4" width="4" height="16" fill={color} custom={1} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="4" y="14" width="4" height="6" fill={color} custom={0} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="18" y1="20" x2="18" y2="10" custom={2} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originY: "20px" }} />
      <motion.line x1="12" y1="20" x2="12" y2="4" custom={1} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originY: "20px" }} />
      <motion.line x1="6" y1="20" x2="6" y2="14" custom={0} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originY: "20px" }} />
    </motion.svg>
  );
}

// ============================================================================
// 10. Main Apps - Grid of app squares animating
// ============================================================================

export function MainAppsIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const squareVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    animate: (i: number) => ({
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" },
    }),
  };

  const gridPositions = [
    [5, 5], [12, 5], [19, 5],
    [5, 12], [12, 12], [19, 12],
    [5, 19], [12, 19], [19, 19],
  ];

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      {gridPositions.map(([x, y], i) => (
        <motion.rect key={i} x={x - 2} y={y - 2} width="4" height="4" rx="0.5" fill={color} stroke={color} strokeWidth={1} custom={i} variants={squareVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// NOTES APP ICONS - Color: #eab308
// ============================================================================

// ============================================================================
// 6. Notes Write - Animated pen stroke
// ============================================================================

export function NotesWriteIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const penVariants: Variants = {
    idle: { x: 0, y: 0 },
    animate: { x: [0, 2, 0], y: [0, 2, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
  };

  const strokeVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: { pathLength: [0, 1, 1], opacity: [0, 1, 0], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      <motion.path d="M6 16l4-4 4 4" stroke={color} strokeWidth={1.5} variants={strokeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.g variants={penVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <line x1="15" y1="5" x2="19" y2="9" />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 7. Notes Sticky - Peeling corner animation
// ============================================================================

export function NotesStickyIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const peelVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.2, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.2 },
    animate: { opacity: [0.2, 0.5, 0.2], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.rect x="4" y="4" width="16" height="16" rx="1" fill={color} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <rect x="4" y="4" width="16" height="16" rx="1" stroke={color} strokeWidth={1.5} />
      <line x1="8" y1="9" x2="16" y2="9" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <line x1="8" y1="12" x2="14" y2="12" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <line x1="8" y1="15" x2="12" y2="15" stroke={color} strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
      <motion.path d="M20 14v6l-6-6h6z" fill={color} stroke={color} strokeWidth={1.5} variants={peelVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "17px", originY: "17px" }} />
    </motion.svg>
  );
}

// ============================================================================
// 8. Notes Document - Page turning animation
// ============================================================================

export function NotesDocumentIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const pageVariants: Variants = {
    idle: { rotateY: 0 },
    animate: { rotateY: [0, 15, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
  };

  const lineVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: (i: number) => ({
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2.5, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ perspective: 100, ...style }} className={className}>
      <motion.g variants={pageVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
      </motion.g>
      <motion.line x1="8" y1="13" x2="16" y2="13" custom={0} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="8" y1="17" x2="13" y2="17" custom={1} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 9. Notes Ideas - Lightbulb with floating thoughts
// ============================================================================

export function NotesIdeasIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const thoughtVariants: Variants = {
    idle: { y: 0, opacity: 0 },
    animate: (i: number) => ({
      y: [0, -8, -8],
      opacity: [0, 1, 0],
      scale: [0.5, 1, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.6 },
    }),
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: { opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.circle cx="12" cy="11" r={5} fill={color} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.9V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.1A7 7 0 0 0 12 2z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={12 + (i - 1) * 3} cy={8} r={1} fill={color} custom={i} variants={thoughtVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 10. Notes Colors - Color palette cycling
// ============================================================================

export function NotesColorsIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const colors = ["#eab308", "#f97316", "#ec4899", "#3b82f6", "#10b981"];

  const colorVariants: Variants = {
    idle: { scale: 1, opacity: 0.7 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.2 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={1.5} />
      {colors.map((c, i) => (
        <motion.circle key={i} cx={6 + (i % 3) * 6} cy={6 + Math.floor(i / 3) * 6} r={2} fill={c} custom={i} variants={colorVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <circle cx="12" cy="18" r={2} fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// 11. Notes Bookmark - Bookmark with ribbon wave
// ============================================================================

export function NotesBookmarkIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const ribbonVariants: Variants = {
    idle: { y: 0 },
    animate: { y: [0, -2, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.2 },
    animate: { opacity: [0.2, 0.4, 0.2], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.rect x="5" y="3" width="14" height="18" rx="1" fill={color} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <motion.path d="M12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-5z" fill={color} opacity={0.3} variants={ribbonVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 12. Notes Pin - Push pin with drop shadow
// ============================================================================

export function NotesPinIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const pinVariants: Variants = {
    idle: { y: 0, rotate: 0 },
    animate: { y: [0, -2, 0], rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const shadowVariants: Variants = {
    idle: { scale: 1, opacity: 0.3 },
    animate: { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.ellipse cx="12" cy="20" rx="3" ry="1" fill={color} variants={shadowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.g variants={pinVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "8px" }}>
        <path d="M9 9V5a3 3 0 0 1 6 0v4" />
        <path d="M12 9v13" />
        <path d="M15 9l-3-3-3 3h6z" fill={color} />
        <circle cx="12" cy="3" r={1.5} fill={color} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 13. Notes Tag - Tag label with swing
// ============================================================================

export function NotesTagIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const swingVariants: Variants = {
    idle: { rotate: 0 },
    animate: { rotate: [-5, 5, -5], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
  };

  const holeVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.2, 1], transition: { duration: 2.5, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={swingVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "8px", originY: "8px" }}>
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M2 2l10 10" opacity={0.3} />
        <motion.circle cx="7" cy="7" r={1.5} fill={color} variants={holeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 14. Notes Search - Search through pages
// ============================================================================

export function NotesSearchIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const magnifyVariants: Variants = {
    idle: { x: 0, y: 0 },
    animate: { x: [0, 2, 0], y: [0, 2, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.3, scale: 1 },
    animate: { opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1], transition: { duration: 2.5, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="8" y1="13" x2="11" y2="13" opacity={0.5} />
      <line x1="8" y1="17" x2="10" y2="17" opacity={0.5} />
      <motion.circle cx="14" cy="16" r={2.5} fill={color} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.g variants={magnifyVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <circle cx="14" cy="16" r={2.5} />
        <line x1="16" y1="18" x2="18" y2="20" />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 15. Notes Archive - Box with paper going in
// ============================================================================

export function NotesArchiveIcon({ size = 24, color = "#eab308", isAnimating = true, className, style }: AnimatedIconProps) {
  const paperVariants: Variants = {
    idle: { y: 0, opacity: 1 },
    animate: { y: [0, 3, 3], opacity: [1, 1, 0.3], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const boxVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={boxVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <polyline points="21,8 21,21 3,21 3,8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" opacity={0.5} />
      </motion.g>
      <motion.g variants={paperVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <rect x="9" y="1" width="6" height="8" rx="0.5" fill={color} opacity={0.4} />
        <line x1="10.5" y1="3" x2="13.5" y2="3" opacity={0.7} />
        <line x1="10.5" y1="5" x2="13.5" y2="5" opacity={0.7} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// JOURNEY APP ICONS - Color: #f97316
// ============================================================================

// ============================================================================
// 11. Journey Mood - Emoji cycling animation
// ============================================================================

export function JourneyMoodIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const faceVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const mouthVariants: Variants = {
    idle: { d: "M8 14s1.5 2 4 2 4-2 4-2" },
    animate: {
      d: ["M8 14s1.5 2 4 2 4-2 4-2", "M8 15h8", "M8 14s1.5 2 4 2 4-2 4-2"],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r={10} variants={faceVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="8" cy="10" r={1.5} fill={color} />
      <circle cx="16" cy="10" r={1.5} fill={color} />
      <motion.path variants={mouthVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 12. Journey Journal - Book with turning pages
// ============================================================================

export function JourneyJournalIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const pageVariants: Variants = {
    idle: { x: 0, opacity: 1 },
    animate: { x: [0, 2, 0], opacity: [1, 0.5, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.2 },
    animate: { opacity: [0.2, 0.4, 0.2], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.rect x="4" y="4" width="16" height="16" rx="1" fill={color} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <motion.line x1="12" y1="7" x2="17" y2="7" stroke={color} strokeWidth={1.5} strokeLinecap="round" variants={pageVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="12" y1="11" x2="15" y2="11" stroke={color} strokeWidth={1.5} strokeLinecap="round" variants={pageVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 13. Journey Emotions - Heart pulse animation
// ============================================================================

export function JourneyEmotionsIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const heartVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.15, 1], transition: { duration: 1, repeat: Infinity, ease: "easeInOut" } },
  };

  const pulseVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: { pathLength: [0, 1], opacity: [0, 1, 0], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} opacity={0.3} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" variants={heartVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M3 12h4l2 4 2-8 2 4h4" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 14. Journey Reflection - Mirror wave animation
// ============================================================================

export function JourneyReflectionIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const waveVariants: Variants = {
    idle: { y: 0, opacity: 0.5 },
    animate: { y: [0, -2, 0], opacity: [0.5, 1, 0.5], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
  };

  const rippleVariants: Variants = {
    idle: { scale: 1, opacity: 0.3 },
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      opacity: [0.3, 0, 0.3],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.5 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="8" r={5} />
      <path d="M12 13v3" />
      <motion.path d="M3 18c0-3 2-5 9-5s9 2 9 5" variants={waveVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx="12" cy="18" r={3 + i * 2} stroke={color} strokeWidth={1} fill="none" opacity={0.3} custom={i} variants={rippleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 15. Journey Mindfulness - Breathing circle animation
// ============================================================================

export function JourneyMindfulnessIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const breatheVariants: Variants = {
    idle: { scale: 1, opacity: 0.3 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const petalVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.1, 1],
      rotate: [0, 5, 0],
      transition: { duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.circle cx="12" cy="12" r={9} fill={color} variants={breatheVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="12" cy="12" r={9} stroke={color} strokeWidth={1.5} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.g key={i} custom={i} variants={petalVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
          <circle cx={12 + Math.cos((angle * Math.PI) / 180) * 6} cy={12 + Math.sin((angle * Math.PI) / 180) * 6} r={2} fill={color} stroke={color} strokeWidth={1} />
        </motion.g>
      ))}
      <circle cx="12" cy="12" r={2.5} fill={color} stroke="white" strokeWidth={1} />
    </motion.svg>
  );
}

// ============================================================================
// 16. Journey Calendar - Calendar with day highlight
// ============================================================================

export function JourneyCalendarIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const dayVariants: Variants = {
    idle: { scale: 1, opacity: 0.7 },
    animate: { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const glowVariants: Variants = {
    idle: { opacity: 0.2 },
    animate: { opacity: [0.2, 0.5, 0.2], transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <motion.circle cx="12" cy="15" r={2.5} fill={color} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="15" r={2} fill={color} variants={dayVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="7" cy="15" r={0.5} fill={color} opacity={0.5} />
      <circle cx="17" cy="15" r={0.5} fill={color} opacity={0.5} />
      <circle cx="7" cy="19" r={0.5} fill={color} opacity={0.5} />
      <circle cx="12" cy="19" r={0.5} fill={color} opacity={0.5} />
    </motion.svg>
  );
}

// ============================================================================
// 17. Journey Gratitude - Heart with sparkles
// ============================================================================

export function JourneyGratitudeIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const heartVariants: Variants = {
    idle: { scale: 1 },
    animate: { scale: [1, 1.1, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  };

  const sparkleVariants: Variants = {
    idle: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  const sparklePositions = [
    [5, 8], [19, 8], [8, 5], [16, 5]
  ];

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" variants={heartVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      {sparklePositions.map(([x, y], i) => (
        <motion.g key={i} custom={i} variants={sparkleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
          <line x1={x - 1} y1={y} x2={x + 1} y2={y} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
          <line x1={x} y1={y - 1} x2={x} y2={y + 1} stroke={color} strokeWidth={1.5} strokeLinecap="round" />
        </motion.g>
      ))}
    </motion.svg>
  );
}

// ============================================================================
// 18. Journey Goals - Target with arrow
// ============================================================================

export function JourneyGoalsIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const arrowVariants: Variants = {
    idle: { x: -10, opacity: 0 },
    animate: { x: [0, 0], opacity: [0, 1], transition: { duration: 1.5, repeat: Infinity, ease: "easeOut", repeatDelay: 0.5 } },
  };

  const ringVariants: Variants = {
    idle: { scale: 1, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r={9} custom={2} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r={6} custom={1} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r={3} custom={0} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <circle cx="12" cy="12" r={1.5} fill={color} />
      <motion.g variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <line x1="3" y1="12" x2="12" y2="12" strokeWidth={2} />
        <polyline points="8,8 3,12 8,16" strokeWidth={2} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// 19. Journey Memory - Brain with glow
// ============================================================================

export function JourneyMemoryIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const brainVariants: Variants = {
    idle: { scale: 1, opacity: 0.3 },
    animate: { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  };

  const synapseVariants: Variants = {
    idle: { opacity: 0.5 },
    animate: (i: number) => ({
      opacity: [0.5, 1, 0.5],
      scale: [1, 1.2, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.ellipse cx="12" cy="12" rx="9" ry="8" fill={color} variants={brainVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 .597-.197 1.148-.53 1.593m0 0A3 3 0 0 1 15 13a3 3 0 0 1-6 0 3 3 0 0 1 1.03-2.407z" />
      <path d="M12 2a10 10 0 0 0-9.95 9M12 22a10 10 0 0 1-9.95-9" opacity={0.5} />
      <path d="M12 2a10 10 0 0 1 9.95 9M12 22a10 10 0 0 0 9.95-9" opacity={0.5} />
      <motion.circle cx="8" cy="10" r={1} fill={color} custom={0} variants={synapseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="16" cy="10" r={1} fill={color} custom={1} variants={synapseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="14" r={1} fill={color} custom={2} variants={synapseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// 20. Journey Progress - Path/road animation
// ============================================================================

export function JourneyProgressIcon({ size = 24, color = "#f97316", isAnimating = true, className, style }: AnimatedIconProps) {
  const pathVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: { pathLength: [0, 1], opacity: [0, 1, 1], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  };

  const markerVariants: Variants = {
    idle: { scale: 1, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.5 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 20c3-6 9-6 9-12 0 6 6 6 9 12" opacity={0.3} />
      <motion.path d="M3 20c3-6 9-6 9-12 0 6 6 6 9 12" strokeWidth={2} variants={pathVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="3" cy="20" r={2} fill={color} custom={0} variants={markerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="8" r={2} fill={color} custom={1} variants={markerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="21" cy="20" r={2} fill={color} custom={2} variants={markerVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <line x1="3" y1="20" x2="3" y2="22" opacity={0.5} />
      <line x1="12" y1="8" x2="12" y2="6" opacity={0.5} />
      <line x1="21" y1="20" x2="21" y2="22" opacity={0.5} />
    </motion.svg>
  );
}

// ============================================================================
// Export all icons as a collection
// ============================================================================

export const AppIconsGroup1 = {
  // Main App
  MainDashboard: MainDashboardIcon,
  MainHome: MainHomeIcon,
  MainHub: MainHubIcon,
  MainOverview: MainOverviewIcon,
  MainSuite: MainSuiteIcon,
  MainNotifications: MainNotificationsIcon,
  MainSearch: MainSearchIcon,
  MainSettings: MainSettingsIcon,
  MainStats: MainStatsIcon,
  MainApps: MainAppsIcon,

  // Notes App
  NotesWrite: NotesWriteIcon,
  NotesSticky: NotesStickyIcon,
  NotesDocument: NotesDocumentIcon,
  NotesIdeas: NotesIdeasIcon,
  NotesColors: NotesColorsIcon,
  NotesBookmark: NotesBookmarkIcon,
  NotesPin: NotesPinIcon,
  NotesTag: NotesTagIcon,
  NotesSearch: NotesSearchIcon,
  NotesArchive: NotesArchiveIcon,

  // Journey App
  JourneyMood: JourneyMoodIcon,
  JourneyJournal: JourneyJournalIcon,
  JourneyEmotions: JourneyEmotionsIcon,
  JourneyReflection: JourneyReflectionIcon,
  JourneyMindfulness: JourneyMindfulnessIcon,
  JourneyCalendar: JourneyCalendarIcon,
  JourneyGratitude: JourneyGratitudeIcon,
  JourneyGoals: JourneyGoalsIcon,
  JourneyMemory: JourneyMemoryIcon,
  JourneyProgress: JourneyProgressIcon,
} as const;

export type AppIconGroup1Name = keyof typeof AppIconsGroup1;
