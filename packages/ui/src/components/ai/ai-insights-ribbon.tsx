"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

export interface AIInsightsRibbonSection {
  icon: ReactNode;
  label: string;
  content: ReactNode;
  /** Short summary for collapsed/mobile view */
  summary?: string;
}

export interface AIInsightsRibbonProps {
  /** Title displayed in the header */
  title?: string;
  /** Sections to display */
  sections: AIInsightsRibbonSection[];
  /** Primary accent color (hex) */
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
  /** Additional class names */
  className?: string;
  /** Primary summary text for collapsed state */
  collapsedSummary?: string;
}

/**
 * AI Insights Ribbon - Adaptive horizontal ribbon that scales with screen size.
 * Exact implementation of Mockup #20 Adaptive Ribbon with glass effect.
 *
 * Layout:
 * - XL/Desktop: Full ribbon with icon+title, divider, labeled sections inline, action buttons
 * - MD/Tablet: Compact bar with icon, truncated text, inline tags, actions count
 * - SM/Mobile: Minimal pill with tiny icon, short text, badge count, chevron
 *
 * Features persistent collapse/expand with localStorage.
 */
export function AIInsightsRibbon({
  title = "AI Insights",
  sections,
  accentColor,
  isLoading = false,
  loadingMessage = "Analyzing...",
  error = null,
  onRefresh,
  refreshDisabled = false,
  storageKey,
  className,
  collapsedSummary,
}: AIInsightsRibbonProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoRotateInterval = 4000; // 4 seconds

  // Load expanded state from localStorage
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setIsExpanded(stored !== "true"); // stored "true" means collapsed
      }
    }
  }, [storageKey]);

  // Auto-rotate through sections
  useEffect(() => {
    if (isPaused || sections.length <= 1 || isLoading) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sections.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [isPaused, sections.length, isLoading]);

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
    if (storageKey) {
      localStorage.setItem(storageKey, String(!newExpanded)); // store collapsed state
    }
  };

  // Get current section for rotating display
  const currentSection = sections[currentSlide];
  const primarySummary = collapsedSummary || currentSection?.summary || sections[0]?.summary || "View insights";

  // Count items for badge
  const itemCount = sections.length;

  // ============================================================
  // COLLAPSED STATE - 3 breakpoints: mobile pill, tablet bar, desktop full ribbon
  // ============================================================
  if (!isExpanded) {
    return (
      <div className={cn("animate-in fade-in duration-300", className)}>
        {/* Mobile collapsed pill (< 768px) */}
        <div className="md:hidden">
          <button
            onClick={toggleExpanded}
            className="relative inline-flex rounded-xl backdrop-blur-md border p-2 text-left transition-all bg-white/90 dark:bg-transparent hover:bg-white dark:hover:bg-white/[0.06] overflow-hidden"
            style={{ borderColor: `${accentColor}40` }}
          >
            <div
              className="absolute inset-0 rounded-xl opacity-[0.12] dark:opacity-[0.15]"
              style={{ backgroundColor: accentColor }}
            />
            <div className="relative flex items-center gap-2">
              {/* Tiny Icon */}
              <div
                className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}40` }}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#f97316' }} />
                ) : (
                  <Sparkles className="h-3 w-3" style={{ color: '#f97316' }} />
                )}
              </div>

              {/* Short text - truncated */}
              <span className="text-xs font-medium text-zinc-800 dark:text-white/90 max-w-[150px] truncate">
                {isLoading ? loadingMessage : primarySummary}
              </span>

              {/* Badge + Chevron */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isLoading && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: `${accentColor}40`, color: accentColor }}
                  >
                    {itemCount}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-zinc-500 dark:text-white/50" />
              </div>
            </div>
          </button>
        </div>

        {/* Tablet collapsed bar (768px - 1023px) */}
        <div className="hidden md:block lg:hidden">
          <button
            onClick={toggleExpanded}
            className="relative w-full rounded-2xl backdrop-blur-md border px-4 py-2.5 text-left transition-all bg-white/90 dark:bg-transparent hover:bg-white dark:hover:bg-white/[0.06] overflow-hidden"
            style={{ borderColor: `${accentColor}40` }}
          >
            <div
              className="absolute inset-0 opacity-[0.12] dark:opacity-[0.15]"
              style={{ backgroundColor: accentColor }}
            />
            <div className="relative flex items-center gap-3">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}40` }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#f97316' }} />
                ) : (
                  <Sparkles className="h-4 w-4" style={{ color: '#f97316' }} />
                )}
              </div>

              {/* Focus text */}
              <span className="text-sm font-medium text-zinc-900 dark:text-white flex-1 min-w-0 truncate">
                {isLoading ? loadingMessage : primarySummary}
              </span>

              {/* Badge + Chevron */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isLoading && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{ backgroundColor: `${accentColor}40`, color: '#f97316' }}
                  >
                    {itemCount} insights
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-zinc-500 dark:text-white/50" />
              </div>
            </div>
          </button>
        </div>

        {/* Desktop: Rotating banner with single insight (>= 1024px) */}
        <div
          className="hidden lg:flex lg:justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="relative w-[80%] max-w-5xl rounded-2xl backdrop-blur-md border px-5 py-3 bg-white/90 dark:bg-transparent overflow-hidden"
            style={{ borderColor: `${accentColor}40` }}
          >
            <div
              className="absolute inset-0 opacity-[0.10] dark:opacity-[0.15]"
              style={{ backgroundColor: accentColor }}
            />
            <div className="relative flex items-center">
              {/* Icon + Title */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}40` }}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: '#f97316' }} />
                  ) : (
                    <Sparkles className="h-5 w-5" style={{ color: '#f97316' }} />
                  )}
                </div>
                <span className="font-semibold text-zinc-900 dark:text-white">{title}</span>
              </div>

              {/* Vertical Divider */}
              <div
                className="h-8 w-px mx-6 flex-shrink-0 opacity-30"
                style={{ backgroundColor: accentColor }}
              />

              {/* Rotating Single Insight */}
              <div className="flex-1 flex items-center gap-4 min-w-0">
                {/* Previous Button */}
                {sections.length > 1 && (
                  <button
                    onClick={goToPrevious}
                    className="flex-shrink-0 p-1.5 rounded-lg text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Previous insight"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                {/* Current Insight with fade animation */}
                {currentSection && (
                  <div
                    key={currentSlide}
                    className="flex-1 flex items-center gap-3 min-w-0 animate-in fade-in slide-in-from-right-2 duration-300"
                  >
                    {/* Section Icon */}
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}25` }}
                    >
                      <span style={{ color: '#f97316' }}>{currentSection.icon}</span>
                    </div>
                    {/* Label + Content */}
                    <div className="flex-1 min-w-0">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                        style={{ backgroundColor: `${accentColor}25`, color: '#f97316' }}
                      >
                        {currentSection.label}
                      </span>
                      <div className="text-sm text-zinc-800 dark:text-white truncate">
                        {currentSection.summary || currentSection.content}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Button */}
                {sections.length > 1 && (
                  <button
                    onClick={goToNext}
                    className="flex-shrink-0 p-1.5 rounded-lg text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Next insight"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Dots Indicator */}
              {sections.length > 1 && (
                <div className="flex items-center gap-1.5 mx-4">
                  {sections.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        index === currentSlide
                          ? "w-4"
                          : "w-1.5 opacity-40 hover:opacity-70"
                      )}
                      style={{
                        backgroundColor: index === currentSlide ? accentColor : (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'white' : '#71717a'),
                      }}
                      aria-label={`Go to insight ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isLoading || refreshDisabled}
                    className="p-2 text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // EXPANDED STATE - Adaptive ribbon with 3 breakpoints
  // ============================================================
  return (
    <div className={cn("animate-in fade-in slide-in-from-top-1 duration-300", className)}>
      {/* ============================================
          ERROR STATE
      ============================================ */}
      {error ? (
        <div
          className="relative rounded-xl backdrop-blur-sm border p-3 md:p-4 bg-white/90 dark:bg-transparent overflow-hidden"
          style={{ borderColor: `${accentColor}40` }}
        >
          <div
            className="absolute inset-0 opacity-[0.10] dark:opacity-[0.15]"
            style={{ backgroundColor: accentColor }}
          />
          <div className="relative flex items-center gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}40` }}
            >
              <Sparkles className="h-4 w-4 md:h-5 md:w-5" style={{ color: '#f97316' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium truncate">
                {error}
              </p>
            </div>
            <button
              onClick={toggleExpanded}
              className="p-1.5 text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : isLoading ? (
        /* ============================================
            LOADING STATE
        ============================================ */
        <div
          className="relative rounded-xl backdrop-blur-sm border p-3 md:p-4 bg-white/90 dark:bg-transparent overflow-hidden"
          style={{ borderColor: `${accentColor}40` }}
        >
          <div
            className="absolute inset-0 opacity-[0.10] dark:opacity-[0.15]"
            style={{ backgroundColor: accentColor }}
          />
          <div className="relative flex items-center gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}40` }}
            >
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" style={{ color: '#f97316' }} />
            </div>
            <span className="text-sm text-zinc-600 dark:text-white/60 flex-1 truncate">{loadingMessage}</span>
            <button
              onClick={toggleExpanded}
              className="p-1.5 text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        /* ============================================
            CONTENT STATE - 3 responsive layouts
        ============================================ */
        <>
          {/* ----------------------------------------
              MOBILE (SM) - Minimal pill layout (below 768px)
              Mockup #20 Mobile: tiny icon, short text, badge, chevron
          ---------------------------------------- */}
          <div className="md:hidden">
            <div
              className="relative inline-flex rounded-xl backdrop-blur-md border p-2 bg-white/90 dark:bg-transparent overflow-hidden"
              style={{ borderColor: `${accentColor}40` }}
            >
              <div
                className="absolute inset-0 rounded-xl opacity-[0.12] dark:opacity-[0.15]"
                style={{ backgroundColor: accentColor }}
              />
              <div className="relative flex items-center gap-2">
                {/* Tiny icon */}
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}40` }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: '#f97316' }} />
                </div>
                {/* Primary text truncated */}
                <span className="text-xs font-medium text-zinc-800 dark:text-white/90 max-w-[150px] truncate">
                  {sections[0]?.summary || sections[0]?.label}
                </span>
                {/* Badge + Chevron */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: `${accentColor}40`, color: '#f97316' }}
                  >
                    {itemCount}
                  </span>
                  <button
                    onClick={toggleExpanded}
                    className="p-0.5 text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white transition-colors"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------
              TABLET (MD) - Compact bar layout (768px - 1023px)
              Mockup #20 Tablet: icon, focus text, inline tags, actions count, chevron
          ---------------------------------------- */}
          <div className="hidden md:block lg:hidden">
            <div
              className="relative rounded-2xl backdrop-blur-md border px-4 py-2.5 bg-white/90 dark:bg-transparent overflow-hidden"
              style={{ borderColor: `${accentColor}40` }}
            >
              <div
                className="absolute inset-0 opacity-[0.12] dark:opacity-[0.15]"
                style={{ backgroundColor: accentColor }}
              />
              <div className="relative flex items-center gap-3">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}40` }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: '#f97316' }} />
                </div>

                {/* Focus text - truncated */}
                <span className="text-sm font-medium text-zinc-900 dark:text-white flex-1 min-w-0 truncate">
                  {sections[0]?.summary || primarySummary}
                </span>

                {/* Inline tags (first 2 themes) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {sections[1]?.content}
                </div>

                {/* Actions count */}
                <span className="text-xs text-zinc-600 dark:text-white/60 flex-shrink-0">
                  {sections[2]?.summary || `${itemCount} items`}
                </span>

                {/* Chevron */}
                <button
                  onClick={toggleExpanded}
                  className="p-1.5 text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------
              DESKTOP (LG+) - Rotating banner with single insight (1024px+)
          ---------------------------------------- */}
          <div
            className="hidden lg:flex lg:justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="relative w-[80%] max-w-5xl rounded-2xl backdrop-blur-md border px-5 py-3 bg-white/90 dark:bg-transparent overflow-hidden"
              style={{ borderColor: `${accentColor}40` }}
            >
              <div
                className="absolute inset-0 opacity-[0.10] dark:opacity-[0.15]"
                style={{ backgroundColor: accentColor }}
              />
              <div className="relative flex items-center">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}40` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: '#f97316' }} />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-white">{title}</span>
                </div>

                {/* Vertical Divider */}
                <div
                  className="h-8 w-px mx-6 flex-shrink-0 opacity-30"
                  style={{ backgroundColor: accentColor }}
                />

                {/* Rotating Single Insight */}
                <div className="flex-1 flex items-center gap-4 min-w-0">
                  {/* Previous Button */}
                  {sections.length > 1 && (
                    <button
                      onClick={goToPrevious}
                      className="flex-shrink-0 p-1.5 rounded-lg text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      aria-label="Previous insight"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  )}

                  {/* Current Insight with fade animation */}
                  {currentSection && (
                    <div
                      key={`expanded-${currentSlide}`}
                      className="flex-1 flex items-center gap-3 min-w-0 animate-in fade-in slide-in-from-right-2 duration-300"
                    >
                      {/* Section Icon */}
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}25` }}
                      >
                        <span style={{ color: '#f97316' }}>{currentSection.icon}</span>
                      </div>
                      {/* Label + Content */}
                      <div className="flex-1 min-w-0">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                          style={{ backgroundColor: `${accentColor}25`, color: '#f97316' }}
                        >
                          {currentSection.label}
                        </span>
                        <div className="text-sm text-zinc-800 dark:text-white truncate">
                          {currentSection.summary || currentSection.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Next Button */}
                  {sections.length > 1 && (
                    <button
                      onClick={goToNext}
                      className="flex-shrink-0 p-1.5 rounded-lg text-zinc-400 dark:text-white/40 hover:text-zinc-600 dark:hover:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                      aria-label="Next insight"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Dots Indicator */}
                {sections.length > 1 && (
                  <div className="flex items-center gap-1.5 mx-4">
                    {sections.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          index === currentSlide
                            ? "w-4"
                            : "w-1.5 opacity-40 hover:opacity-70"
                        )}
                        style={{
                          backgroundColor: index === currentSlide ? accentColor : 'currentColor',
                        }}
                        aria-label={`Go to insight ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      disabled={isLoading || refreshDisabled}
                      className="p-2 text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </button>
                  )}
                  <button
                    onClick={toggleExpanded}
                    className="p-2 text-zinc-500 dark:text-white/50 hover:text-zinc-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Collapse"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Hook to check if insights ribbon is collapsed (for lazy loading)
 */
export function useInsightsRibbonCollapsed(storageKey: string | undefined): boolean {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      setIsCollapsed(stored === "true");
    }
  }, [storageKey]);

  return isCollapsed;
}
