"use client";

import { useId } from "react";
import { motion, Variants } from "framer-motion";

interface MockupIconProps {
  size?: number;
  color?: string;
  isAnimating?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const defaultColor = "#f59e0b"; // amber-500

// ============================================================================
// CATEGORY 1: Wave/Sound Visualizations
// ============================================================================

/**
 * Mockup 1: Circular Sound Waves
 * Concentric circles pulsing outward from center
 */
export function CircularSoundWaves({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  const ringVariants: Variants = {
    idle: { scale: 0.3, opacity: 0 },
    animate: {
      scale: [0.3, 1.2],
      opacity: [0.8, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <circle cx="12" cy="12" r="3" fill={color} />
      {[0, 0.5, 1].map((delay, i) => (
        <motion.circle
          key={i}
          cx="12"
          cy="12"
          r="8"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          variants={ringVariants}
          initial="idle"
          animate={isAnimating ? "animate" : "idle"}
          style={{ originX: "12px", originY: "12px" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay,
          }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 2: Horizontal EQ Bars
 * 7 bars like an audio equalizer
 */
export function HorizontalEQBars({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  const barHeights = [0.4, 0.7, 0.5, 1, 0.6, 0.8, 0.45];
  const targetHeights = [0.6, 0.4, 0.9, 0.5, 0.8, 0.35, 0.7];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {barHeights.map((baseHeight, i) => {
        const x = 2 + i * 3;
        const maxHeight = 16;
        return (
          <motion.rect
            key={i}
            x={x}
            y={4}
            width={2}
            height={maxHeight}
            rx={1}
            fill={color}
            style={{ originY: "20px" }}
            initial={{ scaleY: baseHeight }}
            animate={
              isAnimating
                ? {
                    scaleY: [baseHeight, targetHeights[i], baseHeight],
                  }
                : { scaleY: baseHeight }
            }
            transition={{
              duration: 0.8 + i * 0.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.08,
            }}
          />
        );
      })}
    </motion.svg>
  );
}

/**
 * Mockup 3: Sine Wave Circle
 * Animated sine wave contained in a circle
 */
export function SineWaveCircle({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.3"
      />
      <motion.path
        d="M4 12 Q7 8, 10 12 T16 12 T22 12"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={
          isAnimating
            ? {
                pathOffset: [0, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        fill={color}
        animate={
          isAnimating
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 4: Radial Sound Burst
 * Lines radiating from center with pulse
 */
export function RadialSoundBurst({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  // Pre-calculated ray positions to avoid hydration mismatch from floating-point
  // 8 rays at 45-degree intervals, inner radius 5, outer radius 10 from center (12, 12)
  const rayData = [
    { x1: 17, y1: 12, x2: 22, y2: 12 },           // 0 degrees (right)
    { x1: 15.5, y1: 15.5, x2: 19.1, y2: 19.1 },   // 45 degrees
    { x1: 12, y1: 17, x2: 12, y2: 22 },           // 90 degrees (bottom)
    { x1: 8.5, y1: 15.5, x2: 4.9, y2: 19.1 },     // 135 degrees
    { x1: 7, y1: 12, x2: 2, y2: 12 },             // 180 degrees (left)
    { x1: 8.5, y1: 8.5, x2: 4.9, y2: 4.9 },       // 225 degrees
    { x1: 12, y1: 7, x2: 12, y2: 2 },             // 270 degrees (top)
    { x1: 15.5, y1: 8.5, x2: 19.1, y2: 4.9 },     // 315 degrees
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="4"
        fill={color}
        animate={
          isAnimating
            ? {
                scale: [1, 1.15, 1],
              }
            : {}
        }
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {rayData.map((ray, i) => (
        <motion.line
          key={i}
          x1={ray.x1}
          y1={ray.y1}
          x2={ray.x2}
          y2={ray.y2}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ opacity: 0.4, pathLength: 0.5 }}
          animate={
            isAnimating
              ? {
                  opacity: [0.4, 1, 0.4],
                  pathLength: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 5: Audio Waveform Ring
 * Waveform wrapped around a circle
 */
export function AudioWaveformRing({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  // Pre-calculated positions to avoid hydration mismatches from floating-point
  const positions = [
    { x: 12, y: 6 },
    { x: 15.1, y: 6.8 },
    { x: 17.2, y: 9 },
    { x: 18, y: 12 },
    { x: 17.2, y: 15 },
    { x: 15.1, y: 17.2 },
    { x: 12, y: 18 },
    { x: 8.9, y: 17.2 },
    { x: 6.8, y: 15 },
    { x: 6, y: 12 },
    { x: 6.8, y: 9 },
    { x: 8.9, y: 6.8 },
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.3"
        animate={
          isAnimating
            ? {
                rotate: 360,
              }
            : {}
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
      {/* Inner waveform bars in circular arrangement */}
      {positions.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={1}
          fill={color}
          animate={
            isAnimating
              ? {
                  r: [0.8, 1.5, 0.8],
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
      <circle cx="12" cy="12" r="2" fill={color} />
    </motion.svg>
  );
}

// ============================================================================
// CATEGORY 2: AI Brain/Neural
// ============================================================================

/**
 * Mockup 6: Pulsing Brain Outline
 * Brain silhouette with neural pulse effect
 */
export function PulsingBrainOutline({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Simplified brain shape */}
      <motion.path
        d="M12 4C8 4 5 7 5 10c0 1.5.5 2.8 1.3 3.8C5.5 15 5 16.5 5 18c0 1 .8 2 2 2h10c1.2 0 2-1 2-2 0-1.5-.5-3-1.3-4.2.8-1 1.3-2.3 1.3-3.8 0-3-3-6-7-6z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        animate={
          isAnimating
            ? {
                strokeWidth: [1.5, 2.5, 1.5],
                opacity: [0.7, 1, 0.7],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Neural activity dots */}
      {[
        { x: 9, y: 9 },
        { x: 15, y: 9 },
        { x: 12, y: 13 },
      ].map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r="1.5"
          fill={color}
          animate={
            isAnimating
              ? {
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 7: Neural Network Nodes
 * 3 connected nodes with data flow animation
 */
export function NeuralNetworkNodes({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  const nodes = [
    { x: 6, y: 8 },
    { x: 18, y: 8 },
    { x: 12, y: 18 },
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Connection lines */}
      <motion.path
        d="M6 8 L18 8 L12 18 Z"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.4"
        strokeDasharray="4 2"
        animate={
          isAnimating
            ? {
                strokeDashoffset: [0, -12],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.circle
          key={i}
          cx={node.x}
          cy={node.y}
          r="3"
          fill={color}
          animate={
            isAnimating
              ? {
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
      {/* Center glow */}
      <motion.circle
        cx="12"
        cy="11"
        r="2"
        fill={color}
        opacity="0.5"
        animate={
          isAnimating
            ? {
                scale: [0.8, 1.5, 0.8],
                opacity: [0.3, 0.7, 0.3],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 8: Circuit Mind
 * Microchip-style brain with glowing traces
 */
export function CircuitMind({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Outer chip frame */}
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
      />
      {/* Circuit traces */}
      <motion.path
        d="M8 8 h3 v3 h2 v3 M16 8 h-3 v6 M8 16 h8"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={
          isAnimating
            ? {
                pathLength: [0, 1, 1, 0],
              }
            : { pathLength: 1 }
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Connection pins */}
      {[2, 22, 2, 22].map((pos, i) => (
        <motion.circle
          key={i}
          cx={i < 2 ? pos : 12}
          cy={i < 2 ? 12 : pos}
          r="1.5"
          fill={color}
          animate={
            isAnimating
              ? {
                  opacity: [0.4, 1, 0.4],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
      {/* Center processor */}
      <motion.rect
        x="10"
        y="10"
        width="4"
        height="4"
        rx="0.5"
        fill={color}
        animate={
          isAnimating
            ? {
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 9: Synapse Spark
 * Two neurons with sparking connection
 */
export function SynapseSpark({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Left neuron */}
      <circle cx="6" cy="12" r="4" fill={color} opacity="0.7" />
      {/* Right neuron */}
      <circle cx="18" cy="12" r="4" fill={color} opacity="0.7" />
      {/* Spark connection */}
      <motion.path
        d="M10 12 L12 10 L14 14 L14 12"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          isAnimating
            ? {
                opacity: [0.3, 1, 0.3],
                pathLength: [0.5, 1, 0.5],
              }
            : {}
        }
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Spark particles */}
      {[
        { x: 11, y: 9 },
        { x: 13, y: 15 },
      ].map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r="1"
          fill={color}
          animate={
            isAnimating
              ? {
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }
              : {}
          }
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.3 + 0.2,
          }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 10: AI Core
 * Hexagonal core with orbiting particles
 */
export function AICore({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Hexagon core */}
      <motion.polygon
        points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        animate={
          isAnimating
            ? {
                scale: [1, 1.05, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
      {/* Inner hexagon */}
      <polygon
        points="12,7 16,9.5 16,14.5 12,17 8,14.5 8,9.5"
        fill={color}
        opacity="0.5"
      />
      {/* Orbiting particles */}
      {[0, 120, 240].map((angle, i) => (
        <motion.circle
          key={i}
          cx="12"
          cy="12"
          r="1.5"
          fill={color}
          animate={
            isAnimating
              ? {
                  rotate: [angle, angle + 360],
                  x: [0, 0],
                }
              : {}
          }
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            originX: "12px",
            originY: "12px",
            transform: `rotate(${angle}deg) translateX(8px)`,
          }}
        />
      ))}
      {/* Center dot */}
      <motion.circle
        cx="12"
        cy="12"
        r="2"
        fill={color}
        animate={
          isAnimating
            ? {
                opacity: [0.7, 1, 0.7],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

// ============================================================================
// CATEGORY 3: Microphone/Voice
// ============================================================================

/**
 * Mockup 11: Glowing Mic
 * Microphone icon with pulsing glow ring
 */
export function GlowingMic({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Glow rings */}
      {[1, 2].map((i) => (
        <motion.circle
          key={i}
          cx="12"
          cy="10"
          r={6 + i * 2}
          fill="none"
          stroke={color}
          strokeWidth="1"
          opacity="0.3"
          animate={
            isAnimating
              ? {
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
          style={{ originX: "12px", originY: "10px" }}
        />
      ))}
      {/* Mic body */}
      <motion.rect
        x="9"
        y="4"
        width="6"
        height="10"
        rx="3"
        fill={color}
        animate={
          isAnimating
            ? {
                opacity: [0.8, 1, 0.8],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Mic stand */}
      <path
        d="M12 16 v3 M8 19 h8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 12: Mic with Waves
 * Microphone emitting sound waves
 */
export function MicWithWaves({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Mic body */}
      <rect x="9" y="4" width="6" height="10" rx="3" fill={color} />
      {/* Mic stand */}
      <path
        d="M12 16 v3 M8 19 h8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Sound waves */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={i}
          d={`M${18 + i * 2} 7 Q${20 + i * 2} 10, ${18 + i * 2} 13`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={
            isAnimating
              ? {
                  opacity: [0, 1, 0],
                  pathLength: [0, 1, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.3,
          }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 13: Voice Bubble
 * Speech bubble with animated dots
 */
export function VoiceBubble({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Speech bubble */}
      <path
        d="M4 4 h16 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 h-10 l-4 4 v-4 h-2 a2 2 0 0 1 -2 -2 v-10 a2 2 0 0 1 2 -2"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Animated dots */}
      {[8, 12, 16].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy="11"
          r="1.5"
          fill={color}
          animate={
            isAnimating
              ? {
                  y: [0, -3, 0],
                  opacity: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 14: Soundwave Mic
 * Microphone made of soundwave lines
 */
export function SoundwaveMic({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Mic shape outline */}
      <path
        d="M6 10 a6 6 0 0 0 12 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Soundwave bars forming mic shape */}
      {[8, 10, 12, 14, 16].map((x, i) => {
        const heights = [6, 10, 12, 10, 6];
        return (
          <motion.rect
            key={i}
            x={x - 0.75}
            y={7 - heights[i] / 2 + 3}
            width="1.5"
            height={heights[i]}
            rx="0.75"
            fill={color}
            animate={
              isAnimating
                ? {
                    scaleY: [1, 0.6, 1],
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.1,
            }}
            style={{ originY: `${7 + 3}px` }}
          />
        );
      })}
      {/* Stand */}
      <path
        d="M12 16 v3 M8 19 h8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

// ============================================================================
// CATEGORY 4: Abstract/Modern
// ============================================================================

/**
 * Mockup 15: Morphing Orb
 * Liquid blob that morphs smoothly
 */
export function MorphingOrb({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <motion.path
        fill={color}
        animate={
          isAnimating
            ? {
                d: [
                  "M12 4 Q18 4 20 10 Q22 16 16 20 Q10 24 6 18 Q2 12 6 6 Q10 0 12 4",
                  "M12 3 Q20 5 21 12 Q22 19 14 21 Q6 23 3 15 Q0 7 8 4 Q16 1 12 3",
                  "M12 4 Q18 4 20 10 Q22 16 16 20 Q10 24 6 18 Q2 12 6 6 Q10 0 12 4",
                ],
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        opacity="0.8"
      />
      <motion.circle
        cx="12"
        cy="12"
        r="3"
        fill="white"
        opacity="0.5"
        animate={
          isAnimating
            ? {
                cx: [11, 13, 11],
                cy: [11, 13, 11],
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 16: Rotating Gradient Ring
 * Ring with animated gradient rotation
 */
export function RotatingGradientRing({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  const ringId = useId();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="50%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke={`url(#${ringId})`}
        strokeWidth="3"
        strokeLinecap="round"
        animate={
          isAnimating
            ? {
                rotate: 360,
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="4"
        fill={color}
        animate={
          isAnimating
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 17: Particle Swirl
 * Particles orbiting a center point
 */
export function ParticleSwirl({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  // Pre-calculated particle positions to avoid hydration mismatch from floating-point
  // 6 particles at 60-degree intervals, radius 7 from center (12, 12)
  const particleData = [
    { x: 19, y: 12, size: 1, opacity: 0.6 },       // 0 degrees
    { x: 15.5, y: 18.1, size: 1.5, opacity: 0.8 }, // 60 degrees
    { x: 8.5, y: 18.1, size: 2, opacity: 1 },      // 120 degrees
    { x: 5, y: 12, size: 1, opacity: 0.6 },        // 180 degrees
    { x: 8.5, y: 5.9, size: 1.5, opacity: 0.8 },   // 240 degrees
    { x: 15.5, y: 5.9, size: 2, opacity: 1 },      // 300 degrees
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Center core */}
      <motion.circle
        cx="12"
        cy="12"
        r="3"
        fill={color}
        animate={
          isAnimating
            ? {
                scale: [1, 1.15, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Orbiting particles */}
      <motion.g
        animate={
          isAnimating
            ? {
                rotate: 360,
              }
            : {}
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ originX: "12px", originY: "12px" }}
      >
        {particleData.map((particle, i) => (
          <motion.circle
            key={i}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={color}
            opacity={particle.opacity}
            animate={
              isAnimating
                ? {
                    r: [particle.size, particle.size * 1.5, particle.size],
                  }
                : {}
            }
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.g>
    </motion.svg>
  );
}

/**
 * Mockup 18: Breathing Circle
 * Circle that expands/contracts with glow
 */
export function BreathingCircle({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Outer glow */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill={color}
        opacity="0.15"
        animate={
          isAnimating
            ? {
                scale: [0.8, 1.1, 0.8],
                opacity: [0.1, 0.25, 0.1],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
      {/* Middle ring */}
      <motion.circle
        cx="12"
        cy="12"
        r="7"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.5"
        animate={
          isAnimating
            ? {
                scale: [0.9, 1.05, 0.9],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
      {/* Core */}
      <motion.circle
        cx="12"
        cy="12"
        r="4"
        fill={color}
        animate={
          isAnimating
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }
            : {}
        }
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
    </motion.svg>
  );
}

// ============================================================================
// CATEGORY 5: Hybrid/Unique
// ============================================================================

/**
 * Mockup 19: AI Eye with Soundwave
 * Eye icon with soundwave as pupil
 */
export function AIEyeSoundwave({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Eye outline */}
      <path
        d="M2 12 Q12 4 22 12 Q12 20 2 12"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Iris */}
      <circle cx="12" cy="12" r="5" fill={color} opacity="0.3" />
      {/* Soundwave pupil */}
      {[9, 12, 15].map((x, i) => (
        <motion.rect
          key={i}
          x={x - 0.75}
          y={10}
          width="1.5"
          height="4"
          rx="0.75"
          fill={color}
          animate={
            isAnimating
              ? {
                  scaleY: [0.5, 1, 0.5],
                }
              : {}
          }
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
          style={{ originY: "12px" }}
        />
      ))}
      {/* Scan line */}
      <motion.line
        x1="7"
        y1="12"
        x2="17"
        y2="12"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.5"
        animate={
          isAnimating
            ? {
                y1: [10, 14, 10],
                y2: [10, 14, 10],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 20: Magic Spark Mic
 * Microphone with sparkle animations
 */
export function MagicSparkMic({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  const sparkles = [
    { x: 6, y: 5, delay: 0 },
    { x: 18, y: 7, delay: 0.3 },
    { x: 5, y: 13, delay: 0.6 },
    { x: 19, y: 14, delay: 0.9 },
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Mic body with glow */}
      <motion.rect
        x="9"
        y="4"
        width="6"
        height="10"
        rx="3"
        fill={color}
        animate={
          isAnimating
            ? {
                filter: [
                  "drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))",
                  "drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))",
                  "drop-shadow(0 0 2px rgba(245, 158, 11, 0.5))",
                ],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Mic stand */}
      <path
        d="M12 16 v3 M8 19 h8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Sparkles */}
      {sparkles.map((spark, i) => (
        <motion.g key={i}>
          {/* 4-point star sparkle */}
          <motion.path
            d={`M${spark.x} ${spark.y - 2} L${spark.x} ${spark.y + 2} M${spark.x - 2} ${spark.y} L${spark.x + 2} ${spark.y}`}
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={
              isAnimating
                ? {
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }
                : {}
            }
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeOut",
              delay: spark.delay,
            }}
            style={{ originX: `${spark.x}px`, originY: `${spark.y}px` }}
          />
        </motion.g>
      ))}
    </motion.svg>
  );
}

// ============================================================================
// EXPORTS - All mockup icons
// ============================================================================

export const AIVoiceMockups = {
  // Category 1: Wave/Sound
  CircularSoundWaves,
  HorizontalEQBars,
  SineWaveCircle,
  RadialSoundBurst,
  AudioWaveformRing,
  // Category 2: AI Brain/Neural
  PulsingBrainOutline,
  NeuralNetworkNodes,
  CircuitMind,
  SynapseSpark,
  AICore,
  // Category 3: Microphone/Voice
  GlowingMic,
  MicWithWaves,
  VoiceBubble,
  SoundwaveMic,
  // Category 4: Abstract/Modern
  MorphingOrb,
  RotatingGradientRing,
  ParticleSwirl,
  BreathingCircle,
  // Category 5: Hybrid/Unique
  AIEyeSoundwave,
  MagicSparkMic,
};

export type AIVoiceMockupName = keyof typeof AIVoiceMockups;
