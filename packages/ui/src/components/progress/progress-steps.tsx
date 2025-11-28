'use client';

import { cn } from '../../lib/utils';
import { useAppColors } from '@ainexsuite/theme';
import { Check } from 'lucide-react';

export interface Step {
  /** Step label */
  label: string;
  /** Step description (optional) */
  description?: string;
  /** Whether step is completed */
  completed: boolean;
  /** Whether step is currently active */
  active: boolean;
}

export interface ProgressStepsProps {
  /** Array of steps */
  steps: Step[];
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

export function ProgressSteps({
  steps,
  orientation = 'horizontal',
  size = 'md',
  className,
}: ProgressStepsProps) {
  const { primary: accentColor } = useAppColors();

  // Size classes
  const circleSize = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const descriptionSize = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className={cn(
              'flex items-center',
              orientation === 'vertical' && 'pb-8 last:pb-0'
            )}
          >
            {/* Step indicator */}
            <div className={cn('flex items-center', orientation === 'vertical' && 'flex-col')}>
              {/* Circle */}
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    'rounded-full border-2 flex items-center justify-center transition-all duration-300',
                    circleSize[size],
                    {
                      'border-white/20 bg-white/5': !step.completed && !step.active,
                      'bg-white/10': step.active && !step.completed,
                    }
                  )}
                  style={{
                    borderColor: step.completed || step.active ? accentColor : undefined,
                    backgroundColor: step.completed ? accentColor : undefined,
                  }}
                >
                  {step.completed ? (
                    <Check className={cn('text-white', iconSize[size])} />
                  ) : (
                    <span
                      className={cn(
                        'font-semibold',
                        step.active ? 'text-white' : 'text-white/50',
                        size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Connector line */}
                {!isLast && orientation === 'horizontal' && (
                  <div
                    className={cn(
                      'h-0.5 transition-all duration-300',
                      size === 'sm' ? 'w-12' : size === 'md' ? 'w-16' : 'w-20'
                    )}
                    style={{
                      backgroundColor: step.completed ? accentColor : 'rgba(255, 255, 255, 0.1)',
                      marginLeft: size === 'sm' ? '0.25rem' : size === 'md' ? '0.5rem' : '0.75rem',
                      marginRight: size === 'sm' ? '0.25rem' : size === 'md' ? '0.5rem' : '0.75rem',
                    }}
                  />
                )}

                {/* Vertical connector line */}
                {!isLast && orientation === 'vertical' && (
                  <div
                    className="absolute top-full w-0.5 h-8 transition-all duration-300"
                    style={{
                      backgroundColor: step.completed ? accentColor : 'rgba(255, 255, 255, 0.1)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  />
                )}
              </div>

              {/* Label and description */}
              {orientation === 'horizontal' ? (
                <div className="ml-3 flex-1">
                  <div
                    className={cn(
                      'font-medium transition-colors',
                      textSize[size],
                      step.active || step.completed ? 'text-white' : 'text-white/50'
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className={cn('text-white/40 mt-0.5', descriptionSize[size])}>
                      {step.description}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'font-medium transition-colors',
                      textSize[size],
                      step.active || step.completed ? 'text-white' : 'text-white/50'
                    )}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className={cn('text-white/40 mt-0.5', descriptionSize[size])}>
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
