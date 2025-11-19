'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const currentIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-surface-card hover:bg-surface-hover border border-surface-hover transition-all"
        title={`Theme: ${theme}`}
        aria-label="Toggle theme"
      >
        {currentIcon === Sun && (
          <Sun className="h-5 w-5 text-amber-500 dark:text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
        )}
        {currentIcon === Moon && (
          <Moon className="h-5 w-5 text-blue-500 dark:text-blue-400 transition-transform duration-300 rotate-0 scale-100" />
        )}
        {currentIcon === Monitor && (
          <Monitor className="h-5 w-5 text-ink-800 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-surface-card border border-surface-hover rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;

            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-500/10 text-accent-500'
                    : 'text-ink-800 hover:bg-surface-hover'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{option.label}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-accent-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
