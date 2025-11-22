'use client';

import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-xl z-20 transition-opacity duration-300">
      <Loader2 className="w-6 h-6 text-white/50 animate-spin mb-2" />
      {message && (
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{message}</span>
      )}
    </div>
  );
}

