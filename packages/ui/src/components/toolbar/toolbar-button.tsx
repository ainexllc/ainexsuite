'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  size?: 'sm' | 'md';
  variant?: 'toggle' | 'action';
}

export const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ className, isActive, size = 'md', variant = 'toggle', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-7 w-7',
      md: 'h-8 w-8',
    };

    const baseClasses = 'inline-flex items-center justify-center rounded-full transition-all';

    const variantClasses = {
      toggle: clsx(
        baseClasses,
        sizeClasses[size],
        isActive
          ? 'bg-[var(--color-primary)] text-foreground shadow-md'
          : 'text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
      ),
      action: clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all border',
        isActive
          ? 'bg-white/10 border-white/20 text-white shadow-sm'
          : 'bg-background/40 backdrop-blur-sm border-border hover:border-white/20 text-muted-foreground hover:text-white'
      ),
    };

    return (
      <button
        ref={ref}
        type="button"
        className={clsx(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';
