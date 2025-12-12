'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeLabWorkspace } from '@/components/theme-lab/theme-lab-workspace';

type ThemeMode = 'light' | 'dark' | 'system';

export default function ThemeLabPage() {
  const [activeTab, setActiveTab] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <div className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Theme Lab
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      {/* Tab Switcher Header */}
      <div className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                Theme Lab
              </h1>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                Design System Reference
              </span>
            </div>

            {/* Theme Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <button
                onClick={() => setActiveTab('light')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'light'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
              <button
                onClick={() => setActiveTab('dark')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'dark'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'system'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
                }`}
              >
                <Monitor className="h-4 w-4" />
                Side-by-Side
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="py-6">
        {activeTab === 'system' ? (
          /* Side-by-Side View */
          <div className="grid grid-cols-2 gap-0 min-h-[calc(100vh-8rem)]">
            <div className="light bg-zinc-100 border-r border-zinc-200">
              <ThemeLabWorkspace mode="light" />
            </div>
            <div className="dark bg-zinc-950">
              <ThemeLabWorkspace mode="dark" />
            </div>
          </div>
        ) : (
          /* Single Mode View */
          <div className={activeTab === 'dark' ? 'dark' : 'light'}>
            <div className={activeTab === 'dark' ? 'bg-zinc-950 min-h-[calc(100vh-8rem)]' : 'bg-zinc-100 min-h-[calc(100vh-8rem)]'}>
              <ThemeLabWorkspace mode={activeTab} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
