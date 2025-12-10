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
 *
 * Layout:
 * - XL/Desktop: Full horizontal ribbon with icon, title, divider, sections inline, buttons
 * - MD/Tablet: Compact bar with icon, truncated focus, inline tags, actions count
 * - SM/Mobile: Minimal pill with icon, short text, badge count
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

  // Collapsed State - Compact floating pill
  if (!isExpanded) {
    return (
      <div className={cn("animate-in fade-in duration-300", className)}>
        <button
          onClick={toggleExpanded}
          className="w-full rounded-xl border backdrop-blur-xl px-3 py-2 sm:px-4 sm:py-2.5 text-left transition-all hover:scale-[1.005] active:scale-[0.995] bg-card/80 dark:bg-card/60 shadow-lg dark:shadow-none group"
          style={{
            borderColor: `${accentColor}30`,
            boxShadow: `0 2px 12px -3px ${accentColor}20`,
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" style={{ color: accentColor }} />
              ) : (
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: accentColor }} />
              )}
            </div>

            {/* Summary text - truncated */}
            <span className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-text-primary truncate">
              {isLoading ? loadingMessage : primarySummary}
            </span>

            {/* Badge + Arrow */}
            <div className="flex items-center gap-1.5 text-text-muted flex-shrink-0">
              {!isLoading && (
                <span
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  {itemCount}
                </span>
              )}
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Expanded State - Adaptive horizontal ribbon
  return (
    <div className={cn("animate-in fade-in slide-in-from-top-1 duration-300", className)}>
      <div
        className="relative overflow-hidden rounded-xl border backdrop-blur-xl bg-card/90 dark:bg-card/80 shadow-lg dark:shadow-none"
        style={{
          borderColor: `${accentColor}30`,
          boxShadow: `0 2px 16px -4px ${accentColor}20`,
        }}
      >
        {/* Single-row ribbon layout */}
        <div className="px-3 py-2.5 sm:px-4 sm:py-3">
          {error ? (
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium truncate">
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
          ) : isLoading ? (
            <div className="flex items-center gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: accentColor }} />
              </div>
              <span className="text-sm text-text-muted flex-1">{loadingMessage}</span>
              <button
                onClick={toggleExpanded}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon + Title */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}20` }}
                >
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
                </div>
                <span className="hidden lg:block font-semibold text-sm text-text-primary">{title}</span>
              </div>

              {/* Divider - desktop only */}
              <div className="hidden lg:block h-8 w-px bg-border/50 flex-shrink-0" />

              {/* Sections - horizontal flow with responsive layout */}
              <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
                {sections.map((section, index) => (
                  <div key={index} className="min-w-0 flex-shrink-0 lg:flex-shrink">
                    {/* Desktop: label above content */}
                    <div className="hidden lg:block">
                      <p className="text-[10px] text-text-muted uppercase tracking-wide mb-0.5">
                        {section.label}
                      </p>
                      <div className="text-sm text-text-primary">{section.content}</div>
                    </div>
                    {/* Mobile/Tablet: inline with icon */}
                    <div className="lg:hidden flex items-center gap-2">
                      <span className="flex-shrink-0" style={{ color: accentColor }}>
                        {section.icon}
                      </span>
                      <div className="text-xs sm:text-sm text-text-primary truncate">
                        {section.summary || section.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {lastUpdated && (
                  <span className="hidden xl:block text-[10px] text-text-muted mr-2">
                    {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isLoading || refreshDisabled}
                    className="p-1.5 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isLoading && "animate-spin")} />
                  </button>
                )}
                <button
                  onClick={toggleExpanded}
                  className="p-1.5 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  title="Collapse"
                >
                  <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subtle gradient accent - less prominent */}
        <div
          className="absolute -top-12 -right-12 h-24 w-24 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ backgroundColor: accentColor }}
        />
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
