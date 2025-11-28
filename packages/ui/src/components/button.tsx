import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={clsx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          // Variant styles
          variant === "primary" &&
            "bg-accent-500 text-foreground hover:bg-accent-400 focus-visible:ring-accent-500",
          variant === "secondary" &&
            "bg-surface-muted text-ink-700 hover:bg-ink-200 focus-visible:ring-ink-500",
          variant === "ghost" &&
            "text-ink-600 hover:bg-surface-muted hover:text-ink-900",
          variant === "danger" &&
            "bg-danger text-foreground hover:bg-danger/90 focus-visible:ring-danger",
          // Size styles
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-base",
          size === "lg" && "h-12 px-6 text-lg",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
