'use client';

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
  // Use CSS variables if no colors provided (backwards compatible)
  const primaryStyle = primaryColor
    ? { backgroundColor: primaryColor }
    : { backgroundColor: 'rgba(var(--theme-primary-rgb), 0.35)' };

  const secondaryStyle = secondaryColor
    ? { backgroundColor: secondaryColor }
    : { backgroundColor: 'rgba(var(--theme-secondary-rgb), 0.25)' };

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
