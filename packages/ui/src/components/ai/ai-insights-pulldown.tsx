"use client";

import { ReactNode, useState, useEffect, useMemo } from "react";
import { Sparkles, RefreshCw, Loader2, ChevronLeft, ChevronRight, Pause, Play, ArrowRight, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Format a date as relative time (e.g., "just now", "5m ago", "2h ago", "Dec 18")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
import {
  AIAnalyticsIcon,
  AIBrainIcon,
  NeuralNetworkIcon,
  AIChatIcon,
  AISparkleIcon,
  AIRobotIcon,
  AICircuitIcon,
  AIProcessingIcon,
  AIMagicWandIcon,
  AILightbulbIcon,
  AIVoiceIcon,
  AIEyeIcon,
  AICodeIcon,
  AIAtomIcon,
  AITargetIcon,
  AILearningIcon,
  AIShieldIcon,
  AICloudIcon,
  AIDNAIcon,
  AICompassIcon,
  type AnimatedAIIconName,
} from "./animated-ai-icons";

// Map of animated icon names to components
const ANIMATED_ICON_MAP: Record<AnimatedAIIconName, React.ComponentType<{ size?: number; color?: string; isAnimating?: boolean; className?: string }>> = {
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
};

export interface AIInsightsPulldownSection {
  /** Icon for the section (fallback if no animatedIconType) */
  icon?: ReactNode;
  /** Animated icon type - use this for beautiful animated icons */
  animatedIconType?: AnimatedAIIconName;
  /** Label for the section */
  label: string;
  /** Content to display */
  content: ReactNode;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Optional gradient colors for this section */
  gradient?: {
    from: string;
    to: string;
  };
}

// AI-themed color palette - independent of app accent colors
const AI_COLOR_PALETTE = [
  { from: '#8b5cf6', to: '#6366f1' },  // Purple to Indigo
  { from: '#06b6d4', to: '#3b82f6' },  // Cyan to Blue
  { from: '#ec4899', to: '#8b5cf6' },  // Pink to Purple
  { from: '#14b8a6', to: '#06b6d4' },  // Teal to Cyan
  { from: '#f59e0b', to: '#ec4899' },  // Amber to Pink
  { from: '#6366f1', to: '#8b5cf6' },  // Indigo to Purple
];

export interface AIInsightsPulldownProps {
  /** Title displayed in the header */
  title?: string;
  /** Sections to display (max 2-3 recommended for horizontal layout) */
  sections: AIInsightsPulldownSection[];
  /** Primary accent color (hex) - used for handle tab only */
  accentColor: string;
  /** Whether insights are loading */
  isLoading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error message */
  error?: string | null;
  /** Last updated timestamp */
  lastUpdated?: Date | null;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** Whether refresh is disabled */
  refreshDisabled?: boolean;
  /** Storage key for collapse state persistence */
  storageKey?: string;
  /** Default expanded state (default: true - expanded for new users) */
  defaultExpanded?: boolean;
  /** Additional class names for the wrapper */
  className?: string;
  /** Callback when "View All" or detail action is clicked */
  onViewDetails?: () => void;
  /** Callback when expanded state changes (for parent layout adjustment) */
  onExpandedChange?: (expanded: boolean) => void;
}

/**
 * AI Insights Pulldown - Full Hero Slideshow Style
 *
 * Features:
 * - Full hero-style panel with gradient backgrounds and glow effects
 * - Large icon with glow shadow
 * - Smooth slideshow with pause on hover
 * - Bottom navigation: dots (left), prev/next buttons (right)
 * - Persistent collapse/expand state with localStorage
 *
 * Based on MarketingSlideshow - Full Hero Style
 */
export function AIInsightsPulldown({
  sections,
  accentColor,
  isLoading = false,
  loadingMessage = "Analyzing...",
  error = null,
  lastUpdated = null,
  onRefresh,
  refreshDisabled = false,
  storageKey,
  defaultExpanded = true,
  className,
  onViewDetails,
  onExpandedChange,
}: AIInsightsPulldownProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHoverPaused, setIsHoverPaused] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const autoRotateInterval = 5000; // 5 seconds like MarketingSlideshow

  // Combined pause state - paused if either hover or manual
  const isPaused = isHoverPaused || isManuallyPaused;

  // Get gradient colors for current slide from AI palette (not app colors)
  const currentSection = sections[currentSlide];
  const currentPalette = AI_COLOR_PALETTE[currentSlide % AI_COLOR_PALETTE.length];
  const gradientFrom = currentPalette.from;
  const gradientTo = currentPalette.to;

  // Load expanded state from localStorage
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const expanded = stored === "true";
        setIsExpanded(expanded);
        onExpandedChange?.(expanded);
      }
    }
  }, [storageKey, onExpandedChange]);

  // Auto-rotate through sections
  useEffect(() => {
    if (isPaused || sections.length <= 1 || isLoading || !isExpanded) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sections.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [isPaused, sections.length, isLoading, isExpanded]);

  // Reset slide when sections change
  useEffect(() => {
    setCurrentSlide(0);
  }, [sections.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sections.length) % sections.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sections.length);
  };

  // Toggle and persist state
  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
    if (storageKey) {
      localStorage.setItem(storageKey, String(newExpanded));
    }
  };

  // Compute relative time for lastUpdated
  const timeAgo = useMemo(() => {
    if (!lastUpdated) return null;
    return formatRelativeTime(lastUpdated);
  }, [lastUpdated]);

  return (
    <div className={cn("flex flex-col flex-shrink-0 dark", className)}>
      {/* Thin accent line across bottom of nav - matches tab styling */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}60 20%, ${accentColor} 50%, ${accentColor}60 80%, transparent)`,
        }}
      />

      {/* Panel wrapper - animates height to push content - responsive heights */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isExpanded
            ? "max-h-[100px] sm:max-h-[120px] lg:max-h-[140px] xl:max-h-[160px] 2xl:max-h-[180px]"
            : "max-h-0"
        )}
      >
        {/* Glassmorphism Slide-out Panel - edge to edge - responsive heights */}
        <div
          className="relative h-[100px] sm:h-[120px] lg:h-[140px] xl:h-[160px] 2xl:h-[180px] border-b transition-all duration-500"
          style={{ borderColor: `${gradientFrom}40` }}
          onMouseEnter={() => setIsHoverPaused(true)}
          onMouseLeave={() => setIsHoverPaused(false)}
        >
          {/* Base dark background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/90" />

          {/* Bold color gradient overlay - transitions with each slide */}
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom}50 0%, ${gradientFrom}20 30%, transparent 50%, ${gradientTo}15 70%, ${gradientTo}40 100%)`,
            }}
          />

          {/* Top edge glow - color emanating from nav - responsive height */}
          <div
            className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 xl:h-28 transition-all duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${gradientFrom}60 0%, ${gradientFrom}30 40%, transparent 100%)`,
            }}
          />

          <div className="absolute inset-0 backdrop-blur-xl" />

          {/* Large colorful glow orbs - responsive sizes */}
          <div
            className="absolute -top-16 sm:-top-20 lg:-top-24 left-1/4 w-48 sm:w-64 lg:w-80 xl:w-96 2xl:w-[28rem] h-32 sm:h-40 lg:h-48 xl:h-56 2xl:h-64 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] opacity-40 transition-all duration-500 pointer-events-none"
            style={{ backgroundColor: gradientFrom }}
          />
          <div
            className="absolute -bottom-16 sm:-bottom-20 lg:-bottom-24 right-1/4 w-44 sm:w-60 lg:w-72 xl:w-80 2xl:w-96 h-28 sm:h-36 lg:h-44 xl:h-52 2xl:h-60 rounded-full blur-[50px] sm:blur-[60px] lg:blur-[80px] opacity-35 transition-all duration-500 pointer-events-none"
            style={{ backgroundColor: gradientTo }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-80 lg:w-96 xl:w-[30rem] 2xl:w-[36rem] h-24 sm:h-28 lg:h-32 xl:h-40 2xl:h-48 rounded-full blur-[80px] sm:blur-[100px] lg:blur-[120px] opacity-20 transition-all duration-500 pointer-events-none"
            style={{ backgroundColor: gradientFrom }}
          />

          {/* Content - responsive padding and gaps */}
          <div className="relative h-full flex items-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 2xl:gap-10 z-10">
            {isLoading ? (
              <div className="flex items-center justify-center w-full gap-2 sm:gap-3">
                <Loader2
                  className="h-4 w-4 sm:h-5 sm:w-5 animate-spin"
                  style={{ color: accentColor }}
                />
                <span className="text-xs sm:text-sm text-white/60 font-medium">{loadingMessage}</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center w-full">
                <p className="text-xs sm:text-sm text-yellow-400 font-medium">{error}</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="flex items-center justify-center w-full">
                <p className="text-xs sm:text-sm text-white/40">Add more data to see AI insights</p>
              </div>
            ) : (
              <>
                {/* Icon with bold glow - responsive sizes - supports animated icons */}
                <div
                  className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 rounded-lg sm:rounded-xl flex items-center justify-center border transition-all duration-500"
                  style={{
                    backgroundColor: `${gradientFrom}15`,
                    borderColor: `${gradientFrom}40`,
                    boxShadow: `0 0 30px ${gradientFrom}50, 0 0 60px ${gradientFrom}20`
                  }}
                >
                  {currentSection?.animatedIconType ? (
                    // Render animated icon with responsive size
                    (() => {
                      const AnimatedIcon = ANIMATED_ICON_MAP[currentSection.animatedIconType];
                      return (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-10 2xl:h-10 transition-all duration-500">
                          <AnimatedIcon
                            size={40}
                            color={gradientFrom}
                            isAnimating={true}
                            className="w-full h-full"
                          />
                        </div>
                      );
                    })()
                  ) : (
                    // Fallback to static icon
                    <span
                      className="[&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6 lg:[&>svg]:w-7 lg:[&>svg]:h-7 xl:[&>svg]:w-8 xl:[&>svg]:h-8 2xl:[&>svg]:w-10 2xl:[&>svg]:h-10 transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    >
                      {currentSection?.icon}
                    </span>
                  )}
                </div>

                {/* Text Content - responsive typography */}
                <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1 lg:space-y-1.5 xl:space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5">
                    <Sparkles
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    />
                    <span
                      className="text-[10px] sm:text-xs lg:text-sm xl:text-base font-bold uppercase tracking-wider transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    >
                      {currentSection?.label}
                    </span>
                  </div>
                  <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-white leading-snug line-clamp-2">
                    {currentSection?.content}
                  </div>
                </div>

                {/* Right side controls - responsive */}
                <div className="flex-shrink-0 flex flex-col gap-1.5 sm:gap-2 lg:gap-2.5 xl:gap-3">
                  {/* Nav buttons row - hidden on mobile, visible from sm up */}
                  <div className="hidden sm:flex gap-1 lg:gap-1.5">
                    <button
                      onClick={goToPrevious}
                      className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-lg bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button
                      onClick={() => setIsManuallyPaused(!isManuallyPaused)}
                      className={cn(
                        "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-lg border border-white/10 transition-all",
                        isManuallyPaused
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                      )}
                      aria-label={isManuallyPaused ? "Resume" : "Pause"}
                    >
                      {isManuallyPaused ? <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> : <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />}
                    </button>
                    <button
                      onClick={goToNext}
                      className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-lg bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>

                  {/* View Details button - responsive sizing */}
                  <button
                    onClick={onViewDetails}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 xl:py-3 rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-white transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                    }}
                  >
                    Details
                    <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bottom dots & timestamp - responsive */}
          {sections.length > 1 && !isLoading && !error && (
            <div className="absolute bottom-1.5 sm:bottom-2 lg:bottom-2.5 xl:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 lg:gap-4 z-10">
              <div className="flex gap-1 sm:gap-1.5 lg:gap-2">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "h-0.5 sm:h-1 lg:h-1.5 rounded-full transition-all duration-300",
                      index === currentSlide
                        ? "w-3 sm:w-4 lg:w-5 xl:w-6 bg-white"
                        : "w-1 sm:w-1.5 lg:w-2 bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Go to insight ${index + 1}`}
                  />
                ))}
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-[8px] sm:text-[9px] lg:text-[10px] xl:text-xs text-white/40">
                    · Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      disabled={refreshDisabled}
                      className="p-0.5 sm:p-1 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh insights"
                    >
                      <RefreshCw className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5", refreshDisabled && "animate-spin")} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Grabbable tab handle - pull down to expand */}
      <div className="flex justify-center relative z-10">
        <button
          onClick={toggleExpanded}
          className={cn(
            "inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-b-lg sm:rounded-b-xl backdrop-blur-md border border-t-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-grab active:cursor-grabbing",
            isExpanded
              ? "bg-black/60 border-white/20"
              : "bg-white/80 dark:bg-zinc-900/80"
          )}
          style={{ borderColor: isExpanded ? `${gradientFrom}40` : `${accentColor}30` }}
        >
          {/* Icon with accent background */}
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}25` }}
          >
            {isLoading ? (
              <Loader2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 animate-spin" style={{ color: accentColor }} />
            ) : (
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" style={{ color: accentColor }} />
            )}
          </div>

          {/* AI Insights text with updated time */}
          <span className={cn(
            "text-[10px] sm:text-xs font-medium whitespace-nowrap",
            isExpanded ? "text-white/80" : "text-zinc-600 dark:text-zinc-400"
          )}>
            AI Insights
            {lastUpdated && !isLoading && (
              <span className={cn(
                "hidden sm:inline",
                isExpanded ? "text-white/50" : "text-zinc-400 dark:text-zinc-500"
              )}>
                {" · "}{timeAgo}
              </span>
            )}
          </span>

          {/* Chevron indicator */}
          <ChevronDown
            className={cn(
              "h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform duration-300",
              isExpanded ? "rotate-180 text-white/50" : "text-zinc-400"
            )}
          />
        </button>
      </div>

    </div>
  );
}

/**
 * Hook to check if insights pulldown is expanded (for lazy loading)
 */
export function useInsightsPulldownExpanded(storageKey: string | undefined): boolean {
  const [isExpanded, setIsExpanded] = useState(() => {
    // Initialize synchronously from localStorage to avoid flash/race conditions
    if (typeof window !== "undefined" && storageKey) {
      const stored = localStorage.getItem(storageKey);
      // Default to true (expanded) for new users, respect stored preference otherwise
      return stored === null ? true : stored === "true";
    }
    return true;
  });

  // Update if storageKey changes
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      // Default to true (expanded) for new users
      setIsExpanded(stored === null ? true : stored === "true");
    }
  }, [storageKey]);

  return isExpanded;
}

// Re-export type for consumers
export type { AnimatedAIIconName };
