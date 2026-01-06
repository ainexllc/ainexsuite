'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useHints } from './HintsProvider';
import type { HintConfig, HintPlacement } from './hints-config';

interface HintProps {
  /** The hint configuration */
  hint: HintConfig;
  /** The target element to attach the hint to */
  children: ReactNode;
  /** Additional condition to show the hint (e.g., "no notes exist") */
  showWhen?: boolean;
  /** Custom class name for the wrapper */
  className?: string;
}

const placementStyles: Record<HintPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<HintPlacement, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-amber-500 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-amber-500 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-amber-500 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-amber-500 border-y-transparent border-l-transparent',
};

export function Hint({ hint, children, showWhen = true, className }: HintProps) {
  const { shouldShowHint, dismissHint } = useHints();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const shouldShow = showWhen && shouldShowHint(hint.id);

  // Delay showing to allow page to settle
  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setIsAnimating(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsAnimating(false);
    }
  }, [shouldShow]);

  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      dismissHint(hint.id);
    }, 200);
  };

  return (
    <div className={cn('relative w-full', className)}>
      {children}

      {isVisible && (
        <div
          className={cn(
            'absolute z-50 w-64 p-3 rounded-xl shadow-xl',
            'bg-gradient-to-br from-amber-500 to-amber-600',
            'border border-amber-400/30',
            'transition-all duration-200',
            isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            placementStyles[hint.placement]
          )}
        >
          {/* Arrow */}
          <div
            className={cn(
              'absolute w-0 h-0 border-[6px]',
              arrowStyles[hint.placement]
            )}
          />

          {/* Content */}
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 p-1.5 rounded-lg bg-white/20">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-0.5">
                {hint.title}
              </h4>
              <p className="text-xs text-white/90 leading-relaxed">
                {hint.description}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Dismiss hint"
            >
              <X className="h-4 w-4 text-white/80" />
            </button>
          </div>

          {/* Got it button */}
          <button
            onClick={handleDismiss}
            className="w-full mt-2.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            Got it!
          </button>
        </div>
      )}
    </div>
  );
}
