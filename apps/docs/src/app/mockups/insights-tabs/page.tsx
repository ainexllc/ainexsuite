/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-no-duplicate-props */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Zap,
  Brain,
  Lightbulb,
  TrendingUp,
  Activity,
  Target,
  Layers,
  Cpu,
  Wand2,
  Eye,
  Compass,
  Atom,
  Flame,
  Star,
  Moon,
  Sun,
  Cloud,
  Waves,
} from 'lucide-react';
import {
  AIAnalyticsIcon,
  AISparkleIcon,
  AIBrainIcon,
  AIMagicWandIcon,
  AIProcessingIcon,
  AILightbulbIcon,
  AITargetIcon,
  AIAtomIcon,
  AICircuitIcon,
  AIVoiceIcon,
  NeuralNetworkIcon,
  AIEyeIcon,
  AICompassIcon,
  AICloudIcon,
} from '@ainexsuite/ui/components/ai/animated-ai-icons';

const ACCENT_COLOR = '#f59e0b';
const ACCENT_SECONDARY = '#d97706';

// Sample insight for expanded view
const sampleInsight = {
  label: 'Pattern Detected',
  content: 'Your productivity peaks on Tuesday mornings',
};

// ============================================================================
// Mockup Wrapper Component
// ============================================================================

interface MockupWrapperProps {
  title: string;
  number: number;
  description: string;
  children: React.ReactNode;
}

function MockupWrapper({ title, number, description, children }: MockupWrapperProps) {
  return (
    <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-bold">
            {number}
          </span>
          <div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-white/50 text-sm">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6 bg-zinc-950/50">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 1. Floating Pill Tab
// ============================================================================

function Mockup1() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="w-full max-w-md bg-gradient-to-br from-amber-500/20 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <AIAnalyticsIcon size={32} color={ACCENT_COLOR} isAnimating />
              <div>
                <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold">{sampleInsight.label}</span>
                <p className="text-white font-medium">{sampleInsight.content}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white text-sm"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${ACCENT_COLOR}20, ${ACCENT_SECONDARY}10)`,
          borderColor: `${ACCENT_COLOR}40`,
          boxShadow: `0 0 20px ${ACCENT_COLOR}30`,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AIAnalyticsIcon size={18} color={ACCENT_COLOR} isAnimating />
        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">AI Insights</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronUp className="w-4 h-4 text-amber-400" />
        </motion.div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 2. Breathing Glow Tab
// ============================================================================

function Mockup2() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-md overflow-hidden"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-amber-500/20 p-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full blur-xl"
                    style={{ backgroundColor: ACCENT_COLOR }}
                    animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <AIBrainIcon size={40} color={ACCENT_COLOR} isAnimating />
                </div>
                <div>
                  <span className="text-amber-400 text-xs uppercase tracking-wider">{sampleInsight.label}</span>
                  <p className="text-white text-lg font-semibold">{sampleInsight.content}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-6 py-3 rounded-xl border border-amber-500/30"
        style={{ background: 'rgba(0,0,0,0.8)' }}
      >
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ background: `radial-gradient(circle at center, ${ACCENT_COLOR}30, transparent)` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="relative flex items-center gap-3">
          <AISparkleIcon size={20} color={ACCENT_COLOR} isAnimating />
          <span className="text-amber-400 font-semibold">AI</span>
        </div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 3. Sliding Drawer Tab
// ============================================================================

function Mockup3() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md h-32 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <motion.div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-amber-500/20 to-transparent p-4"
          initial={{ y: '-100%' }}
          animate={{ y: isOpen ? 0 : '-100%' }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="flex items-center gap-3">
            <AILightbulbIcon size={28} color={ACCENT_COLOR} isAnimating />
            <div>
              <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
              <p className="text-white">{sampleInsight.content}</p>
            </div>
          </div>
        </motion.div>

        {/* Tab Handle */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-b-lg border border-t-0"
          style={{
            backgroundColor: `${ACCENT_COLOR}20`,
            borderColor: `${ACCENT_COLOR}40`,
          }}
          animate={{ top: isOpen ? 80 : 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <AIAnalyticsIcon size={16} color={ACCENT_COLOR} isAnimating />
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="w-3 h-3 text-amber-400" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}

// ============================================================================
// 4. Morphing Icon Tab
// ============================================================================

function Mockup4() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full max-w-md bg-gradient-to-br from-amber-900/30 to-orange-900/20 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20"
          >
            <div className="flex items-center gap-4">
              <AIProcessingIcon size={36} color={ACCENT_COLOR} isAnimating />
              <div className="flex-1">
                <span className="text-amber-400/80 text-xs uppercase tracking-wider">{sampleInsight.label}</span>
                <p className="text-white font-medium">{sampleInsight.content}</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className="flex items-center justify-center w-14 h-14 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR}30, ${ACCENT_SECONDARY}20)`,
            borderColor: `${ACCENT_COLOR}50`,
          }}
          animate={{
            borderRadius: isOpen ? '50%' : '16px',
          }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <ChevronDown className="w-6 h-6 text-amber-400" />
            ) : (
              <AIAnalyticsIcon size={24} color={ACCENT_COLOR} isAnimating />
            )}
          </motion.div>
        </motion.div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 5. Pulsing Ring Tab
// ============================================================================

function Mockup5() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md bg-black/90 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6"
          >
            <div className="flex items-center gap-4">
              <AITargetIcon size={32} color={ACCENT_COLOR} isAnimating />
              <div>
                <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                <p className="text-white">{sampleInsight.content}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        {/* Pulsing rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: ACCENT_COLOR }}
            animate={{
              scale: [1, 1.5 + i * 0.3],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
        <div
          className="relative flex items-center justify-center w-12 h-12 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY})`,
          }}
        >
          <AIAnalyticsIcon size={20} color="white" isAnimating />
        </div>
      </button>
    </div>
  );
}

// ============================================================================
// 6. Wave Animation Tab
// ============================================================================

function Mockup6() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            style={{ originY: 1 }}
            className="w-full max-w-md bg-gradient-to-t from-amber-500/20 via-amber-500/10 to-transparent backdrop-blur-xl rounded-2xl p-6 border border-amber-500/20"
          >
            <div className="flex items-center gap-4">
              <AIVoiceIcon size={32} color={ACCENT_COLOR} isAnimating />
              <div>
                <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                <p className="text-white">{sampleInsight.content}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-2 rounded-xl border overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.8)',
          borderColor: `${ACCENT_COLOR}40`,
        }}
      >
        <AIVoiceIcon size={20} color={ACCENT_COLOR} isAnimating />
        <span className="text-amber-400 font-medium text-sm">Insights</span>
        <div className="flex gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
              animate={{
                height: [4, 12, 4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 7. Flip Card Tab
// ============================================================================

function Mockup7() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4" style={{ perspective: 1000 }}>
      <motion.div
        className="w-full max-w-md h-24 relative cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotateX: isOpen ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - Tab */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR}20, ${ACCENT_SECONDARY}10)`,
            borderColor: `${ACCENT_COLOR}40`,
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="flex items-center gap-3">
            <AIAtomIcon size={28} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 font-semibold">View AI Insights</span>
            <ChevronDown className="w-5 h-5 text-amber-400" />
          </div>
        </div>

        {/* Back - Content */}
        <div
          className="absolute inset-0 flex items-center rounded-2xl border bg-black/90 p-4"
          style={{
            borderColor: `${ACCENT_COLOR}40`,
            backfaceVisibility: 'hidden',
            transform: 'rotateX(180deg)',
          }}
        >
          <AIAtomIcon size={32} color={ACCENT_COLOR} isAnimating />
          <div className="ml-4">
            <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
            <p className="text-white">{sampleInsight.content}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// 8. Expanding Circle Tab
// ============================================================================

function Mockup8() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md h-32 flex items-center justify-center">
        {/* Expanded Content */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-2xl border overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.9)',
            borderColor: `${ACCENT_COLOR}40`,
          }}
          animate={{
            scale: isOpen ? 1 : 0,
            opacity: isOpen ? 1 : 0,
          }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <div className="flex items-center gap-4 p-4">
            <AIMagicWandIcon size={32} color={ACCENT_COLOR} isAnimating />
            <div>
              <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
              <p className="text-white">{sampleInsight.content}</p>
            </div>
          </div>
        </motion.div>

        {/* Center Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY})`,
            boxShadow: `0 0 30px ${ACCENT_COLOR}50`,
          }}
          animate={{
            scale: isOpen ? 0.6 : 1,
          }}
          whileHover={{ scale: isOpen ? 0.7 : 1.1 }}
        >
          <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
            {isOpen ? (
              <ChevronUp className="w-6 h-6 text-white" />
            ) : (
              <AIMagicWandIcon size={24} color="white" isAnimating />
            )}
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}

// ============================================================================
// 9. Split Reveal Tab
// ============================================================================

function Mockup9() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-black/90">
        {/* Content that reveals */}
        <div className="relative h-24">
          {/* Left half */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-amber-500/20 to-transparent flex items-center justify-end pr-4"
            animate={{ x: isOpen ? '-100%' : 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Right half */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-amber-500/20 to-transparent flex items-center pl-4"
            animate={{ x: isOpen ? '100%' : 0 }}
            transition={{ duration: 0.5 }}
          />

          {/* Hidden content */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center gap-4 p-4"
            animate={{ opacity: isOpen ? 1 : 0 }}
          >
            <NeuralNetworkIcon size={32} color={ACCENT_COLOR} isAnimating />
            <div>
              <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
              <p className="text-white">{sampleInsight.content}</p>
            </div>
          </motion.div>

          {/* Center button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full border"
              style={{
                background: `linear-gradient(135deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY})`,
                borderColor: 'white',
              }}
              animate={{ opacity: isOpen ? 0 : 1 }}
            >
              <NeuralNetworkIcon size={20} color="white" isAnimating />
            </motion.button>
          </div>
        </div>

        {/* Close button when open */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-white/50 hover:text-white"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 10. Orbit Animation Tab
// ============================================================================

function Mockup10() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md bg-black/90 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6"
          >
            <div className="flex items-center gap-4">
              <AIAtomIcon size={36} color={ACCENT_COLOR} isAnimating />
              <div>
                <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                <p className="text-white">{sampleInsight.content}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)} className="relative w-20 h-20">
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: ACCENT_COLOR,
              left: '50%',
              top: '50%',
              marginLeft: -4,
              marginTop: -4,
              transformOrigin: `4px ${20 + i * 8}px`,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 1,
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
            />
          </motion.div>
        ))}

        {/* Center */}
        <div
          className="absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR}30, ${ACCENT_SECONDARY}20)`,
            border: `2px solid ${ACCENT_COLOR}50`,
          }}
        >
          <AIAnalyticsIcon size={20} color={ACCENT_COLOR} isAnimating />
        </div>
      </button>
    </div>
  );
}

// ============================================================================
// 11. Gradient Border Tab
// ============================================================================

function Mockup11() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md relative p-[2px] rounded-2xl"
            style={{
              background: `linear-gradient(90deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY}, ${ACCENT_COLOR})`,
              backgroundSize: '200% 100%',
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(90deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY}, ${ACCENT_COLOR})`,
                backgroundSize: '200% 100%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative bg-black rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <AICircuitIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                  <p className="text-white">{sampleInsight.content}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-6 py-3 rounded-xl overflow-hidden"
        style={{ background: 'black' }}
      >
        {/* Animated border */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(90deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY}, ${ACCENT_COLOR})`,
            backgroundSize: '200% 100%',
            padding: 2,
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute inset-[2px] rounded-[10px] bg-black" />
        <div className="relative flex items-center gap-2">
          <AICircuitIcon size={18} color={ACCENT_COLOR} isAnimating />
          <span className="text-amber-400 font-semibold text-sm">AI</span>
        </div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 12. Bounce Entry Tab
// ============================================================================

function Mockup12() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.3 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="w-full max-w-md bg-gradient-to-br from-amber-500/10 to-orange-500/5 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <AISparkleIcon size={36} color={ACCENT_COLOR} isAnimating />
              </motion.div>
              <div>
                <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                <p className="text-white">{sampleInsight.content}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border"
        style={{
          background: `linear-gradient(135deg, ${ACCENT_COLOR}15, transparent)`,
          borderColor: `${ACCENT_COLOR}40`,
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <AISparkleIcon size={18} color={ACCENT_COLOR} isAnimating />
        <span className="text-amber-400 font-medium">Insights</span>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 13. Liquid Morph Tab
// ============================================================================

function Mockup13() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="w-full max-w-md"
        animate={{
          height: isOpen ? 120 : 48,
          borderRadius: isOpen ? 16 : 24,
        }}
        transition={{ type: 'spring', damping: 15 }}
        style={{
          background: `linear-gradient(135deg, ${ACCENT_COLOR}20, ${ACCENT_SECONDARY}10)`,
          border: `1px solid ${ACCENT_COLOR}40`,
          overflow: 'hidden',
        }}
      >
        <motion.div
          className="h-full flex items-center justify-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-4 p-4"
              >
                <AIEyeIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                  <p className="text-white">{sampleInsight.content}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <AIEyeIcon size={20} color={ACCENT_COLOR} isAnimating />
                <span className="text-amber-400 font-medium">View Insights</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// 14. Particle Burst Tab
// ============================================================================

function Mockup14() {
  const [isOpen, setIsOpen] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = () => {
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full max-w-md bg-black/90 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6"
          >
            <div className="flex items-center gap-4">
              <AIBrainIcon size={32} color={ACCENT_COLOR} isAnimating />
              <div>
                <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                <p className="text-white">{sampleInsight.content}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleClick} className="relative">
        {/* Particles */}
        <AnimatePresence>
          {showParticles && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ACCENT_COLOR,
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 30 * Math.PI) / 180) * 50,
                    y: Math.sin((i * 30 * Math.PI) / 180) * 50,
                  }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.6 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR}30, ${ACCENT_SECONDARY}20)`,
            borderColor: `${ACCENT_COLOR}50`,
          }}
        >
          <AIBrainIcon size={24} color={ACCENT_COLOR} isAnimating />
        </div>
      </button>
    </div>
  );
}

// ============================================================================
// 15. Stacked Cards Tab
// ============================================================================

function Mockup15() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-full max-w-md">
        {/* Stacked cards effect */}
        {[2, 1, 0].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-x-0 mx-auto rounded-2xl border bg-black/80"
            style={{
              width: `calc(100% - ${i * 20}px)`,
              borderColor: `${ACCENT_COLOR}${40 - i * 10}`,
              zIndex: 3 - i,
            }}
            animate={{
              y: isOpen ? i * 8 : i * 4,
              opacity: isOpen ? 1 - i * 0.2 : 1 - i * 0.3,
              scale: 1 - i * 0.05,
            }}
          >
            {i === 0 && (
              <motion.div
                className="p-4 flex items-center gap-4"
                animate={{ height: isOpen ? 100 : 60 }}
              >
                <AICompassIcon size={isOpen ? 32 : 24} color={ACCENT_COLOR} isAnimating />
                <div className="flex-1">
                  {isOpen ? (
                    <>
                      <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                      <p className="text-white">{sampleInsight.content}</p>
                    </>
                  ) : (
                    <span className="text-amber-400 font-medium">AI Insights</span>
                  )}
                </div>
                <button onClick={() => setIsOpen(!isOpen)} className="text-white/50 hover:text-white">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// 16. Spotlight Tab
// ============================================================================

function Mockup16() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-md relative rounded-2xl overflow-hidden"
          >
            {/* Spotlight effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at var(--x, 50%) var(--y, 50%), ${ACCENT_COLOR}40 0%, transparent 60%)`,
              }}
              animate={{
                '--x': ['30%', '70%', '30%'],
                '--y': ['30%', '70%', '30%'],
              } as any}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative bg-black/80 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <AILightbulbIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                  <p className="text-white">{sampleInsight.content}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-6 py-3 rounded-xl overflow-hidden"
        style={{
          background: 'black',
          border: `1px solid ${ACCENT_COLOR}40`,
        }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${ACCENT_COLOR}30 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="relative flex items-center gap-2">
          <AILightbulbIcon size={18} color={ACCENT_COLOR} isAnimating />
          <span className="text-amber-400 font-medium">Insights</span>
        </div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 17. DNA Helix Tab
// ============================================================================

function Mockup17() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: -90 }}
            transition={{ duration: 0.5 }}
            style={{ perspective: 1000 }}
            className="w-full max-w-md bg-black/90 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: ACCENT_COLOR }}
                    animate={{
                      scaleY: [0.5, 1, 0.5],
                      rotateZ: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
              <div>
                <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                <p className="text-white">{sampleInsight.content}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border"
        style={{
          background: `linear-gradient(135deg, ${ACCENT_COLOR}15, transparent)`,
          borderColor: `${ACCENT_COLOR}40`,
        }}
      >
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-4 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
              animate={{
                scaleY: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
        <span className="text-amber-400 font-medium">AI</span>
      </button>
    </div>
  );
}

// ============================================================================
// 18. Hexagon Tab
// ============================================================================

function Mockup18() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="w-full max-w-md"
          >
            <div
              className="relative bg-black/90 backdrop-blur-xl p-6"
              style={{
                clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)',
                border: `2px solid ${ACCENT_COLOR}40`,
              }}
            >
              <div className="flex items-center gap-4">
                <AIProcessingIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                  <p className="text-white">{sampleInsight.content}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-16 h-16"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <motion.polygon
            points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
            fill={`${ACCENT_COLOR}20`}
            stroke={ACCENT_COLOR}
            strokeWidth="2"
            animate={{ rotate: isOpen ? 30 : 0 }}
            style={{ transformOrigin: 'center' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AIProcessingIcon size={24} color={ACCENT_COLOR} isAnimating />
        </div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 19. Gradient Wave Tab
// ============================================================================

function Mockup19() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md relative overflow-hidden rounded-2xl"
          >
            {/* Animated wave background */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(45deg, ${ACCENT_COLOR}30, ${ACCENT_SECONDARY}20, ${ACCENT_COLOR}30)`,
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <div className="relative bg-black/70 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <AICloudIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                  <p className="text-white">{sampleInsight.content}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-6 py-3 rounded-xl overflow-hidden"
      >
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, ${ACCENT_COLOR}40, ${ACCENT_SECONDARY}30, ${ACCENT_COLOR}40)`,
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative flex items-center gap-2">
          <AICloudIcon size={18} color="white" isAnimating />
          <span className="text-white font-medium">Insights</span>
        </div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// 20. Neon Glow Tab
// ============================================================================

function Mockup20() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md relative"
          >
            {/* Neon glow layers */}
            <div
              className="absolute -inset-1 rounded-2xl blur-md"
              style={{ background: ACCENT_COLOR, opacity: 0.3 }}
            />
            <div
              className="absolute -inset-0.5 rounded-2xl blur-sm"
              style={{ background: ACCENT_COLOR, opacity: 0.5 }}
            />
            <div className="relative bg-black rounded-2xl border-2 p-6" style={{ borderColor: ACCENT_COLOR }}>
              <div className="flex items-center gap-4">
                <AISparkleIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">{sampleInsight.label}</span>
                  <p className="text-white">{sampleInsight.content}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        whileHover={{ scale: 1.05 }}
      >
        {/* Neon glow effect */}
        <motion.div
          className="absolute -inset-2 rounded-xl blur-lg"
          style={{ background: ACCENT_COLOR }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute -inset-1 rounded-xl blur-md"
          style={{ background: ACCENT_COLOR }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <div
          className="relative px-5 py-2.5 rounded-xl border-2 bg-black"
          style={{ borderColor: ACCENT_COLOR }}
        >
          <div className="flex items-center gap-2">
            <AISparkleIcon size={18} color={ACCENT_COLOR} isAnimating />
            <span style={{ color: ACCENT_COLOR }} className="font-bold">AI INSIGHTS</span>
          </div>
        </div>
      </motion.button>
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function InsightsTabsMockupsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Insights Tab Mockups</h1>
          <p className="text-white/60 text-lg">
            20 animated tab designs for the AI Insights pulldown. Click each tab to see the expanded view.
          </p>
        </div>

        {/* Grid of mockups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <MockupWrapper number={1} title="Floating Pill" description="Rounded pill with glow effect">
            <Mockup1 />
          </MockupWrapper>

          <MockupWrapper number={2} title="Breathing Glow" description="Pulsing radial glow animation">
            <Mockup2 />
          </MockupWrapper>

          <MockupWrapper number={3} title="Sliding Drawer" description="Slides down from top edge">
            <Mockup3 />
          </MockupWrapper>

          <MockupWrapper number={4} title="Morphing Icon" description="Icon transforms on toggle">
            <Mockup4 />
          </MockupWrapper>

          <MockupWrapper number={5} title="Pulsing Rings" description="Concentric ring animation">
            <Mockup5 />
          </MockupWrapper>

          <MockupWrapper number={6} title="Wave Animation" description="Audio wave visualization">
            <Mockup6 />
          </MockupWrapper>

          <MockupWrapper number={7} title="Flip Card" description="3D card flip transition">
            <Mockup7 />
          </MockupWrapper>

          <MockupWrapper number={8} title="Expanding Circle" description="Circle expands to reveal">
            <Mockup8 />
          </MockupWrapper>

          <MockupWrapper number={9} title="Split Reveal" description="Splits apart to show content">
            <Mockup9 />
          </MockupWrapper>

          <MockupWrapper number={10} title="Orbit Animation" description="Orbiting particles effect">
            <Mockup10 />
          </MockupWrapper>

          <MockupWrapper number={11} title="Gradient Border" description="Animated gradient border">
            <Mockup11 />
          </MockupWrapper>

          <MockupWrapper number={12} title="Bounce Entry" description="Spring bounce animation">
            <Mockup12 />
          </MockupWrapper>

          <MockupWrapper number={13} title="Liquid Morph" description="Fluid shape transformation">
            <Mockup13 />
          </MockupWrapper>

          <MockupWrapper number={14} title="Particle Burst" description="Exploding particles on click">
            <Mockup14 />
          </MockupWrapper>

          <MockupWrapper number={15} title="Stacked Cards" description="Layered card depth effect">
            <Mockup15 />
          </MockupWrapper>

          <MockupWrapper number={16} title="Spotlight" description="Moving spotlight effect">
            <Mockup16 />
          </MockupWrapper>

          <MockupWrapper number={17} title="DNA Helix" description="Rotating helix bars">
            <Mockup17 />
          </MockupWrapper>

          <MockupWrapper number={18} title="Hexagon" description="Geometric hex shape">
            <Mockup18 />
          </MockupWrapper>

          <MockupWrapper number={19} title="Gradient Wave" description="Flowing gradient animation">
            <Mockup19 />
          </MockupWrapper>

          <MockupWrapper number={20} title="Neon Glow" description="Cyberpunk neon effect">
            <Mockup20 />
          </MockupWrapper>
        </div>
      </div>
    </div>
  );
}
