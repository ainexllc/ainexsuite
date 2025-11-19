import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-surface-elevated px-4 py-2.5',
          'text-text-primary placeholder:text-text-muted',
          'focus:outline-none focus:ring-2',
          'transition-all duration-200 resize-none',
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

Textarea.displayName = 'Textarea';
