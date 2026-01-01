'use client';

import { X, Keyboard } from 'lucide-react';
import { clsx } from 'clsx';

interface ShortcutItem {
  key: string;
  description: string;
  modifiers?: string[];
}

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS: ShortcutItem[] = [
  { key: 'N', description: 'Create new task' },
  { key: '/', description: 'Focus search' },
  { key: '1-5', description: 'Switch view (List, Board, My Day, Matrix, Calendar)' },
  { key: '?', description: 'Toggle keyboard shortcuts help' },
  { key: 'Esc', description: 'Close dialogs / Cancel editing' },
];

export function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-[var(--color-primary)]" />
            <h2 className="text-lg font-semibold text-zinc-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-4 space-y-3">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-zinc-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.modifiers?.map((mod) => (
                  <kbd
                    key={mod}
                    className={clsx(
                      'px-2 py-1 text-xs font-mono rounded',
                      'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    )}
                  >
                    {mod}
                  </kbd>
                ))}
                <kbd
                  className={clsx(
                    'px-2 py-1 text-xs font-mono rounded min-w-[2rem] text-center',
                    'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  )}
                >
                  {shortcut.key}
                </kbd>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
          <p className="text-xs text-zinc-500 text-center">
            Press <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 border border-zinc-700">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}
