import { useEffect, useCallback } from 'react';

interface NudgeDirection {
  x: number;
  y: number;
}

interface UseKeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onDuplicate?: () => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onNudge?: (direction: NudgeDirection) => void;
  onToggleLock?: () => void;
  disabled?: boolean;
}

/**
 * Hook for managing keyboard shortcuts in the workflow canvas
 *
 * Shortcuts:
 * - Ctrl/Cmd + Z: Undo
 * - Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z: Redo
 * - Delete/Backspace: Delete selected
 * - Ctrl/Cmd + C: Copy
 * - Ctrl/Cmd + V: Paste
 * - Ctrl/Cmd + X: Cut
 * - Ctrl/Cmd + D: Duplicate
 * - Ctrl/Cmd + A: Select all
 * - Ctrl/Cmd + L: Toggle lock/unlock
 * - Escape: Deselect all
 * - Arrow keys: Nudge selected (1px, 10px with Shift)
 */
export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  onCopy,
  onPaste,
  onCut,
  onDuplicate,
  onSelectAll,
  onDeselectAll,
  onNudge,
  onToggleLock,
  disabled = false,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Check if we're typing in an input/textarea - if so, don't handle shortcuts
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      if (isTyping) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;
      const nudgeAmount = event.shiftKey ? 10 : 1;

      // Ctrl/Cmd + Z - Undo
      if (modifier && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        onUndo();
        return;
      }

      // Ctrl/Cmd + Shift + Z - Redo (alternative)
      if (modifier && event.key === 'z' && event.shiftKey) {
        event.preventDefault();
        onRedo();
        return;
      }

      // Ctrl/Cmd + Y - Redo
      if (modifier && event.key === 'y') {
        event.preventDefault();
        onRedo();
        return;
      }

      // Ctrl/Cmd + C - Copy
      if (modifier && event.key === 'c') {
        event.preventDefault();
        onCopy?.();
        return;
      }

      // Ctrl/Cmd + V - Paste
      if (modifier && event.key === 'v') {
        event.preventDefault();
        onPaste?.();
        return;
      }

      // Ctrl/Cmd + X - Cut
      if (modifier && event.key === 'x') {
        event.preventDefault();
        onCut?.();
        return;
      }

      // Ctrl/Cmd + D - Duplicate
      if (modifier && event.key === 'd') {
        event.preventDefault();
        onDuplicate?.();
        return;
      }

      // Ctrl/Cmd + A - Select all
      if (modifier && event.key === 'a') {
        event.preventDefault();
        onSelectAll?.();
        return;
      }

      // Ctrl/Cmd + L - Toggle lock/unlock
      if (modifier && event.key === 'l') {
        event.preventDefault();
        onToggleLock?.();
        return;
      }

      // Escape - Deselect all
      if (event.key === 'Escape') {
        event.preventDefault();
        onDeselectAll?.();
        return;
      }

      // Delete or Backspace - Delete selected nodes/edges
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        onDelete();
        return;
      }

      // Arrow keys - Nudge selected nodes
      if (onNudge) {
        switch (event.key) {
          case 'ArrowUp':
            event.preventDefault();
            onNudge({ x: 0, y: -nudgeAmount });
            return;
          case 'ArrowDown':
            event.preventDefault();
            onNudge({ x: 0, y: nudgeAmount });
            return;
          case 'ArrowLeft':
            event.preventDefault();
            onNudge({ x: -nudgeAmount, y: 0 });
            return;
          case 'ArrowRight':
            event.preventDefault();
            onNudge({ x: nudgeAmount, y: 0 });
            return;
        }
      }
    },
    [
      onUndo,
      onRedo,
      onDelete,
      onCopy,
      onPaste,
      onCut,
      onDuplicate,
      onSelectAll,
      onDeselectAll,
      onNudge,
      onToggleLock,
    ]
  );

  useEffect(() => {
    if (disabled) return;

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);
}
