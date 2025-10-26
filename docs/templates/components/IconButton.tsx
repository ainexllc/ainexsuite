/**
 * IconButton Component Template
 *
 * Accessible icon-only button with tooltip support.
 *
 * Features:
 * - Circular or square shape
 * - Size variants
 * - Accessible aria-label
 * - Hover states
 * - Loading state
 *
 * Usage:
 *   <IconButton
 *     icon={<Trash2 />}
 *     aria-label="Delete note"
 *     onClick={handleDelete}
 *   />
 *
 *   <IconButton
 *     icon={<Save />}
 *     aria-label="Save"
 *     variant="primary"
 *     size="lg"
 *     loading
 *   />
 */

"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "square";
  loading?: boolean;
  "aria-label": string; // Required for accessibility
}

export function IconButton({
  icon,
  variant = "default",
  size = "md",
  shape = "square",
  loading = false,
  disabled,
  className,
  "aria-label": ariaLabel,
  ...props
}: IconButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    default:
      "text-ink-base hover:bg-surface-muted dark:text-ink-200 dark:hover:bg-surface-base",
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500",
    danger: "text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
    ghost: "text-ink-muted hover:text-ink-base hover:bg-surface-muted",
  };

  const sizes = {
    sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
    md: "h-9 w-9 [&_svg]:h-4 [&_svg]:w-4",
    lg: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
  };

  const shapes = {
    circle: "rounded-full",
    square: "rounded-lg",
  };

  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      aria-label={ariaLabel}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        shapes[shape],
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" aria-hidden="true" />
      ) : (
        <span aria-hidden="true">{icon}</span>
      )}
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}
