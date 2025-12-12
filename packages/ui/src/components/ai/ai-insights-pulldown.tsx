"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface AIInsightsPulldownSection {
  /** Icon for the section */
  icon: ReactNode;
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

export interface AIInsightsPulldownProps {
  /** Title displayed in the header */
  title?: string;
  /** Sections to display (max 2-3 recommended for horizontal layout) */
  sections: AIInsightsPulldownSection[];
  /** Primary accent color (hex) */
  accentColor: string;
  /** Secondary accent color for gradient (hex) - defaults to accentColor */
  accentColorSecondary?: string;
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
  /** Default expanded state (default: false - collapsed) */
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
  title = "AI Insights",
  sections,
  accentColor,
  accentColorSecondary,
  isLoading = false,
  loadingMessage = "Analyzing...",
  error = null,
  lastUpdated = null,
  onRefresh,
  refreshDisabled = false,
  storageKey,
  defaultExpanded = false,
  className,
  onViewDetails,
  onExpandedChange,
}: AIInsightsPulldownProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateInterval = 5000; // 5 seconds like MarketingSlideshow

  // Get gradient colors for current slide
  const currentSection = sections[currentSlide];
  const gradientFrom = currentSection?.gradient?.from || accentColor;
  const gradientTo = currentSection?.gradient?.to || accentColorSecondary || accentColor;

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

  return (
    <div className={cn("flex flex-col flex-shrink-0", className)}>
      {/* Panel wrapper - animates height to push content */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isExpanded ? "max-h-[180px]" : "max-h-0"
        )}
      >
        {/* Full Hero Panel */}
        <div
          className="relative w-full overflow-hidden border-b border-white/10 bg-black/20 backdrop-blur-xl"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Gradient Background - transitions with slide */}
          <div
            className="absolute inset-0 opacity-20 transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
            }}
          />

          {/* Glow Effects - corner orbs */}
          <div
            className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-30 transition-all duration-500"
            style={{ backgroundColor: gradientFrom }}
          />
          <div
            className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-25 transition-all duration-500"
            style={{ backgroundColor: gradientTo }}
          />

          {/* Content Container */}
          <div className="relative z-10 h-[160px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-full gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5"
                  style={{ boxShadow: `0 0 40px ${accentColor}40` }}
                >
                  <Loader2
                    className="h-8 w-8 animate-spin"
                    style={{ color: accentColor }}
                  />
                </div>
                <span className="text-base text-white/60 font-medium">{loadingMessage}</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-base text-yellow-400 font-medium">{error}</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-base text-white/40">Add more notes to see AI insights</p>
              </div>
            ) : (
              /* Main Content */
              <div className="flex items-start h-full px-8 pt-6 pb-12">
                <div className="flex items-center gap-5 flex-1">
                  {/* Large Icon with Glow */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500"
                    style={{ boxShadow: `0 0 40px ${gradientFrom}40` }}
                  >
                    <span
                      className="[&>svg]:w-8 [&>svg]:h-8 transition-colors duration-500"
                      style={{ color: gradientFrom }}
                    >
                      {currentSection?.icon}
                    </span>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 space-y-1.5 min-w-0 pt-1">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        className="w-4 h-4 transition-colors duration-500"
                        style={{ color: gradientFrom }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-wider transition-colors duration-500"
                        style={{ color: gradientFrom }}
                      >
                        {currentSection?.label}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight leading-tight">
                      {currentSection?.content}
                    </div>
                  </div>

                  {/* Action Button (if present) */}
                  {currentSection?.action && (
                    <button
                      onClick={currentSection.action.onClick}
                      className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg text-white"
                      style={{
                        background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
                      }}
                    >
                      {currentSection.action.label}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Top Right Controls - Refresh & Close */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={refreshDisabled}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh insights"
                >
                  <RefreshCw className={cn("w-4 h-4", refreshDisabled && "animate-spin")} />
                </button>
              )}
              <button
                onClick={toggleExpanded}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Navigation - dots left, timestamp center, arrows right */}
            {sections.length > 1 && !isLoading && !error && (
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-8">
                {/* Dots Indicator */}
                <div className="flex items-center gap-2">
                  {sections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === currentSlide
                          ? "w-8 bg-white"
                          : "w-1.5 bg-white/30 hover:bg-white/50"
                      )}
                      aria-label={`Go to insight ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Cached Timestamp */}
                {lastUpdated && (
                  <span className="text-[10px] text-white/30">
                    Cached · {lastUpdated.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                )}

                {/* Prev/Next Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-300"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all duration-300"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handle Tab - always visible, centered */}
      <div className="flex justify-center relative z-10">
        <button
          onClick={toggleExpanded}
          className={cn(
            "group flex flex-col items-center justify-center gap-0.5 px-6 py-1.5 rounded-b-xl border border-t-0 transition-all duration-300",
            isExpanded ? "h-5" : "h-5 hover:h-6"
          )}
          style={{
            backgroundColor: isExpanded ? `${accentColor}20` : `${accentColor}10`,
            borderColor: `${accentColor}30`,
            boxShadow: isExpanded ? `0 4px 15px ${accentColor}20` : undefined,
          }}
        >
          {/* Handle line with gradient */}
          <div
            className="w-8 h-1 rounded-full transition-all duration-300"
            style={{
              background: isExpanded
                ? `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})`
                : `${accentColor}60`,
            }}
          />
          {/* Sparkles icon appears on hover when collapsed */}
          {!isExpanded && (
            <Sparkles
              className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: accentColor }}
            />
          )}
        </button>
      </div>
    </div>
  );
}

/**
 * Hook to check if insights pulldown is expanded (for lazy loading)
 */
export function useInsightsPulldownExpanded(storageKey: string | undefined): boolean {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      setIsExpanded(stored === "true");
    }
  }, [storageKey]);

  return isExpanded;
}
