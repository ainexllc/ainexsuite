import { useCallback, useRef, useState } from 'react';
import { Node, Edge } from '@xyflow/react';

interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

interface UseUndoRedoOptions {
  maxHistorySize?: number;
  debounceMs?: number;
}

interface UseUndoRedoResult {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  takeSnapshot: () => void;
  clear: () => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
}

/**
 * Hook for managing undo/redo history in React Flow
 * Uses snapshot-based approach with debouncing to prevent excessive history during drag operations
 */
export function useUndoRedo(
  nodes: Node[],
  edges: Edge[],
  setNodesState: React.Dispatch<React.SetStateAction<Node[]>>,
  setEdgesState: React.Dispatch<React.SetStateAction<Edge[]>>,
  options: UseUndoRedoOptions = {}
): UseUndoRedoResult {
  const { maxHistorySize = 50, debounceMs = 500 } = options;

  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUndoRedoRef = useRef(false);

  // Take a snapshot of current state
  const takeSnapshot = useCallback(() => {
    if (isUndoRedoRef.current) {
      // Don't take snapshots during undo/redo operations
      return;
    }

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce snapshot taking
    debounceTimerRef.current = setTimeout(() => {
      const snapshot: HistoryState = {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
      };

      setPast((prev) => {
        const newPast = [...prev, snapshot];
        // Limit history size
        if (newPast.length > maxHistorySize) {
          return newPast.slice(newPast.length - maxHistorySize);
        }
        return newPast;
      });

      // Clear future when new action is taken
      setFuture([]);
    }, debounceMs);
  }, [nodes, edges, maxHistorySize, debounceMs]);

  // Undo operation
  const undo = useCallback(() => {
    if (past.length === 0) return;

    isUndoRedoRef.current = true;

    // Get the most recent past state
    const newPast = [...past];
    const previousState = newPast.pop()!;

    // Save current state to future
    const currentState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    setPast(newPast);
    setFuture((prev) => [...prev, currentState]);

    // Restore previous state
    setNodesState(previousState.nodes);
    setEdgesState(previousState.edges);

    // Reset flag after a short delay to allow state to settle
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 100);
  }, [past, nodes, edges, setNodesState, setEdgesState]);

  // Redo operation
  const redo = useCallback(() => {
    if (future.length === 0) return;

    isUndoRedoRef.current = true;

    // Get the most recent future state
    const newFuture = [...future];
    const nextState = newFuture.pop()!;

    // Save current state to past
    const currentState: HistoryState = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    };

    setFuture(newFuture);
    setPast((prev) => [...prev, currentState]);

    // Restore next state
    setNodesState(nextState.nodes);
    setEdgesState(nextState.edges);

    // Reset flag after a short delay
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 100);
  }, [future, nodes, edges, setNodesState, setEdgesState]);

  // Clear all history
  const clear = useCallback(() => {
    setPast([]);
    setFuture([]);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Wrapper for setNodes that takes a snapshot first
  const setNodes = useCallback(
    (newNodes: Node[]) => {
      takeSnapshot();
      setNodesState(newNodes);
    },
    [takeSnapshot, setNodesState]
  );

  // Wrapper for setEdges that takes a snapshot first
  const setEdges = useCallback(
    (newEdges: Edge[]) => {
      takeSnapshot();
      setEdgesState(newEdges);
    },
    [takeSnapshot, setEdgesState]
  );

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    takeSnapshot,
    clear,
    setNodes,
    setEdges,
  };
}
