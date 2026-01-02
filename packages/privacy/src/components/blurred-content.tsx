'use client';

import { Lock } from 'lucide-react';
import type { BlurredContentProps } from '../types';

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function BlurredContent({
  isLocked,
  onClick,
  className,
  children,
  accentColor = 'var(--color-primary, #f97316)',
}: BlurredContentProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn('relative cursor-pointer overflow-hidden rounded-lg flex-1 flex items-center justify-center', className)}
      onClick={onClick}
    >
      {/* Lock icon - fixed size, centered */}
      <div className="flex flex-col items-center gap-1 p-3">
        <div className="rounded-full bg-zinc-800 p-2 shadow-lg">
          <Lock
            className="h-5 w-5"
            style={{ color: accentColor }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Click to unlock</p>
      </div>
    </div>
  );
}
