import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

/**
 * Hook for managing keyboard shortcuts in the workflow canvas
 * Handles: Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo), Delete (delete selected)
 */
export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onDelete,
  disabled = false,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're typing in an input/textarea - if so, don't handle shortcuts
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true';

      if (isTyping) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

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

      // Delete or Backspace - Delete selected nodes/edges
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        onDelete();
        return;
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUndo, onRedo, onDelete, disabled]);
}
