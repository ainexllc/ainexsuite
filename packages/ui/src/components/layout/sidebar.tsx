"use client";

import { type ReactNode, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";
import type { Route } from "next";

// ============================================================================
// Types
// ============================================================================

export type SidebarPosition = "left" | "right";

export type SidebarProps = {
  /** Sidebar width (default: 280px) */
  width?: number | string;
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onToggle?: (collapsed: boolean) => void;
  /** Sidebar position (default: 'left') */
  position?: SidebarPosition;
  /** Custom className */
  className?: string;
  /** Child components */
  children: ReactNode;
  /** Whether to show collapse toggle button (default: true on desktop) */
  showCollapseToggle?: boolean;
  /** Whether to show close button on mobile (default: true) */
  showCloseButton?: boolean;
  /** Close handler for mobile overlay */
  onClose?: () => void;
  /** Whether mobile overlay is open */
  isOpen?: boolean;
  /** Enable glassmorphism styling (default: true) */
  glass?: boolean;
};

export type SidebarHeaderProps = {
  /** Header title */
  title?: string;
  /** Header icon */
  icon?: ReactNode;
  /** Action element (e.g., button) */
  action?: ReactNode;
  /** Custom className */
  className?: string;
  /** Child components (overrides title/icon if provided) */
  children?: ReactNode;
};

export type SidebarSectionProps = {
  /** Section title */
  title?: string;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default expanded state (if collapsible) */
  defaultExpanded?: boolean;
  /** Custom className */
  className?: string;
  /** Child components */
  children: ReactNode;
};

export type SidebarItemProps = {
  /** Item icon */
  icon?: ReactNode;
  /** Item label */
  label: string;
  /** Link href (if it's a link) */
  href?: string;
  /** Click handler (if it's a button) */
  onClick?: () => void;
  /** Whether item is active */
  active?: boolean;
  /** Badge text/count */
  badge?: string | number;
  /** Indent level (for nested items) */
  indent?: number;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Whether to show only icon when sidebar is collapsed */
  collapsible?: boolean;
};

export type SidebarFooterProps = {
  /** Custom className */
  className?: string;
  /** Child components */
  children: ReactNode;
};

// ============================================================================
// Sidebar - Main Wrapper Component
// ============================================================================

/**
 * Flexible sidebar wrapper component with support for:
 * - Collapsed/expanded states
 * - Left/right positioning
 * - Mobile overlay
 * - Glassmorphism styling
 * - Responsive behavior
 *
 * @example
 * ```tsx
 * <Sidebar width={280} collapsed={collapsed} onToggle={setCollapsed}>
 *   <SidebarHeader title="Navigation" />
 *   <div className="flex-1 overflow-y-auto">
 *     <SidebarSection title="Main">
 *       <SidebarItem icon={<Home />} label="Home" href="/" active />
 *       <SidebarItem icon={<Settings />} label="Settings" href="/settings" />
 *     </SidebarSection>
 *   </div>
 *   <SidebarFooter>
 *     <button>Sign Out</button>
 *   </SidebarFooter>
 * </Sidebar>
 * ```
 */
export function Sidebar({
  width = 280,
  collapsed = false,
  onToggle,
  position = "left",
  className,
  children,
  showCollapseToggle = true,
  showCloseButton = true,
  onClose,
  isOpen = false,
  glass = true,
}: SidebarProps) {
  const widthValue = typeof width === "number" ? `${width}px` : width;
  const collapsedWidth = "80px";

  const baseClasses = clsx(
    "flex h-full flex-col transition-all duration-300",
    glass && "backdrop-blur-xl",
    glass ? "bg-black/40" : "bg-surface-base/90",
    position === "left" && "border-r",
    position === "right" && "border-l",
    glass ? "border-white/10" : "border-outline-subtle/60",
    className,
  );

  const desktopClasses = clsx(
    "hidden lg:flex h-[calc(100vh-4rem)] shrink-0",
    position === "left" && "border-r",
    position === "right" && "border-l",
    glass ? "border-white/10 bg-black/40" : "border-outline-subtle/60 bg-surface-base/85",
    glass && "backdrop-blur-xl",
    "transition-all duration-300",
  );

  const content = (
    <div
      className={baseClasses}
      style={{
        width: collapsed ? collapsedWidth : widthValue,
      }}
    >
      {children}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={desktopClasses}
        style={{
          width: collapsed ? collapsedWidth : widthValue,
          [position]: 0,
        }}
      >
        <div className="flex h-full flex-col">
          {/* Collapse Toggle */}
          {showCollapseToggle && onToggle && (
            <div className="flex items-center justify-end px-3 py-2 border-b border-white/10">
              <button
                type="button"
                className="icon-button"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => onToggle(!collapsed)}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {position === "left" ? (
                  collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )
                ) : collapsed ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          )}

          {children}
        </div>
      </aside>

      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-overlay/60 transition-all duration-200 lg:hidden",
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      >
        <div
          className={clsx(
            "h-full max-w-[90vw] transform transition-transform duration-300",
            position === "left" && "rounded-r-3xl",
            position === "right" && "rounded-l-3xl ml-auto",
            isOpen ? "translate-x-0" : position === "left" ? "-translate-x-full" : "translate-x-full",
            glass ? "bg-surface-elevated/95 backdrop-blur-2xl" : "bg-surface-elevated",
            position === "left" && "border-r",
            position === "right" && "border-l",
            glass ? "border-white/10" : "border-outline-subtle/60",
            "shadow-2xl",
          )}
          style={{ width: widthValue }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full flex-col">
            {/* Mobile Header with Close Button */}
            {showCloseButton && onClose && (
              <div className="flex items-center justify-between border-b border-outline-subtle/40 px-5 py-4">
                <span className="text-sm font-semibold text-ink-900">Navigation</span>
                <button
                  type="button"
                  className="icon-button h-8 w-8 rounded-full bg-surface-muted hover:bg-ink-200"
                  aria-label="Close navigation"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// SidebarHeader - Header Section
// ============================================================================

/**
 * Sidebar header component with optional title, icon, and action.
 *
 * @example
 * ```tsx
 * <SidebarHeader
 *   title="Workspace"
 *   icon={<Folder />}
 *   action={<Button size="sm">New</Button>}
 * />
 * ```
 */
export function SidebarHeader({
  title,
  icon,
  action,
  className,
  children,
}: SidebarHeaderProps) {
  if (children) {
    return (
      <div
        className={clsx(
          "flex items-center justify-between border-b border-white/10 px-5 py-4",
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-between border-b border-white/10 px-5 py-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-ink-900">{icon}</span>}
        {title && <span className="text-sm font-semibold text-ink-900">{title}</span>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================================================
// SidebarSection - Grouping Component
// ============================================================================

/**
 * Sidebar section for grouping related items.
 * Supports collapsible sections with expand/collapse animation.
 *
 * @example
 * ```tsx
 * <SidebarSection title="Projects" collapsible defaultExpanded>
 *   <SidebarItem label="Project A" href="/projects/a" />
 *   <SidebarItem label="Project B" href="/projects/b" />
 * </SidebarSection>
 * ```
 */
export function SidebarSection({
  title,
  collapsible = false,
  defaultExpanded = true,
  className,
  children,
}: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = useCallback(() => {
    if (collapsible) {
      setIsExpanded((prev) => !prev);
    }
  }, [collapsible]);

  return (
    <div className={clsx("py-4", className)}>
      {title && (
        <div
          className={clsx(
            "px-3 text-xs font-semibold uppercase tracking-wide text-ink-400",
            collapsible && "cursor-pointer select-none flex items-center justify-between",
          )}
          onClick={handleToggle}
          role={collapsible ? "button" : undefined}
          aria-expanded={collapsible ? isExpanded : undefined}
          tabIndex={collapsible ? 0 : undefined}
          onKeyDown={
            collapsible
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggle();
                  }
                }
              : undefined
          }
        >
          <span>{title}</span>
          {collapsible && (
            <span className="text-ink-500">
              {isExpanded ? (
                <ChevronRight className="h-3 w-3 rotate-90 transition-transform duration-200" />
              ) : (
                <ChevronRight className="h-3 w-3 transition-transform duration-200" />
              )}
            </span>
          )}
        </div>
      )}
      <nav
        className={clsx(
          "space-y-1 overflow-hidden transition-all duration-200",
          title && "mt-2",
          collapsible && !isExpanded && "max-h-0 opacity-0",
          collapsible && isExpanded && "max-h-[2000px] opacity-100",
        )}
      >
        {children}
      </nav>
    </div>
  );
}

// ============================================================================
// SidebarItem - Navigation Item
// ============================================================================

/**
 * Sidebar navigation item component.
 * Can be a link or button, supports icons, badges, and nested items.
 *
 * @example
 * ```tsx
 * // As a link
 * <SidebarItem
 *   icon={<Home />}
 *   label="Dashboard"
 *   href="/"
 *   active
 *   badge="3"
 * />
 *
 * // As a button
 * <SidebarItem
 *   icon={<Settings />}
 *   label="Settings"
 *   onClick={handleSettings}
 * />
 *
 * // Nested item
 * <SidebarItem
 *   label="Sub-item"
 *   href="/sub"
 *   indent={1}
 * />
 * ```
 */
export function SidebarItem({
  icon,
  label,
  href,
  onClick,
  active = false,
  badge,
  indent = 0,
  disabled = false,
  className,
  collapsible = false,
}: SidebarItemProps) {
  const baseClasses = clsx(
    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
    active
      ? "bg-ink-200 text-ink-900"
      : "text-ink-500 hover:bg-surface-muted hover:text-ink-700",
    disabled && "opacity-50 cursor-not-allowed pointer-events-none",
    className,
  );

  const iconWrapperClasses = clsx(
    "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors",
    active ? "bg-ink-300/80 text-ink-900" : "bg-surface-muted text-ink-600",
  );

  const content = (
    <>
      {icon && (
        <span className={iconWrapperClasses}>
          {typeof icon === "string" ? <span className="text-sm">{icon}</span> : icon}
        </span>
      )}
      {!collapsible && (
        <span className={clsx("flex-1 truncate", active ? "text-ink-900" : "text-inherit")}>
          {label}
        </span>
      )}
      {!collapsible && badge !== undefined && (
        <span className="inline-flex items-center rounded-full bg-ink-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {badge}
        </span>
      )}
    </>
  );

  const style = indent > 0 ? { paddingLeft: `${12 + indent * 16}px` } : undefined;

  if (href) {
    return (
      <Link
        href={href as Route}
        className={baseClasses}
        style={style}
        title={collapsible ? label : undefined}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(baseClasses, "w-full text-left")}
      style={style}
      disabled={disabled}
      title={collapsible ? label : undefined}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </button>
  );
}

// ============================================================================
// SidebarFooter - Footer Section
// ============================================================================

/**
 * Sidebar footer component for actions or information at the bottom.
 *
 * @example
 * ```tsx
 * <SidebarFooter>
 *   <button className="w-full btn-secondary">
 *     Sign Out
 *   </button>
 * </SidebarFooter>
 * ```
 */
export function SidebarFooter({ className, children }: SidebarFooterProps) {
  return (
    <div
      className={clsx(
        "border-t border-white/10 px-4 py-4 mt-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Utility Hook for Sidebar State Management
// ============================================================================

/**
 * Hook for managing sidebar collapsed state with localStorage persistence.
 *
 * @param key - localStorage key for persistence
 * @param defaultCollapsed - default collapsed state
 * @returns [collapsed, setCollapsed] tuple
 *
 * @example
 * ```tsx
 * const [collapsed, setCollapsed] = useSidebarCollapsed('my-sidebar', false);
 *
 * <Sidebar collapsed={collapsed} onToggle={setCollapsed}>
 *   ...
 * </Sidebar>
 * ```
 */
export function useSidebarCollapsed(
  key: string,
  defaultCollapsed = false,
): [boolean, (collapsed: boolean) => void] {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaultCollapsed;
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultCollapsed;
  });

  const setCollapsed = useCallback(
    (value: boolean) => {
      setCollapsedState(value);
      if (typeof window !== "undefined") {
        localStorage.setItem(key, String(value));
      }
    },
    [key],
  );

  return [collapsed, setCollapsed];
}
