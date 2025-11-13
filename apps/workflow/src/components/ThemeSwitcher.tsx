'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { workflowThemes } from '@/lib/themes';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg transition-all"
        style={{
          backgroundColor: `rgba(${theme.primaryRgb}, 0.1)`,
          border: `1px solid rgba(${theme.primaryRgb}, 0.3)`,
          color: theme.primary,
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        title="Change Theme"
      >
        <Palette className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-xl z-20 overflow-hidden"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              borderColor: `rgba(${theme.primaryRgb}, 0.2)`,
            }}
          >
            <div className="p-2 border-b border-white/10">
              <p className="text-xs font-semibold text-white/70">Select Theme</p>
            </div>
            <div className="p-1">
              {workflowThemes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/10"
                >
                  <div
                    className="h-5 w-5 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: t.primary }}
                  />
                  <span className="flex-1 text-white">{t.name}</span>
                  {theme.id === t.id && (
                    <Check className="h-4 w-4" style={{ color: t.primary }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
