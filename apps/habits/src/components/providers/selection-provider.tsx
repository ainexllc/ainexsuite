'use client';

import { createContext, useContext, useCallback, ReactNode } from 'react';
import { useHabitSelection } from '@/hooks/use-habit-selection';

interface SelectionContextValue {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelect: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  selectionCount: number;
  isSelectMode: boolean;
  enterSelectMode: () => void;
  exitSelectMode: () => void;
  lastSelectedId: string | null;
  handleSelect: (habitId: string, event: React.MouseEvent, allHabitIds: string[]) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

interface SelectionProviderProps {
  children: ReactNode;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export function SelectionProvider({ children, onSelectionChange }: SelectionProviderProps) {
  const selection = useHabitSelection({ onSelectionChange });

  // Handle click with shift-key support for range selection
  const handleSelect = useCallback((habitId: string, event: React.MouseEvent, allHabitIds: string[]) => {
    if (event.shiftKey && selection.lastSelectedId) {
      // Range selection with shift+click
      selection.selectRange(allHabitIds, selection.lastSelectedId, habitId);
    } else {
      // Regular toggle selection
      selection.toggleSelect(habitId);
    }
  }, [selection]);

  return (
    <SelectionContext.Provider value={{ ...selection, handleSelect }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useHabitSelectionContext() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useHabitSelectionContext must be used within a SelectionProvider');
  }
  return context;
}
