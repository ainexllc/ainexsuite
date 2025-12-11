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
  // COLLAPSED STATE - 3 breakpoints: mobile pill, tablet bar, desktop full ribbon
  // ============================================================
  if (!isExpanded) {
    return (
      <div className={cn("animate-in fade-in duration-300", className)}>
        {/* Mobile collapsed pill (< 768px) */}
        <div className="md:hidden">
          <button
            onClick={toggleExpanded}
            className="inline-flex rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] p-2 text-left transition-all hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-2">
              {/* Tiny Icon */}
              <div
                className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}30` }}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" style={{ color: accentColor }} />
                ) : (
                  <Sparkles className="h-3 w-3" style={{ color: accentColor }} />
                )}
              </div>

              {/* Short text - truncated */}
              <span className="text-xs font-medium text-white/90 max-w-[150px] truncate">
                {isLoading ? loadingMessage : primarySummary}
              </span>

              {/* Badge + Chevron */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!isLoading && (
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                  >
                    {itemCount}
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-white/50" />
              </div>
            </div>
          </button>
        </div>

        {/* Tablet collapsed bar (768px - 1023px) */}
        <div className="hidden md:block lg:hidden">
          <button
            onClick={toggleExpanded}
            className="w-full rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-4 py-2.5 text-left transition-all hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}30` }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: accentColor }} />
                ) : (
                  <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                )}
              </div>

              {/* Focus text */}
              <span className="text-sm font-medium text-white flex-1 min-w-0 truncate">
                {isLoading ? loadingMessage : primarySummary}
              </span>

              {/* Badge + Chevron */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isLoading && (
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                  >
                    {itemCount} insights
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-white/50" />
              </div>
            </div>
          </button>
        </div>

        {/* Desktop: Always show full ribbon even when "collapsed" (>= 1024px) */}
        <div className="hidden lg:flex lg:justify-center">
          <div className="w-[80%] max-w-5xl rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-5 py-3">
            <div className="flex items-center">
              {/* Icon + Title */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}30` }}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: accentColor }} />
                  ) : (
                    <Sparkles className="h-5 w-5" style={{ color: accentColor }} />
                  )}
                </div>
                <span className="font-semibold text-white">{title}</span>
              </div>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-white/10 mx-6 flex-shrink-0" />

              {/* Sections - horizontal inline with consistent spacing */}
              <div className="flex-1 flex items-center gap-12">
                {sections.map((section, index) => (
                  <div key={index} className="flex-shrink-0">
                    <p className="text-[11px] text-white/50 mb-0.5 uppercase tracking-wide">{section.label}</p>
                    <div className="text-sm text-white">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isLoading || refreshDisabled}
                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
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
        <div className="rounded-xl backdrop-blur-sm bg-white/5 dark:bg-white/5 border border-white/10 p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}30` }}
            >
              <Sparkles className="h-4 w-4 md:h-5 md:w-5" style={{ color: accentColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-yellow-400 font-medium truncate">
                {error}
              </p>
            </div>
            <button
              onClick={toggleExpanded}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : isLoading ? (
        /* ============================================
            LOADING STATE
        ============================================ */
        <div className="rounded-xl backdrop-blur-sm bg-white/5 dark:bg-white/5 border border-white/10 p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}30` }}
            >
              <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" style={{ color: accentColor }} />
            </div>
            <span className="text-sm text-white/60 flex-1 truncate">{loadingMessage}</span>
            <button
              onClick={toggleExpanded}
              className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
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
            <div className="inline-flex rounded-xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] p-2">
              <div className="flex items-center gap-2">
                {/* Tiny icon */}
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}30` }}
                >
                  <Sparkles className="h-3 w-3" style={{ color: accentColor }} />
                </div>
                {/* Primary text truncated */}
                <span className="text-xs font-medium text-white/90 max-w-[150px] truncate">
                  {sections[0]?.summary || sections[0]?.label}
                </span>
                {/* Badge + Chevron */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
                  >
                    {itemCount}
                  </span>
                  <button
                    onClick={toggleExpanded}
                    className="p-0.5 text-white/50 hover:text-white transition-colors"
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
            <div className="rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-4 py-2.5">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}30` }}
                >
                  <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
                </div>

                {/* Focus text - truncated */}
                <span className="text-sm font-medium text-white flex-1 min-w-0 truncate">
                  {sections[0]?.summary || primarySummary}
                </span>

                {/* Inline tags (first 2 themes) */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {sections[1]?.content}
                </div>

                {/* Actions count */}
                <span className="text-xs text-white/60 flex-shrink-0">
                  {sections[2]?.summary || `${itemCount} items`}
                </span>

                {/* Chevron */}
                <button
                  onClick={toggleExpanded}
                  className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ----------------------------------------
              DESKTOP (LG+) - Full ribbon with labeled sections (1024px+)
              Exact match to Mockup #20 Desktop layout
          ---------------------------------------- */}
          <div className="hidden lg:flex lg:justify-center">
            <div className="w-[80%] max-w-5xl rounded-2xl backdrop-blur-md bg-white/[0.03] border border-white/[0.08] px-5 py-3">
              <div className="flex items-center">
                {/* Icon + Title */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}30` }}
                  >
                    <Sparkles className="h-5 w-5" style={{ color: accentColor }} />
                  </div>
                  <span className="font-semibold text-white">{title}</span>
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-white/10 mx-6 flex-shrink-0" />

                {/* Sections - horizontal inline with consistent spacing */}
                <div className="flex-1 flex items-center gap-12">
                  {sections.map((section, index) => (
                    <div key={index} className="flex-shrink-0">
                      <p className="text-[11px] text-white/50 mb-0.5 uppercase tracking-wide">{section.label}</p>
                      <div className="text-sm text-white">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                  {onRefresh && (
                    <button
                      onClick={onRefresh}
                      disabled={isLoading || refreshDisabled}
                      className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </button>
                  )}
                  <button
                    onClick={toggleExpanded}
                    className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
