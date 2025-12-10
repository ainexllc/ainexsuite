'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'ainexsuite-auto-hide-nav';
const HIDE_DELAY = 1000; // Hide after 1 second of inactivity
const HOVER_ZONE_HEIGHT = 8; // Pixels from top to trigger reveal

export interface UseAutoHideNavOptions {
  /**
   * Whether the feature is enabled (desktop only by default)
   * @default true on desktop, false on mobile
   */
  enabled?: boolean;
  /**
   * Delay in ms before hiding the nav after mouse leaves
   * @default 3000
   */
  hideDelay?: number;
}

export interface UseAutoHideNavReturn {
  /**
   * Whether the nav should be visible
   */
  isVisible: boolean;
  /**
   * Whether auto-hide is enabled by user preference
   */
  autoHideEnabled: boolean;
  /**
   * Toggle auto-hide preference
   */
  toggleAutoHide: () => void;
  /**
   * Force show the nav (e.g., when interacting)
   */
  showNav: () => void;
  /**
   * Props to spread on the header element
   */
  headerProps: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  /**
   * Props for the hover zone element (invisible trigger at top)
   */
  hoverZoneProps: {
    onMouseEnter: () => void;
    style: React.CSSProperties;
  };
}

/**
 * Hook for auto-hiding navigation bar on desktop
 *
 * Features:
 * - Persists user preference in localStorage
 * - Only active on desktop (min-width: 1024px)
 * - Reveals on hover at top of screen
 * - Keyboard shortcut support (Cmd/Ctrl + \)
 *
 * @example
 * ```tsx
 * const { isVisible, autoHideEnabled, toggleAutoHide, headerProps, hoverZoneProps } = useAutoHideNav();
 *
 * return (
 *   <>
 *     <div {...hoverZoneProps} />
 *     <header {...headerProps} style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}>
 *       ...
 *     </header>
 *   </>
 * );
 * ```
 */
export function useAutoHideNav(options: UseAutoHideNavOptions = {}): UseAutoHideNavReturn {
  const { hideDelay = HIDE_DELAY } = options;

  // Check if we're on desktop
  const [isDesktop, setIsDesktop] = useState(false);

  // User preference from localStorage
  const [autoHideEnabled, setAutoHideEnabled] = useState(false);

  // Current visibility state
  const [isVisible, setIsVisible] = useState(true);

  // Track if mouse is over header
  const isHovering = useRef(false);

  // Timer for auto-hide
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  // Check if desktop on mount
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(min-width: 1024px)').matches);
    };

    checkDesktop();

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    mediaQuery.addEventListener('change', checkDesktop);

    return () => mediaQuery.removeEventListener('change', checkDesktop);
  }, []);

  // Load preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setAutoHideEnabled(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save preference to localStorage
  const toggleAutoHide = useCallback(() => {
    setAutoHideEnabled(prev => {
      const newValue = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
      } catch {
        // Ignore localStorage errors
      }
      // When enabling, start visible
      if (newValue) {
        setIsVisible(true);
      }
      return newValue;
    });
  }, []);

  // Show nav function
  const showNav = useCallback(() => {
    setIsVisible(true);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  // Start hide timer
  const startHideTimer = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
    }
    hideTimer.current = setTimeout(() => {
      if (!isHovering.current && autoHideEnabled && isDesktop) {
        setIsVisible(false);
      }
    }, hideDelay);
  }, [autoHideEnabled, hideDelay, isDesktop]);

  // Header mouse handlers
  const handleHeaderMouseEnter = useCallback(() => {
    isHovering.current = true;
    showNav();
  }, [showNav]);

  const handleHeaderMouseLeave = useCallback(() => {
    isHovering.current = false;
    if (autoHideEnabled && isDesktop) {
      startHideTimer();
    }
  }, [autoHideEnabled, isDesktop, startHideTimer]);

  // Hover zone mouse handler
  const handleHoverZoneMouseEnter = useCallback(() => {
    showNav();
  }, [showNav]);

  // Keyboard shortcut: Cmd/Ctrl + \
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleAutoHide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleAutoHide]);

  // Start hide timer when auto-hide is enabled and not hovering
  useEffect(() => {
    if (autoHideEnabled && isDesktop && !isHovering.current) {
      startHideTimer();
    }
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, [autoHideEnabled, isDesktop, startHideTimer]);

  // Always show if not desktop or auto-hide disabled
  const effectivelyVisible = !isDesktop || !autoHideEnabled || isVisible;

  return {
    isVisible: effectivelyVisible,
    autoHideEnabled: autoHideEnabled && isDesktop,
    toggleAutoHide,
    showNav,
    headerProps: {
      onMouseEnter: handleHeaderMouseEnter,
      onMouseLeave: handleHeaderMouseLeave,
    },
    hoverZoneProps: {
      onMouseEnter: handleHoverZoneMouseEnter,
      style: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        height: HOVER_ZONE_HEIGHT,
        zIndex: 50,
        pointerEvents: effectivelyVisible ? 'none' : 'auto',
      },
    },
  };
}
