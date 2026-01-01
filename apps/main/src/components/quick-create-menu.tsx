"use client";

import { useEffect, useCallback } from "react";
import {
  X,
  FileText,
  CheckSquare,
  BookOpen,
  Dumbbell,
  Timer,
  Command,
} from "lucide-react";
import { clsx } from "clsx";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";

interface QuickCreateMenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  appSlug: string;
  shortcut?: string;
}

const createItems: QuickCreateMenuItem[] = [
  {
    id: "task",
    label: "New Task",
    description: "Add a task to your todo list",
    icon: CheckSquare,
    color: "#8b5cf6",
    appSlug: "todo",
    shortcut: "T",
  },
  {
    id: "note",
    label: "New Note",
    description: "Capture a quick thought",
    icon: FileText,
    color: "#eab308",
    appSlug: "notes",
    shortcut: "N",
  },
  {
    id: "journal",
    label: "Journal Entry",
    description: "Write in your journal",
    icon: BookOpen,
    color: "#f97316",
    appSlug: "journal",
    shortcut: "J",
  },
  {
    id: "workout",
    label: "Log Workout",
    description: "Track your exercise",
    icon: Dumbbell,
    color: "#3b82f6",
    appSlug: "fit",
    shortcut: "W",
  },
  {
    id: "timer",
    label: "Start Timer",
    description: "Focus session or pomodoro",
    icon: Timer,
    color: "#10b981",
    appSlug: "habits",
    shortcut: "F",
  },
];

interface QuickCreateMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickCreateMenu({ isOpen, onClose }: QuickCreateMenuProps) {
  const currentAppSlug = getCurrentAppSlug();

  const handleCreate = useCallback((item: QuickCreateMenuItem) => {
    onClose();
    // Navigate to the app with a create action parameter
    navigateToApp(item.appSlug, currentAppSlug || "main");
  }, [onClose, currentAppSlug]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Single key shortcuts
      const item = createItems.find(
        (i) => i.shortcut?.toLowerCase() === e.key.toLowerCase()
      );
      if (item) {
        e.preventDefault();
        handleCreate(item);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleCreate]);

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
          className="w-full max-w-md rounded-2xl border border-outline-subtle/40 bg-surface-elevated shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-subtle/40 px-6 py-4">
            <h2 className="text-lg font-semibold text-ink-900">Quick Create</h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-surface-muted hover:text-ink-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="space-y-1">
              {createItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleCreate(item)}
                    className={clsx(
                      "flex w-full items-center gap-4 rounded-xl p-3 text-left transition-all",
                      "hover:bg-surface-muted"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: item.color }} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-ink-900">{item.label}</div>
                      <div className="text-sm text-ink-500">{item.description}</div>
                    </div>

                    {/* Shortcut */}
                    {item.shortcut && (
                      <kbd className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-muted text-xs font-medium text-ink-500">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-outline-subtle/40 px-6 py-3">
            <p className="text-center text-xs text-ink-500">
              Press{" "}
              <kbd className="inline-flex items-center gap-0.5 rounded bg-surface-muted px-1.5 py-0.5 text-xs">
                <Command className="h-2.5 w-2.5" />N
              </kbd>{" "}
              to open this menu
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
