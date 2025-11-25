import * as React from 'react';
import { cn } from '../../lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ error: _error, className, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          'h-5 w-5 rounded border-outline-subtle bg-surface-elevated text-primary',
          'focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-base',
          'accent-primary cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
