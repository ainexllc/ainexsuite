"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

// ============ Types ============

interface SelectionContextValue {
  /** Set of currently selected project IDs */
  selectedIds: Set<string>;
  /** Whether selection mode is active */
  selectionMode: boolean;
  /** Number of selected items */
  selectionCount: number;
  /** Check if a project is selected */
  isSelected: (id: string) => boolean;
  /** Add a project to selection */
  select: (id: string) => void;
  /** Remove a project from selection */
  deselect: (id: string) => void;
  /** Toggle project selection */
  toggle: (id: string) => void;
  /** Select multiple projects at once */
  selectAll: (ids: string[]) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Select a range of projects (for shift+click) */
  selectRange: (ids: string[], fromId: string, toId: string) => void;
  /** Enter selection mode without selecting anything */
  enterSelectionMode: () => void;
  /** Exit selection mode and clear selections */
  exitSelectionMode: () => void;
  /** Handle selection with keyboard modifiers (shift+click for range) */
  handleSelect: (projectId: string, event: React.MouseEvent, allProjectIds: string[]) => void;
}

interface SelectionProviderProps {
  children: React.ReactNode;
}

// ============ Context ============

const SelectionContext = createContext<SelectionContextValue | null>(null);

// ============ Provider ============

export function SelectionProvider({ children }: SelectionProviderProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Track last selected project for shift+click range selection
  const lastSelectedRef = useRef<string>("");

  // ============ Selection Operations ============

  const isSelected = useCallback(
    (id: string): boolean => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setSelectionMode(true);
  }, []);

  const deselect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);

      // Auto-exit selection mode when nothing is selected
      if (next.size === 0) {
        setSelectionMode(false);
      }

      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      // Auto-manage selection mode
      if (next.size === 0) {
        setSelectionMode(false);
      } else {
        setSelectionMode(true);
      }

      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setSelectedIds(new Set(ids));
    setSelectionMode(true);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectionMode(false);
    lastSelectedRef.current = "";
  }, []);

  const selectRange = useCallback(
    (ids: string[], fromId: string, toId: string) => {
      const fromIndex = ids.indexOf(fromId);
      const toIndex = ids.indexOf(toId);

      if (fromIndex === -1 || toIndex === -1) {
        return;
      }

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeIds = ids.slice(start, end + 1);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        rangeIds.forEach((id) => next.add(id));
        return next;
      });

      setSelectionMode(true);
    },
    []
  );

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
    lastSelectedRef.current = "";
  }, []);

  const handleSelect = useCallback(
    (projectId: string, event: React.MouseEvent, allProjectIds: string[]) => {
      if (event.shiftKey && lastSelectedRef.current) {
        // Shift+Click: range selection
        selectRange(allProjectIds, lastSelectedRef.current, projectId);
      } else {
        // Normal click: toggle selection
        toggle(projectId);
        lastSelectedRef.current = projectId;
      }
    },
    [selectRange, toggle]
  );

  // ============ Computed Values ============

  const selectionCount = useMemo(() => selectedIds.size, [selectedIds]);

  // ============ Context Value ============

  const value = useMemo<SelectionContextValue>(
    () => ({
      selectedIds,
      selectionMode,
      selectionCount,
      isSelected,
      select,
      deselect,
      toggle,
      selectAll,
      clearSelection,
      selectRange,
      enterSelectionMode,
      exitSelectionMode,
      handleSelect,
    }),
    [
      selectedIds,
      selectionMode,
      selectionCount,
      isSelected,
      select,
      deselect,
      toggle,
      selectAll,
      clearSelection,
      selectRange,
      enterSelectionMode,
      exitSelectionMode,
      handleSelect,
    ]
  );

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

// ============ Hook ============

/**
 * Hook to access selection context for projects.
 * Must be used within a SelectionProvider.
 *
 * @example
 * const { selectedIds, toggle, clearSelection, selectionMode } = useSelection();
 *
 * // Check if a project is selected
 * const isProjectSelected = isSelected(projectId);
 *
 * // Toggle selection on click
 * <ProjectCard onClick={() => toggle(project.id)} />
 *
 * // Select all visible projects
 * selectAll(projects.map(p => p.id));
 *
 * // Clear all selections
 * clearSelection();
 */
export function useSelection(): SelectionContextValue {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelection must be used within a SelectionProvider.");
  }

  return context;
}
