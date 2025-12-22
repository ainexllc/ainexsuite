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
// PROJECTS APP ICONS (#6366f1)
// ============================================================================

// 1. Projects - Folder with documents
// ============================================================================

export function ProjectsFolderIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const paperVariants: Variants = {
    idle: { y: 0, opacity: 1 },
    animate: (i: number) => ({
      y: [0, -3, 0],
      opacity: [1, 0.7, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      {[0, 1, 2].map((i) => (
        <motion.line key={i} x1={8 + i * 2} y1={14} x2={8 + i * 2 + 4} y2={14} custom={i} variants={paperVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// 2. Kanban - Moving cards across columns
// ============================================================================

export function ProjectsKanbanIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const cardVariants: Variants = {
    idle: { x: 0, opacity: 1 },
    animate: {
      x: [0, 6, 0],
      opacity: [1, 0.6, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="4" width="6" height="16" rx="1" />
      <rect x="10" y="4" width="6" height="16" rx="1" />
      <rect x="18" y="4" width="4" height="16" rx="1" />
      <motion.rect x="3.5" y="6" width="3" height="3" rx="0.5" fill={color} stroke="none" variants={cardVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <line x1="3.5" y1="11" x2="6.5" y2="11" opacity={0.5} />
      <line x1="3.5" y1="13" x2="6.5" y2="13" opacity={0.5} />
    </motion.svg>
  );
}

// 3. Milestones - Progress flag waving
// ============================================================================

export function ProjectsMilestoneIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const flagVariants: Variants = {
    idle: { scaleX: 1 },
    animate: {
      scaleX: [1, 0.95, 1],
      skewY: [0, 2, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="4" y1="22" x2="4" y2="2" />
      <motion.path d="M4 4c2 0 4-1 8-1s6 1 8 1v10c-2 0-4-1-8-1s-6 1-8 1V4z" fill={color} fillOpacity={0.2} stroke={color} style={{ originX: "4px", originY: "9px" }} variants={flagVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 4. Teams - People collaborating
// ============================================================================

export function ProjectsTeamIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const personVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g custom={0} variants={personVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <circle cx="12" cy="8" r="3" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </motion.g>
      <motion.g custom={1} variants={personVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "18px", originY: "12px" }}>
        <circle cx="18" cy="7" r="2" opacity={0.6} />
        <path d="M22 21v-1a3 3 0 0 0-3-3" opacity={0.6} />
      </motion.g>
      <motion.g custom={2} variants={personVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "6px", originY: "12px" }}>
        <circle cx="6" cy="7" r="2" opacity={0.6} />
        <path d="M2 21v-1a3 3 0 0 1 3-3" opacity={0.6} />
      </motion.g>
    </motion.svg>
  );
}

// 5. Deliverables - Package being checked
// ============================================================================

export function ProjectsDeliverableIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const checkVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 2 },
    },
  };

  const boxVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 0.95, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={boxVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.3 7l8.7 5 8.7-5M12 22.1V12" />
      </motion.g>
      <motion.path d="M9 11l2 2 4-4" stroke={color} strokeWidth={2} variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 6. Tasks - Task card with checkmark
// ============================================================================

export function ProjectsTaskIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const checkVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1.5 },
    },
  };

  const cardVariants: Variants = {
    idle: { y: 0 },
    animate: {
      y: [0, -2, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={cardVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <rect x="4" y="4" width="16" height="16" rx="2" fill={color} fillOpacity={0.1} />
        <line x1="8" y1="12" x2="16" y2="12" opacity={0.3} />
        <line x1="8" y1="16" x2="14" y2="16" opacity={0.3} />
        <motion.path d="M7 8l2 2 4-4" strokeWidth={2} variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      </motion.g>
    </motion.svg>
  );
}

// 7. Timeline - Gantt chart bars
// ============================================================================

export function ProjectsTimelineIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleX: 0.6 },
    animate: (i: number) => ({
      scaleX: [0.6, 1, 0.6],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="2" y1="9" x2="22" y2="9" opacity={0.3} />
      <line x1="2" y1="15" x2="22" y2="15" opacity={0.3} />
      <motion.rect x="5" y="6" width="8" height="2" rx="0.5" fill={color} style={{ originX: "9px" }} custom={0} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="8" y="12" width="10" height="2" rx="0.5" fill={color} style={{ originX: "13px" }} custom={1} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="4" y="18" width="12" height="2" rx="0.5" fill={color} style={{ originX: "10px" }} custom={2} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 8. Budget - Dollar/coin animation
// ============================================================================

export function ProjectsBudgetIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const coinVariants: Variants = {
    idle: { y: 0, opacity: 1 },
    animate: (i: number) => ({
      y: [0, -4, 0],
      opacity: [1, 0.7, 1],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  const dollarVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="9" custom={0} variants={coinVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.g variants={dollarVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <path d="M12 6v12M15 9.5a3.5 3.5 0 0 0-3.5-3.5h-1a3.5 3.5 0 0 0 0 7h3a3.5 3.5 0 0 1 0 7h-1a3.5 3.5 0 0 1-3.5-3.5" />
      </motion.g>
      <motion.circle cx="18" cy="6" r="2" fill={color} fillOpacity={0.3} custom={1} variants={coinVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="6" cy="18" r="1.5" fill={color} fillOpacity={0.3} custom={2} variants={coinVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 9. Document - Document with badge
// ============================================================================

export function ProjectsDocumentIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const badgeVariants: Variants = {
    idle: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const lineVariants: Variants = {
    idle: { scaleX: 0 },
    animate: (i: number) => ({
      scaleX: [0, 1],
      transition: { duration: 0.8, repeat: Infinity, delay: i * 0.2, repeatDelay: 1.5 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <motion.line x1="8" y1="13" x2="16" y2="13" style={{ originX: "8px" }} custom={0} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="8" y1="17" x2="14" y2="17" style={{ originX: "8px" }} custom={1} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="18" cy="16" r="3" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} variants={badgeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "18px", originY: "16px" }} />
      <motion.path d="M16.5 16l0.5 0.5 1.5-1.5" stroke={color} strokeWidth={1.5} variants={badgeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "18px", originY: "16px" }} />
    </motion.svg>
  );
}

// 10. Status - Status indicator dots
// ============================================================================

export function ProjectsStatusIcon({ size = 24, color = "#6366f1", isAnimating = true, className, style }: AnimatedIconProps) {
  const dotVariants: Variants = {
    idle: { scale: 1, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  const ringVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: (i: number) => ({
      scale: [1, 2],
      opacity: [0.5, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" opacity={0.3} />
      <motion.circle cx="8" cy="6" r="1.5" fill="#10b981" stroke="none" custom={0} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="8" cy="6" r="1.5" stroke="#10b981" fill="none" custom={0} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="14" r="1.5" fill="#eab308" stroke="none" custom={1} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="14" r="1.5" stroke="#eab308" fill="none" custom={1} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="16" cy="18" r="1.5" fill={color} stroke="none" custom={2} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="16" cy="18" r="1.5" stroke={color} fill="none" custom={2} variants={ringVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// ============================================================================
// WORKFLOW APP ICONS (#06b6d4)
// ============================================================================

// 1. Automation - Gear spinning
// ============================================================================

export function WorkflowAutomationIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g animate={isAnimating ? { rotate: 360 } : {}} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ originX: "12px", originY: "12px" }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" fill={color} fillOpacity={0.2} />
      </motion.g>
    </motion.svg>
  );
}

// 2. Flows - Data flowing through pipes
// ============================================================================

export function WorkflowFlowIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const flowVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1, 1, 0],
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <path d="M3 12h7l3-6 4 12 3-6h3" opacity={0.3} />
      <motion.path d="M3 12h7l3-6 4 12 3-6h3" variants={flowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} strokeWidth={2} />
      <circle cx="3" cy="12" r="2" fill={color} />
      <circle cx="21" cy="12" r="2" fill={color} />
    </motion.svg>
  );
}

// 3. Nodes - Network nodes connecting
// ============================================================================

export function WorkflowNodeIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const nodeVariants: Variants = {
    idle: { scale: 1, opacity: 0.8 },
    animate: (i: number) => ({
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  const lineVariants: Variants = {
    idle: { pathLength: 1, opacity: 0.5 },
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
      <motion.line x1="12" y1="5" x2="7" y2="12" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="12" y1="5" x2="17" y2="12" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="7" y1="12" x2="12" y2="19" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="17" y1="12" x2="12" y2="19" stroke={color} strokeWidth={1.5} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="5" r="2.5" fill={color} stroke="none" custom={0} variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="7" cy="12" r="2.5" fill={color} stroke="none" custom={1} variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="17" cy="12" r="2.5" fill={color} stroke="none" custom={2} variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="19" r="2.5" fill={color} stroke="none" custom={3} variants={nodeVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 4. Connections - Linking nodes
// ============================================================================

export function WorkflowConnectionIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const linkVariants: Variants = {
    idle: { pathLength: 1, opacity: 1 },
    animate: {
      pathLength: [0, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const pulseVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.3, 1],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M8.5 7.5L15.5 16.5" opacity={0.3} />
      <motion.path d="M8.5 7.5L15.5 16.5" strokeWidth={2} variants={linkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="1.5" fill={color} stroke="none" variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 5. Processes - Sequential steps
// ============================================================================

export function WorkflowProcessIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const stepVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: (i: number) => ({
      opacity: [0.3, 1, 0.3],
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  const arrowVariants: Variants = {
    idle: { x: 0, opacity: 0.5 },
    animate: {
      x: [0, 3, 0],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.rect x="2" y="9" width="5" height="6" rx="1" fill={color} fillOpacity={0.2} custom={0} variants={stepVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="9.5" y="9" width="5" height="6" rx="1" fill={color} fillOpacity={0.2} custom={1} variants={stepVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="17" y="9" width="5" height="6" rx="1" fill={color} fillOpacity={0.2} custom={2} variants={stepVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M7.5 12h1.5M15 12h1.5" variants={arrowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 6. Trigger - Lightning trigger bolt
// ============================================================================

export function WorkflowTriggerIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const boltVariants: Variants = {
    idle: { opacity: 1, scale: 1 },
    animate: {
      opacity: [1, 0.6, 1],
      scale: [1, 1.1, 1],
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const glowVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: {
      scale: [1, 1.5],
      opacity: [0.6, 0],
      transition: { duration: 1, repeat: Infinity, ease: "easeOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="9" opacity={0.2} />
      <motion.path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} variants={boltVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.circle cx="12" cy="12" r="6" stroke={color} fill="none" strokeWidth={2} variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 7. Condition - Diamond decision shape
// ============================================================================

export function WorkflowConditionIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const diamondVariants: Variants = {
    idle: { rotate: 0, scale: 1 },
    animate: {
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const pathVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: (i: number) => ({
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.5, repeatDelay: 1.5 },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.path d="M12 2l10 10-10 10L2 12 12 2z" fill={color} fillOpacity={0.1} stroke={color} strokeWidth={2} variants={diamondVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.path d="M12 8v8M8 12h8" strokeWidth={2} custom={0} variants={pathVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="8" r="1" fill={color} stroke="none" custom={1} variants={pathVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="16" r="1" fill={color} stroke="none" custom={1} variants={pathVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 8. Action - Play arrow action
// ============================================================================

export function WorkflowActionIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const playVariants: Variants = {
    idle: { x: 0, scale: 1 },
    animate: {
      x: [0, 2, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const circleVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.circle cx="12" cy="12" r="10" variants={circleVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.path d="M10 8l6 4-6 4V8z" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={1.5} variants={playVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.line x1="16" y1="12" x2="19" y2="12" strokeWidth={2} opacity={0.5} variants={playVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 9. Loop - Loop arrows animation
// ============================================================================

export function WorkflowLoopIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const loopVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 3, repeat: Infinity, ease: "linear" },
    },
  };

  const dotVariants: Variants = {
    idle: { scale: 1, opacity: 0.6 },
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.6, 1, 0.6],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={loopVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" strokeWidth={2} />
        <path d="M21 3v5h-5" />
      </motion.g>
      <motion.circle cx="12" cy="3" r="1.5" fill={color} stroke="none" custom={0} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="21" cy="12" r="1.5" fill={color} stroke="none" custom={1} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 10. Integration - Puzzle pieces connecting
// ============================================================================

export function WorkflowIntegrationIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const piece1Variants: Variants = {
    idle: { x: -2, y: -2 },
    animate: {
      x: 0,
      y: 0,
      transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
    },
  };

  const piece2Variants: Variants = {
    idle: { x: 2, y: 2 },
    animate: {
      x: 0,
      y: 0,
      transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={piece1Variants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M4 4h6v6H8a2 2 0 0 0-2 2v2H4V4z" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
        <circle cx="10" cy="7" r="1.5" fill={color} />
      </motion.g>
      <motion.g variants={piece2Variants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M14 10h6v10h-6v-2a2 2 0 0 0-2-2h-2v-6h2a2 2 0 0 0 2-2v-1z" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
        <circle cx="14" cy="15" r="1.5" fill={color} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// CALENDAR APP ICONS (#06b6d4)
// ============================================================================

// 1. Calendar - Page flip animation
// ============================================================================

export function CalendarGridIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const flipVariants: Variants = {
    idle: { rotateX: 0 },
    animate: {
      rotateX: [0, 10, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={{ perspective: 400, ...style }}>
      <motion.g variants={flipVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ transformOrigin: "center" }}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="9" y1="4" x2="9" y2="10" />
        <line x1="15" y1="4" x2="15" y2="10" />
        <line x1="9" y1="14" x2="9" y2="20" />
        <line x1="15" y1="14" x2="15" y2="20" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
      </motion.g>
    </motion.svg>
  );
}

// 2. Events - Bouncing event marker
// ============================================================================

export function CalendarEventIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const dotVariants: Variants = {
    idle: { scale: 1, y: 0 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      y: [0, -2, 0],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <motion.circle cx="8" cy="14" r="1.5" fill={color} stroke="none" custom={0} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="14" r="1.5" fill={color} stroke="none" custom={1} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="16" cy="18" r="1.5" fill={color} stroke="none" custom={2} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 3. Scheduling - Clock hands moving
// ============================================================================

export function CalendarScheduleIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const hourHandVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 8, repeat: Infinity, ease: "linear" },
    },
  };

  const minuteHandVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <circle cx="12" cy="12" r="9" />
      {[0, 90, 180, 270].map((angle) => (
        <circle key={angle} cx={12 + 7 * Math.cos((angle * Math.PI) / 180)} cy={12 + 7 * Math.sin((angle * Math.PI) / 180)} r="0.5" fill={color} />
      ))}
      <motion.line x1="12" y1="12" x2="12" y2="7" strokeWidth={2} variants={hourHandVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.line x1="12" y1="12" x2="16" y2="12" strokeWidth={1.5} variants={minuteHandVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </motion.svg>
  );
}

// 4. Time - Hourglass sand flowing
// ============================================================================

export function CalendarTimeIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const sandVariants: Variants = {
    idle: { y: 0, scaleY: 1 },
    animate: {
      y: [0, 6],
      scaleY: [1, 0.3],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const rotateVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 180,
      transition: { duration: 3, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={rotateVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <path d="M8 2h8M8 22h8M8 2c0 4.4-3.6 8-8 8M16 2c0 4.4 3.6 8 8 8M8 22c0-4.4-3.6-8-8-8M16 22c0-4.4 3.6-8 8-8" />
        <motion.path d="M10 8h4v3l-2 1-2-1V8z" fill={color} fillOpacity={0.5} variants={sandVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originY: "8px" }} />
      </motion.g>
    </motion.svg>
  );
}

// 5. Appointments - Bell ringing
// ============================================================================

export function CalendarAppointmentIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const bellVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: [-15, 15, -10, 10, 0],
      transition: { duration: 1, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" },
    },
  };

  const waveVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: (i: number) => ({
      scale: [1, 1.5],
      opacity: [0.8, 0],
      transition: { duration: 1, repeat: Infinity, delay: i * 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={bellVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "4px" }}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </motion.g>
      {[0, 1].map((i) => (
        <motion.circle key={i} cx="12" cy="8" r="8" stroke={color} strokeWidth={1} fill="none" custom={i} variants={waveVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// 6. Week - Week view animation
// ============================================================================

export function CalendarWeekIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const columnVariants: Variants = {
    idle: { opacity: 0.3 },
    animate: (i: number) => ({
      opacity: [0.3, 1, 0.3],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  const highlightVariants: Variants = {
    idle: { scaleY: 0 },
    animate: {
      scaleY: [0, 1, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.line key={i} x1={5 + i * 2.3} y1={10} x2={5 + i * 2.3} y2={22} opacity={0.3} custom={i} variants={columnVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <motion.rect x="11" y="12" width="2" height="8" rx="0.5" fill={color} fillOpacity={0.3} style={{ originY: "16px" }} variants={highlightVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 7. Reminder - Bell with calendar
// ============================================================================

export function CalendarReminderIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const bellVariants: Variants = {
    idle: { rotate: 0, y: 0 },
    animate: {
      rotate: [-10, 10, -10, 10, 0],
      y: [0, -2, 0],
      transition: { duration: 1.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" },
    },
  };

  const dotVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.5, 1],
      opacity: [1, 0.5, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="6" width="12" height="14" rx="2" />
      <line x1="3" y1="11" x2="15" y2="11" />
      <line x1="13" y1="4" x2="13" y2="8" />
      <line x1="5" y1="4" x2="5" y2="8" />
      <motion.g variants={bellVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "18px", originY: "16px" }}>
        <path d="M21 15a3 3 0 0 0-3-3 3 3 0 0 0-3 3c0 3.5-1.5 4.5-1.5 4.5h9s-1.5-1-1.5-4.5" />
        <path d="M18.7 21.5a1 1 0 0 1-1.4 0" />
      </motion.g>
      <motion.circle cx="18" cy="12" r="2" fill={color} stroke="none" variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 8. Recurring - Repeat circular arrows
// ============================================================================

export function CalendarRecurringIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const rotateVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 3, repeat: Infinity, ease: "linear" },
    },
  };

  const calendarVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 0.95, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={calendarVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "13px" }}>
        <rect x="5" y="6" width="14" height="14" rx="2" />
        <line x1="5" y1="11" x2="19" y2="11" />
        <line x1="15" y1="4" x2="15" y2="8" />
        <line x1="9" y1="4" x2="9" y2="8" />
      </motion.g>
      <motion.g variants={rotateVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "15px" }}>
        <path d="M14 13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2" opacity={0.6} />
        <path d="M10 15l-1-1M14 15l1-1" strokeWidth={2} />
      </motion.g>
    </motion.svg>
  );
}

// 9. Today - "Today" highlight pulse
// ============================================================================

export function CalendarTodayIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const pulseVariants: Variants = {
    idle: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.7, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const glowVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: {
      scale: [1, 1.5],
      opacity: [0.5, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <circle cx="8" cy="14" r="0.5" fill={color} opacity={0.3} />
      <circle cx="12" cy="14" r="0.5" fill={color} opacity={0.3} />
      <circle cx="16" cy="14" r="0.5" fill={color} opacity={0.3} />
      <motion.circle cx="12" cy="18" r="2.5" fill={color} fillOpacity={0.2} stroke={color} strokeWidth={2} variants={pulseVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "18px" }} />
      <motion.circle cx="12" cy="18" r="2.5" stroke={color} fill="none" variants={glowVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 10. Sync - Sync arrows rotating
// ============================================================================

export function CalendarSyncIcon({ size = 24, color = "#06b6d4", isAnimating = true, className, style }: AnimatedIconProps) {
  const syncVariants: Variants = {
    idle: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  const calendarVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={calendarVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <line x1="4" y1="10" x2="20" y2="10" />
        <line x1="15" y1="2" x2="15" y2="6" />
        <line x1="9" y1="2" x2="9" y2="6" />
      </motion.g>
      <motion.g variants={syncVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "14px" }}>
        <path d="M15 12a3 3 0 0 1 0 6h-3" strokeWidth={2} />
        <path d="M9 16a3 3 0 0 1 0-6h3" strokeWidth={2} />
        <path d="M15 18l1.5-1.5L15 15M9 14L7.5 15.5 9 17" strokeWidth={2} />
      </motion.g>
    </motion.svg>
  );
}

// ============================================================================
// ADMIN APP ICONS (#64748b)
// ============================================================================

// 1. Settings - Gear rotating
// ============================================================================

export function AdminSettingsIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g animate={isAnimating ? { rotate: 360 } : {}} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ originX: "12px", originY: "12px" }}>
        <path d="M12 2a2 2 0 0 1 2 2c0 .74.4 1.39 1 1.73.6.35 1.37.24 1.86-.25l.85.85a2 2 0 0 1-.25 1.86c.35.6.99 1 1.73 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2c-.74 0-1.39.4-1.73 1-.35.6-.24 1.37.25 1.86l-.85.85a2 2 0 0 1-1.86-.25c-.6.35-1 .99-1 1.73a2 2 0 0 1-2 2 2 2 0 0 1-2-2c0-.74-.4-1.39-1-1.73-.6-.35-1.37-.24-1.86.25l-.85-.85a2 2 0 0 1 .25-1.86c-.35-.6-.99-1-1.73-1a2 2 0 0 1-2-2 2 2 0 0 1 2-2c.74 0 1.39-.4 1.73-1 .35-.6.24-1.37-.25-1.86l.85-.85a2 2 0 0 1 1.86.25c.6-.35 1-.99 1-1.73a2 2 0 0 1 2-2z" />
        <circle cx="12" cy="12" r="3" />
      </motion.g>
    </motion.svg>
  );
}

// 2. Admin - Shield with crown
// ============================================================================

export function AdminShieldIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const crownVariants: Variants = {
    idle: { y: 0, scale: 1 },
    animate: {
      y: [0, -2, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const shieldVariants: Variants = {
    idle: { scale: 1 },
    animate: {
      scale: [1, 1.02, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.path d="M12 2l8 4v6c0 5.5-3.8 10-8 11-4.2-1-8-5.5-8-11V6l8-4z" variants={shieldVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "12px" }} />
      <motion.g variants={crownVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <path d="M8 9l1.5-2L12 9l2.5-2L16 9l-1 4H9l-1-4z" fill={color} fillOpacity={0.2} />
      </motion.g>
    </motion.svg>
  );
}

// 3. Users - People cycling
// ============================================================================

export function AdminUsersIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const userVariants: Variants = {
    idle: { opacity: 1, scale: 1 },
    animate: (i: number) => ({
      opacity: [1, 0.5, 1],
      scale: [1, 0.95, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g custom={0} variants={userVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
      </motion.g>
      <motion.g custom={1} variants={userVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        <circle cx="17" cy="9" r="3" opacity={0.6} />
        <path d="M22 21v-1.5a3.5 3.5 0 0 0-3.5-3.5" opacity={0.6} />
      </motion.g>
    </motion.svg>
  );
}

// 4. Controls - Sliders adjusting
// ============================================================================

export function AdminControlsIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const sliderVariants: Variants = {
    idle: { x: 0 },
    animate: (i: number) => ({
      x: [0, 4, 0],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <motion.circle cx="8" cy="7" r="2" fill={color} custom={0} variants={sliderVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="14" cy="12" r="2" fill={color} custom={1} variants={sliderVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="10" cy="17" r="2" fill={color} custom={2} variants={sliderVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 5. Management - Dashboard with metrics
// ============================================================================

export function AdminManagementIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleY: 1 },
    animate: (i: number) => ({
      scaleY: [0.6, 1, 0.6],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  const lineVariants: Variants = {
    idle: { pathLength: 1 },
    animate: {
      pathLength: [0, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="9" x2="9" y2="21" />
      {[12, 15, 18].map((x, i) => (
        <motion.rect key={i} x={x} y={16} width={2} height={4} rx={0.5} fill={color} style={{ originY: "20px" }} custom={i} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <motion.path d="M4.5 6h4M14 6h4" opacity={0.3} />
      <motion.path d="M12 13l2 2 3-3" variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 6. Database - Database cylinders
// ============================================================================

export function AdminDatabaseIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const cylinderVariants: Variants = {
    idle: { scaleY: 1 },
    animate: (i: number) => ({
      scaleY: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" },
    }),
  };

  const dataVariants: Variants = {
    idle: { x: 0, opacity: 0 },
    animate: {
      x: [0, 10],
      opacity: [0, 1, 0],
      transition: { duration: 2, repeat: Infinity, ease: "linear" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g custom={0} variants={cylinderVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originY: "12px" }}>
        <ellipse cx="12" cy="5" rx="8" ry="3" fill={color} fillOpacity={0.1} />
        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
      </motion.g>
      <motion.circle cx="6" cy="10" r="1" fill={color} variants={dataVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="8" cy="17" r="1" fill={color} variants={dataVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 7. Logs - Log lines scrolling
// ============================================================================

export function AdminLogsIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const lineVariants: Variants = {
    idle: { y: 0, opacity: 1 },
    animate: (i: number) => ({
      y: [0, 20],
      opacity: [1, 0],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "linear" },
    }),
  };

  const scrollVariants: Variants = {
    idle: { y: 0 },
    animate: {
      y: [0, 10, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="7" y1="7" x2="17" y2="7" opacity={0.3} />
      <motion.g variants={scrollVariants} initial="idle" animate={isAnimating ? "animate" : "idle"}>
        {[0, 1, 2, 3].map((i) => (
          <motion.line key={i} x1="7" y1={10 + i * 3} x2={13 + i * 2} y2={10 + i * 3} custom={i} variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
        ))}
      </motion.g>
      <circle cx="5" cy="10" r="0.5" fill={color} />
      <circle cx="5" cy="13" r="0.5" fill={color} />
      <circle cx="5" cy="16" r="0.5" fill={color} />
    </motion.svg>
  );
}

// 8. API - API brackets animation
// ============================================================================

export function AdminAPIIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const bracketVariants: Variants = {
    idle: { x: 0, opacity: 1 },
    animate: (i: number) => ({
      x: i === 0 ? [-2, 0] : [2, 0],
      opacity: [0.5, 1],
      transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
    }),
  };

  const dotVariants: Variants = {
    idle: { scale: 1, opacity: 0.5 },
    animate: (i: number) => ({
      scale: [1, 1.3, 1],
      opacity: [0.5, 1, 0.5],
      transition: { duration: 1.5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="4" y="4" width="16" height="16" rx="2" opacity={0.2} />
      <motion.path d="M8 6L3 12l5 6" strokeWidth={2} custom={0} variants={bracketVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.path d="M16 6l5 6-5 6" strokeWidth={2} custom={1} variants={bracketVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="10" cy="12" r="1" fill={color} custom={0} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="12" cy="12" r="1" fill={color} custom={1} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.circle cx="14" cy="12" r="1" fill={color} custom={2} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 9. Security - Lock with checkmark
// ============================================================================

export function AdminSecurityIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const lockVariants: Variants = {
    idle: { y: 0, scale: 1 },
    animate: {
      y: [0, -2, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const checkVariants: Variants = {
    idle: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: [0, 1],
      opacity: [0, 1],
      transition: { duration: 0.8, repeat: Infinity, repeatDelay: 2 },
    },
  };

  const shieldVariants: Variants = {
    idle: { scale: 1, opacity: 0 },
    animate: {
      scale: [1, 1.3],
      opacity: [0.3, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeOut" },
    },
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <motion.g variants={lockVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} style={{ originX: "12px", originY: "15px" }}>
        <rect x="5" y="11" width="14" height="11" rx="2" fill={color} fillOpacity={0.1} />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </motion.g>
      <motion.path d="M9 15l2 2 4-4" strokeWidth={2} variants={checkVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      <motion.rect x="5" y="11" width="14" height="11" rx="2" stroke={color} fill="none" variants={shieldVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
    </motion.svg>
  );
}

// 10. Analytics - Dashboard charts
// ============================================================================

export function AdminAnalyticsIcon({ size = 24, color = "#64748b", isAnimating = true, className, style }: AnimatedIconProps) {
  const barVariants: Variants = {
    idle: { scaleY: 0.5 },
    animate: (i: number) => ({
      scaleY: [0.5, 1, 0.5],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  const lineVariants: Variants = {
    idle: { pathLength: 0 },
    animate: {
      pathLength: [0, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const dotVariants: Variants = {
    idle: { scale: 1 },
    animate: (i: number) => ({
      scale: [1, 1.5, 1],
      transition: { duration: 2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" },
    }),
  };

  return (
    <motion.svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="2" y1="12" x2="22" y2="12" opacity={0.2} />
      <line x1="2" y1="17" x2="22" y2="17" opacity={0.2} />
      {[0, 1, 2, 3].map((i) => (
        <motion.rect key={i} x={4 + i * 4} y={14} width="2" height={6 - i} rx={0.5} fill={color} fillOpacity={0.6} style={{ originY: "20px" }} custom={i} variants={barVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
      <motion.path d="M15 9l2-2 2 2 2-2" variants={lineVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={17 + i * 2} cy={7 + (i === 1 ? -2 : 0) + (i === 2 ? 2 : 0)} r="0.8" fill={color} custom={i} variants={dotVariants} initial="idle" animate={isAnimating ? "animate" : "idle"} />
      ))}
    </motion.svg>
  );
}

// ============================================================================
// Export all icons as collections
// ============================================================================

export const ProjectsIcons = {
  Folder: ProjectsFolderIcon,
  Kanban: ProjectsKanbanIcon,
  Milestone: ProjectsMilestoneIcon,
  Team: ProjectsTeamIcon,
  Deliverable: ProjectsDeliverableIcon,
  Task: ProjectsTaskIcon,
  Timeline: ProjectsTimelineIcon,
  Budget: ProjectsBudgetIcon,
  Document: ProjectsDocumentIcon,
  Status: ProjectsStatusIcon,
} as const;

export const WorkflowIcons = {
  Automation: WorkflowAutomationIcon,
  Flow: WorkflowFlowIcon,
  Node: WorkflowNodeIcon,
  Connection: WorkflowConnectionIcon,
  Process: WorkflowProcessIcon,
  Trigger: WorkflowTriggerIcon,
  Condition: WorkflowConditionIcon,
  Action: WorkflowActionIcon,
  Loop: WorkflowLoopIcon,
  Integration: WorkflowIntegrationIcon,
} as const;

export const CalendarIcons = {
  Grid: CalendarGridIcon,
  Event: CalendarEventIcon,
  Schedule: CalendarScheduleIcon,
  Time: CalendarTimeIcon,
  Appointment: CalendarAppointmentIcon,
  Week: CalendarWeekIcon,
  Reminder: CalendarReminderIcon,
  Recurring: CalendarRecurringIcon,
  Today: CalendarTodayIcon,
  Sync: CalendarSyncIcon,
} as const;

export const AdminIcons = {
  Settings: AdminSettingsIcon,
  Shield: AdminShieldIcon,
  Users: AdminUsersIcon,
  Controls: AdminControlsIcon,
  Management: AdminManagementIcon,
  Database: AdminDatabaseIcon,
  Logs: AdminLogsIcon,
  API: AdminAPIIcon,
  Security: AdminSecurityIcon,
  Analytics: AdminAnalyticsIcon,
} as const;

export const AppIconsGroup4 = {
  Projects: ProjectsIcons,
  Workflow: WorkflowIcons,
  Calendar: CalendarIcons,
  Admin: AdminIcons,
} as const;

export type ProjectsIconName = keyof typeof ProjectsIcons;
export type WorkflowIconName = keyof typeof WorkflowIcons;
export type CalendarIconName = keyof typeof CalendarIcons;
export type AdminIconName = keyof typeof AdminIcons;
