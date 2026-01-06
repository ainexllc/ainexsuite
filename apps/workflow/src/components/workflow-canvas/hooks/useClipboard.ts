import { useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

const CLIPBOARD_KEY = 'workflow-clipboard';

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
  timestamp: number;
}

interface UseClipboardOptions {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  takeSnapshot: () => void;
  getId: () => string;
}

export function useClipboard({
  nodes,
  edges,
  setNodes,
  setEdges,
  takeSnapshot,
  getId,
}: UseClipboardOptions) {
  const pasteOffsetRef = useRef(0);

  /**
   * Get selected nodes and their connected edges
   */
  const getSelectedContent = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));

    // Get edges that connect selected nodes (both ends must be selected)
    const connectedEdges = edges.filter(
      (e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target)
    );

    return { nodes: selectedNodes, edges: connectedEdges };
  }, [nodes, edges]);

  /**
   * Copy selected nodes and edges to clipboard
   */
  const copy = useCallback(() => {
    const { nodes: selectedNodes, edges: selectedEdges } = getSelectedContent();

    if (selectedNodes.length === 0) {
      return false;
    }

    const clipboardData: ClipboardData = {
      nodes: selectedNodes.map((n) => ({
        ...n,
        selected: false, // Don't paste as selected
      })),
      edges: selectedEdges.map((e) => ({
        ...e,
        selected: false,
      })),
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clipboardData));
      pasteOffsetRef.current = 0; // Reset paste offset on new copy
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, [getSelectedContent]);

  /**
   * Cut selected nodes and edges (copy + delete)
   */
  const cut = useCallback(() => {
    const { nodes: selectedNodes } = getSelectedContent();

    if (selectedNodes.length === 0) {
      return false;
    }

    // First copy
    const copied = copy();
    if (!copied) return false;

    // Then delete
    takeSnapshot();
    const selectedNodeIds = new Set(selectedNodes.map((n) => n.id));

    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) =>
      eds.filter(
        (e) =>
          !e.selected &&
          !selectedNodeIds.has(e.source) &&
          !selectedNodeIds.has(e.target)
      )
    );

    return true;
  }, [getSelectedContent, copy, takeSnapshot, setNodes, setEdges]);

  /**
   * Paste nodes and edges from clipboard
   */
  const paste = useCallback(() => {
    try {
      const clipboardStr = localStorage.getItem(CLIPBOARD_KEY);
      if (!clipboardStr) return false;

      const clipboardData: ClipboardData = JSON.parse(clipboardStr);
      if (!clipboardData.nodes || clipboardData.nodes.length === 0) {
        return false;
      }

      takeSnapshot();

      // Increment paste offset for staggered pasting
      pasteOffsetRef.current += 20;
      const offset = pasteOffsetRef.current;

      // Create ID mapping for new nodes
      const idMapping = new Map<string, string>();
      clipboardData.nodes.forEach((node) => {
        idMapping.set(node.id, getId());
      });

      // Create new nodes with offset positions and new IDs
      const newNodes: Node[] = clipboardData.nodes.map((node) => ({
        ...node,
        id: idMapping.get(node.id) || getId(),
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset,
        },
        selected: true, // Select pasted nodes
      }));

      // Create new edges with updated source/target IDs
      const newEdges: Edge[] = clipboardData.edges.map((edge) => ({
        ...edge,
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source: idMapping.get(edge.source) || edge.source,
        target: idMapping.get(edge.target) || edge.target,
        selected: false,
      }));

      // Deselect existing nodes and add new ones
      setNodes((nds) => [
        ...nds.map((n) => ({ ...n, selected: false })),
        ...newNodes,
      ]);

      setEdges((eds) => [
        ...eds.map((e) => ({ ...e, selected: false })),
        ...newEdges,
      ]);

      return true;
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
      return false;
    }
  }, [takeSnapshot, getId, setNodes, setEdges]);

  /**
   * Duplicate selected nodes in place (with slight offset)
   */
  const duplicate = useCallback(() => {
    const { nodes: selectedNodes, edges: selectedEdges } = getSelectedContent();

    if (selectedNodes.length === 0) {
      return false;
    }

    takeSnapshot();

    // Create ID mapping for new nodes
    const idMapping = new Map<string, string>();
    selectedNodes.forEach((node) => {
      idMapping.set(node.id, getId());
    });

    // Create new nodes with offset
    const newNodes: Node[] = selectedNodes.map((node) => ({
      ...node,
      id: idMapping.get(node.id) || getId(),
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
      selected: true,
    }));

    // Create new edges with updated IDs
    const newEdges: Edge[] = selectedEdges.map((edge) => ({
      ...edge,
      id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      source: idMapping.get(edge.source) || edge.source,
      target: idMapping.get(edge.target) || edge.target,
      selected: false,
    }));

    // Deselect original nodes and add duplicates
    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ]);

    setEdges((eds) => [...eds, ...newEdges]);

    return true;
  }, [getSelectedContent, takeSnapshot, getId, setNodes, setEdges]);

  /**
   * Select all nodes
   */
  const selectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: true })));
  }, [setNodes, setEdges]);

  /**
   * Deselect all nodes and edges
   */
  const deselectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
  }, [setNodes, setEdges]);

  /**
   * Check if clipboard has content
   */
  const hasClipboardContent = useCallback(() => {
    try {
      const clipboardStr = localStorage.getItem(CLIPBOARD_KEY);
      if (!clipboardStr) return false;
      const clipboardData: ClipboardData = JSON.parse(clipboardStr);
      return clipboardData.nodes && clipboardData.nodes.length > 0;
    } catch {
      return false;
    }
  }, []);

  /**
   * Check if there are selected nodes
   */
  const hasSelection = useCallback(() => {
    return nodes.some((n) => n.selected);
  }, [nodes]);

  return {
    copy,
    cut,
    paste,
    duplicate,
    selectAll,
    deselectAll,
    hasClipboardContent,
    hasSelection,
  };
}
