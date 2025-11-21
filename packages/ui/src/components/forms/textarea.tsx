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
          'text-ink-900 placeholder:text-ink-400',
          'focus:outline-none focus:ring-2',
          'transition-all duration-200 resize-none',
          error
            ? 'border-danger focus:ring-danger'
            : 'border-outline-subtle hover:border-outline-base focus:ring-primary',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
