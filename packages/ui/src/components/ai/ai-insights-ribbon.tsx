"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
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
 * Exact implementation of Mockup #20 Adaptive Ribbon.
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
  lastUpdated = null,
  onRefresh,
  refreshDisabled = false,
  storageKey,
  className,
  collapsedSummary,
}: AIInsightsRibbonProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Load expanded state from localStorage
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setIsExpanded(stored !== "true"); // stored "true" means collapsed
      }
    }
  }, [storageKey]);

  // Toggle and persist state
  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (storageKey) {
      localStorage.setItem(storageKey, String(!newExpanded)); // store collapsed state
    }
  };

  // Get first section summary for collapsed view
  const primarySummary = collapsedSummary || sections[0]?.summary || "View insights";

  // Count items for badge
  const itemCount = sections.length;

  // ============================================================
  // COLLAPSED STATE - Mobile-style minimal pill (Mockup #20 Mobile)
  // ============================================================
  if (!isExpanded) {
    return (
      <div className={cn("animate-in fade-in duration-300", className)}>
        <button
          onClick={toggleExpanded}
          className="w-full rounded-lg border backdrop-blur-xl p-2 text-left transition-all hover:scale-[1.005] active:scale-[0.995] bg-card/80 dark:bg-card/60 shadow-lg dark:shadow-none group"
          style={{
            borderColor: `${accentColor}30`,
            boxShadow: `0 2px 12px -3px ${accentColor}20`,
          }}
        >
          <div className="flex items-center gap-2">
            {/* Tiny Icon */}
            <div
              className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" style={{ color: accentColor }} />
              ) : (
                <Sparkles className="h-3 w-3" style={{ color: accentColor }} />
              )}
            </div>

            {/* Short text - truncated */}
            <span className="flex-1 min-w-0 text-xs font-medium text-text-primary truncate">
              {isLoading ? loadingMessage : primarySummary}
            </span>

            {/* Badge + Chevron */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!isLoading && (
                <span
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  {itemCount}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-text-muted" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // ============================================================
  // EXPANDED STATE - Adaptive ribbon with 3 breakpoints
  // ============================================================
  return (
    <div className={cn("animate-in fade-in slide-in-from-top-1 duration-300", className)}>
      <div
        className="relative overflow-hidden rounded-lg md:rounded-xl border backdrop-blur-xl bg-card/90 dark:bg-card/80 shadow-lg dark:shadow-none"
        style={{
          borderColor: `${accentColor}30`,
          boxShadow: `0 2px 16px -4px ${accentColor}20`,
        }}
      >
        {/* ============================================
            ERROR STATE
        ============================================ */}
        {error ? (
          <div className="p-2 md:p-3 xl:p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded md:rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 xl:h-5 xl:w-5" style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-yellow-600 dark:text-yellow-400 font-medium truncate">
                  {error}
                </p>
              </div>
              <button
                onClick={toggleExpanded}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : isLoading ? (
          /* ============================================
              LOADING STATE
          ============================================ */
          <div className="p-2 md:p-3 xl:p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 xl:w-10 xl:h-10 rounded md:rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 xl:h-5 xl:w-5 animate-spin" style={{ color: accentColor }} />
              </div>
              <span className="text-xs md:text-sm text-text-muted flex-1 truncate">{loadingMessage}</span>
              <button
                onClick={toggleExpanded}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors flex-shrink-0"
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
                MOBILE (SM) - Minimal pill layout
            ---------------------------------------- */}
            <div className="md:hidden p-2">
              <div className="flex items-center gap-2">
                {/* Tiny icon */}
                <div
                  className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: accentColor }} />
                </div>
                {/* Primary text truncated */}
                <span className="flex-1 min-w-0 text-xs font-medium text-text-primary truncate">
                  {sections[0]?.summary || sections[0]?.label}
                </span>
                {/* Badge + Chevron */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                    style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                  >
                    {itemCount}
                  </span>
                  <button
                    onClick={toggleExpanded}
                    className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* ----------------------------------------
                TABLET (MD) - Compact bar with inline tags
            ---------------------------------------- */}
            <div className="hidden md:block xl:hidden p-3">
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                </div>
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {sections[0]?.summary || sections[0]?.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Show first section's tags/content inline */}
                    {sections[1] && (
                      <div className="text-[10px] text-text-muted truncate">
                        {sections[1].summary}
                      </div>
                    )}
                    {sections[2] && (
                      <span className="text-xs text-text-muted">
                        {sections[2].summary}
                      </span>
                    )}
                  </div>
                </div>
                {/* Collapse button */}
                <button
                  onClick={toggleExpanded}
                  className="p-1.5 hover:bg-muted/50 rounded-lg flex-shrink-0 transition-colors"
                >
                  <ChevronUp className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>

            {/* ----------------------------------------
                DESKTOP (XL) - Full ribbon with labeled sections
            ---------------------------------------- */}
            <div className="hidden xl:block p-4">
              <div className="flex items-center gap-6">
                {/* Icon + Title */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-text-primary">{title}</span>
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-border/50 flex-shrink-0" />

                {/* Sections - horizontal with labels above content */}
                <div className="flex-1 flex items-center gap-8">
                  {sections.map((section, index) => (
                    <div key={index} className="min-w-0">
                      <p className="text-xs text-text-muted mb-1">{section.label}</p>
                      <div className="text-sm font-medium text-text-primary">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      disabled={isLoading || refreshDisabled}
                      className="p-2 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </button>
                  )}
                  <button
                    onClick={toggleExpanded}
                    className="p-2 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors"
                    title="Collapse"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
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
