'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  StickyNote as StickyNoteIcon, Trash2, Sun, Moon, Undo2, Redo2, CheckSquare, Trash, Network, Download, Upload,
} from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  MiniMap,
  NodeTypes,
  MarkerType,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import './whiteboard.css';
import StickyNoteNode from './StickyNoteNode';
import { useUndoRedo } from './hooks/useUndoRedo';

// Custom styles for edges to ensure visibility
const edgeStyles = {
  stroke: '#06b6d4',
  strokeWidth: 3,
};

/**
 * Validates edges to ensure source and target nodes exist
 * Filters out any orphaned edges that reference non-existent nodes
 */
const validateEdges = (edges: Edge[], nodes: Node[]) => {
  const nodeIds = new Set(nodes.map(n => n.id));
  const orphanedEdges: string[] = [];

  const validEdges = edges.filter(edge => {
    const sourceExists = nodeIds.has(edge.source);
    const targetExists = nodeIds.has(edge.target);

    if (!sourceExists || !targetExists) {
      orphanedEdges.push(
        `${edge.id} (${edge.source} → ${edge.target}): ` +
        `${!sourceExists ? `source node "${edge.source}" missing` : ''} ` +
        `${!targetExists ? `target node "${edge.target}" missing` : ''}`
      );
      console.warn(
        `Removing orphaned edge: ${edge.id} (${edge.source} → ${edge.target})`
      );
      return false;
    }

    return true;
  });

  return { validEdges, orphanedEdges };
};

interface WhiteboardProps {
  // No fixed dimensions; will use container size
}

function WhiteboardInner(_props: WhiteboardProps) {
  const { user } = useAuth();

  // React Flow state
  const [nodes, setNodesState, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdgesState, onEdgesChangeRaw] = useEdgesState<Edge>([]);

  // Wrap onEdgesChange with logging
  const onEdgesChange = useCallback(
    (changes: any) => {
      console.log('onEdgesChange called with changes:', changes);
      onEdgesChangeRaw(changes);
    },
    [onEdgesChangeRaw]
  );

  // Undo/Redo hook
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    takeSnapshot,
    setNodes,
    setEdges,
  } = useUndoRedo(nodes, edges, setNodesState, setEdgesState);

  // UI state
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stickyNoteColor, setStickyNoteColor] = useState('#fef08a');
  const [stickyNoteSize, setStickyNoteSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [edgeType, setEdgeType] = useState<'smoothstep' | 'straight' | 'default' | 'step'>('smoothstep');

  // Define node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      stickyNote: StickyNoteNode,
    }),
    []
  );

  // Count selected items
  const selectedCount = useMemo(() => {
    const selectedNodes = nodes.filter((n) => n.selected).length;
    const selectedEdges = edges.filter((e) => e.selected).length;
    return selectedNodes + selectedEdges;
  }, [nodes, edges]);

  // Stable default edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: edgeType,
      animated: true,
      style: edgeStyles,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#06b6d4',
      },
    }),
    [edgeType]
  );

  // Load whiteboard data from Firestore
  useEffect(() => {
    if (!user || isLoaded) return;

    const loadWhiteboard = async () => {
      try {
        const whiteboardRef = doc(db, 'whiteboards', user.uid);
        const whiteboardSnap = await getDoc(whiteboardRef);

        if (whiteboardSnap.exists()) {
          const data = whiteboardSnap.data();

          // Load nodes (sticky notes) and add callbacks
          if (data.nodes) {
            const nodesWithCallbacks = data.nodes.map((node: Node) => ({
              ...node,
              data: {
                ...node.data,
                onDelete: () => deleteNode(node.id),
                onTextChange: (text: string) => updateNodeText(node.id, text),
              },
            }));
            setNodes(nodesWithCallbacks);

            // Load edges (connections) with validation
            if (data.edges) {
              // Validate edges before loading - filter out orphaned edges
              const { validEdges, orphanedEdges } = validateEdges(data.edges, nodesWithCallbacks);

              if (orphanedEdges.length > 0) {
                console.warn(`Found ${orphanedEdges.length} orphaned edge(s):`, orphanedEdges);

                // Clean up orphaned edges from Firestore
                try {
                  void setDoc(whiteboardRef, {
                    nodes: data.nodes,
                    edges: validEdges,
                    isDarkMode: data.isDarkMode,
                    updatedAt: new Date().toISOString(),
                  });
                  console.log(`Cleaned up ${orphanedEdges.length} orphaned edge(s) from Firestore`);
                } catch (updateError) {
                  console.error('Error cleaning up orphaned edges in Firestore:', updateError);
                }
              }

              setEdges(validEdges);
            }
          } else {
            // No nodes loaded, clear edges too
            setEdges([]);
          }

          // Load dark mode preference
          if (typeof data.isDarkMode === 'boolean') {
            setIsDarkMode(data.isDarkMode);
          }
        }
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading whiteboard:', error);
        setIsLoaded(true);
      }
    };

    void loadWhiteboard();
  }, [user, setNodes, setEdges]);

  // Save whiteboard to Firestore
  const saveWhiteboard = useCallback(async () => {
    if (!user || !isLoaded) return;

    try {
      const whiteboardRef = doc(db, 'whiteboards', user.uid);

      // Strip out functions and undefined values from node data before saving
      const nodesToSave = nodes.map((node) => {
        const data: Record<string, unknown> = {
          text: node.data.text || '',
          color: node.data.color || '#fef08a',
          size: node.data.size || 'medium',
        };

        // Only include defined values
        if (node.data.isDarkMode !== undefined) {
          data.isDarkMode = node.data.isDarkMode;
        }
        if (node.data.locked !== undefined) {
          data.locked = node.data.locked;
        }

        return {
          id: node.id,
          type: node.type,
          position: node.position,
          data,
        };
      });

      // Validate edges before saving to prevent orphaned edges from being saved
      const { validEdges } = validateEdges(edges, nodes);

      await setDoc(whiteboardRef, {
        nodes: nodesToSave,
        edges: validEdges,
        isDarkMode,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving whiteboard:', error);
    }
  }, [user, nodes, edges, isDarkMode, isLoaded]);

  // Auto-save when nodes, edges, or dark mode changes
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      void saveWhiteboard();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, isDarkMode, saveWhiteboard, isLoaded]);

  // React Flow connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('=== WHITEBOARD CONNECTION ATTEMPT ===');
      console.log('Connection params:', params);

      // Validate that both source and target nodes exist
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) {
        console.error('⚠️ CONNECTION BLOCKED - Invalid node reference');
        console.log('Source node exists:', !!sourceNode);
        console.log('Target node exists:', !!targetNode);
        return;
      }

      setEdgesState((eds) => {
        console.log('Current edges in state:', eds);
        console.log('Number of edges:', eds.length);

        // Check for duplicate edges (same source and target)
        const isDuplicate = eds.some(
          (edge) =>
            edge.source === params.source &&
            edge.target === params.target &&
            edge.sourceHandle === params.sourceHandle &&
            edge.targetHandle === params.targetHandle
        );

        if (isDuplicate) {
          console.warn('⚠️ DUPLICATE EDGE BLOCKED - Edge already exists between these notes');
          console.log('Existing edge:', eds.find(e =>
            e.source === params.source &&
            e.target === params.target &&
            e.sourceHandle === params.sourceHandle &&
            e.targetHandle === params.targetHandle
          ));
          return eds;
        }

        const newEdges = addEdge(params, eds);
        console.log('✅ NEW EDGE CREATED');
        console.log('Updated edges array:', newEdges);
        console.log('New edge count:', newEdges.length);
        takeSnapshot();
        return newEdges;
      });
    },
    [nodes, setEdgesState, takeSnapshot]
  );

  // Delete node handler
  const deleteNode = useCallback(
    (nodeId: string) => {
      takeSnapshot();
      setNodesState((nds) => nds.filter((n) => n.id !== nodeId));
      setEdgesState((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setNodesState, setEdgesState, takeSnapshot]
  );

  // Delete edge on click
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      takeSnapshot();
      setEdgesState((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdgesState, takeSnapshot]
  );

  // Update node text handler
  const updateNodeText = useCallback(
    (nodeId: string, text: string) => {
      setNodesState((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, text } } : n
        )
      );
    },
    [setNodesState]
  );

  // Add sticky note
  const addStickyNote = useCallback(() => {
    takeSnapshot();
    const nodeId = `note-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type: 'stickyNote',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      data: {
        text: '',
        color: stickyNoteColor,
        size: stickyNoteSize,
        isDarkMode,
        onDelete: () => deleteNode(nodeId),
        onTextChange: (text: string) => updateNodeText(nodeId, text),
      },
    };

    setNodesState((nds) => [...nds, newNode]);
  }, [stickyNoteColor, stickyNoteSize, isDarkMode, setNodesState, deleteNode, updateNodeText, takeSnapshot]);

  // Update all node handlers when they change - ONLY when isDarkMode changes
  useEffect(() => {
    setNodesState((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isDarkMode,
        },
      }))
    );
  }, [isDarkMode, setNodesState]);

  // Clear all nodes and edges
  const clearWhiteboard = useCallback(() => {
    takeSnapshot();
    setNodesState([]);
    setEdgesState([]);
  }, [setNodesState, setEdgesState, takeSnapshot]);

  // Delete selected nodes/edges
  const deleteSelected = useCallback(() => {
    if (selectedCount === 0) return;

    takeSnapshot();
    const selectedNodeIds = nodes.filter((n) => n.selected).map((n) => n.id);
    setNodesState((nds) => nds.filter((n) => !n.selected));
    setEdgesState((eds) =>
      eds.filter((e) => !e.selected && !selectedNodeIds.includes(e.source) && !selectedNodeIds.includes(e.target))
    );
  }, [selectedCount, nodes, setNodesState, setEdgesState, takeSnapshot]);

  // Select all nodes and edges
  const selectAll = useCallback(() => {
    setNodesState((nds) => nds.map((n) => ({ ...n, selected: true })));
    setEdgesState((eds) => eds.map((e) => ({ ...e, selected: true })));
  }, [setNodesState, setEdgesState]);

  // Change color of selected sticky notes
  const changeSelectedColor = useCallback(
    (color: string) => {
      const selectedNodeCount = nodes.filter((n) => n.selected).length;
      if (selectedNodeCount === 0) return;

      takeSnapshot();
      setNodesState((nds) =>
        nds.map((n) =>
          n.selected && n.type === 'stickyNote'
            ? { ...n, data: { ...n.data, color } }
            : n
        )
      );
    },
    [nodes, setNodesState, takeSnapshot]
  );

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // Export whiteboard to JSON
  const exportToJSON = useCallback(() => {
    const exportData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          text: n.data.text || '',
          color: n.data.color || '#fef08a',
          size: n.data.size || 'medium',
        },
      })),
      edges: edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      })),
      meta: {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  // Import whiteboard from JSON
  const importFromJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        if (!importData.nodes || !importData.edges) {
          alert('Invalid whiteboard file format');
          return;
        }

        takeSnapshot();

        // Restore nodes with callbacks
        const restoredNodes = importData.nodes.map((node: Node) => ({
          ...node,
          data: {
            ...node.data,
            isDarkMode,
            onDelete: () => deleteNode(node.id),
            onTextChange: (text: string) => updateNodeText(node.id, text),
          },
        }));

        setNodesState(restoredNodes);
        setEdgesState(importData.edges);
      } catch (error) {
        console.error('Error importing whiteboard:', error);
        alert('Failed to import whiteboard. Please check the file format.');
      }
    };
    input.click();
  }, [isDarkMode, deleteNode, updateNodeText, setNodesState, setEdgesState, takeSnapshot]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') ||
        (event.ctrlKey && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className={`w-full h-full relative rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Debug Panel */}
      <div className={`absolute top-4 right-4 z-50 rounded-lg p-3 text-xs font-mono max-w-sm ${
        isDarkMode ? 'bg-gray-900/95 border border-cyan-500/30 text-white' : 'bg-white/95 border border-blue-500/30 text-gray-900'
      }`}>
        <div className={`font-bold mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`}>Debug Info</div>
        <div>Nodes: {nodes.length}</div>
        <div>Edges: {edges.length}</div>
        {edges.length > 0 && (
          <>
            <div className="mt-2 space-y-1">
              <div className={`font-semibold ${isDarkMode ? 'text-cyan-300' : 'text-blue-500'}`}>Edges:</div>
              {edges.map((edge, idx) => (
                <div key={edge.id} className={`text-[10px] p-1 rounded ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                  {idx + 1}. {edge.source} → {edge.target}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                console.log('Clearing all edges');
                setEdgesState([]);
              }}
              className={`mt-2 w-full px-2 py-1 rounded text-xs ${
                isDarkMode ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400' : 'bg-red-100 hover:bg-red-200 border border-red-300 text-red-700'
              }`}
            >
              Clear All Edges
            </button>
          </>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        elevateEdgesOnSelect
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={edgeStyles}
        defaultEdgeOptions={defaultEdgeOptions}
        connectOnClick={true}
        edgesReconnectable={true}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDarkMode ? '#ffffff20' : '#00000020'}
        />
        <Controls className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''} />
        <MiniMap
          className={isDarkMode ? 'bg-gray-700' : ''}
          nodeColor={isDarkMode ? '#60a5fa' : '#3b82f6'}
        />

        {/* Toolbar Panel */}
        <Panel position="top-left" className={`flex flex-col gap-2 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800/85 to-gray-900/85 border-white/10'
            : 'bg-gradient-to-br from-white/85 to-gray-50/85 border-gray-200'
        }`}>
          {/* Sticky Notes Section */}
          <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Sticky Notes
            </span>

            <button
              onClick={addStickyNote}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm shadow-lg transition-all ${
                isDarkMode
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white'
                  : 'bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-gray-900'
              }`}
              title="Add sticky note"
            >
              <StickyNoteIcon className="w-4 h-4" />
              <span>Add Note</span>
            </button>

            {/* Sticky Note Color Picker */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={stickyNoteColor}
                onChange={(e) => setStickyNoteColor(e.target.value)}
                className={`w-8 h-8 rounded cursor-pointer border-2 ${
                  isDarkMode ? 'border-white/20' : 'border-gray-300'
                }`}
                title="Note color"
              />
              <div className="flex gap-1">
                {['#fef08a', '#a7f3d0', '#bfdbfe', '#fbbf24', '#fca5a5'].map((presetColor) => (
                  <button
                    key={presetColor}
                    onClick={() => setStickyNoteColor(presetColor)}
                    className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                      stickyNoteColor === presetColor ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    } ${isDarkMode ? 'border-white/20' : 'border-gray-300'}`}
                    style={{ backgroundColor: presetColor }}
                    title="Select color"
                  />
                ))}
              </div>
            </div>

            {/* Sticky Note Size Selector */}
            <div className="flex gap-1">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setStickyNoteSize(size)}
                  className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all capitalize ${
                    stickyNoteSize === size
                      ? 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

          {/* Undo/Redo Section */}
          <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              History
            </span>
            <div className="flex gap-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm shadow-lg transition-all ${
                  canUndo
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white'
                    : isDarkMode
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm shadow-lg transition-all ${
                  canRedo
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white'
                    : isDarkMode
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

          {/* Selection Section */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Selection
              </span>
              {selectedCount > 0 && (
                <span className={`text-xs font-medium ${isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  {selectedCount} selected
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={selectAll}
                disabled={nodes.length === 0 && edges.length === 0}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl font-medium text-xs shadow-lg transition-all ${
                  nodes.length === 0 && edges.length === 0
                    ? isDarkMode
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white'
                }`}
                title="Select all (Ctrl+A)"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>All</span>
              </button>
              <button
                onClick={deleteSelected}
                disabled={selectedCount === 0}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl font-medium text-xs shadow-lg transition-all ${
                  selectedCount === 0
                    ? isDarkMode
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                    : 'bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white'
                }`}
                title="Delete selected (Delete)"
              >
                <Trash className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            {/* Bulk Color Change - only show when nodes are selected */}
            {selectedCount > 0 && nodes.some((n) => n.selected) && (
              <div className="flex items-center gap-2 pt-1">
                <span className={`text-xs ${isDarkMode ? 'text-white/70' : 'text-gray-600'}`}>
                  Color:
                </span>
                <div className="flex gap-1 flex-1">
                  {['#fef08a', '#a7f3d0', '#bfdbfe', '#fbbf24', '#fca5a5', '#e9d5ff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => changeSelectedColor(color)}
                      className={`w-6 h-6 rounded-lg border-2 transition-all hover:scale-110 ${
                        isDarkMode ? 'border-white/20' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Change to ${color}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

          {/* Edge Type Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Network className="w-3.5 h-3.5" style={{ color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#6b7280' }} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
                Edge Style
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(['smoothstep', 'straight', 'default', 'step'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setEdgeType(type)}
                  className={`px-2 py-1.5 text-xs rounded-lg transition-all capitalize ${
                    edgeType === type
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium'
                      : isDarkMode
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={`${type.charAt(0).toUpperCase() + type.slice(1)} edges`}
                >
                  {type === 'default' ? 'Bezier' : type}
                </button>
              ))}
            </div>
          </div>

          <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

          {/* Export/Import Section */}
          <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Data
            </span>
            <div className="flex gap-1">
              <button
                onClick={exportToJSON}
                disabled={nodes.length === 0 && edges.length === 0}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl font-medium text-xs shadow-lg transition-all ${
                  nodes.length === 0 && edges.length === 0
                    ? isDarkMode
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-green-400 to-emerald-400 hover:from-green-500 hover:to-emerald-500 text-white'
                }`}
                title="Export whiteboard to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
              <button
                onClick={importFromJSON}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl font-medium text-xs shadow-lg transition-all ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-500 hover:to-purple-500 text-white'
                }`}
                title="Import whiteboard from JSON"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import</span>
              </button>
            </div>
          </div>

          <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={clearWhiteboard}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm shadow-lg transition-all ${
                isDarkMode
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                  : 'bg-gradient-to-r from-red-400 to-rose-400 hover:from-red-500 hover:to-rose-500 text-white'
              }`}
              title="Clear whiteboard"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white/90'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function Whiteboard(props: WhiteboardProps) {
  return (
    <ReactFlowProvider>
      <WhiteboardInner {...props} />
    </ReactFlowProvider>
  );
}
