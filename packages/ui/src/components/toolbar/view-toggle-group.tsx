'use client';

import { clsx } from 'clsx';
import type { ViewOption } from './types';

export interface ViewToggleGroupProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: ViewOption<T>[];
  size?: 'sm' | 'md';
  className?: string;
}

export function ViewToggleGroup<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
}: ViewToggleGroupProps<T>) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full p-1 shadow-sm border',
        'bg-white/5 dark:bg-white/5 backdrop-blur-sm border-white/10 dark:border-white/10',
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
              'inline-flex items-center justify-center rounded-full transition-all',
              isActive
                ? 'bg-[#f97316] text-white shadow-md'
                : 'text-zinc-400 hover:bg-white/10 hover:text-white dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white'
            )}
          >
            <Icon className={iconSize} />
          </button>
        );
      })}
    </div>
  );
}
