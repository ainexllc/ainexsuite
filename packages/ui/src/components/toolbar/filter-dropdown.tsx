'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ToolbarButton } from './toolbar-button';

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
      <ToolbarButton
        variant="action"
        isActive={isOpen || activeCount > 0}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-sm">Filter</span>
        {activeCount > 0 && (
          <span className="px-1.5 py-0.5 bg-white/10 text-white text-xs rounded-full min-w-[1.25rem] text-center border border-white/10 shadow-sm backdrop-blur-sm">
            {activeCount}
          </span>
        )}
      </ToolbarButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 z-50 min-w-[280px] max-w-[360px] bg-background/95 backdrop-blur-xl rounded-xl border border-border shadow-xl origin-top-right"
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
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
