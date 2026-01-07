/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
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
  TrendingUp,
  Lightbulb,
  Target,
  BarChart3,
  Zap,
  ArrowRight,
  ExternalLink,
  Maximize2,
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
  AIEyeIcon,
  AIAtomIcon,
} from '@ainexsuite/ui/components/ai/animated-ai-icons';

const ACCENT_COLOR = '#f59e0b';
const ACCENT_SECONDARY = '#d97706';

// Sample insights for slideshow
const sampleInsights = [
  {
    id: 1,
    label: 'Pattern',
    content: 'Your productivity peaks on Tuesday mornings',
    summary: '23% more tasks completed',
    icon: <TrendingUp className="w-5 h-5" />,
    gradient: { from: '#f59e0b', to: '#d97706' },
  },
  {
    id: 2,
    label: 'Suggestion',
    content: 'Try breaking large tasks into smaller chunks',
    summary: 'Based on completion patterns',
    icon: <Lightbulb className="w-5 h-5" />,
    gradient: { from: '#8b5cf6', to: '#6d28d9' },
  },
  {
    id: 3,
    label: 'Achievement',
    content: "You've maintained a 7-day streak!",
    summary: 'Keep it up!',
    icon: <Target className="w-5 h-5" />,
    gradient: { from: '#10b981', to: '#059669' },
  },
  {
    id: 4,
    label: 'Focus',
    content: 'Your most productive category is Work',
    summary: '45 tasks this month',
    icon: <BarChart3 className="w-5 h-5" />,
    gradient: { from: '#3b82f6', to: '#2563eb' },
  },
];

// ============================================================================
// Mock TopNav Component
// ============================================================================

function MockTopNav({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <header
      className={`relative z-30 bg-zinc-900/95 backdrop-blur-2xl border-b border-white/10 ${className}`}
      style={{ boxShadow: `0 4px 16px -4px rgba(249,115,22,0.2)` }}
    >
      <div className="mx-auto flex h-14 w-full items-center px-4">
        <div className="flex items-center gap-3">
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70">
            <Menu className="h-4 w-4" />
          </button>
          <span className="text-white font-semibold text-sm">Notes</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/10" />
        </div>
      </div>
      {children}
    </header>
  );
}

// ============================================================================
// Shared Slideshow Hook
// ============================================================================

function useSlideshow(length: number, interval = 5000, paused = false) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (paused || isHovered || length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % length);
    }, interval);
    return () => clearInterval(timer);
  }, [length, interval, paused, isHovered]);

  return {
    currentSlide,
    setCurrentSlide,
    isHovered,
    setIsHovered,
    goNext: () => setCurrentSlide((prev) => (prev + 1) % length),
    goPrev: () => setCurrentSlide((prev) => (prev - 1 + length) % length),
  };
}

// ============================================================================
// Details Modal Component
// ============================================================================

function DetailsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-4 md:inset-10 bg-zinc-900 rounded-2xl border border-amber-500/30 z-50 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <AIAnalyticsIcon size={24} color={ACCENT_COLOR} isAnimating />
                  <h2 className="text-white font-semibold text-lg">AI Insights</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-auto">
                <div className="grid gap-4">
                  {sampleInsights.map((insight, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-white/10 bg-white/5"
                      style={{ borderLeftColor: insight.gradient.from, borderLeftWidth: 3 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span style={{ color: insight.gradient.from }}>{insight.icon}</span>
                        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: insight.gradient.from }}>
                          {insight.label}
                        </span>
                      </div>
                      <p className="text-white font-medium">{insight.content}</p>
                      <p className="text-white/50 text-sm mt-1">{insight.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Details Drawer Component (Slide from right)
// ============================================================================

function DetailsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-900 border-l border-amber-500/30 z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <AIAnalyticsIcon size={24} color={ACCENT_COLOR} isAnimating />
                  <h2 className="text-white font-semibold">All Insights</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <div className="space-y-3">
                  {sampleInsights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: insight.gradient.from }}>{insight.icon}</span>
                        <span className="text-xs uppercase tracking-wider" style={{ color: insight.gradient.from }}>
                          {insight.label}
                        </span>
                      </div>
                      <p className="text-white font-medium">{insight.content}</p>
                      <p className="text-white/40 text-sm mt-1">{insight.summary}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Mockup Wrapper
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
      <div className="bg-zinc-950">{children}</div>
    </div>
  );
}

// ============================================================================
// 1. Classic Slideshow with View Details
// ============================================================================

function Mockup1() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { currentSlide, setCurrentSlide, isHovered, setIsHovered, goNext, goPrev } = useSlideshow(sampleInsights.length, 4000, isPaused || !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 140 : 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="relative h-full bg-black/95 backdrop-blur-xl border-b border-amber-500/20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Dynamic gradient background */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              transition={{ duration: 0.5 }}
            />
            {/* Top glow */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-20 opacity-50 pointer-events-none"
              animate={{ background: `linear-gradient(180deg, ${current.gradient.from}40, transparent)` }}
              transition={{ duration: 0.5 }}
            />

            {/* Content */}
            <div className="relative h-full flex items-center px-6 gap-4">
              <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center gap-4">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-4 flex-1"
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/10"
                    style={{ background: `linear-gradient(135deg, ${current.gradient.from}30, ${current.gradient.to}20)` }}
                  >
                    <span style={{ color: current.gradient.from }}>{current.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3" style={{ color: current.gradient.from }} />
                      <span className="text-xs uppercase tracking-wider font-bold" style={{ color: current.gradient.from }}>
                        {current.label}
                      </span>
                    </div>
                    <p className="text-white text-lg font-semibold">{current.content}</p>
                    <p className="text-white/50 text-sm">{current.summary}</p>
                  </div>
                </motion.div>
              </div>

              <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* View Details Button */}
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
                style={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              >
                <span className="text-white">View Details</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Bottom navigation */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-6">
              <div className="flex gap-2">
                {sampleInsights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === currentSlide ? 24 : 6,
                      backgroundColor: i === currentSlide ? current.gradient.from : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white"
                >
                  {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Close */}
            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 p-1.5 rounded-lg text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Tab */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl border border-t-0"
            style={{ background: `${ACCENT_COLOR}20`, borderColor: `${ACCENT_COLOR}40` }}
            animate={{ y: isOpen ? 140 : 0 }}
          >
            {isOpen ? (
              <div className="w-8 h-1 rounded-full" style={{ background: ACCENT_COLOR }} />
            ) : (
              <>
                <AIAnalyticsIcon size={16} color={ACCENT_COLOR} isAnimating />
                <span className="text-amber-400 text-xs font-bold">AI</span>
                <ChevronDown className="w-3 h-3 text-amber-400" />
              </>
            )}
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 2. Compact Bar with Drawer
// ============================================================================

function Mockup2() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full overflow-hidden"
          style={{ width: '90%', maxWidth: 700 }}
          animate={{ height: isOpen ? 70 : 0 }}
        >
          <div
            className="h-full bg-black/95 backdrop-blur-xl border border-t-0 rounded-b-2xl flex items-center px-4 gap-3"
            style={{ borderColor: `${current.gradient.from}40` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button onClick={goPrev} className="p-1.5 rounded-lg bg-white/10 text-white/50 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>

            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex items-center gap-3"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${current.gradient.from}30` }}
              >
                <span style={{ color: current.gradient.from }}>{current.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{current.content}</p>
              </div>
            </motion.div>

            <button onClick={goNext} className="p-1.5 rounded-lg bg-white/10 text-white/50 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
              {sampleInsights.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ backgroundColor: i === currentSlide ? current.gradient.from : 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </div>

            <button
              onClick={() => setShowDrawer(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: `${current.gradient.from}30`, color: current.gradient.from }}
            >
              View All
            </button>

            <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/40 hover:text-white">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-lg"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 70 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// 3. Hero Slideshow with Gradient Transitions
// ============================================================================

function Mockup3() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 5000, isPaused || !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 160 : 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="relative h-full bg-black/95 backdrop-blur-xl border-b"
            style={{ borderColor: `${current.gradient.from}30` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 opacity-25"
              animate={{
                background: `linear-gradient(135deg, ${current.gradient.from} 0%, ${current.gradient.to} 50%, transparent 100%)`,
              }}
              transition={{ duration: 0.8 }}
            />

            {/* Top edge glow */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
              animate={{
                background: `linear-gradient(180deg, ${current.gradient.from}50 0%, ${current.gradient.from}20 40%, transparent 100%)`,
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Center glow orb */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-96 h-20 rounded-full blur-3xl opacity-40 pointer-events-none"
              animate={{ backgroundColor: current.gradient.from }}
              transition={{ duration: 0.5 }}
            />

            {/* Corner orbs */}
            <motion.div
              className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
              animate={{ backgroundColor: current.gradient.from }}
            />
            <motion.div
              className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none"
              animate={{ backgroundColor: current.gradient.to }}
            />

            {/* Content */}
            <div className="relative h-full flex items-center px-8">
              <div className="flex items-center gap-6 flex-1">
                {/* Large icon */}
                <motion.div
                  className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5"
                  animate={{ boxShadow: `0 0 40px ${current.gradient.from}40` }}
                >
                  <motion.span
                    animate={{ color: current.gradient.from }}
                    className="[&>svg]:w-7 [&>svg]:h-7"
                  >
                    {current.icon}
                  </motion.span>
                </motion.div>

                {/* Text content with animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4" style={{ color: current.gradient.from }} />
                      <motion.span
                        className="text-xs uppercase tracking-wider font-bold"
                        animate={{ color: current.gradient.from }}
                      >
                        {current.label}
                      </motion.span>
                    </div>
                    <p className="text-white text-2xl font-bold">{current.content}</p>
                    <p className="text-white/50 mt-1">{current.summary}</p>
                  </motion.div>
                </AnimatePresence>

                {/* View Details */}
                <motion.button
                  onClick={() => setShowDetails(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white"
                  animate={{
                    background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})`,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-8">
              <div className="flex gap-2">
                {sampleInsights.map((insight, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === currentSlide ? 32 : 8,
                      backgroundColor: i === currentSlide ? 'white' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
              <span className="text-white/30 text-xs">
                {currentSlide + 1} / {sampleInsights.length}
              </span>
              <div className="flex gap-2">
                <button onClick={goPrev} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPaused ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button onClick={goNext} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Close & Refresh */}
            <div className="absolute top-2 right-2 flex gap-1">
              <button className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 rounded-b-xl border border-t-0"
            style={{
              background: isOpen ? `${ACCENT_COLOR}30` : `${ACCENT_COLOR}20`,
              borderColor: `${ACCENT_COLOR}40`,
              boxShadow: isOpen ? 'none' : `0 4px 20px ${ACCENT_COLOR}30`,
            }}
            animate={{
              y: isOpen ? 160 : 0,
              height: isOpen ? 24 : 32,
              paddingTop: isOpen ? 4 : 8,
              paddingBottom: isOpen ? 4 : 8,
            }}
          >
            {isOpen ? (
              <motion.div
                className="w-8 h-1 rounded-full"
                animate={{ background: `linear-gradient(90deg, ${current.gradient.from}, ${current.gradient.to})` }}
              />
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

      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 4. Cards Carousel
// ============================================================================

function Mockup4() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 130 : 0 }}
        >
          <div
            className="h-full bg-gradient-to-b from-black/95 to-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center gap-3 h-full overflow-x-auto pb-2">
              {sampleInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  className="flex-shrink-0 w-64 p-3 rounded-xl border cursor-pointer"
                  style={{
                    background: i === currentSlide ? `${insight.gradient.from}20` : 'rgba(255,255,255,0.05)',
                    borderColor: i === currentSlide ? `${insight.gradient.from}50` : 'rgba(255,255,255,0.1)',
                  }}
                  animate={{
                    scale: i === currentSlide ? 1.02 : 1,
                    y: i === currentSlide ? -4 : 0,
                  }}
                  onClick={() => setCurrentSlide(i)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: insight.gradient.from }}>{insight.icon}</span>
                    <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: insight.gradient.from }}>
                      {insight.label}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium line-clamp-2">{insight.content}</p>
                </motion.div>
              ))}

              {/* View All Card */}
              <motion.button
                onClick={() => setShowDetails(true)}
                className="flex-shrink-0 w-40 h-full rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all"
              >
                <Maximize2 className="w-5 h-5 text-white/40" />
                <span className="text-white/40 text-sm">View All</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl border border-t-0"
            style={{ background: `${ACCENT_COLOR}20`, borderColor: `${ACCENT_COLOR}40` }}
            animate={{ y: isOpen ? 130 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">{sampleInsights.length} Insights</span>
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsDrawer isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 5. Minimal Ticker
// ============================================================================

function Mockup5() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, goNext, setIsHovered } = useSlideshow(sampleInsights.length, 3000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 44 : 0 }}
        >
          <div
            className="h-full flex items-center px-4 gap-4 border-b"
            style={{ background: `${current.gradient.from}10`, borderColor: `${current.gradient.from}30` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: `${current.gradient.from}30` }}
            >
              <span style={{ color: current.gradient.from }} className="[&>svg]:w-3.5 [&>svg]:h-3.5">{current.icon}</span>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentSlide}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 text-white text-sm font-medium truncate"
              >
                {current.content}
              </motion.p>
            </AnimatePresence>

            <button
              onClick={() => setShowDetails(true)}
              className="text-xs font-semibold hover:underline"
              style={{ color: current.gradient.from }}
            >
              View all {sampleInsights.length} insights
            </button>

            <button onClick={() => setIsOpen(false)} className="p-1 text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="px-6 py-1"
            animate={{ y: isOpen ? 44 : 0 }}
          >
            <motion.div
              className="h-0.5 w-12 rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
              animate={{ width: isOpen ? 40 : 48 }}
            />
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 6. Split View with Preview
// ============================================================================

function Mockup6() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { currentSlide, setCurrentSlide, setIsHovered } = useSlideshow(sampleInsights.length, 5000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 120 : 0 }}
        >
          <div className="h-full bg-black/95 backdrop-blur-xl border-b border-white/10 flex">
            {/* Left: Current insight */}
            <div
              className="flex-1 p-4 flex items-center gap-4 border-r border-white/10"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                animate={{ background: `linear-gradient(135deg, ${current.gradient.from}30, ${current.gradient.to}20)` }}
              >
                <motion.span animate={{ color: current.gradient.from }}>{current.icon}</motion.span>
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1"
                >
                  <motion.span
                    className="text-xs uppercase tracking-wider font-bold"
                    animate={{ color: current.gradient.from }}
                  >
                    {current.label}
                  </motion.span>
                  <p className="text-white font-medium">{current.content}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Mini list */}
            <div className="w-64 p-3 flex flex-col gap-2">
              {sampleInsights.slice(0, 3).map((insight, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${i === currentSlide ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  <span style={{ color: insight.gradient.from }} className="[&>svg]:w-4 [&>svg]:h-4">{insight.icon}</span>
                  <span className="text-white/70 text-xs truncate flex-1">{insight.content}</span>
                </button>
              ))}
              <button
                onClick={() => setShowDrawer(true)}
                className="text-amber-400 text-xs hover:underline text-center mt-1"
              >
                + {sampleInsights.length - 3} more
              </button>
            </div>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 120 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// 7. Stacked Cards Reveal
// ============================================================================

function Mockup7() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full"
          style={{ width: '90%', maxWidth: 500 }}
          animate={{ y: isOpen ? 8 : -80 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          {/* Stacked cards effect */}
          {[2, 1, 0].map((offset) => {
            const index = (currentSlide + offset) % sampleInsights.length;
            const insight = sampleInsights[index];
            return (
              <motion.div
                key={offset}
                className="absolute inset-x-0 rounded-2xl border bg-black/95 backdrop-blur-xl"
                style={{
                  borderColor: offset === 0 ? `${insight.gradient.from}50` : 'rgba(255,255,255,0.1)',
                  zIndex: 3 - offset,
                }}
                animate={{
                  y: offset * 8,
                  scale: 1 - offset * 0.03,
                  opacity: 1 - offset * 0.2,
                }}
              >
                {offset === 0 && (
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${insight.gradient.from}25` }}
                      >
                        <span style={{ color: insight.gradient.from }}>{insight.icon}</span>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: insight.gradient.from }}>
                          {insight.label}
                        </span>
                        <p className="text-white font-medium">{insight.content}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                      <div className="flex gap-1.5">
                        {sampleInsights.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className="w-2 h-2 rounded-full transition-all"
                            style={{ backgroundColor: i === currentSlide ? insight.gradient.from : 'rgba(255,255,255,0.3)' }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setShowDetails(true)}
                        className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: insight.gradient.from }}
                      >
                        View Details <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl border border-t-0"
            style={{ background: `${ACCENT_COLOR}20`, borderColor: `${ACCENT_COLOR}40` }}
            animate={{ y: isOpen ? 100 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronDown className="w-3 h-3 text-amber-400" />
            </motion.div>
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 8. Floating Panel with Glow
// ============================================================================

function Mockup8() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute left-1/2 -translate-x-1/2 top-full mt-3"
              style={{ width: '90%', maxWidth: 550 }}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute -inset-2 rounded-3xl blur-xl opacity-30"
                animate={{ backgroundColor: current.gradient.from }}
              />
              <div className="relative bg-black/95 backdrop-blur-xl rounded-2xl border p-5" style={{ borderColor: `${current.gradient.from}40` }}>
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    animate={{ background: `linear-gradient(135deg, ${current.gradient.from}30, ${current.gradient.to}20)` }}
                  >
                    <motion.span animate={{ color: current.gradient.from }} className="[&>svg]:w-6 [&>svg]:h-6">
                      {current.icon}
                    </motion.span>
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex-1"
                    >
                      <motion.span
                        className="text-xs uppercase tracking-wider font-bold"
                        animate={{ color: current.gradient.from }}
                      >
                        {current.label}
                      </motion.span>
                      <p className="text-white text-lg font-semibold">{current.content}</p>
                      <p className="text-white/50 text-sm">{current.summary}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    {sampleInsights.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlide(i)}
                        className="h-1.5 rounded-full transition-all"
                        style={{
                          width: i === currentSlide ? 20 : 6,
                          backgroundColor: i === currentSlide ? current.gradient.from : 'rgba(255,255,255,0.3)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={goPrev} className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={goNext} className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <motion.button
                      onClick={() => setShowDrawer(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
                    >
                      View All
                    </motion.button>
                  </div>
                </div>

                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="relative mt-2"
            animate={{ y: isOpen ? 4 : 0 }}
          >
            {!isOpen && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: ACCENT_COLOR }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            <div
              className="relative w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${ACCENT_COLOR}, ${ACCENT_SECONDARY})`, boxShadow: `0 4px 15px ${ACCENT_COLOR}50` }}
            >
              <motion.div animate={{ rotate: isOpen ? 45 : 0 }}>
                {isOpen ? <X className="w-5 h-5 text-white" /> : <AIAnalyticsIcon size={20} color="white" isAnimating />}
              </motion.div>
            </div>
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// 9. Side Tab with Slide
// ============================================================================

function Mockup9() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute right-0 top-full h-24 overflow-hidden"
          animate={{ width: isOpen ? 400 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="h-full w-[400px] bg-black/95 backdrop-blur-xl border-l border-b rounded-bl-2xl p-4 flex items-center gap-4"
            style={{ borderColor: `${current.gradient.from}40` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button onClick={goPrev} className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${current.gradient.from}25` }}>
                  <span style={{ color: current.gradient.from }}>{current.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs uppercase tracking-wider" style={{ color: current.gradient.from }}>{current.label}</span>
                  <p className="text-white font-medium truncate">{current.content}</p>
                </div>
              </motion.div>
            </AnimatePresence>
            <button onClick={goNext} className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDetails(true)}
              className="p-2 rounded-lg"
              style={{ background: `${current.gradient.from}25`, color: current.gradient.from }}
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute right-0 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 py-3 px-2 rounded-l-lg border border-r-0"
            style={{ background: `${ACCENT_COLOR}20`, borderColor: `${ACCENT_COLOR}40` }}
            animate={{ x: isOpen ? -400 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronLeft className="w-4 h-4 text-amber-400" />
            </motion.div>
            {!isOpen && <AIAnalyticsIcon size={16} color={ACCENT_COLOR} isAnimating />}
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 10. Fade Transition Slideshow
// ============================================================================

function Mockup10() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 100 : 0 }}
        >
          <div
            className="relative h-full bg-black/95 backdrop-blur-xl border-b"
            style={{ borderColor: `${current.gradient.from}30` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Background slides */}
            {sampleInsights.map((insight, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                style={{ background: `linear-gradient(135deg, ${insight.gradient.from}15, transparent)` }}
                animate={{ opacity: i === currentSlide ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />
            ))}

            <div className="relative h-full flex items-center px-8">
              <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex-1 flex items-center justify-center gap-4 relative h-16">
                {sampleInsights.map((insight, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 flex items-center justify-center gap-4"
                    animate={{
                      opacity: i === currentSlide ? 1 : 0,
                      scale: i === currentSlide ? 1 : 0.95,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${insight.gradient.from}25` }}>
                      <span style={{ color: insight.gradient.from }}>{insight.icon}</span>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: insight.gradient.from }}>
                        {insight.label}
                      </span>
                      <p className="text-white text-lg font-medium">{insight.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDrawer(true)}
                className="ml-4 px-4 py-2 rounded-lg font-semibold text-sm text-white"
                style={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              >
                View All
              </button>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
              <motion.div
                className="h-full"
                style={{ backgroundColor: current.gradient.from }}
                animate={{ width: `${((currentSlide + 1) / sampleInsights.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 p-1.5 rounded-lg text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 100 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>

      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// Continue with 11-20 (abbreviated for space - similar patterns)
// ============================================================================

// 11-20 follow similar patterns with variations:
// - Different animation styles (scale, rotate, blur)
// - Different layouts (centered, side, full-width)
// - Different View Details triggers (button, icon, text link)
// - Different slideshow transitions

function Mockup11() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, setIsHovered } = useSlideshow(sampleInsights.length, 3500, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full w-[85%] max-w-xl overflow-hidden"
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        >
          <motion.div
            className="bg-black/95 backdrop-blur-xl rounded-b-2xl border border-t-0 p-4"
            style={{ borderColor: `${current.gradient.from}40` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Vertical slideshow */}
            <div className="relative h-20 overflow-hidden">
              {sampleInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 flex items-center gap-4"
                  animate={{
                    y: (i - currentSlide) * 100,
                    opacity: i === currentSlide ? 1 : 0,
                  }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${insight.gradient.from}25` }}>
                    <span style={{ color: insight.gradient.from }}>{insight.icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs uppercase tracking-wider" style={{ color: insight.gradient.from }}>{insight.label}</span>
                    <p className="text-white font-medium">{insight.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex flex-col gap-1">
                {sampleInsights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="w-6 h-1 rounded-full transition-all"
                    style={{ backgroundColor: i === currentSlide ? current.gradient.from : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              >
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 160 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// Mockups 12-20 would follow similar patterns...
// For brevity, I'll create a few more unique ones

function Mockup12() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { currentSlide, setCurrentSlide, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 80 : 0 }}
        >
          <div
            className="h-full flex items-center px-4 gap-2"
            style={{ background: `linear-gradient(90deg, black, ${current.gradient.from}15, black)` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Dots navigation on left */}
            <div className="flex gap-1.5">
              {sampleInsights.map((insight, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{
                    background: i === currentSlide ? `${insight.gradient.from}30` : 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: i === currentSlide ? `${insight.gradient.from}50` : 'transparent',
                  }}
                >
                  <span style={{ color: i === currentSlide ? insight.gradient.from : 'rgba(255,255,255,0.4)' }} className="[&>svg]:w-4 [&>svg]:h-4">
                    {insight.icon}
                  </span>
                </button>
              ))}
            </div>

            {/* Current content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 px-4"
              >
                <p className="text-white font-medium">{current.content}</p>
                <p className="text-white/50 text-sm">{current.summary}</p>
              </motion.div>
            </AnimatePresence>

            <button
              onClick={() => setShowDrawer(true)}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: `${current.gradient.from}25`, color: current.gradient.from }}
            >
              Details
            </button>

            <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white">
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 80 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">{sampleInsights.length}</span>
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// 13. Circular Progress Ring
// ============================================================================

function Mockup13() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];
  const progress = ((currentSlide + 1) / sampleInsights.length) * 100;

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 110 : 0 }}
        >
          <div
            className="h-full bg-black/95 backdrop-blur-xl border-b px-6 py-4 flex items-center gap-6"
            style={{ borderColor: `${current.gradient.from}30` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Circular progress */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <motion.circle
                  cx="18" cy="18" r="16" fill="none"
                  stroke={current.gradient.from}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={100}
                  animate={{ strokeDashoffset: 100 - progress }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{currentSlide + 1}/{sampleInsights.length}</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: current.gradient.from }}>{current.icon}</span>
                  <span className="text-xs uppercase tracking-wider font-bold" style={{ color: current.gradient.from }}>
                    {current.label}
                  </span>
                </div>
                <p className="text-white text-lg font-semibold">{current.content}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
              <motion.button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-white"
                animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              >
                Details
              </motion.button>
            </div>

            <button onClick={() => setIsOpen(false)} className="p-2 text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 110 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 14. Morphing Background Blobs
// ============================================================================

function Mockup14() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4500, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 140 : 0 }}
        >
          <div
            className="relative h-full bg-black/90 backdrop-blur-xl border-b"
            style={{ borderColor: `${current.gradient.from}30` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Morphing blobs */}
            <motion.div
              className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full blur-3xl opacity-30 -translate-y-1/2"
              animate={{
                backgroundColor: current.gradient.from,
                scale: [1, 1.2, 1],
                x: [0, 20, 0],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full blur-3xl opacity-25 -translate-y-1/2"
              animate={{
                backgroundColor: current.gradient.to,
                scale: [1.2, 1, 1.2],
                x: [0, -20, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            />

            <div className="relative h-full flex items-center px-8 gap-6">
              <motion.div
                className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10"
                animate={{ background: `${current.gradient.from}20`, boxShadow: `0 0 30px ${current.gradient.from}30` }}
              >
                <motion.span animate={{ color: current.gradient.from }} className="[&>svg]:w-6 [&>svg]:h-6">
                  {current.icon}
                </motion.span>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="flex-1"
                >
                  <motion.span
                    className="text-xs uppercase tracking-wider font-bold flex items-center gap-2"
                    animate={{ color: current.gradient.from }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {current.label}
                  </motion.span>
                  <p className="text-white text-xl font-bold mt-1">{current.content}</p>
                  <p className="text-white/50 text-sm">{current.summary}</p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col gap-2">
                <div className="flex gap-1">
                  <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <motion.button
                  onClick={() => setShowDrawer(true)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white flex items-center gap-2"
                  animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
                  whileHover={{ scale: 1.05 }}
                >
                  View All <ExternalLink className="w-3 h-3" />
                </motion.button>
              </div>
            </div>

            {/* Bottom dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {sampleInsights.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ backgroundColor: i === currentSlide ? 'white' : 'rgba(255,255,255,0.3)' }}
                />
              ))}
            </div>

            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 p-1.5 rounded-lg text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 140 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// 15. Mini Cards Strip
// ============================================================================

function Mockup15() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, setIsHovered } = useSlideshow(sampleInsights.length, 3500, !isOpen);

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 90 : 0 }}
        >
          <div
            className="h-full bg-black/95 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {sampleInsights.map((insight, i) => (
              <motion.button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className="flex-1 h-full rounded-xl border p-3 flex items-center gap-3 transition-all"
                style={{
                  background: i === currentSlide ? `${insight.gradient.from}15` : 'transparent',
                  borderColor: i === currentSlide ? `${insight.gradient.from}50` : 'rgba(255,255,255,0.1)',
                }}
                animate={{
                  scale: i === currentSlide ? 1.02 : 1,
                }}
                whileHover={{ scale: 1.02 }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${insight.gradient.from}25` }}
                >
                  <span style={{ color: insight.gradient.from }} className="[&>svg]:w-4 [&>svg]:h-4">{insight.icon}</span>
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-white text-sm font-medium truncate">{insight.content}</p>
                </div>
                {i === currentSlide && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: insight.gradient.from }}
                  />
                )}
              </motion.button>
            ))}
            <button
              onClick={() => setShowDetails(true)}
              className="px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all flex-shrink-0"
            >
              <Maximize2 className="w-5 h-5 text-white/40" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 90 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">{sampleInsights.length}</span>
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 16. Typewriter Effect
// ============================================================================

function Mockup16() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 6000, !isOpen);
  const current = sampleInsights[currentSlide];

  useEffect(() => {
    if (!isOpen) return;
    setDisplayText('');
    const text = current.content;
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [currentSlide, isOpen, current.content]);

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 120 : 0 }}
        >
          <div
            className="h-full bg-black/95 backdrop-blur-xl border-b px-8 py-4"
            style={{ borderColor: `${current.gradient.from}30` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex items-center gap-4 h-full">
              <motion.div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                animate={{ background: `${current.gradient.from}25` }}
              >
                <motion.span animate={{ color: current.gradient.from }}>{current.icon}</motion.span>
              </motion.div>

              <div className="flex-1">
                <motion.span
                  className="text-xs uppercase tracking-wider font-bold"
                  animate={{ color: current.gradient.from }}
                >
                  {current.label}
                </motion.span>
                <p className="text-white text-xl font-semibold mt-1">
                  {displayText}
                  <motion.span
                    className="inline-block w-0.5 h-5 ml-1 align-middle"
                    style={{ backgroundColor: current.gradient.from }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1.5">
                  {sampleInsights.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: i === currentSlide ? current.gradient.from : 'rgba(255,255,255,0.3)' }}
                    />
                  ))}
                </div>
                <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <motion.button
                  onClick={() => setShowDrawer(true)}
                  className="px-4 py-2 rounded-lg font-semibold text-sm text-white"
                  animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
                >
                  View All
                </motion.button>
              </div>
            </div>

            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 p-1.5 rounded-lg text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 120 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// 17. Flip Card Transition
// ============================================================================

function Mockup17() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full w-[85%] max-w-lg overflow-hidden"
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        >
          <div
            className="bg-black/95 backdrop-blur-xl rounded-b-2xl border border-t-0 p-4"
            style={{ borderColor: `${current.gradient.from}40` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Flip container */}
            <div className="relative h-20" style={{ perspective: '1000px' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center gap-4"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${current.gradient.from}25` }}
                  >
                    <span style={{ color: current.gradient.from }}>{current.icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: current.gradient.from }}>
                      {current.label}
                    </span>
                    <p className="text-white font-semibold">{current.content}</p>
                    <p className="text-white/50 text-sm">{current.summary}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex gap-2">
                <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1.5">
                {sampleInsights.map((insight, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="w-6 h-1.5 rounded-full transition-all"
                    style={{ backgroundColor: i === currentSlide ? insight.gradient.from : 'rgba(255,255,255,0.2)' }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowDetails(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              >
                Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 170 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 18. Spotlight Effect
// ============================================================================

function Mockup18() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 130 : 0 }}
        >
          <div
            className="relative h-full bg-black/98 border-b"
            style={{ borderColor: `${current.gradient.from}20` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Spotlight gradient */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                background: `radial-gradient(ellipse 400px 200px at 50% 0%, ${current.gradient.from}25 0%, transparent 70%)`,
              }}
              transition={{ duration: 0.5 }}
            />

            <div className="relative h-full flex items-center px-8">
              <button onClick={goPrev} className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 mr-4">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex-1 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <motion.span animate={{ color: current.gradient.from }}>{current.icon}</motion.span>
                      <motion.span
                        className="text-xs uppercase tracking-wider font-bold"
                        animate={{ color: current.gradient.from }}
                      >
                        {current.label}
                      </motion.span>
                    </div>
                    <p className="text-white text-2xl font-bold">{current.content}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button onClick={goNext} className="p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 ml-4">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Bottom bar */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-6">
              <div className="flex gap-2">
                {sampleInsights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === currentSlide ? 24 : 6,
                      backgroundColor: i === currentSlide ? 'white' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
              <motion.button
                onClick={() => setShowDrawer(true)}
                className="px-4 py-1.5 rounded-full font-semibold text-xs text-white"
                animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              >
                View All Insights
              </motion.button>
            </div>

            <button onClick={() => setIsOpen(false)} className="absolute top-2 right-2 p-1.5 rounded-lg text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 130 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// 19. Timeline Strip
// ============================================================================

function Mockup19() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { currentSlide, setCurrentSlide, setIsHovered } = useSlideshow(sampleInsights.length, 4000, !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 100 : 0 }}
        >
          <div
            className="h-full bg-black/95 backdrop-blur-xl border-b border-white/10 px-4 py-3"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Timeline */}
            <div className="relative flex items-center h-full">
              {/* Timeline line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
              <motion.div
                className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2"
                style={{ backgroundColor: current.gradient.from }}
                animate={{ width: `${((currentSlide + 1) / sampleInsights.length) * 100}%` }}
              />

              {/* Timeline nodes */}
              <div className="relative flex items-center justify-between w-full">
                {sampleInsights.map((insight, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="flex flex-col items-center gap-2"
                  >
                    <motion.div
                      className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10"
                      style={{
                        backgroundColor: i <= currentSlide ? `${insight.gradient.from}30` : 'black',
                        borderColor: i <= currentSlide ? insight.gradient.from : 'rgba(255,255,255,0.2)',
                      }}
                      animate={{
                        scale: i === currentSlide ? 1.2 : 1,
                      }}
                    >
                      <span
                        style={{ color: i <= currentSlide ? insight.gradient.from : 'rgba(255,255,255,0.4)' }}
                        className="[&>svg]:w-4 [&>svg]:h-4"
                      >
                        {insight.icon}
                      </span>
                    </motion.div>
                    <AnimatePresence>
                      {i === currentSlide && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="text-white text-xs font-medium text-center max-w-24 line-clamp-1"
                        >
                          {insight.content}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>

              {/* View Details floating button */}
              <motion.button
                onClick={() => setShowDetails(true)}
                className="absolute right-0 top-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
              >
                Details
              </motion.button>
            </div>

            <button onClick={() => setIsOpen(false)} className="absolute top-1 right-1 p-1.5 rounded-lg text-white/40 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-b-xl"
            style={{ background: `${ACCENT_COLOR}25` }}
            animate={{ y: isOpen ? 100 : 0 }}
          >
            <AIAnalyticsIcon size={14} color={ACCENT_COLOR} isAnimating />
            <span className="text-amber-400 text-[10px] font-bold">AI</span>
          </motion.button>
        </div>
      </MockTopNav>
      <DetailsModal isOpen={showDetails} onClose={() => setShowDetails(false)} />
    </>
  );
}

// ============================================================================
// 20. Glassmorphism with Blur Layers
// ============================================================================

function Mockup20() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const { currentSlide, setCurrentSlide, goNext, goPrev, setIsHovered } = useSlideshow(sampleInsights.length, 4500, isPaused || !isOpen);
  const current = sampleInsights[currentSlide];

  return (
    <>
      <MockTopNav>
        <motion.div
          className="absolute left-0 right-0 top-full overflow-hidden"
          animate={{ height: isOpen ? 150 : 0 }}
        >
          <div
            className="relative h-full"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Layered glass panels */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95" />
            <motion.div
              className="absolute inset-0 opacity-30"
              animate={{ background: `linear-gradient(135deg, ${current.gradient.from}40, transparent, ${current.gradient.to}20)` }}
            />
            <div className="absolute inset-0 backdrop-blur-xl" />

            {/* Floating glass card */}
            <motion.div
              className="absolute inset-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md overflow-hidden"
              animate={{ borderColor: `${current.gradient.from}30` }}
            >
              {/* Inner glow */}
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-30"
                animate={{ backgroundColor: current.gradient.from }}
              />

              <div className="relative h-full flex items-center px-6 gap-5">
                <motion.div
                  className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/10 border border-white/10"
                  animate={{ boxShadow: `0 0 25px ${current.gradient.from}30` }}
                >
                  <motion.span animate={{ color: current.gradient.from }} className="[&>svg]:w-6 [&>svg]:h-6">
                    {current.icon}
                  </motion.span>
                </motion.div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3" style={{ color: current.gradient.from }} />
                      <motion.span
                        className="text-xs uppercase tracking-wider font-bold"
                        animate={{ color: current.gradient.from }}
                      >
                        {current.label}
                      </motion.span>
                    </div>
                    <p className="text-white text-xl font-bold">{current.content}</p>
                    <p className="text-white/50 text-sm">{current.summary}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex flex-col gap-2">
                  <div className="flex gap-1">
                    <button onClick={goPrev} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white border border-white/10">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className={`p-2 rounded-lg border border-white/10 ${isPaused ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button onClick={goNext} className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white border border-white/10">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <motion.button
                    onClick={() => setShowDrawer(true)}
                    className="px-4 py-2 rounded-lg font-semibold text-sm text-white flex items-center justify-center gap-2"
                    animate={{ background: `linear-gradient(135deg, ${current.gradient.from}, ${current.gradient.to})` }}
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Bottom dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {sampleInsights.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === currentSlide ? 20 : 6,
                      backgroundColor: i === currentSlide ? 'white' : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <button onClick={() => setIsOpen(false)} className="absolute top-1 right-1 p-1.5 rounded-lg text-white/40 hover:text-white z-10">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <div className="absolute left-1/2 -translate-x-1/2 top-full z-10">
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 rounded-b-xl border border-t-0"
            style={{
              background: isOpen ? `${ACCENT_COLOR}30` : `${ACCENT_COLOR}20`,
              borderColor: `${ACCENT_COLOR}40`,
              boxShadow: isOpen ? 'none' : `0 4px 20px ${ACCENT_COLOR}30`,
            }}
            animate={{
              y: isOpen ? 150 : 0,
              height: isOpen ? 24 : 32,
              paddingTop: isOpen ? 4 : 8,
              paddingBottom: isOpen ? 4 : 8,
            }}
          >
            {isOpen ? (
              <motion.div
                className="w-8 h-1 rounded-full"
                animate={{ background: `linear-gradient(90deg, ${current.gradient.from}, ${current.gradient.to})` }}
              />
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
      <DetailsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function InsightsUnderNavV2Page() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Insights - Under Nav V2</h1>
          <p className="text-white/60 text-lg">
            20 more mockups with slideshow effects and View Details buttons. Click tabs to toggle, use arrows to navigate slides.
          </p>
        </div>

        <div className="space-y-8">
          <MockupWrapper number={1} title="Classic Slideshow" description="Full slideshow with modal details">
            <div className="h-72 relative"><Mockup1 /></div>
          </MockupWrapper>

          <MockupWrapper number={2} title="Compact Bar" description="Minimal bar with drawer">
            <div className="h-48 relative"><Mockup2 /></div>
          </MockupWrapper>

          <MockupWrapper number={3} title="Hero Gradient" description="Dynamic gradient transitions">
            <div className="h-80 relative"><Mockup3 /></div>
          </MockupWrapper>

          <MockupWrapper number={4} title="Cards Carousel" description="Horizontal scrolling cards">
            <div className="h-56 relative"><Mockup4 /></div>
          </MockupWrapper>

          <MockupWrapper number={5} title="Minimal Ticker" description="Auto-scrolling ticker bar">
            <div className="h-32 relative"><Mockup5 /></div>
          </MockupWrapper>

          <MockupWrapper number={6} title="Split View" description="Current insight + mini list">
            <div className="h-56 relative"><Mockup6 /></div>
          </MockupWrapper>

          <MockupWrapper number={7} title="Stacked Cards" description="3D stacked card effect">
            <div className="h-56 relative"><Mockup7 /></div>
          </MockupWrapper>

          <MockupWrapper number={8} title="Floating Glow" description="Floating panel with glow">
            <div className="h-72 relative"><Mockup8 /></div>
          </MockupWrapper>

          <MockupWrapper number={9} title="Side Slide" description="Slides from right edge">
            <div className="h-48 relative"><Mockup9 /></div>
          </MockupWrapper>

          <MockupWrapper number={10} title="Fade Transition" description="Cross-fade with progress bar">
            <div className="h-48 relative"><Mockup10 /></div>
          </MockupWrapper>

          <MockupWrapper number={11} title="Vertical Scroll" description="Vertical sliding content">
            <div className="h-64 relative"><Mockup11 /></div>
          </MockupWrapper>

          <MockupWrapper number={12} title="Icon Navigation" description="Icon tabs for quick switch">
            <div className="h-48 relative"><Mockup12 /></div>
          </MockupWrapper>

          <MockupWrapper number={13} title="Circular Progress" description="Progress ring indicator">
            <div className="h-48 relative"><Mockup13 /></div>
          </MockupWrapper>

          <MockupWrapper number={14} title="Morphing Blobs" description="Animated background blobs">
            <div className="h-64 relative"><Mockup14 /></div>
          </MockupWrapper>

          <MockupWrapper number={15} title="Mini Cards Strip" description="All insights visible at once">
            <div className="h-48 relative"><Mockup15 /></div>
          </MockupWrapper>

          <MockupWrapper number={16} title="Typewriter" description="Typing animation effect">
            <div className="h-56 relative"><Mockup16 /></div>
          </MockupWrapper>

          <MockupWrapper number={17} title="Flip Card" description="3D flip transitions">
            <div className="h-64 relative"><Mockup17 /></div>
          </MockupWrapper>

          <MockupWrapper number={18} title="Spotlight" description="Center spotlight effect">
            <div className="h-56 relative"><Mockup18 /></div>
          </MockupWrapper>

          <MockupWrapper number={19} title="Timeline Strip" description="Progress timeline nodes">
            <div className="h-48 relative"><Mockup19 /></div>
          </MockupWrapper>

          <MockupWrapper number={20} title="Glassmorphism" description="Layered blur glass effect">
            <div className="h-64 relative"><Mockup20 /></div>
          </MockupWrapper>
        </div>

        <div className="mt-12 p-6 bg-zinc-900/50 rounded-xl border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Features Included</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2 text-white/70">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Auto-rotating slideshow with configurable interval
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Pause on hover functionality
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Manual navigation (prev/next, dots)
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                View Details button (opens modal or drawer)
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Dynamic gradient colors per insight
              </li>
            </ul>
            <ul className="space-y-2 text-white/70">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Circular progress indicators
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Morphing blob backgrounds
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Typewriter text animation
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                3D flip card transitions
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Glassmorphism blur effects
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
