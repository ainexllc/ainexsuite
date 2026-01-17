"use client";

import { X, Keyboard, Navigation, Edit, Zap } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  type KeyboardShortcut,
  formatShortcut,
  getModifierKey,
} from "./use-keyboard-shortcuts";

export interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Array of shortcuts to display */
  shortcuts: KeyboardShortcut[];
  /** Optional title override */
  title?: string;
  /** Optional help tip at the bottom */
  helpTip?: string;
}

const categoryIcons = {
  navigation: Navigation,
  editing: Edit,
  actions: Zap,
};

const categoryLabels = {
  navigation: "Navigation",
  editing: "Editing",
  actions: "Quick Actions",
};

/**
 * KeyboardShortcutsModal - A modal displaying available keyboard shortcuts
 *
 * Features:
 * - Groups shortcuts by category
 * - Cross-platform display (Cmd/Ctrl)
 * - Accessible with keyboard navigation
 * - Click outside or press Escape to close
 *
 * @example
 * ```tsx
 * const [showShortcuts, setShowShortcuts] = useState(false);
 *
 * <KeyboardShortcutsModal
 *   isOpen={showShortcuts}
 *   onClose={() => setShowShortcuts(false)}
 *   shortcuts={myShortcuts}
 * />
 * ```
 */
export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
  title = "Keyboard Shortcuts",
  helpTip,
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
  const defaultTip = `Press ${mod}+/ anytime to show this menu`;

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
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Zap;
            const label = categoryLabels[category as keyof typeof categoryLabels] || category;

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
                      <kbd className={cn(
                        "px-2 py-1 rounded bg-surface-muted border border-border",
                        "text-xs font-mono text-muted-foreground"
                      )}>
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
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-surface-muted border border-border text-xs font-mono">
                {helpTip || defaultTip}
              </kbd>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
