'use client';

import { createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { useSelection } from '@/hooks/use-selection';

interface SelectionContextValue {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelect: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  selectRange: (ids: string[], fromId: string, toId: string) => void;
  selectionCount: number;
  isSelectMode: boolean;
  enterSelectMode: () => void;
  exitSelectMode: () => void;
  handleSelect: (tableId: string, event: React.MouseEvent, allDocIds: string[]) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

interface SelectionProviderProps {
  children: React.ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const selection = useSelection();

  // Track last selected doc for shift+click range selection
  const lastSelectedRef = useRef('');

  const handleSelect = useCallback((tableId: string, event: React.MouseEvent, allDocIds: string[]) => {
    if (event.shiftKey && lastSelectedRef.current) {
      // Shift+Click: range selection
      selection.selectRange(allDocIds, lastSelectedRef.current, tableId);
    } else {
      // Normal click: toggle selection
      selection.toggleSelect(tableId);
      lastSelectedRef.current = tableId;
    }
  }, [selection]);

  const value = useMemo<SelectionContextValue>(() => ({
    ...selection,
    handleSelect,
  }), [selection, handleSelect]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useTableSelection() {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error('useTableSelection must be used within a SelectionProvider');
  }

  return context;
}
