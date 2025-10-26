/**
 * Button Component Template
 *
 * Accessible, reusable button with variants and loading states.
 *
 * Features:
 * - Multiple variants (primary, secondary, ghost, danger)
 * - Loading state with spinner
 * - Disabled state
 * - Full keyboard and screen reader support
 * - Flexible sizing
 *
 * Usage:
 *   <Button variant="primary" onClick={handleClick}>
 *     Click Me
 *   </Button>
 *
 *   <Button variant="secondary" loading disabled>
 *     Processing...
 *   </Button>
 */

"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500",
    secondary:
      "border border-outline-subtle bg-white text-ink-base hover:bg-surface-muted dark:bg-surface-elevated dark:hover:bg-surface-base",
    ghost: "text-ink-base hover:bg-surface-muted dark:hover:bg-surface-elevated",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2 text-base",
    lg: "px-8 py-3 text-lg",
  };

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon && <span aria-hidden="true">{icon}</span>
      )}
      {children}
    </button>
  );
}
