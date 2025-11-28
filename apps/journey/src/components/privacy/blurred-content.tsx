'use client';

import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlurredContentProps {
  isLocked: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function BlurredContent({ isLocked, onClick, className, children }: BlurredContentProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn("relative cursor-pointer overflow-hidden rounded-lg", className)}
      onClick={onClick}
    >
      {/* Blurred content */}
      <div className="select-none pointer-events-none blur-md opacity-50">
        {children}
      </div>

      {/* Overlay with lock icon */}
      <div className="absolute inset-0 flex items-center justify-center bg-foreground/10 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-1 p-3">
          <div className="p-2 bg-zinc-800 rounded-full shadow-lg">
            <Lock className="w-5 h-5 text-[#f97316]" />
          </div>
          <p className="text-xs text-muted-foreground">
            Click to unlock
          </p>
        </div>
      </div>
    </div>
  );
}
