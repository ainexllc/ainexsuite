'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';

export interface FilterDropdownProps {
  activeCount?: number;
  onReset?: () => void;
  children: ReactNode;
  className?: string;
}

export function FilterDropdown({
  activeCount = 0,
  onReset,
  children,
  className,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Filter"
        title="Filter"
        className={clsx(
          'relative h-7 w-7 flex items-center justify-center rounded-full transition',
          isOpen || activeCount > 0
            ? 'bg-[var(--color-primary)] text-white'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 hover:text-zinc-700 dark:hover:text-zinc-200'
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 z-50 min-w-[300px] max-w-[320px] bg-background/95 backdrop-blur-xl rounded-xl border border-border shadow-xl origin-top-right"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-foreground text-sm">Filters</h3>
              <div className="flex items-center gap-2">
                {activeCount > 0 && onReset && (
                  <button
                    onClick={() => {
                      onReset();
                    }}
                    className="text-xs text-white/70 hover:text-white font-medium transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-foreground/10 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 max-h-[280px] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
