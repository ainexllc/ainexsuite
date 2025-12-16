"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Sparkles, Lightbulb, Zap, BookOpen, Link2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { MoodOrb } from "./insights/mood-orb";
import { ProgressRing } from "./insights/progress-ring";
import { ThemePills } from "./insights/theme-pills";
import { ActionItems } from "./insights/action-items";
import { ReflectionPrompt } from "./insights/reflection-prompt";
import { InsightCard } from "./insights/insight-card";

// AI Color palette
const AI_COLORS = {
  purple: { from: "#8b5cf6", to: "#6366f1" },
  cyan: { from: "#06b6d4", to: "#3b82f6" },
  pink: { from: "#ec4899", to: "#8b5cf6" },
  teal: { from: "#14b8a6", to: "#06b6d4" },
  amber: { from: "#f59e0b", to: "#ec4899" },
  indigo: { from: "#6366f1", to: "#8b5cf6" },
};

export interface AIInsightsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Weekly focus / main summary */
  weeklyFocus?: string;
  /** Current mood */
  mood?: string;
  /** Common themes array */
  commonThemes?: string[];
  /** Pending action items */
  pendingActions?: string[];
  /** Top categories with counts */
  topCategories?: Array<{ name: string; count: number }>;
  /** Connected topics */
  connections?: Array<{ topic: string; noteCount: number }>;
  /** Learning topics */
  learningTopics?: string[];
  /** Quick tip */
  quickTip?: string;
  /** Reflection prompt */
  reflectionPrompt?: string;
  /** Current streak count */
  streak?: number;
  /** Items this week count */
  itemsThisWeek?: number;
  /** Last updated timestamp */
  lastUpdated?: Date | null;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Whether refresh is in progress */
  isRefreshing?: boolean;
  /** Start entry handler (for reflection prompt) */
  onStartEntry?: () => void;
  /** View connections handler */
  onViewConnections?: (topic: string) => void;
  /** Theme click handler */
  onThemeClick?: (theme: string) => void;
  /** Storage key for action items persistence */
  actionsStorageKey?: string;
  /** App accent color (for header) */
  accentColor?: string;
}

/**
 * AIInsightsModal - Full-screen insights display
 *
 * Features:
 * - Dark glassmorphism design
 * - Animated mood orb
 * - Progress rings for stats
 * - Interactive theme pills
 * - Checkable action items
 * - Reflection prompt with Start Entry
 * - Fully responsive grid layout
 */
export function AIInsightsModal({
  isOpen,
  onClose,
  weeklyFocus,
  mood,
  commonThemes = [],
  pendingActions = [],
  topCategories = [],
  connections = [],
  learningTopics = [],
  quickTip,
  reflectionPrompt,
  streak = 0,
  itemsThisWeek = 0,
  lastUpdated,
  onRefresh,
  isRefreshing,
  onStartEntry,
  onViewConnections,
  onThemeClick,
  actionsStorageKey,
  accentColor = "#8b5cf6",
}: AIInsightsModalProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleThemeClick = (theme: string) => {
    setSelectedTheme((prev) => (prev === theme ? null : theme));
    onThemeClick?.(theme);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "fixed inset-4 sm:inset-6 lg:inset-10 xl:inset-16 z-50",
              "bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95",
              "backdrop-blur-2xl rounded-2xl sm:rounded-3xl",
              "border border-white/10",
              "overflow-hidden flex flex-col",
              "shadow-2xl"
            )}
            style={{
              boxShadow: `0 0 100px ${accentColor}20, 0 0 200px ${accentColor}10`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: accentColor }} />
                </motion.div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">AI Insights</h2>
                  {lastUpdated && (
                    <p className="text-xs text-white/40">
                      Updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className={cn(
                      "p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
              {/* Background glow orbs */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

              {/* Grid Layout */}
              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Row 1: Mood Orb + Weekly Focus */}
                <div className="lg:col-span-4 flex justify-center">
                  <InsightCard
                    title="Current Vibe"
                    icon={<Sparkles />}
                    gradient={AI_COLORS.purple}
                    delay={1}
                    className="w-full flex flex-col items-center"
                  >
                    <MoodOrb mood={mood} size="md" delay={2} />
                  </InsightCard>
                </div>

                <div className="lg:col-span-8">
                  <InsightCard
                    title="Weekly Focus"
                    gradient={AI_COLORS.cyan}
                    delay={2}
                    className="h-full"
                  >
                    <p className="text-lg sm:text-xl lg:text-2xl font-medium text-white/90 leading-relaxed">
                      {weeklyFocus || "Add more entries to see your weekly focus..."}
                    </p>
                  </InsightCard>
                </div>

                {/* Row 2: Themes */}
                {commonThemes.length > 0 && (
                  <div className="lg:col-span-12">
                    <InsightCard
                      title="Themes"
                      icon={<span className="text-lg">#</span>}
                      gradient={AI_COLORS.pink}
                      delay={3}
                    >
                      <ThemePills
                        themes={commonThemes}
                        selectedTheme={selectedTheme}
                        onThemeClick={handleThemeClick}
                        delay={4}
                      />
                    </InsightCard>
                  </div>
                )}

                {/* Row 3: Stats + Quick Tip */}
                <div className="lg:col-span-3">
                  <InsightCard
                    title="Streak"
                    gradient={AI_COLORS.amber}
                    delay={4}
                    className="flex flex-col items-center"
                  >
                    <ProgressRing
                      value={streak}
                      max={30}
                      label="days"
                      gradient={AI_COLORS.amber}
                      size="md"
                      delay={5}
                    />
                  </InsightCard>
                </div>

                <div className="lg:col-span-3">
                  <InsightCard
                    title="This Week"
                    gradient={AI_COLORS.teal}
                    delay={5}
                    className="flex flex-col items-center"
                  >
                    <ProgressRing
                      value={itemsThisWeek}
                      max={14}
                      label="entries"
                      gradient={AI_COLORS.teal}
                      size="md"
                      delay={6}
                    />
                  </InsightCard>
                </div>

                <div className="lg:col-span-6">
                  <InsightCard
                    title="Quick Tip"
                    icon={<Lightbulb />}
                    gradient={AI_COLORS.indigo}
                    delay={6}
                    className="h-full"
                  >
                    <p className="text-base sm:text-lg text-white/80">
                      {quickTip || "Keep journaling to receive personalized tips!"}
                    </p>
                  </InsightCard>
                </div>

                {/* Row 4: Pending Actions */}
                {pendingActions.length > 0 && (
                  <div className="lg:col-span-12">
                    <InsightCard
                      title="Pending Actions"
                      icon={<Zap />}
                      gradient={AI_COLORS.amber}
                      delay={7}
                    >
                      <ActionItems
                        actions={pendingActions}
                        storageKey={actionsStorageKey}
                        gradient={AI_COLORS.amber}
                        delay={8}
                      />
                    </InsightCard>
                  </div>
                )}

                {/* Row 5: Connections + Learning */}
                {connections.length > 0 && (
                  <div className="lg:col-span-6">
                    <InsightCard
                      title="Connections"
                      icon={<Link2 />}
                      gradient={AI_COLORS.cyan}
                      delay={8}
                    >
                      <div className="space-y-2">
                        {connections.map((conn, i) => (
                          <motion.button
                            key={conn.topic}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                            onClick={() => onViewConnections?.(conn.topic)}
                            className={cn(
                              "w-full flex items-center justify-between p-2 rounded-lg",
                              "text-left hover:bg-white/5 transition-colors",
                              onViewConnections && "cursor-pointer"
                            )}
                          >
                            <span className="text-white/80">{conn.topic}</span>
                            <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                              {conn.noteCount} notes
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </InsightCard>
                  </div>
                )}

                {learningTopics.length > 0 && (
                  <div className={cn("lg:col-span-6", connections.length === 0 && "lg:col-span-12")}>
                    <InsightCard
                      title="Learning"
                      icon={<BookOpen />}
                      gradient={AI_COLORS.purple}
                      delay={9}
                    >
                      <ul className="space-y-2">
                        {learningTopics.map((topic, i) => (
                          <motion.li
                            key={topic}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.9 + i * 0.1 }}
                            className="flex items-center gap-2 text-white/80"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            {topic}
                          </motion.li>
                        ))}
                      </ul>
                    </InsightCard>
                  </div>
                )}

                {/* Row 6: Reflection Prompt */}
                {reflectionPrompt && (
                  <div className="lg:col-span-12">
                    <InsightCard
                      title="Reflection"
                      gradient={AI_COLORS.indigo}
                      delay={10}
                      glow
                    >
                      <ReflectionPrompt
                        prompt={reflectionPrompt}
                        onStartEntry={onStartEntry}
                        gradient={AI_COLORS.indigo}
                        delay={11}
                      />
                    </InsightCard>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
