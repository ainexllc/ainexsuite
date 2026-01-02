'use client';

import { useRef, useState, useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useHints } from './HintsProvider';
import type { HintId, HintPlacement } from './hints-config';
import { HINTS } from './hints-config';

interface HintProps {
  hintId: HintId;
  children: ReactNode;
}

export function Hint({ hintId, children }: HintProps) {
  const { shouldShowHint, dismissHint } = useHints();
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const config = HINTS[hintId];
  const showHint = shouldShowHint(hintId);

  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [showHint]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => dismissHint(hintId), 200);
  };

  const getPlacementStyles = (placement: HintPlacement) => {
    switch (placement) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
    }
  };

  const getArrowStyles = (placement: HintPlacement) => {
    switch (placement) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-t-violet-500 border-x-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-violet-500 border-x-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-l-violet-500 border-y-transparent border-r-transparent';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-r-violet-500 border-y-transparent border-l-transparent';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 border-b-violet-500 border-x-transparent border-t-transparent';
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      {children}
      {showHint && (
        <div
          className={`absolute z-50 ${getPlacementStyles(config.placement)} transition-all duration-200 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="relative bg-violet-500 text-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className={`absolute w-0 h-0 border-[6px] ${getArrowStyles(config.placement)}`} />
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <p className="font-medium text-sm">{config.title}</p>
                <p className="text-xs text-violet-100 mt-0.5">{config.description}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-0.5 hover:bg-violet-600 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
