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
  /** Whether this is a first-time user (shows welcome content) */
  isFirstTimeUser?: boolean;
  /** Callback to dismiss first-time user message */
  onDismissFirstTime?: () => void;
  /** Custom message when there's not enough data */
  emptyStateMessage?: string;
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
  isFirstTimeUser = false,
  onDismissFirstTime,
  emptyStateMessage,
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
            ? "max-h-[80px] sm:max-h-[90px] lg:max-h-[100px] xl:max-h-[110px] 2xl:max-h-[120px]"
            : "max-h-0"
        )}
      >
        {/* Glassmorphism Slide-out Panel - edge to edge - responsive heights */}
        <div
          className="relative h-[80px] sm:h-[90px] lg:h-[100px] xl:h-[110px] 2xl:h-[120px] border-b transition-all duration-500"
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
            className="absolute top-0 left-0 right-0 h-12 sm:h-14 lg:h-16 xl:h-18 transition-all duration-500 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${gradientFrom}60 0%, ${gradientFrom}30 40%, transparent 100%)`,
            }}
          />

          <div className="absolute inset-0 backdrop-blur-xl" />

          {/* Large colorful glow orbs - responsive sizes */}
          <div
            className="absolute -top-12 sm:-top-14 lg:-top-16 left-1/4 w-36 sm:w-48 lg:w-56 xl:w-64 2xl:w-72 h-24 sm:h-28 lg:h-32 xl:h-36 2xl:h-40 rounded-full blur-[40px] sm:blur-[50px] lg:blur-[60px] opacity-40 transition-all duration-500 pointer-events-none"
            style={{ backgroundColor: gradientFrom }}
          />
          <div
            className="absolute -bottom-12 sm:-bottom-14 lg:-bottom-16 right-1/4 w-32 sm:w-44 lg:w-52 xl:w-56 2xl:w-64 h-20 sm:h-24 lg:h-28 xl:h-32 2xl:h-36 rounded-full blur-[30px] sm:blur-[40px] lg:blur-[50px] opacity-35 transition-all duration-500 pointer-events-none"
            style={{ backgroundColor: gradientTo }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 lg:w-64 xl:w-72 2xl:w-80 h-16 sm:h-20 lg:h-24 xl:h-28 2xl:h-32 rounded-full blur-[50px] sm:blur-[60px] lg:blur-[70px] opacity-20 transition-all duration-500 pointer-events-none"
            style={{ backgroundColor: gradientFrom }}
          />

          {/* Content - responsive padding and gaps */}
          <div className="relative h-full flex items-center px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 2xl:px-10 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-5 2xl:gap-6 z-10">
            {isLoading ? (
              <div className="flex items-center justify-center w-full gap-1.5 sm:gap-2">
                <Loader2
                  className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin"
                  style={{ color: accentColor }}
                />
                <span className="text-[10px] sm:text-xs text-white/60 font-medium">{loadingMessage}</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center w-full">
                <p className="text-[10px] sm:text-xs text-yellow-400 font-medium">{error}</p>
              </div>
            ) : isFirstTimeUser ? (
              /* First-time user welcome content */
              <>
                {/* Welcome Icon */}
                <div
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 rounded-md sm:rounded-lg flex items-center justify-center border transition-all duration-500"
                  style={{
                    backgroundColor: `${gradientFrom}15`,
                    borderColor: `${gradientFrom}40`,
                    boxShadow: `0 0 20px ${gradientFrom}50, 0 0 40px ${gradientFrom}20`
                  }}
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 transition-all duration-500">
                    <AIBrainIcon
                      size={28}
                      color={gradientFrom}
                      isAnimating={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Welcome Text */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Sparkles
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    />
                    <span
                      className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-bold uppercase tracking-wider transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    >
                      Welcome to AI Insights
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg 2xl:text-xl font-medium text-white/90 leading-snug line-clamp-2">
                    Your personal AI analyzes your data to provide smart insights, patterns, and suggestions.
                  </div>
                </div>

                {/* Got It button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={onDismissFirstTime}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 lg:py-2.5 rounded-md font-semibold text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                    }}
                  >
                    Got It
                    <ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5" />
                  </button>
                </div>
              </>
            ) : sections.length === 0 ? (
              <div className="flex items-center justify-center w-full">
                <p className="text-[10px] sm:text-xs text-white/40">
                  {emptyStateMessage || "Add more entries to see AI insights"}
                </p>
              </div>
            ) : (
              <>
                {/* Icon with bold glow - responsive sizes - supports animated icons */}
                <div
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 rounded-md sm:rounded-lg flex items-center justify-center border transition-all duration-500"
                  style={{
                    backgroundColor: `${gradientFrom}15`,
                    borderColor: `${gradientFrom}40`,
                    boxShadow: `0 0 20px ${gradientFrom}50, 0 0 40px ${gradientFrom}20`
                  }}
                >
                  {currentSection?.animatedIconType ? (
                    // Render animated icon with responsive size
                    (() => {
                      const AnimatedIcon = ANIMATED_ICON_MAP[currentSection.animatedIconType];
                      return (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 transition-all duration-500">
                          <AnimatedIcon
                            size={28}
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
                      className="[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 lg:[&>svg]:w-5.5 lg:[&>svg]:h-5.5 xl:[&>svg]:w-6 xl:[&>svg]:h-6 2xl:[&>svg]:w-7 2xl:[&>svg]:h-7 transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    >
                      {currentSection?.icon}
                    </span>
                  )}
                </div>

                {/* Text Content - responsive typography */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <Sparkles
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    />
                    <span
                      className="text-[9px] sm:text-[10px] lg:text-xs xl:text-sm font-bold uppercase tracking-wider transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    >
                      {currentSection?.label}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold text-white leading-snug line-clamp-2">
                    {currentSection?.content}
                  </div>
                </div>

                {/* Right side controls - responsive */}
                <div className="flex-shrink-0 flex flex-col gap-1 sm:gap-1.5 lg:gap-2">
                  {/* Nav buttons row - hidden on mobile, visible from sm up */}
                  <div className="hidden sm:flex gap-1">
                    <button
                      onClick={goToPrevious}
                      className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    </button>
                    <button
                      onClick={() => setIsManuallyPaused(!isManuallyPaused)}
                      className={cn(
                        "flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md border border-white/10 transition-all",
                        isManuallyPaused
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                      )}
                      aria-label={isManuallyPaused ? "Resume" : "Pause"}
                    >
                      {isManuallyPaused ? <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" /> : <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />}
                    </button>
                    <button
                      onClick={goToNext}
                      className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-md bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />
                    </button>
                  </div>

                  {/* View Details button - responsive sizing */}
                  <button
                    onClick={onViewDetails}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 md:px-3 lg:px-4 py-1 sm:py-1.5 md:py-2 rounded-md font-semibold text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-white transition-all hover:scale-105 hover:shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                    }}
                  >
                    Details
                    <ArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bottom dots & timestamp - responsive */}
          {sections.length > 1 && !isLoading && !error && (
            <div className="absolute bottom-1 sm:bottom-1.5 lg:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 lg:gap-3 z-10">
              <div className="flex gap-0.5 sm:gap-1 lg:gap-1.5">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "h-0.5 rounded-full transition-all duration-300",
                      index === currentSlide
                        ? "w-2.5 sm:w-3 lg:w-4 bg-white"
                        : "w-0.5 sm:w-1 lg:w-1.5 bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Go to insight ${index + 1}`}
                  />
                ))}
              </div>
              {lastUpdated && (
                <div className="flex items-center gap-1">
                  <span className="text-[7px] sm:text-[8px] lg:text-[9px] text-white/40">
                    · Updated {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      disabled={refreshDisabled}
                      className="p-0.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh insights"
                    >
                      <RefreshCw className={cn("w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3", refreshDisabled && "animate-spin")} />
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
