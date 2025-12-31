'use client';

import { useState, useRef, useCallback } from 'react';
import { Check, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableHabitCardProps {
  children: React.ReactNode;
  onSwipeRight?: () => void; // Complete action
  onSwipeLeft?: () => void;  // Edit action
  disabled?: boolean;
  isCompleted?: boolean;
}

const SWIPE_THRESHOLD = 80; // Minimum distance to trigger action
const MAX_SWIPE = 120; // Maximum visual swipe distance

export function SwipeableHabitCard({
  children,
  onSwipeRight,
  onSwipeLeft,
  disabled = false,
  isCompleted = false
}: SwipeableHabitCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startXRef = useRef(0);
  const currentXRef = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
    currentXRef.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping || disabled) return;

    currentXRef.current = e.touches[0].clientX;
    const diff = currentXRef.current - startXRef.current;

    // Limit the swipe distance with resistance
    const resistance = 0.5;
    const clampedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff * resistance));

    // Don't allow right swipe if already completed
    if (isCompleted && clampedDiff > 0) {
      setTranslateX(0);
      return;
    }

    setTranslateX(clampedDiff);
  }, [isSwiping, disabled, isCompleted]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping) return;
    setIsSwiping(false);

    const diff = currentXRef.current - startXRef.current;

    // Check if swipe exceeded threshold
    if (diff > SWIPE_THRESHOLD && onSwipeRight && !isCompleted) {
      // Swipe right - Complete
      onSwipeRight();
    } else if (diff < -SWIPE_THRESHOLD && onSwipeLeft) {
      // Swipe left - Edit
      onSwipeLeft();
    }

    // Reset position with animation
    setTranslateX(0);
  }, [isSwiping, onSwipeRight, onSwipeLeft, isCompleted]);

  // Calculate background action visibility
  const showRightAction = translateX > 20;
  const showLeftAction = translateX < -20;
  const rightActionOpacity = Math.min(1, translateX / SWIPE_THRESHOLD);
  const leftActionOpacity = Math.min(1, -translateX / SWIPE_THRESHOLD);

  return (
    <div className="relative overflow-hidden rounded-2xl md:overflow-visible">
      {/* Right action background (Complete) */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 flex items-center pl-4 bg-emerald-500/20 rounded-2xl transition-opacity',
          showRightAction ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          width: Math.abs(translateX) + 20,
          opacity: rightActionOpacity
        }}
      >
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">Complete</span>
        </div>
      </div>

      {/* Left action background (Edit) */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-end pr-4 bg-indigo-500/20 rounded-2xl transition-opacity',
          showLeftAction ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          width: Math.abs(translateX) + 20,
          opacity: leftActionOpacity
        }}
      >
        <div className="flex items-center gap-2 text-indigo-400">
          <span className="text-sm font-medium">Edit</span>
          <Settings className="h-5 w-5" />
        </div>
      </div>

      {/* Swipeable content */}
      <div
        className={cn(
          'relative z-10 touch-pan-y',
          isSwiping ? '' : 'transition-transform duration-200'
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Swipe hint - only show on first visit */}
      <style jsx>{`
        @media (max-width: 768px) {
          .swipe-hint::after {
            content: '';
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
        }
      `}</style>
    </div>
  );
}
