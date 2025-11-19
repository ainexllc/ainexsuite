import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-surface-elevated px-4 py-2.5',
          'text-text-primary placeholder:text-text-muted',
          'focus:outline-none focus:ring-2',
          'transition-all duration-200',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-border-secondary hover:border-border-primary focus:ring-primary',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
