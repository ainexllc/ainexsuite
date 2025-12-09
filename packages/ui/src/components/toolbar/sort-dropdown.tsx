'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { ToolbarButton } from './toolbar-button';
import type { SortConfig, SortOption } from './types';

export interface SortDropdownProps {
  value: SortConfig;
  onChange: (config: SortConfig) => void;
  options: SortOption[];
  className?: string;
}

export function SortDropdown({
  value,
  onChange,
  options,
  className,
}: SortDropdownProps) {
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

  const handleFieldSelect = (field: SortConfig['field']) => {
    if (field === value.field) {
      // Toggle direction if same field
      onChange({ field, direction: value.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      // Default to descending for dates, ascending for title
      const defaultDirection = field === 'title' ? 'asc' : 'desc';
      onChange({ field, direction: defaultDirection });
    }
    setIsOpen(false);
  };

  const currentOption = options.find((o) => o.field === value.field);
  const DirectionIcon = value.direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div ref={dropdownRef} className={clsx('relative', className)}>
      <ToolbarButton
        variant="action"
        isActive={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <ArrowUpDown className="h-4 w-4" />
        <span className="text-sm">{currentOption?.label || 'Sort'}</span>
        <DirectionIcon className="h-3 w-3 opacity-60" />
      </ToolbarButton>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-background/95 backdrop-blur-xl rounded-xl border border-border shadow-xl py-1">
          {options.map((option) => {
            const isSelected = option.field === value.field;
            return (
              <button
                key={option.field}
                onClick={() => handleFieldSelect(option.field)}
                className={clsx(
                  'w-full flex items-center justify-between px-4 py-2 text-sm transition-colors',
                  isSelected
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-foreground hover:bg-foreground/5'
                )}
              >
                <span>{option.label}</span>
                <div className="flex items-center gap-1">
                  {isSelected && (
                    <>
                      <DirectionIcon className="h-3 w-3" />
                      <Check className="h-3.5 w-3.5" />
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
