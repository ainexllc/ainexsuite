'use client';

import { X, Keyboard, Navigation, Edit, Zap } from 'lucide-react';
import { type KeyboardShortcut, formatShortcut, getModifierKey } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

const categoryIcons = {
  navigation: Navigation,
  editing: Edit,
  actions: Zap,
};

const categoryLabels = {
  navigation: 'Navigation',
  editing: 'Editing',
  actions: 'Quick Actions',
};

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const mod = getModifierKey();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons];
            const label = categoryLabels[category as keyof typeof categoryLabels];

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {label}
                  </h3>
                </div>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 rounded bg-surface-muted border border-border text-xs font-mono text-muted-foreground">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Tip */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-border text-xs font-mono">{mod}+/</kbd> anytime to show this menu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
