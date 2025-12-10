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
 * AI Insights Ribbon - Floating command bar with adaptive responsive behavior.
 *
 * - XL/Desktop: Full horizontal ribbon with all sections visible
 * - MD/Tablet: Condensed view with summary and expandable detail
 * - SM/Mobile: Minimal pill that expands to full view
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

  // Collapsed State - Floating pill/bar
  if (!isExpanded) {
    return (
      <div className={cn("animate-in fade-in duration-300", className)}>
        <button
          onClick={toggleExpanded}
          className="w-full rounded-full border backdrop-blur-xl px-4 py-2.5 sm:px-6 sm:py-3 text-left transition-all hover:scale-[1.01] active:scale-[0.99] bg-card/80 dark:bg-card/60 shadow-lg dark:shadow-none group"
          style={{
            borderColor: `${accentColor}40`,
            boxShadow: `0 4px 20px -5px ${accentColor}30`,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 rounded-full p-2 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: accentColor }} />
              ) : (
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
              )}
            </div>

            {/* Summary text - truncated on mobile */}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary truncate block">
                {isLoading ? loadingMessage : primarySummary}
              </span>
            </div>

            {/* Badge + Arrow */}
            <div className="flex items-center gap-2 text-text-muted flex-shrink-0">
              {!isLoading && (
                <span
                  className="hidden sm:inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  {itemCount}
                </span>
              )}
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Expanded State - Full ribbon with responsive layout
  return (
    <div className={cn("animate-in fade-in slide-in-from-top-2 duration-300", className)}>
      <div
        className="relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl bg-card/90 dark:bg-card/80 shadow-lg dark:shadow-none"
        style={{
          borderColor: `${accentColor}40`,
          boxShadow: `0 4px 30px -5px ${accentColor}25, inset 0 0 60px -20px ${accentColor}15`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 rounded-xl p-2"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" style={{ color: accentColor }} />
              ) : (
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: accentColor }} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-text-primary">{title}</h3>
              {lastUpdated && (
                <p className="text-[10px] sm:text-xs text-text-muted">
                  Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading || refreshDisabled}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh Insights"
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

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error ? (
            <div className="text-center py-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-1">
                Insights Unavailable
              </p>
              <p className="text-xs text-text-muted max-w-sm mx-auto">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-6 gap-3">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: accentColor }} />
              <p className="text-sm text-text-muted">{loadingMessage}</p>
            </div>
          ) : (
            <>
              {/*
                Responsive Grid:
                - Mobile (default): Stack vertically
                - Tablet (md): 2 columns
                - Desktop (lg+): 3 columns, or horizontal row
              */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map((section, index) => (
                  <RibbonSection
                    key={index}
                    icon={section.icon}
                    label={section.label}
                    accentColor={accentColor}
                  >
                    {section.content}
                  </RibbonSection>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Decorative gradient orbs */}
        <div
          className="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full blur-3xl pointer-events-none opacity-15"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}

interface RibbonSectionProps {
  icon: ReactNode;
  label: string;
  accentColor: string;
  children: ReactNode;
}

function RibbonSection({ icon, label, accentColor, children }: RibbonSectionProps) {
  return (
    <div className="space-y-2 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted">
        <span style={{ color: accentColor }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-sm text-text-primary">{children}</div>
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
