'use client';

import { ReactNode } from 'react';
import { X, Move } from 'lucide-react';
import { cn } from '@ainexsuite/ui';

interface WidgetWrapperProps {
  children: ReactNode;
  isEditMode: boolean;
  onRemove?: () => void;
  className?: string;
  title?: string;
}

export function WidgetWrapper({ 
  children, 
  isEditMode, 
  onRemove, 
  className,
  title 
}: WidgetWrapperProps) {
  return (
    <div className={cn(
      "relative group h-full transition-all duration-300 ease-out",
      // Glassmorphism Base
      "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md",
      // Edit Mode Styles
      isEditMode && "ring-2 ring-white/20 hover:ring-accent-500 cursor-grab active:cursor-grabbing bg-white/10",
      className
    )}>
      {/* Edit Mode Controls Overlay */}
      <div className={cn(
        "absolute top-2 right-2 z-50 flex gap-2 transition-opacity duration-200",
        isEditMode ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <button 
          onClick={onRemove}
          className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 backdrop-blur shadow-lg"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Drag Handle Indicator (Only visible in Edit Mode) */}
      {isEditMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 pointer-events-none">
           <Move className="w-8 h-8" />
        </div>
      )}

      {/* Content Area */}
      <div className={cn(
        "h-full w-full p-4",
        isEditMode && "opacity-50 scale-95 transition-transform"
      )}>
        {children}
      </div>
    </div>
  );
}
