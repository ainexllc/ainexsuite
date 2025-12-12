'use client';

import { X, Keyboard } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-surface-elevated border border-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {KEYBOARD_SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-accent-400 bg-accent-500/10 border border-accent-500/20 rounded">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white/5 border border-white/10 rounded">?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
}
