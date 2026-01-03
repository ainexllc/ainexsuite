'use client';

import { cn } from '../lib/utils';
import * as LucideIcons from 'lucide-react';

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number | string;
}

export function DynamicIcon({ name, className = 'h-5 w-5', size }: DynamicIconProps) {
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<{ className?: string; size?: number | string }>;

  if (!IconComponent) {
    return (
      <div className={cn('h-5 w-5 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400', className)}>
        ?
      </div>
    );
  }

  return <IconComponent className={className} size={size} />;
}
