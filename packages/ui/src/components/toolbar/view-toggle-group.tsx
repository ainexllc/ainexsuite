'use client';

import { clsx } from 'clsx';
import type { ViewOption } from './types';
import { ToolbarButton } from './toolbar-button';

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

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1 rounded-full bg-background/40 backdrop-blur-sm p-1 shadow-sm border border-border',
        className
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <ToolbarButton
            key={option.value}
            isActive={value === option.value}
            size={size}
            onClick={() => onChange(option.value)}
            aria-label={option.label}
            title={option.label}
          >
            <Icon className={iconSize} />
          </ToolbarButton>
        );
      })}
    </div>
  );
}
