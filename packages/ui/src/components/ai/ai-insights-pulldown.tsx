"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sparkles, RefreshCw, Loader2, X } from "lucide-react";
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
}

export interface AIInsightsPulldownProps {
  /** Title displayed in the header */
  title?: string;
  /** Sections to display (max 2-3 recommended for horizontal layout) */
  sections: AIInsightsPulldownSection[];
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
 * AI Insights Pulldown - Handle Pull Tab with Push-Down Panel
 *
 * Features:
 * - Minimal handle tab that sticks out below the navigation
 * - Full-width panel that pushes content down when expanded
 * - Horizontal card layout for insights
 * - Smooth animation with cubic-bezier easing
 * - Persistent collapse/expand state with localStorage
 *
 * Based on Mockup #7b - Handle Pull (Push Down)
 */
export function AIInsightsPulldown({
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
  defaultExpanded = false,
  className,
  onViewDetails,
  onExpandedChange,
}: AIInsightsPulldownProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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
          "overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]",
          isExpanded ? "max-h-[200px]" : "max-h-0"
        )}
      >
        {/* Full-width panel */}
        <div
          className="w-full backdrop-blur-xl border-b px-4 py-3 sm:px-5 sm:py-4"
          style={{
            background: `linear-gradient(180deg, rgba(15,15,15,0.98) 0%, rgba(10,10,10,0.95) 100%)`,
            borderColor: `${accentColor}26`,
          }}
        >
          <div className="max-w-5xl mx-auto">
            {/* Panel Header */}
            <div className="flex items-center justify-between mb-3">
              <h3
                className="text-sm font-semibold flex items-center gap-2"
                style={{ color: accentColor }}
              >
                <Sparkles className="h-4 w-4" />
                {title}
              </h3>
              <div className="flex items-center gap-2">
                {lastUpdated && (
                  <span className="text-[11px] text-white/40">
                    Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={isLoading || refreshDisabled}
                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                  </button>
                )}
                <button
                  onClick={toggleExpanded}
                  className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  title="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2
                  className="h-5 w-5 animate-spin"
                  style={{ color: accentColor }}
                />
                <span className="text-sm text-white/60">{loadingMessage}</span>
              </div>
            ) : error ? (
              <div className="py-4 text-center">
                <p className="text-sm text-yellow-400">{error}</p>
              </div>
            ) : sections.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-sm text-white/40">Add more notes to see AI insights</p>
              </div>
            ) : (
              /* Horizontal insight cards */
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="flex-1 flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    {/* Icon */}
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${accentColor}20` }}
                    >
                      {section.icon}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
                        {section.label}
                      </p>
                      <div className="text-sm text-white/80 leading-relaxed">
                        {section.content}
                      </div>
                      {section.action && (
                        <button
                          onClick={section.action.onClick}
                          className="mt-2 px-3 py-1.5 text-xs rounded-md transition-colors"
                          style={{
                            backgroundColor: `${accentColor}20`,
                            color: accentColor,
                          }}
                        >
                          {section.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
            "group flex flex-col items-center justify-center gap-0.5 px-6 py-1.5 rounded-b-xl border border-t-0 transition-all duration-200",
            isExpanded
              ? "h-5"
              : "h-5 hover:h-6"
          )}
          style={{
            backgroundColor: isExpanded ? `${accentColor}20` : `${accentColor}10`,
            borderColor: `${accentColor}26`,
          }}
        >
          {/* Handle line */}
          <div
            className="w-6 h-0.5 rounded-full transition-colors"
            style={{
              backgroundColor: isExpanded ? accentColor : `${accentColor}60`,
            }}
          />
          {/* Icon appears on hover when collapsed */}
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
