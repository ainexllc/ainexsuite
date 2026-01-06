"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SelectionContextValue {
  selectedIds: Set<string>;
  selectionCount: number;
  isSelectMode: boolean;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  deselectAll: () => void;
  setSelectMode: (mode: boolean) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    // Auto-enable select mode when selecting
    setIsSelectMode(true);
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
    if (ids.length > 0) {
      setIsSelectMode(true);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsSelectMode(false);
  }, []);

  const setSelectMode = useCallback((mode: boolean) => {
    setIsSelectMode(mode);
    if (!mode) {
      setSelectedIds(new Set());
    }
  }, []);

  const selectionCount = selectedIds.size;

  const value = useMemo<SelectionContextValue>(
    () => ({
      selectedIds,
      selectionCount,
      isSelectMode,
      isSelected,
      toggleSelection,
      selectAll,
      clearSelection,
      deselectAll: clearSelection,
      setSelectMode,
    }),
    [selectedIds, selectionCount, isSelectMode, isSelected, toggleSelection, selectAll, clearSelection, setSelectMode]
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider");
  }

  return context;
}
