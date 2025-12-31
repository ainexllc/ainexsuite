"use client";

import { useEffect, useMemo } from "react";
import { X, Command } from "lucide-react";
import { clsx } from "clsx";
import type { KeyboardShortcut } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts,
}: KeyboardShortcutsModalProps) {
  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Group shortcuts by category
  const groupedShortcuts = useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    shortcuts.forEach((shortcut) => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = [];
      }
      groups[shortcut.category].push(shortcut);
    });
    return groups;
  }, [shortcuts]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-overlay/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-2xl border border-outline-subtle/40 bg-surface-elevated shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-subtle/40 px-6 py-4">
            <h2 className="text-lg font-semibold text-ink-900">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            <div className="space-y-6">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut) => (
                      <div
                        key={`${shortcut.key}-${shortcut.modifiers?.join("-")}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-surface-muted"
                      >
                        <span className="text-sm text-ink-700">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.modifiers?.map((mod) => (
                            <Kbd key={mod}>
                              {mod === "meta" ? (
                                <Command className="h-3 w-3" />
                              ) : mod === "shift" ? (
                                "⇧"
                              ) : mod === "alt" ? (
                                "⌥"
                              ) : (
                                "⌃"
                              )}
                            </Kbd>
                          ))}
                          <Kbd>{shortcut.key.toUpperCase()}</Kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-outline-subtle/40 px-6 py-4">
            <p className="text-center text-xs text-ink-500">
              Press <Kbd><Command className="h-2.5 w-2.5" /></Kbd> <Kbd>/</Kbd> to toggle this menu
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={clsx(
        "inline-flex h-6 min-w-6 items-center justify-center rounded bg-surface-muted px-1.5 text-xs font-medium text-ink-600",
        className
      )}
    >
      {children}
    </kbd>
  );
}
