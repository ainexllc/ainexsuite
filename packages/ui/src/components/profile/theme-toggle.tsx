'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeToggleProps {
  onThemeChange?: (theme: Theme) => void;
}

export function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    onThemeChange?.(newTheme);

    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider px-1">
        Theme
      </h3>

      <div className="flex gap-2">
        {themes.map((option) => {
          const IconComponent = option.icon;
          const isActive = theme === option.value;

          return (
            <button
              key={option.value}
              onClick={() => handleThemeChange(option.value)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border transition ${
                isActive
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/[0.07] hover:text-white/70'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
