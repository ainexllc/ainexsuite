/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Menu,
  X,
  Pause,
  Play,
  RefreshCw,
} from 'lucide-react';
import {
  AIAnalyticsIcon,
  AISparkleIcon,
  AIBrainIcon,
  AIMagicWandIcon,
  AIProcessingIcon,
  AILightbulbIcon,
  AITargetIcon,
  AICircuitIcon,
  AIVoiceIcon,
  NeuralNetworkIcon,
} from '@ainexsuite/ui/components/ai/animated-ai-icons';

const ACCENT_COLOR = '#f59e0b';
const ACCENT_SECONDARY = '#d97706';

// Sample insights for slideshow
const sampleInsights = [
  { label: 'Pattern', content: 'Your productivity peaks on Tuesday mornings', icon: <AIAnalyticsIcon size={24} color={ACCENT_COLOR} isAnimating /> },
  { label: 'Suggestion', content: 'Try breaking large tasks into smaller chunks', icon: <AILightbulbIcon size={24} color={ACCENT_COLOR} isAnimating /> },
  { label: 'Trend', content: "You've completed 23% more tasks this week", icon: <AITargetIcon size={24} color={ACCENT_COLOR} isAnimating /> },
];

// ============================================================================
// Mock TopNav Component (simplified copy)
// ============================================================================

function MockTopNav({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <header
      className={`relative z-30 bg-zinc-900/95 backdrop-blur-2xl border-b border-white/10 ${className}`}
      style={{
        boxShadow: `0 4px 16px -4px rgba(249,115,22,0.2)`,
      }}
    >
      <div className="mx-auto flex h-14 w-full items-center px-4">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70">
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-white font-semibold text-sm">Notes</span>
        </div>

        {/* Right: Placeholder actions */}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/10" />
        </div>
      </div>
      {children}
    </header>
  );
}

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
      <div className="bg-zinc-950">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// 1. Center Tab - Sliding Panel
// ============================================================================

function Mockup1() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Panel that slides down from under nav */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-full w-[90%] max-w-2xl overflow-hidden"
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className="bg-black/95 backdrop-blur-xl border border-t-0 border-amber-500/30 rounded-b-2xl p-5"
          style={{ boxShadow: `0 10px 40px -10px ${ACCENT_COLOR}40` }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT_COLOR}30, ${ACCENT_SECONDARY}20)` }}
            >
              <AIAnalyticsIcon size={24} color={ACCENT_COLOR} isAnimating />
            </div>
            <div className="flex-1">
              <span className="text-amber-400 text-xs uppercase tracking-wider font-semibold">Pattern Detected</span>
              <p className="text-white text-lg font-medium">Your productivity peaks on Tuesday mornings</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tab handle attached to bottom of nav */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl border border-t-0"
          style={{
            background: isOpen ? `${ACCENT_COLOR}30` : `${ACCENT_COLOR}20`,
            borderColor: `${ACCENT_COLOR}40`,
            boxShadow: `0 4px 20px ${ACCENT_COLOR}30`,
          }}
          whileHover={{ y: 2 }}
          animate={{ y: isOpen ? 0 : 0 }}
        >
          <AIAnalyticsIcon size={16} color={ACCENT_COLOR} isAnimating />
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">AI</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="w-3 h-3 text-amber-400" />
          </motion.div>
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// 2. Full Width Reveal
// ============================================================================

function Mockup2() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Full width panel */}
      <motion.div
        className="absolute left-0 right-0 top-full overflow-hidden"
        initial={false}
        animate={{ height: isOpen ? 120 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="relative h-full bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-xl border-b border-amber-500/20">
          {/* Glow effect from top */}
          <div
            className="absolute top-0 left-0 right-0 h-20 pointer-events-none"
            style={{ background: `linear-gradient(180deg, ${ACCENT_COLOR}20 0%, transparent 100%)` }}
          />
          <div className="relative flex items-center justify-center h-full gap-6 px-8">
            <div className="flex items-center gap-4">
              <AIBrainIcon size={36} color={ACCENT_COLOR} isAnimating />
              <div>
                <span className="text-amber-400 text-xs uppercase tracking-wider">AI Insight</span>
                <p className="text-white text-xl font-semibold">Your productivity peaks on Tuesday mornings</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Centered tab */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-5 py-2 rounded-b-2xl"
          style={{
            background: `linear-gradient(180deg, ${ACCENT_COLOR}25, ${ACCENT_COLOR}15)`,
            boxShadow: `0 8px 30px ${ACCENT_COLOR}40`,
          }}
          animate={{ y: isOpen ? 120 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AIBrainIcon size={18} color={ACCENT_COLOR} isAnimating />
          </motion.div>
          <span className="text-amber-400 text-xs font-bold">INSIGHTS</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4 text-amber-400" />
          </motion.div>
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// 3. Corner Dropdown (Right)
// ============================================================================

function Mockup3() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Dropdown from right side */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-4 top-full mt-2 w-80"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="bg-black/95 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-4 overflow-hidden"
              style={{ boxShadow: `0 20px 50px -10px ${ACCENT_COLOR}30` }}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30"
                style={{ backgroundColor: ACCENT_COLOR }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <AISparkleIcon size={20} color={ACCENT_COLOR} isAnimating />
                  <span className="text-amber-400 text-xs uppercase tracking-wider font-semibold">AI Insights</span>
                </div>
                <p className="text-white font-medium">Your productivity peaks on Tuesday mornings</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-white/40 text-xs">Updated 2m ago</span>
                  <button className="text-amber-400 text-xs hover:underline">View all</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab on right side */}
      <div className="absolute right-4 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-b-lg border border-t-0"
          style={{
            background: `${ACCENT_COLOR}20`,
            borderColor: `${ACCENT_COLOR}40`,
          }}
          whileHover={{ y: 2 }}
        >
          <AISparkleIcon size={14} color={ACCENT_COLOR} isAnimating />
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronDown className="w-3 h-3 text-amber-400" />
          </motion.div>
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// 4. Expanding Bar with Slideshow
// ============================================================================

function Mockup4() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <MockTopNav>
      {/* Expanding bar */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-full overflow-hidden"
        initial={false}
        animate={{
          width: isOpen ? '90%' : 120,
          height: isOpen ? 100 : 32,
        }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ maxWidth: 600 }}
      >
        <motion.div
          className="h-full rounded-b-2xl border border-t-0 overflow-hidden cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.95)',
            borderColor: `${ACCENT_COLOR}40`,
            boxShadow: `0 10px 40px -10px ${ACCENT_COLOR}40`,
          }}
          onClick={() => !isOpen && setIsOpen(true)}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full p-4 flex items-center gap-4"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide((currentSlide - 1 + sampleInsights.length) % sampleInsights.length); }}
                  className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 flex items-center gap-3">
                  {sampleInsights[currentSlide].icon}
                  <div>
                    <span className="text-amber-400 text-xs uppercase">{sampleInsights[currentSlide].label}</span>
                    <p className="text-white font-medium">{sampleInsights[currentSlide].content}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide((currentSlide + 1) % sampleInsights.length); }}
                  className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                  className="p-2 rounded-lg text-white/40 hover:text-white"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center gap-2"
              >
                <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
                <span className="text-amber-400 text-xs font-bold">AI</span>
                <ChevronDown className="w-3 h-3 text-amber-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </MockTopNav>
  );
}

// ============================================================================
// 5. Ribbon Pull-Down (Hero Style)
// ============================================================================

function Mockup5() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <MockTopNav>
      {/* Hero ribbon */}
      <motion.div
        className="absolute left-0 right-0 top-full overflow-hidden"
        initial={false}
        animate={{ height: isOpen ? 160 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="relative h-full bg-black/95 backdrop-blur-xl border-b border-amber-500/20">
          {/* Top edge glow */}
          <div
            className="absolute top-0 left-0 right-0 h-24 opacity-60 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${ACCENT_COLOR}40 0%, ${ACCENT_COLOR}15 30%, transparent 100%)`,
            }}
          />
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-[500px] h-16 rounded-full blur-[40px] opacity-40 pointer-events-none"
            style={{ backgroundColor: ACCENT_COLOR }}
          />

          {/* Content */}
          <div className="relative h-full flex items-center px-8">
            <div className="flex items-center gap-5 flex-1">
              {/* Large icon with glow */}
              <div
                className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5"
                style={{ boxShadow: `0 0 40px ${ACCENT_COLOR}40` }}
              >
                {sampleInsights[currentSlide].icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-xs uppercase tracking-wider font-bold">
                    {sampleInsights[currentSlide].label}
                  </span>
                </div>
                <p className="text-white text-2xl font-bold">{sampleInsights[currentSlide].content}</p>
              </div>
            </div>
          </div>

          {/* Bottom navigation */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-8">
            <div className="flex gap-2">
              {sampleInsights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/30'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentSlide((currentSlide - 1 + sampleInsights.length) % sampleInsights.length)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((currentSlide + 1) % sampleInsights.length)}
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Center handle tab */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 rounded-b-xl border border-t-0"
          style={{
            background: `${ACCENT_COLOR}20`,
            borderColor: `${ACCENT_COLOR}40`,
            boxShadow: isOpen ? 'none' : `0 4px 20px ${ACCENT_COLOR}30, 0 0 40px ${ACCENT_COLOR}15`,
          }}
          animate={{
            y: isOpen ? 160 : 0,
            height: isOpen ? 24 : 32,
            paddingTop: isOpen ? 4 : 8,
            paddingBottom: isOpen ? 4 : 8,
          }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {isOpen ? (
            <div className="w-8 h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY})` }} />
          ) : (
            <>
              <div style={{ filter: `drop-shadow(0 0 6px ${ACCENT_COLOR}60)` }}>
                <AIAnalyticsIcon size={18} color={ACCENT_COLOR} isAnimating />
              </div>
              <span className="text-amber-400 text-[10px] font-bold tracking-wider">AI</span>
              <Sparkles className="w-3 h-3 text-amber-400 opacity-60" />
            </>
          )}
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// 6. Minimal Line Tab
// ============================================================================

function Mockup6() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Minimal sliding panel */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-full w-[80%] max-w-lg overflow-hidden"
        initial={false}
        animate={{ height: isOpen ? 80 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full bg-black/90 backdrop-blur-xl border-x border-b border-amber-500/20 rounded-b-xl p-4 flex items-center gap-4">
          <AICircuitIcon size={28} color={ACCENT_COLOR} isAnimating />
          <div className="flex-1">
            <p className="text-white font-medium">Your productivity peaks on Tuesday mornings</p>
          </div>
        </div>
      </motion.div>

      {/* Minimal line tab */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative px-8 py-2"
          animate={{ y: isOpen ? 80 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated line */}
          <motion.div
            className="h-0.5 rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
            animate={{ width: isOpen ? 40 : 60 }}
          />
          {/* Glow on hover */}
          <motion.div
            className="absolute inset-x-0 top-0 h-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center top, ${ACCENT_COLOR}40, transparent)`,
            }}
          />
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// 7. Peeking Card
// ============================================================================

function Mockup7() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Card that peeks from under nav */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 top-full w-72"
        initial={false}
        animate={{ y: isOpen ? 0 : -60 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div
          className="bg-black/95 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-4 cursor-pointer"
          style={{ boxShadow: `0 10px 40px -10px ${ACCENT_COLOR}40` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <AIVoiceIcon size={24} color={ACCENT_COLOR} isAnimating />
            <div className="flex-1 min-w-0">
              <span className="text-amber-400 text-xs uppercase tracking-wider">AI Insight</span>
              <motion.p
                className="text-white font-medium truncate"
                animate={{ opacity: isOpen ? 1 : 0.7 }}
              >
                Your productivity peaks on Tuesday mornings
              </motion.p>
            </div>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-amber-400" />
            </motion.div>
          </div>

          {/* Extra content when fully open */}
          <motion.div
            initial={false}
            animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-white/10">
              <p className="text-white/60 text-sm">Based on your activity over the last 30 days</p>
              <button className="mt-2 text-amber-400 text-sm hover:underline">View details</button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </MockTopNav>
  );
}

// ============================================================================
// 8. Floating Orb
// ============================================================================

function Mockup8() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Expanded panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 top-full mt-12 w-80"
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
          >
            <div className="bg-black/95 backdrop-blur-xl rounded-2xl border border-amber-500/30 p-5">
              <div className="flex items-center gap-4">
                <NeuralNetworkIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">Pattern Detected</span>
                  <p className="text-white font-medium">Your productivity peaks on Tuesday mornings</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating orb button */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative mt-2"
          animate={{ y: isOpen ? 4 : 0 }}
        >
          {/* Pulsing rings */}
          {!isOpen && [1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border"
              style={{ borderColor: ACCENT_COLOR }}
              animate={{
                scale: [1, 1.5 + i * 0.2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
          <div
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY})`,
              boxShadow: `0 4px 20px ${ACCENT_COLOR}50`,
            }}
          >
            <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
              {isOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <NeuralNetworkIcon size={20} color="white" isAnimating />
              )}
            </motion.div>
          </div>
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// 9. Side Peek (Left)
// ============================================================================

function Mockup9() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Panel sliding from left */}
      <motion.div
        className="absolute left-0 top-full h-20 overflow-hidden"
        initial={false}
        animate={{ width: isOpen ? 350 : 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div
          className="h-full w-[350px] bg-black/95 backdrop-blur-xl border-r border-b border-amber-500/30 rounded-br-2xl p-4 flex items-center gap-4"
          style={{ boxShadow: `10px 10px 40px -10px ${ACCENT_COLOR}30` }}
        >
          <AIMagicWandIcon size={28} color={ACCENT_COLOR} isAnimating />
          <div className="flex-1 min-w-0">
            <span className="text-amber-400 text-xs uppercase">AI Insight</span>
            <p className="text-white font-medium truncate">Your productivity peaks on Tuesday mornings</p>
          </div>
        </div>
      </motion.div>

      {/* Tab on left side */}
      <div className="absolute left-0 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 py-3 px-2 rounded-r-lg border border-l-0"
          style={{
            background: `${ACCENT_COLOR}20`,
            borderColor: `${ACCENT_COLOR}40`,
          }}
          animate={{ x: isOpen ? 350 : 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </motion.div>
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// 10. Spotlight Reveal
// ============================================================================

function Mockup10() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <MockTopNav>
      {/* Spotlight panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute left-0 right-0 top-full h-28 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative h-full bg-black/95 backdrop-blur-xl border-b border-amber-500/20">
              {/* Moving spotlight */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle 150px at var(--x, 50%) 50%, ${ACCENT_COLOR}30, transparent)`,
                }}
                animate={{
                  '--x': ['20%', '80%', '20%'],
                } as any}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative h-full flex items-center justify-center gap-4 px-8">
                <AIProcessingIcon size={32} color={ACCENT_COLOR} isAnimating />
                <div>
                  <span className="text-amber-400 text-xs uppercase">Pattern Detected</span>
                  <p className="text-white text-lg font-medium">Your productivity peaks on Tuesday mornings</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center tab */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex items-center gap-2 px-4 py-2 rounded-b-xl overflow-hidden"
          style={{ background: 'black', border: `1px solid ${ACCENT_COLOR}40`, borderTop: 'none' }}
          animate={{ y: isOpen ? 112 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Inner spotlight */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${ACCENT_COLOR}30, transparent)`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative flex items-center gap-2">
            <AIProcessingIcon size={16} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-xs font-bold">AI</span>
          </div>
        </motion.button>
      </div>
    </MockTopNav>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function InsightsUnderNavPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Insights - Under Nav Mockups</h1>
          <p className="text-white/60 text-lg">
            10 animated tab designs that slide out from under the top navigation. Click each tab to see the animation.
          </p>
        </div>

        {/* Stack of mockups */}
        <div className="space-y-8">
          <MockupWrapper number={1} title="Center Slide Down" description="Panel slides down from center of nav">
            <div className="h-64 relative">
              <Mockup1 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={2} title="Full Width Reveal" description="Full-width panel with glow effect">
            <div className="h-64 relative">
              <Mockup2 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={3} title="Corner Dropdown" description="Dropdown from right side of nav">
            <div className="h-64 relative">
              <Mockup3 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={4} title="Expanding Bar" description="Tab expands into slideshow panel">
            <div className="h-64 relative">
              <Mockup4 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={5} title="Hero Ribbon" description="Full hero-style panel with slideshow">
            <div className="h-72 relative">
              <Mockup5 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={6} title="Minimal Line" description="Subtle line expands to panel">
            <div className="h-48 relative">
              <Mockup6 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={7} title="Peeking Card" description="Card peeks out from under nav">
            <div className="h-56 relative">
              <Mockup7 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={8} title="Floating Orb" description="Pulsing orb with dropdown panel">
            <div className="h-64 relative">
              <Mockup8 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={9} title="Side Peek" description="Panel slides from left edge">
            <div className="h-48 relative">
              <Mockup9 />
            </div>
          </MockupWrapper>

          <MockupWrapper number={10} title="Spotlight Reveal" description="Moving spotlight effect">
            <div className="h-56 relative">
              <Mockup10 />
            </div>
          </MockupWrapper>
        </div>
      </div>
    </div>
  );
}
