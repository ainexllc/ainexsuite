"use client";

import * as React from "react";
import { clsx } from "clsx";
import { Filter, X } from "lucide-react";
import { GlassModal, GlassModalHeader, GlassModalContent, GlassModalFooter } from "../glass-modal";

/**
 * Tab configuration for FilterModal
 */
export interface FilterTab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

/**
 * FilterModal Props
 */
export interface FilterModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Description text shown below title */
  description?: string;
  /** Array of filter tabs */
  tabs?: FilterTab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Callback when Apply button is clicked */
  onApply?: () => void;
  /** Callback when Reset/Clear button is clicked */
  onReset?: () => void;
  /** Text for the apply button */
  applyLabel?: string;
  /** Text for the reset button */
  resetLabel?: string;
  /** Disable the reset button */
  disableReset?: boolean;
  /** Modal content */
  children: React.ReactNode;
  /** Accent color from theme (e.g., #f97316 for Journey) */
  accentColor?: string;
  /** Additional class names */
  className?: string;
}

/**
 * FilterModal - A modal component for filtering content with tab support
 *
 * Features:
 * - Tab navigation for filter categories
 * - Reset and Apply action buttons
 * - Glassmorphism styling
 * - Theme-aware accent colors
 *
 * @example
 * ```tsx
 * const tabs = [
 *   { id: 'all', label: 'All', count: 10 },
 *   { id: 'tags', label: 'Tags', icon: Tag, count: 5 }
 * ];
 *
 * <FilterModal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Filter Entries"
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   onApply={applyFilters}
 *   onReset={clearFilters}
 *   accentColor="#f97316"
 * >
 *   <div>Filter content here</div>
 * </FilterModal>
 * ```
 */
export function FilterModal({
  isOpen,
  onClose,
  title = "Filters",
  description,
  tabs,
  activeTab,
  onTabChange,
  onApply,
  onReset,
  applyLabel = "Apply Filters",
  resetLabel = "Reset",
  disableReset = false,
  children,
  accentColor = "#6366f1", // Default to indigo
  className,
}: FilterModalProps) {
  const handleApply = () => {
    onApply?.();
    onClose();
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      variant="frosted"
      className={className}
    >
      {/* Header with Icon and Title */}
      <GlassModalHeader onClose={onClose} showCloseButton={true}>
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: `${accentColor}20`,
            }}
          >
            <Filter className="w-5 h-5" style={{ color: accentColor }} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </GlassModalHeader>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="flex gap-1 p-2 bg-background/5 border-b border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                  isActive
                    ? "text-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: accentColor,
                        boxShadow: `0 4px 14px -2px ${accentColor}40`,
                      }
                    : undefined
                }
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={clsx(
                      "text-xs px-2 py-0.5 rounded-full",
                      isActive
                        ? "bg-foreground/20 text-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <GlassModalContent className="max-h-[60vh] overflow-y-auto">
        {children}
      </GlassModalContent>

      {/* Footer with Actions */}
      <GlassModalFooter className="justify-between">
        <button
          type="button"
          onClick={onReset}
          disabled={disableReset}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resetLabel}
        </button>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-6 py-2 text-sm font-medium text-foreground rounded-lg transition-colors shadow-lg"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 4px 14px -2px ${accentColor}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            {applyLabel}
          </button>
        </div>
      </GlassModalFooter>
    </GlassModal>
  );
}
