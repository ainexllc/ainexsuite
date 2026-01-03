'use client';

import { useState, useCallback, useMemo } from 'react';

interface UseHabitSelectionOptions {
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

interface UseHabitSelectionResult {
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
  lastSelectedId: string | null;
}

export function useHabitSelection(options: UseHabitSelectionOptions = {}): UseHabitSelectionResult {
  const { onSelectionChange } = options;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const updateSelection = useCallback((newSelection: Set<string>) => {
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection);
  }, [onSelectionChange]);

  const isSelected = useCallback((id: string) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const toggleSelect = useCallback((id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    updateSelection(newSelection);
    setLastSelectedId(id);

    // Auto-exit select mode when no items selected
    if (newSelection.size === 0) {
      setIsSelectMode(false);
      setLastSelectedId(null);
    } else if (!isSelectMode) {
      setIsSelectMode(true);
    }
  }, [selectedIds, updateSelection, isSelectMode]);

  const select = useCallback((id: string) => {
    const newSelection = new Set(selectedIds);
    newSelection.add(id);
    updateSelection(newSelection);
    setLastSelectedId(id);
    if (!isSelectMode) {
      setIsSelectMode(true);
    }
  }, [selectedIds, updateSelection, isSelectMode]);

  const deselect = useCallback((id: string) => {
    const newSelection = new Set(selectedIds);
    newSelection.delete(id);
    updateSelection(newSelection);
    if (newSelection.size === 0) {
      setIsSelectMode(false);
      setLastSelectedId(null);
    }
  }, [selectedIds, updateSelection]);

  const selectAll = useCallback((ids: string[]) => {
    const newSelection = new Set(ids);
    updateSelection(newSelection);
    if (newSelection.size > 0) {
      setIsSelectMode(true);
      setLastSelectedId(ids[ids.length - 1]);
    }
  }, [updateSelection]);

  const deselectAll = useCallback(() => {
    updateSelection(new Set());
    setIsSelectMode(false);
    setLastSelectedId(null);
  }, [updateSelection]);

  const selectRange = useCallback((ids: string[], fromId: string, toId: string) => {
    const fromIndex = ids.indexOf(fromId);
    const toIndex = ids.indexOf(toId);

    if (fromIndex === -1 || toIndex === -1) return;

    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);

    const rangeIds = ids.slice(start, end + 1);
    const newSelection = new Set(selectedIds);
    rangeIds.forEach(id => newSelection.add(id));
    updateSelection(newSelection);
    setLastSelectedId(toId);

    if (!isSelectMode) {
      setIsSelectMode(true);
    }
  }, [selectedIds, updateSelection, isSelectMode]);

  const enterSelectMode = useCallback(() => {
    setIsSelectMode(true);
  }, []);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    updateSelection(new Set());
    setLastSelectedId(null);
  }, [updateSelection]);

  const selectionCount = useMemo(() => selectedIds.size, [selectedIds]);

  return {
    selectedIds,
    isSelected,
    toggleSelect,
    select,
    deselect,
    selectAll,
    deselectAll,
    selectRange,
    selectionCount,
    isSelectMode,
    enterSelectMode,
    exitSelectMode,
    lastSelectedId,
  };
}
