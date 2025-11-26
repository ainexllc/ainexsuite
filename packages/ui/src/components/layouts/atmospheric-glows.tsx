'use client';

import { useEffect, useState } from 'react';

interface AtmosphericGlowsProps {
  /**
   * Primary glow color with opacity
   * @default 'rgba(249, 115, 22, 0.35)' (orange)
   * @example 'rgba(59, 130, 246, 0.35)' for blue theme
   */
  primaryColor?: string;
  /**
   * Secondary glow color with opacity
   * @default 'rgba(96, 165, 250, 0.25)' (blue-ish)
   * @example 'rgba(96, 165, 250, 0.25)' for blue theme
   */
  secondaryColor?: string;
  /**
   * Additional CSS classes to apply to the container
   */
  className?: string;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(249, 115, 22, ${alpha})`; // fallback orange
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * AtmosphericGlows Component
 *
 * Renders dynamic background glow effects with customizable colors.
 * Supports both CSS variable-based theming and direct color props.
 *
 * @example
 * ```tsx
 * // Default (orange theme):
 * <AtmosphericGlows />
 *
 * // Blue theme:
 * <AtmosphericGlows
 *   primaryColor="rgba(59, 130, 246, 0.35)"
 *   secondaryColor="rgba(96, 165, 250, 0.25)"
 * />
 *
 * // Green theme:
 * <AtmosphericGlows
 *   primaryColor="rgba(34, 197, 94, 0.35)"
 *   secondaryColor="rgba(74, 222, 128, 0.25)"
 * />
 * ```
 */
export function AtmosphericGlows({
  primaryColor,
  secondaryColor,
  className
}: AtmosphericGlowsProps = {}) {
  // State to hold computed colors from CSS variables (using secondary accent mixed with dark)
  const [computedPrimary, setComputedPrimary] = useState('rgba(249, 115, 22, 0.35)');
  const [computedSecondary, setComputedSecondary] = useState('rgba(249, 115, 22, 0.25)');

  // Read CSS variables set by AppColorProvider - use secondary color for both glows
  useEffect(() => {
    if (primaryColor || secondaryColor) return; // Skip if colors are provided directly

    const updateColors = () => {
      const root = document.documentElement;
      const secondary = getComputedStyle(root).getPropertyValue('--color-secondary').trim();

      // Use secondary color for both glows (mixed with dark background)
      if (secondary && secondary.startsWith('#')) {
        setComputedPrimary(hexToRgba(secondary, 0.35));
        setComputedSecondary(hexToRgba(secondary, 0.20));
      }
    };

    // Initial update
    updateColors();

    // Watch for CSS variable changes using MutationObserver
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    return () => observer.disconnect();
  }, [primaryColor, secondaryColor]);

  // Use provided colors or computed colors from CSS variables
  const primaryStyle = primaryColor
    ? { backgroundColor: primaryColor }
    : { backgroundColor: computedPrimary };

  const secondaryStyle = secondaryColor
    ? { backgroundColor: secondaryColor }
    : { backgroundColor: computedSecondary };

  return (
    <>
      {/* Primary glow - uses custom color or CSS variable for theme color */}
      <div
        className={`pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[150px] ${className || ''}`}
        style={primaryStyle}
      />
      {/* Secondary glow */}
      <div
        className={`pointer-events-none absolute top-1/3 right-[-12%] h-[460px] w-[460px] rounded-full blur-[160px] ${className || ''}`}
        style={secondaryStyle}
      />
    </>
  );
}
