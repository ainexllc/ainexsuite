"use client";

import { useEffect, useCallback, useState } from "react";
import { navigateToApp, getCurrentAppSlug } from "@ainexsuite/ui";

export interface KeyboardShortcut {
  key: string;
  modifiers?: ("meta" | "ctrl" | "shift" | "alt")[];
  description: string;
  category: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  onOpenSearch?: () => void;
  onOpenShortcutsHelp?: () => void;
  onOpenQuickCreate?: () => void;
  onOpenAiAssistant?: () => void;
  onOpenSettings?: () => void;
}

// App shortcuts for Cmd+1-9
const appShortcuts = [
  { key: "1", slug: "notes" },
  { key: "2", slug: "journal" },
  { key: "3", slug: "todo" },
  { key: "4", slug: "fit" },
  { key: "5", slug: "habits" },
  { key: "6", slug: "health" },
  { key: "7", slug: "album" },
  { key: "8", slug: "projects" },
  { key: "9", slug: "workflow" },
];

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions) {
  const {
    onOpenSearch,
    onOpenShortcutsHelp,
    onOpenQuickCreate,
    onOpenAiAssistant,
    onOpenSettings,
  } = options;

  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Get all available shortcuts for display
  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: "K",
      modifiers: ["meta"],
      description: "Open search",
      category: "Navigation",
      action: () => onOpenSearch?.(),
    },
    {
      key: "/",
      modifiers: ["meta"],
      description: "Show keyboard shortcuts",
      category: "Navigation",
      action: () => setIsShortcutsModalOpen(true),
    },
    {
      key: "N",
      modifiers: ["meta"],
      description: "Quick create",
      category: "Navigation",
      action: () => setIsQuickCreateOpen(true),
    },
    // Apps
    ...appShortcuts.map((app) => ({
      key: app.key,
      modifiers: ["meta"] as ("meta")[],
      description: `Go to ${app.slug.charAt(0).toUpperCase() + app.slug.slice(1)}`,
      category: "Apps",
      action: () => navigateToApp(app.slug, getCurrentAppSlug() || "main"),
    })),
    // Panels
    {
      key: "A",
      modifiers: ["meta", "shift"],
      description: "Open AI assistant",
      category: "Panels",
      action: () => onOpenAiAssistant?.(),
    },
    {
      key: ",",
      modifiers: ["meta"],
      description: "Open settings",
      category: "Panels",
      action: () => onOpenSettings?.(),
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;
      const key = event.key.toLowerCase();

      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable)
      ) {
        return;
      }

      // Cmd+K - Search (already handled in layout, but we can override)
      if (isMeta && key === "k") {
        event.preventDefault();
        onOpenSearch?.();
        return;
      }

      // Cmd+/ - Show shortcuts help
      if (isMeta && key === "/") {
        event.preventDefault();
        onOpenShortcutsHelp?.() ?? setIsShortcutsModalOpen(true);
        return;
      }

      // Cmd+N - Quick create
      if (isMeta && key === "n" && !isShift) {
        event.preventDefault();
        onOpenQuickCreate?.() ?? setIsQuickCreateOpen(true);
        return;
      }

      // Cmd+Shift+A - AI assistant
      if (isMeta && isShift && key === "a") {
        event.preventDefault();
        onOpenAiAssistant?.();
        return;
      }

      // Cmd+, - Settings
      if (isMeta && key === ",") {
        event.preventDefault();
        onOpenSettings?.();
        return;
      }

      // Cmd+1-9 - Jump to apps
      if (isMeta && !isShift) {
        const appShortcut = appShortcuts.find((s) => s.key === key);
        if (appShortcut) {
          event.preventDefault();
          navigateToApp(appShortcut.slug, getCurrentAppSlug() || "main");
          return;
        }
      }
    },
    [onOpenSearch, onOpenShortcutsHelp, onOpenQuickCreate, onOpenAiAssistant, onOpenSettings]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    isQuickCreateOpen,
    setIsQuickCreateOpen,
  };
}
