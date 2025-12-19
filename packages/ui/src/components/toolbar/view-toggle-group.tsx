'use client';

import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import type { ViewOption } from './types';

export interface ViewToggleGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewOption<T>[];
  size?: 'sm' | 'md';
  className?: string;
  /** Extra content to render inside the pill after the view toggles */
  trailingContent?: ReactNode;
}

export function ViewToggleGroup<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
  trailingContent,
}: ViewToggleGroupProps<T>) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  const buttonSize = size === 'sm' ? 'h-6 w-6' : 'h-7 w-7';

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 backdrop-blur-xl border',
        'bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50',
        className
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-label={option.label}
            title={option.label}
            className={clsx(
              buttonSize,
              'flex items-center justify-center rounded-full transition',
              isActive
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 hover:text-zinc-700 dark:hover:text-zinc-200'
            )}
          >
            <Icon className={iconSize} />
          </button>
        );
      })}
      {trailingContent}
    </div>
  );
}
