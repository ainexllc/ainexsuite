"use client";

import { ReactNode, useState, useEffect, useCallback } from "react";
import { Sparkles, RefreshCw, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * Hook to check if insights are collapsed (for lazy loading)
 * Call this in parent components to skip fetching when collapsed
 */
export function useInsightsCollapsed(storageKey: string | undefined): boolean {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      setIsCollapsed(stored === 'true');
    }
  }, [storageKey]);

  return isCollapsed;
}

export interface AIInsightsSection {
  icon: ReactNode;
  label: string;
  content: ReactNode;
}

export interface AIInsightsCardProps {
  /** Title displayed in the header (default: "AI Insights") */
  title?: string;
  /** Sections to display in the card */
  sections: AIInsightsSection[];
  /** Primary accent color (hex) - uses app color from Firestore */
  accentColor: string;
  /** Layout variant: default (3-col grid), sidebar (stacked), condensed (compact horizontal) */
  variant?: "default" | "sidebar" | "condensed";
  /** Whether insights are loading */
  isLoading?: boolean;
  /** Loading message to display */
  loadingMessage?: string;
  /** Error message to display */
  error?: string | null;
  /** Last updated timestamp */
  lastUpdated?: Date | null;
  /** Callback when refresh is clicked */
  onRefresh?: () => void;
  /** Callback when dismiss is clicked (only shown if provided) */
  onDismiss?: () => void;
  /** Callback when expand is clicked (only for condensed variant) */
  onExpand?: () => void;
  /** Whether refresh is disabled */
  refreshDisabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Children to render after sections */
  children?: ReactNode;
  /** Summary text for condensed variant (shows first item if not provided) */
  condensedSummary?: string;
  /** Enable collapsible behavior (default: false) */
  collapsible?: boolean;
  /** Default collapsed state (default: false - shows expanded) */
  defaultCollapsed?: boolean;
  /** Storage key for persisting collapsed state (e.g., "journey-insights-collapsed") */
  storageKey?: string;
}

/**
 * Shared AI Insights card component with consistent styling across apps.
 * Uses app accent color from Firestore for theming.
 */
export function AIInsightsCard({
  title = "AI Insights",
  sections,
  accentColor,
  variant = "default",
  isLoading = false,
  loadingMessage = "Analyzing...",
  error = null,
  lastUpdated = null,
  onRefresh,
  onDismiss,
  onExpand,
  refreshDisabled = false,
  className,
  children,
  condensedSummary,
  collapsible = false,
  defaultCollapsed = false,
  storageKey,
}: AIInsightsCardProps) {
  const isSidebar = variant === "sidebar";
  const isCondensed = variant === "condensed";

  // Collapsible state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    if (collapsible && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        setIsCollapsed(stored === 'true');
      }
    }
  }, [collapsible, storageKey]);

  // Toggle collapsed state
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (storageKey) {
      localStorage.setItem(storageKey, String(newState));
    }
  };

  // Collapsed state: show minimal header bar that can be expanded
  if (collapsible && isCollapsed) {
    return (
      <div className={cn("animate-in fade-in duration-300", className)}>
        <button
          onClick={toggleCollapsed}
          className="w-full relative overflow-hidden rounded-xl border backdrop-blur-xl px-4 py-3 text-left transition-all hover:border-opacity-70 active:scale-[0.995] bg-white/80 dark:bg-card/60 shadow-lg dark:shadow-none"
          style={{
            borderColor: `${accentColor}33`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex-shrink-0 rounded-lg p-2"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-text-primary">{title}</span>
              {lastUpdated && (
                <span className="ml-2 text-xs text-text-muted">
                  {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 text-text-muted flex-shrink-0" />
          </div>
        </button>
      </div>
    );
  }

  // Condensed variant: compact horizontal layout
  if (isCondensed) {
    return (
      <div className={cn("animate-in fade-in slide-in-from-top-2 duration-300", className)}>
        <button
          onClick={onExpand}
          className="w-full relative overflow-hidden rounded-xl border backdrop-blur-xl p-3 text-left transition-all hover:border-opacity-70 active:scale-[0.99] bg-white/80 dark:bg-card/60 shadow-lg dark:shadow-none"
          style={{
            borderColor: `${accentColor}33`,
            boxShadow: `inset 0 0 60px -20px ${accentColor}40`
          }}
        >
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div
              className="flex-shrink-0 rounded-lg p-2"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: accentColor }} />
              ) : (
                <Sparkles className="h-4 w-4" style={{ color: accentColor }} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">
                  {title}
                </span>
                {lastUpdated && (
                  <span className="text-[10px] text-text-muted/60">
                    {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
              {isLoading ? (
                <p className="text-sm text-text-secondary truncate">{loadingMessage}</p>
              ) : error ? (
                <p className="text-sm text-yellow-500 dark:text-yellow-400 truncate">Tap to view details</p>
              ) : (
                <p className="text-sm text-text-primary truncate">
                  {condensedSummary || "Tap to view insights"}
                </p>
              )}
            </div>

            {/* Expand indicator */}
            <ChevronDown className="h-4 w-4 text-text-muted flex-shrink-0" />
          </div>

          {/* Subtle accent line */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] opacity-30"
            style={{ backgroundColor: accentColor }}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-top-4 duration-500",
        !isSidebar && "mb-8",
        className
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 backdrop-blur-xl bg-white/80 dark:bg-card/80 shadow-lg dark:shadow-none",
          isSidebar ? "p-4" : "p-6"
        )}
        style={{
          borderColor: `${accentColor}4D`,
          boxShadow: `inset 0 0 100px -20px ${accentColor}66`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2" style={{ color: accentColor }}>
            <Sparkles className={cn(isSidebar ? "h-4 w-4" : "h-5 w-5")} />
            <h3 className={cn("font-semibold text-text-primary", isSidebar ? "text-sm" : "text-base")}>
              {title}
            </h3>
            {lastUpdated && !isSidebar && (
              <span className="text-xs text-text-muted font-normal ml-2">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading || refreshDisabled}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                title="Refresh Insights"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </button>
            )}
            {collapsible && (
              <button
                onClick={toggleCollapsed}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                title="Collapse"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
            {onExpand && isSidebar && !collapsible && (
              <button
                onClick={onExpand}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                title="Collapse"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className={cn(
              "flex flex-col items-center justify-center text-text-muted gap-3",
              isSidebar ? "py-6" : "py-8"
            )}
          >
            <Loader2
              className={cn("animate-spin", isSidebar ? "h-5 w-5" : "h-6 w-6")}
              style={{ color: accentColor }}
            />
            <p className="text-sm">{loadingMessage}</p>
          </div>
        ) : error ? (
          <div className={cn("text-center space-y-3", isSidebar ? "py-6" : "py-8")}>
            <div className="text-yellow-500 dark:text-yellow-400 text-sm font-medium">Insights Unavailable</div>
            <div className="text-text-secondary text-xs leading-relaxed max-w-sm mx-auto">{error}</div>
          </div>
        ) : (
          <div className={cn(isSidebar ? "space-y-4" : "grid gap-6 md:grid-cols-3")}>
            {sections.map((section, index) => (
              <AIInsightsSection
                key={index}
                icon={section.icon}
                label={section.label}
                accentColor={accentColor}
                order={isSidebar ? index : undefined}
              >
                {section.content}
              </AIInsightsSection>
            ))}
          </div>
        )}

        {children}

        {/* Decorative blur orbs */}
        <div
          className="absolute -top-24 -right-24 h-48 w-48 blur-3xl rounded-full pointer-events-none"
          style={{ backgroundColor: `${accentColor}33` }}
        />
        <div
          className="absolute -bottom-24 -left-24 h-48 w-48 blur-3xl rounded-full pointer-events-none"
          style={{ backgroundColor: `${accentColor}1A` }}
        />
      </div>
    </div>
  );
}

interface AIInsightsSectionProps {
  icon: ReactNode;
  label: string;
  accentColor: string;
  order?: number;
  children: ReactNode;
}

function AIInsightsSection({ icon, label, children, order }: AIInsightsSectionProps) {
  return (
    <div className="space-y-2" style={order !== undefined ? { order } : undefined}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-text-muted">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

/**
 * Helper component for rendering a bulleted list in AI Insights
 */
export interface AIInsightsBulletListProps {
  items: string[];
  accentColor: string;
}

export function AIInsightsBulletList({ items, accentColor }: AIInsightsBulletListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
          <span
            className="mt-1.5 h-1 w-1 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Helper component for rendering theme tags in AI Insights
 */
export interface AIInsightsTagListProps {
  tags: string[];
}

export function AIInsightsTagList({ tags }: AIInsightsTagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-md bg-gray-100 dark:bg-white/10 px-2.5 py-1 text-xs text-text-primary ring-1 ring-inset ring-gray-200 dark:ring-white/10"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

/**
 * Helper component for rendering paragraph text in AI Insights
 */
export interface AIInsightsTextProps {
  children: ReactNode;
}

export function AIInsightsText({ children }: AIInsightsTextProps) {
  return <p className="text-sm text-text-primary leading-relaxed">{children}</p>;
}
