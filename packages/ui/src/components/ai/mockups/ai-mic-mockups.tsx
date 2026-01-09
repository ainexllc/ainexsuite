"use client";

import { useId } from "react";
import { motion } from "framer-motion";

interface MockupIconProps {
  size?: number;
  color?: string;
  isAnimating?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const defaultColor = "#f59e0b"; // amber-500

// ============================================================================
// MICROPHONE MOCKUPS - 20 Designs focused on "Click to Listen"
// ============================================================================

/**
 * Mockup 21: Classic Mic Pulse
 * Traditional microphone with pulsing rings indicating ready to listen
 */
export function ClassicMicPulse({
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
      {/* Pulse rings */}
      {[0, 0.4, 0.8].map((delay, i) => (
        <motion.circle
          key={i}
          cx="12"
          cy="9"
          r="8"
          fill="none"
          stroke={color}
          strokeWidth="1"
          initial={{ scale: 0.5, opacity: 0.8 }}
          animate={
            isAnimating
              ? {
                  scale: [0.5, 1.3],
                  opacity: [0.6, 0],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay,
            ease: "easeOut",
          }}
          style={{ originX: "12px", originY: "9px" }}
        />
      ))}
      {/* Mic body */}
      <rect x="9" y="2" width="6" height="11" rx="3" fill={color} />
      {/* Mic holder */}
      <path
        d="M6 9a6 6 0 0 0 12 0"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Stand */}
      <path
        d="M12 15v4M8 19h8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 22: Mic with Live Indicator
 * Microphone with a "LIVE" style dot indicator
 */
export function MicLiveIndicator({
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
      <rect x="8" y="3" width="6" height="10" rx="3" fill={color} />
      {/* Mic holder */}
      <path
        d="M5 10a6 6 0 0 0 12 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Stand */}
      <path
        d="M11 16v3M7 19h8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Live indicator dot */}
      <motion.circle
        cx="19"
        cy="5"
        r="3"
        fill="#ef4444"
        animate={
          isAnimating
            ? {
                scale: [1, 1.2, 1],
                opacity: [1, 0.6, 1],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Outer glow for live dot */}
      <motion.circle
        cx="19"
        cy="5"
        r="3"
        fill="none"
        stroke="#ef4444"
        strokeWidth="1"
        animate={
          isAnimating
            ? {
                scale: [1, 1.8],
                opacity: [0.5, 0],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{ originX: "19px", originY: "5px" }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 23: Podcast Mic
 * Professional podcast-style microphone
 */
export function PodcastMic({
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
      {/* Mic head (large round) */}
      <motion.circle
        cx="12"
        cy="8"
        r="6"
        fill="none"
        stroke={color}
        strokeWidth="2"
        animate={
          isAnimating
            ? {
                strokeWidth: [2, 2.5, 2],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Mic grille lines */}
      {[5, 8, 11].map((y, i) => (
        <motion.line
          key={i}
          x1="8"
          y1={y}
          x2="16"
          y2={y}
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.6"
          animate={
            isAnimating
              ? {
                  opacity: [0.4, 0.8, 0.4],
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
      {/* Stand arm */}
      <path
        d="M12 14v2l4 4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 24: Voice Assistant Circle
 * Circular design with mic icon and listening waves
 */
export function VoiceAssistantCircle({
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
      {/* Outer circle */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.4"
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
      {/* Inner filled circle */}
      <circle cx="12" cy="12" r="8" fill={color} opacity="0.2" />
      {/* Mini mic icon */}
      <rect x="10" y="7" width="4" height="6" rx="2" fill={color} />
      <path
        d="M8 11a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 15v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Listening waves on sides */}
      {[-1, 1].map((dir) => (
        <motion.path
          key={dir}
          d={`M${12 + dir * 8} 10 Q${12 + dir * 10} 12, ${12 + dir * 8} 14`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={
            isAnimating
              ? {
                  opacity: [0, 0.8, 0],
                  pathLength: [0, 1, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 25: Recording Mic
 * Microphone with recording indicator bars
 */
export function RecordingMic({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  const heights = [6, 10, 8, 5];
  const targetScales = [0.5, 0.7, 0.45, 0.8];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Mic body */}
      <rect x="8" y="2" width="5" height="10" rx="2.5" fill={color} />
      {/* Mic holder */}
      <path
        d="M5 9a5.5 5.5 0 0 0 11 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Stand */}
      <path d="M10.5 14v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {/* Recording level bars */}
      {[16, 18, 20, 22].map((x, i) => (
        <motion.rect
          key={i}
          x={x}
          y={12 - heights[i] / 2}
          width="1.5"
          height={heights[i]}
          rx="0.75"
          fill={color}
          animate={
            isAnimating
              ? {
                  scaleY: [1, targetScales[i], 1],
                }
              : {}
          }
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
          style={{ originY: "12px" }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 26: Siri-Style Waves
 * Animated waveform surrounding a mic
 */
export function SiriStyleMic({
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
      {/* Flowing wave background */}
      <motion.ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="8"
        fill={color}
        opacity="0.15"
        animate={
          isAnimating
            ? {
                ry: [8, 10, 8],
                rx: [10, 9, 10],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.ellipse
        cx="12"
        cy="12"
        rx="7"
        ry="5"
        fill={color}
        opacity="0.25"
        animate={
          isAnimating
            ? {
                ry: [5, 7, 5],
                rx: [7, 6, 7],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
      {/* Center mic */}
      <rect x="10" y="7" width="4" height="7" rx="2" fill={color} />
      <path
        d="M8 12a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 16v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 27: Tap to Speak
 * Hand/tap indicator with mic
 */
export function TapToSpeak({
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
      {/* Tap ripple */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="1"
        initial={{ scale: 0.5, opacity: 0.8 }}
        animate={
          isAnimating
            ? {
                scale: [0.5, 1.2],
                opacity: [0.6, 0],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeOut",
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
      {/* Mic icon */}
      <motion.g
        animate={
          isAnimating
            ? {
                scale: [1, 0.95, 1],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: "12px", originY: "12px" }}
      >
        <rect x="9" y="5" width="6" height="9" rx="3" fill={color} />
        <path
          d="M6 11a6 6 0 0 0 12 0"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 17v3"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </motion.g>
    </motion.svg>
  );
}

/**
 * Mockup 28: Frequency Mic
 * Mic with frequency visualization
 */
export function FrequencyMic({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  const baseHeights = [8, 14, 10, 6];
  const targetScales = [0.5, 0.35, 0.7, 0.55];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Mic body - left side */}
      <rect x="3" y="6" width="5" height="9" rx="2.5" fill={color} />
      <path
        d="M2 12a3.5 3.5 0 0 0 7 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.5 15v3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Frequency bars */}
      {[11, 14, 17, 20].map((x, i) => (
        <motion.rect
          key={i}
          x={x}
          y={12 - baseHeights[i] / 2}
          width="2"
          height={baseHeights[i]}
          rx="1"
          fill={color}
          animate={
            isAnimating
              ? {
                  scaleY: [1, targetScales[i], 1],
                }
              : {}
          }
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.12,
          }}
          style={{ originY: "12px" }}
        />
      ))}
    </motion.svg>
  );
}

/**
 * Mockup 29: Voice Recognition
 * Mic with circular voice pattern
 */
export function VoiceRecognition({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  // Pre-calculated positions for 6 dots at 60-degree intervals, radius 7
  const dotPositions = [
    { x: 19, y: 12 },     // 0 degrees
    { x: 15.5, y: 18.1 }, // 60 degrees
    { x: 8.5, y: 18.1 },  // 120 degrees
    { x: 5, y: 12 },      // 180 degrees
    { x: 8.5, y: 5.9 },   // 240 degrees
    { x: 15.5, y: 5.9 },  // 300 degrees
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Rotating dashed circle */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.5"
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
      {/* Processing dots around */}
      {dotPositions.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r="1.5"
          fill={color}
          animate={
            isAnimating
              ? {
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }
              : {}
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}
      {/* Center mic */}
      <rect x="10" y="8" width="4" height="5" rx="2" fill={color} />
      <path
        d="M9 12a3 3 0 0 0 6 0"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path d="M12 15v2" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </motion.svg>
  );
}

/**
 * Mockup 30: Alexa-Style Ring
 * Ring that lights up with listening animation
 */
export function AlexaStyleRing({
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
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Animated ring */}
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={`url(#${ringId})`}
        strokeWidth="2.5"
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
      {/* Center mic */}
      <rect x="10" y="7" width="4" height="7" rx="2" fill={color} />
      <path
        d="M8 11a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 15v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 31: Listening Ears
 * Mic with animated "ear" curves
 */
export function ListeningEars({
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
      {/* Left ear waves */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={`left-${i}`}
          d={`M${4 - i * 1.5} ${8 - i} Q${2 - i * 1.5} 12, ${4 - i * 1.5} ${16 + i}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={
            isAnimating
              ? {
                  opacity: [0, 0.8 - i * 0.2, 0],
                  pathLength: [0, 1, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.2,
          }}
        />
      ))}
      {/* Right ear waves */}
      {[0, 1, 2].map((i) => (
        <motion.path
          key={`right-${i}`}
          d={`M${20 + i * 1.5} ${8 - i} Q${22 + i * 1.5} 12, ${20 + i * 1.5} ${16 + i}`}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={
            isAnimating
              ? {
                  opacity: [0, 0.8 - i * 0.2, 0],
                  pathLength: [0, 1, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: i * 0.2,
          }}
        />
      ))}
      {/* Center mic */}
      <rect x="10" y="6" width="4" height="8" rx="2" fill={color} />
      <path
        d="M8 11a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 15v3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 32: Sound Input
 * Mic with input arrow indicators
 */
export function SoundInput({
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
      {/* Input arrows coming in */}
      {[
        { x1: 2, y1: 8, x2: 6, y2: 10 },
        { x1: 2, y1: 12, x2: 6, y2: 12 },
        { x1: 2, y1: 16, x2: 6, y2: 14 },
        { x1: 22, y1: 8, x2: 18, y2: 10 },
        { x1: 22, y1: 12, x2: 18, y2: 12 },
        { x1: 22, y1: 16, x2: 18, y2: 14 },
      ].map((arrow, i) => (
        <motion.line
          key={i}
          x1={arrow.x1}
          y1={arrow.y1}
          x2={arrow.x2}
          y2={arrow.y2}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={
            isAnimating
              ? {
                  opacity: [0, 1, 0],
                  x1: [arrow.x1, arrow.x2 + (arrow.x1 < 12 ? -2 : 2), arrow.x1],
                }
              : {}
          }
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i % 3) * 0.15,
          }}
        />
      ))}
      {/* Center mic */}
      <rect x="10" y="5" width="4" height="9" rx="2" fill={color} />
      <path
        d="M8 11a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 16v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 33: Glow Mic Button
 * Circular button with mic and glow effect
 */
export function GlowMicButton({
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
      {/* Glow layers */}
      <motion.circle
        cx="12"
        cy="12"
        r="11"
        fill={color}
        opacity="0.1"
        animate={
          isAnimating
            ? {
                opacity: [0.1, 0.25, 0.1],
                r: [11, 11.5, 11],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.circle
        cx="12"
        cy="12"
        r="9"
        fill={color}
        opacity="0.2"
        animate={
          isAnimating
            ? {
                opacity: [0.2, 0.35, 0.2],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="7" fill={color} opacity="0.3" />
      {/* Mic icon */}
      <rect x="10" y="8" width="4" height="5" rx="2" fill={color} />
      <path
        d="M9 12a3 3 0 0 0 6 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 15v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

/**
 * Mockup 34: Waveform Circle
 * Mic surrounded by circular waveform
 */
export function WaveformCircle({
  size = 24,
  color = defaultColor,
  isAnimating = true,
  className,
  style,
}: MockupIconProps) {
  // Pre-calculated bar positions for 16 bars around a circle
  const barData = [
    { x1: 12, y1: 5, x2: 12, y2: 2, ext: 1.5 },
    { x1: 14.6, y1: 5.4, x2: 15.9, y2: 2.9, ext: 1.2 },
    { x1: 16.6, y1: 7.4, x2: 19.1, y2: 5.9, ext: 1.8 },
    { x1: 17.5, y1: 10, x2: 20.5, y2: 10, ext: 1.4 },
    { x1: 16.6, y1: 12.6, x2: 19.1, y2: 14.1, ext: 1.6 },
    { x1: 14.6, y1: 14.6, x2: 15.9, y2: 17.1, ext: 1.3 },
    { x1: 12, y1: 15, x2: 12, y2: 18, ext: 1.7 },
    { x1: 9.4, y1: 14.6, x2: 8.1, y2: 17.1, ext: 1.1 },
    { x1: 7.4, y1: 12.6, x2: 4.9, y2: 14.1, ext: 1.9 },
    { x1: 6.5, y1: 10, x2: 3.5, y2: 10, ext: 1.4 },
    { x1: 7.4, y1: 7.4, x2: 4.9, y2: 5.9, ext: 1.6 },
    { x1: 9.4, y1: 5.4, x2: 8.1, y2: 2.9, ext: 1.2 },
    { x1: 11, y1: 5.1, x2: 10.5, y2: 2.2, ext: 1.5 },
    { x1: 13, y1: 5.1, x2: 13.5, y2: 2.2, ext: 1.3 },
    { x1: 15.5, y1: 6.5, x2: 17.5, y2: 4.5, ext: 1.7 },
    { x1: 8.5, y1: 6.5, x2: 6.5, y2: 4.5, ext: 1.4 },
  ];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      {/* Circular waveform bars */}
      {barData.map((bar, i) => (
        <motion.line
          key={i}
          x1={bar.x1}
          y1={bar.y1}
          x2={bar.x2}
          y2={bar.y2}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          animate={
            isAnimating
              ? {
                  opacity: [0.5, 1, 0.5],
                  strokeWidth: [1.5, 2, 1.5],
                }
              : {}
          }
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        />
      ))}
      {/* Center mic */}
      <rect x="10" y="9" width="4" height="4" rx="2" fill={color} />
      <path
        d="M10 12a2 2 0 0 0 4 0"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path d="M12 14v1" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </motion.svg>
  );
}

/**
 * Mockup 35: Voice Command
 * Mic with command prompt style indicator
 */
export function VoiceCommand({
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
      {/* Command bracket left */}
      <path
        d="M4 6 L2 12 L4 18"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Command bracket right */}
      <path
        d="M20 6 L22 12 L20 18"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Mic */}
      <motion.rect
        x="10"
        y="6"
        width="4"
        height="8"
        rx="2"
        fill={color}
        animate={
          isAnimating
            ? {
                opacity: [0.8, 1, 0.8],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <path
        d="M8 11a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 16v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Blinking cursor */}
      <motion.rect
        x="11"
        y="19"
        width="2"
        height="3"
        fill={color}
        animate={
          isAnimating
            ? {
                opacity: [1, 1, 0, 0, 1],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.49, 0.5, 0.99, 1],
        }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 36: Active Listening
 * Concentric rings showing active listening state
 */
export function ActiveListening({
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
      {/* Active rings */}
      {[0, 1, 2, 3].map((i) => (
        <motion.circle
          key={i}
          cx="12"
          cy="10"
          r={4 + i * 2.5}
          fill="none"
          stroke={color}
          strokeWidth="1"
          initial={{ opacity: 0.8 - i * 0.15 }}
          animate={
            isAnimating
              ? {
                  opacity: [0.8 - i * 0.15, 0.4 - i * 0.1, 0.8 - i * 0.15],
                  strokeWidth: [1, 1.5, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
      {/* Center mic */}
      <rect x="10" y="6" width="4" height="6" rx="2" fill={color} />
      <path
        d="M8 10a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 14v4M9 18h6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 37: Smart Assistant
 * AI assistant style with sparkle and mic
 */
export function SmartAssistant({
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
      {/* Sparkles */}
      {[
        { x: 4, y: 4 },
        { x: 20, y: 6 },
        { x: 3, y: 16 },
        { x: 21, y: 18 },
      ].map((pos, i) => (
        <motion.g key={i}>
          <motion.path
            d={`M${pos.x} ${pos.y - 2} L${pos.x} ${pos.y + 2} M${pos.x - 2} ${pos.y} L${pos.x + 2} ${pos.y}`}
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
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.3,
            }}
            style={{ originX: `${pos.x}px`, originY: `${pos.y}px` }}
          />
        </motion.g>
      ))}
      {/* Central orb */}
      <motion.circle
        cx="12"
        cy="11"
        r="6"
        fill={color}
        opacity="0.2"
        animate={
          isAnimating
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: "12px", originY: "11px" }}
      />
      {/* Mic */}
      <rect x="10" y="7" width="4" height="6" rx="2" fill={color} />
      <path
        d="M8 11a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 15v3"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 38: Voice Detector
 * Radar-style voice detection animation
 */
export function VoiceDetector({
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
      {/* Radar sweep */}
      <motion.path
        d="M12 12 L12 2 A10 10 0 0 1 22 12 Z"
        fill={color}
        opacity="0.3"
        animate={
          isAnimating
            ? {
                rotate: [0, 360],
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
      {/* Rings */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.3"
      />
      <circle
        cx="12"
        cy="12"
        r="6"
        fill="none"
        stroke={color}
        strokeWidth="1"
        opacity="0.3"
      />
      {/* Center mic dot */}
      <motion.circle
        cx="12"
        cy="12"
        r="3"
        fill={color}
        animate={
          isAnimating
            ? {
                scale: [1, 1.2, 1],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ originX: "12px", originY: "12px" }}
      />
    </motion.svg>
  );
}

/**
 * Mockup 39: Speak Now
 * Mic with animated "speak" indicator
 */
export function SpeakNow({
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
      {/* Bouncing indicator dots */}
      {[7, 12, 17].map((x, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy="4"
          r="1.5"
          fill={color}
          animate={
            isAnimating
              ? {
                  y: [0, -2, 0],
                }
              : {}
          }
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
      {/* Mic with glow */}
      <motion.rect
        x="9"
        y="8"
        width="6"
        height="8"
        rx="3"
        fill={color}
        animate={
          isAnimating
            ? {
                filter: [
                  "drop-shadow(0 0 2px rgba(245, 158, 11, 0.3))",
                  "drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))",
                  "drop-shadow(0 0 2px rgba(245, 158, 11, 0.3))",
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
      <path
        d="M6 13a6 6 0 0 0 12 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 19v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

/**
 * Mockup 40: Audio Capture
 * Mic with capturing animation arrows
 */
export function AudioCapture({
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
      {/* Capture arrows */}
      <motion.path
        d="M4 4 L8 4 L8 8"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          isAnimating
            ? {
                opacity: [0.4, 1, 0.4],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.path
        d="M20 4 L16 4 L16 8"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          isAnimating
            ? {
                opacity: [0.4, 1, 0.4],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <motion.path
        d="M4 20 L8 20 L8 16"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          isAnimating
            ? {
                opacity: [0.4, 1, 0.4],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4,
        }}
      />
      <motion.path
        d="M20 20 L16 20 L16 16"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={
          isAnimating
            ? {
                opacity: [0.4, 1, 0.4],
              }
            : {}
        }
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6,
        }}
      />
      {/* Center mic */}
      <rect x="10" y="7" width="4" height="7" rx="2" fill={color} />
      <path
        d="M8 11a4 4 0 0 0 8 0"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 16v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

// ============================================================================
// EXPORTS - All mic mockup icons
// ============================================================================

export const AIMicMockups = {
  ClassicMicPulse,
  MicLiveIndicator,
  PodcastMic,
  VoiceAssistantCircle,
  RecordingMic,
  SiriStyleMic,
  TapToSpeak,
  FrequencyMic,
  VoiceRecognition,
  AlexaStyleRing,
  ListeningEars,
  SoundInput,
  GlowMicButton,
  WaveformCircle,
  VoiceCommand,
  ActiveListening,
  SmartAssistant,
  VoiceDetector,
  SpeakNow,
  AudioCapture,
};

export type AIMicMockupName = keyof typeof AIMicMockups;
