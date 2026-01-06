'use client';

import { Lock } from 'lucide-react';

interface LockBadgeProps {
  locked?: boolean;
}

export function LockBadge({ locked }: LockBadgeProps) {
  if (!locked) return null;

  return (
    <div
      className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 shadow-lg"
      title="This node is locked"
    >
      <Lock className="h-3 w-3 text-amber-950" />
    </div>
  );
}
