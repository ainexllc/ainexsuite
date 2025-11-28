'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';

interface AIInsightsBannerProps {
  /**
   * Title for the insights banner
   * @default "AI Insights"
   */
  title?: string;
  /**
   * App accent color for styling
   */
  appColor?: string;
  /**
   * Whether insights are currently loading
   */
  isLoading?: boolean;
  /**
   * Error message to display
   */
  error?: string | null;
  /**
   * Content to display in the banner (usually insight cards)
   */
  children?: ReactNode;
  /**
   * Whether the banner starts collapsed
   * @default false
   */
  defaultCollapsed?: boolean;
  /**
   * Storage key for persisting collapsed state
   */
  storageKey?: string;
  /**
   * Callback when collapsed state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function AIInsightsBanner({
  title = 'AI Insights',
  appColor = '#8b5cf6',
  isLoading = false,
  error = null,
  children,
  defaultCollapsed = false,
  storageKey,
  onCollapsedChange,
}: AIInsightsBannerProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Load collapsed state from localStorage
  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsCollapsed(saved === 'true');
      }
    }
  }, [storageKey]);

  const handleToggle = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (storageKey) {
      localStorage.setItem(storageKey, String(newState));
    }
    onCollapsedChange?.(newState);
  };

  return (
    <div className="mb-6 rounded-2xl border border-white/10 bg-surface-elevated/50 backdrop-blur-sm overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${appColor}20` }}
          >
            <Sparkles className="h-4 w-4" style={{ color: appColor }} />
          </div>
          <span className="font-semibold text-text-primary">{title}</span>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-text-muted" />
          )}
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <span className="text-xs">
            {isCollapsed ? 'Show' : 'Hide'}
          </span>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Content - Collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        }`}
      >
        <div className="px-5 pb-5">
          {error ? (
            <div className="flex items-center gap-3 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : isLoading && !children ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : children ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {children}
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">
              No insights available yet. Add more data to generate insights.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface InsightCardProps {
  /**
   * Icon to display
   */
  icon: ReactNode;
  /**
   * Card title/label
   */
  label: string;
  /**
   * Main value or content
   */
  value: string | ReactNode;
  /**
   * Optional subtitle/description
   */
  subtitle?: string;
  /**
   * Accent color for the card
   */
  color?: string;
}

export function InsightCard({
  icon,
  label,
  value,
  subtitle,
  color = '#8b5cf6',
}: InsightCardProps) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
            {label}
          </p>
          <div className="text-sm font-medium text-text-primary">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-text-muted mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
