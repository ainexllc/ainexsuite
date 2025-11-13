'use client';

import { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  BackgroundVariant,
  ReactFlowProvider,
  type ReactFlowInstance,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import './workflow-canvas.css';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';

import RectangleNode from './nodes/RectangleNode';
import DiamondNode from './nodes/DiamondNode';
import OvalNode from './nodes/OvalNode';
import ParallelogramNode from './nodes/ParallelogramNode';
import { ShapePalette } from './ShapePalette';
import { Toolbar } from './Toolbar';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from '@/contexts/ThemeContext';

// Define nodeTypes outside component to prevent re-creation
const nodeTypes = {
  rectangle: RectangleNode,
  diamond: DiamondNode,
  oval: OvalNode,
  parallelogram: ParallelogramNode,
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

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);
  const getId = () => `node_${nodeIdCounter.current++}`;
  const [nodes, setNodesState, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  const prevThemeIdRef = useRef(theme.id);

  // Undo/Redo hook
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    takeSnapshot,
  } = useUndoRedo(nodes, edges, setNodesState, setEdgesState);

  // Get selected nodes/edges count
  const selectedCount = useMemo(() => {
    const selectedNodes = nodes.filter((n) => n.selected).length;
    const selectedEdges = edges.filter((e) => e.selected).length;
    return selectedNodes + selectedEdges;
  }, [nodes, edges]);

  // Debug effect to log edge and node state
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('🔍 Edge/Node State Update:');
    // eslint-disable-next-line no-console
    console.log('Nodes:', nodes.map(n => ({ id: n.id, type: n.type, position: n.position })));
    // eslint-disable-next-line no-console
    console.log('Edges:', edges.map(e => ({ id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle, targetHandle: e.targetHandle })));

    // Check if edges reference valid nodes
    let orphanedCount = 0;
    const nodeIds = new Set(nodes.map(n => n.id));

    edges.forEach(edge => {
      const sourceExists = nodeIds.has(edge.source);
      const targetExists = nodeIds.has(edge.target);

      if (!sourceExists || !targetExists) {
        orphanedCount++;
        // eslint-disable-next-line no-console
        console.error(
          `❌ Edge ${edge.id} references non-existent node(s): ` +
          `${!sourceExists ? `source "${edge.source}"` : ''} ` +
          `${!targetExists ? `target "${edge.target}"` : ''}`
        );
      } else {
        // eslint-disable-next-line no-console
        console.log(`✅ Edge ${edge.id} has valid nodes: ${edge.source} → ${edge.target}`);
      }
    });

    if (orphanedCount > 0) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ Found ${orphanedCount} orphaned edge(s) currently in state`);
    }
  }, [nodes, edges]);

  // Stable default edge options with proper marker configuration
  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      animated: true,
      style: {
        stroke: theme.primary,
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 25,
        height: 25,
        color: theme.primary,
      },
    }),
    [theme.primary]
  );

  // Load workflow from Firestore (only on mount/user change)
  useEffect(() => {
    if (!user || !reactFlowInstance) return;

    const loadWorkflow = async () => {
      try {
        const workflowRef = doc(db, 'workflows', user.uid);
        const workflowSnap = await getDoc(workflowRef);

        if (workflowSnap.exists()) {
          const data = workflowSnap.data();
          // Use setNodesState/setEdgesState for initial load (no history)
          if (data.nodes) {
            setNodesState(data.nodes);

            // Update ID counter to prevent duplicate IDs
            const maxId = data.nodes.reduce((max: number, node: Node) => {
              const match = node.id.match(/node_(\d+)/);
              if (match) {
                const nodeId = parseInt(match[1], 10);
                return Math.max(max, nodeId);
              }
              return max;
            }, -1);
            nodeIdCounter.current = maxId + 1;
          }
          if (data.edges) {
            // Validate edges before loading - filter out orphaned edges
            const { validEdges, orphanedEdges } = validateEdges(data.edges, data.nodes || []);

            if (orphanedEdges.length > 0) {
              // eslint-disable-next-line no-console
              console.warn(`Found ${orphanedEdges.length} orphaned edge(s):`, orphanedEdges);

              // Clean up orphaned edges from Firestore
              try {
                await updateDoc(workflowRef, {
                  edges: validEdges,
                });
                // eslint-disable-next-line no-console
                console.log(`Cleaned up ${orphanedEdges.length} orphaned edge(s) from Firestore`);
              } catch (updateError) {
                // eslint-disable-next-line no-console
                console.error('Error cleaning up orphaned edges in Firestore:', updateError);
              }
            }

            // Apply current theme color to valid edges
            const edgesWithTheme = validEdges.map((edge: Edge) => ({
              ...edge,
              style: {
                ...edge.style,
                stroke: theme.primary,
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 25,
                height: 25,
                color: theme.primary,
              },
            }));
            setEdgesState(edgesWithTheme);
          }
          if (data.viewport && reactFlowInstance) {
            reactFlowInstance.setViewport(data.viewport);
          }
        }
      } catch (error) {
        console.error('Error loading workflow:', error);
      }
    };

    loadWorkflow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, reactFlowInstance]); // Only load once when user/instance changes

  // Update all edges when theme changes
  useEffect(() => {
    // Only update if theme actually changed (not on initial render)
    if (prevThemeIdRef.current !== theme.id) {
      prevThemeIdRef.current = theme.id;

      // Update existing edges to use the new theme color
      setEdgesState((eds) =>
        eds.map((edge) => ({
          ...edge,
          style: {
            stroke: theme.primary,
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 25,
            height: 25,
            color: theme.primary,
          },
        }))
      );
    }
  }, [theme.id, theme.primary, setEdgesState]); // Run when theme changes

  // Periodic edge validation - clean up orphaned edges when nodes change
  // Only trigger on nodes changes, not edges changes, to avoid interfering with edge creation
  useEffect(() => {
    if (edges.length === 0 || nodes.length === 0) return;

    const { validEdges, orphanedEdges } = validateEdges(edges, nodes);

    if (orphanedEdges.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`Cleaning up ${orphanedEdges.length} orphaned edge(s):`, orphanedEdges);
      setEdgesState(validEdges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]); // Only run when nodes change (not edges)

  // Auto-save workflow to Firestore (1-second debounce)
  useEffect(() => {
    if (!user || !reactFlowInstance) return;

    const timeoutId = setTimeout(async () => {
      try {
        const viewport = reactFlowInstance.getViewport();
        const workflowRef = doc(db, 'workflows', user.uid);

        await setDoc(
          workflowRef,
          {
            nodes,
            edges,
            viewport,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error saving workflow:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, user, reactFlowInstance]);

  // Delete selected nodes/edges
  const handleDelete = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    const selectedEdges = edges.filter((e) => e.selected);

    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    takeSnapshot();

    // Get IDs of nodes being deleted
    const deletedNodeIds = new Set(selectedNodes.map(n => n.id));

    // Filter out selected nodes
    const remainingNodes = nodes.filter((n) => !n.selected);

    // Filter out selected edges AND edges connected to deleted nodes
    const remainingEdges = edges.filter((e) => {
      // Remove if edge is selected
      if (e.selected) return false;

      // Remove if edge connects to a deleted node
      if (deletedNodeIds.has(e.source) || deletedNodeIds.has(e.target)) {
        // eslint-disable-next-line no-console
        console.log(`Removing edge ${e.id} connected to deleted node`);
        return false;
      }

      return true;
    });

    setNodesState(remainingNodes);
    setEdgesState(remainingEdges);
  }, [nodes, edges, setNodesState, setEdgesState, takeSnapshot]);

  // Clear entire canvas
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return;

    if (window.confirm('Clear entire canvas? This cannot be undone.')) {
      takeSnapshot();
      setNodesState([]);
      setEdgesState([]);
    }
  }, [nodes.length, edges.length, setNodesState, setEdgesState, takeSnapshot]);

  // Clear all edges only
  const handleClearEdges = useCallback(() => {
    if (edges.length === 0) return;

    if (window.confirm(`Clear all ${edges.length} edge(s)? This cannot be undone.`)) {
      takeSnapshot();
      setEdgesState([]);
    }
  }, [edges.length, setEdgesState, takeSnapshot]);

  // Zoom controls (using reactFlowInstance)
  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: handleDelete,
  });

  const onConnect = useCallback(
    (params: Connection) => {
      // eslint-disable-next-line no-console
      console.log('=== CONNECTION ATTEMPT ===');
      // eslint-disable-next-line no-console
      console.log('Connection params:', params);

      // Validate that both source and target nodes exist
      if (!params.source || !params.target) {
        // eslint-disable-next-line no-console
        console.error('❌ CONNECTION BLOCKED - Missing source or target');
        return;
      }

      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode) {
        // eslint-disable-next-line no-console
        console.error(`❌ CONNECTION BLOCKED - Source node "${params.source}" not found`);
        return;
      }

      if (!targetNode) {
        // eslint-disable-next-line no-console
        console.error(`❌ CONNECTION BLOCKED - Target node "${params.target}" not found`);
        return;
      }

      setEdgesState((eds) => {
        // eslint-disable-next-line no-console
        console.log('Current edges in state:', eds);
        // eslint-disable-next-line no-console
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
          // eslint-disable-next-line no-console
          console.warn('⚠️ DUPLICATE EDGE BLOCKED - Edge already exists between these nodes');
          // eslint-disable-next-line no-console
          console.log('Existing edge:', eds.find(e =>
            e.source === params.source &&
            e.target === params.target &&
            e.sourceHandle === params.sourceHandle &&
            e.targetHandle === params.targetHandle
          ));
          return eds;
        }

        const newEdges = addEdge(params, eds);
        // eslint-disable-next-line no-console
        console.log('✅ NEW EDGE CREATED');
        // eslint-disable-next-line no-console
        console.log('Updated edges array:', newEdges);
        // eslint-disable-next-line no-console
        console.log('New edge count:', newEdges.length);
        takeSnapshot();
        return newEdges;
      });
    },
    [nodes, setEdgesState, takeSnapshot]
  );

  // Click on edge to delete it
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      takeSnapshot();
      setEdgesState((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdgesState, takeSnapshot]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const type = event.dataTransfer.getData('application/reactflow');

      // Validate we have a proper type from the palette
      if (typeof type === 'undefined' || !type || !reactFlowInstance) {
        return;
      }

      // Only handle drops for our specific node types
      const validTypes = ['rectangle', 'diamond', 'oval', 'parallelogram'];
      if (!validTypes.includes(type)) {
        return;
      }

      // Use screenToFlowPosition instead of deprecated project method
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const labels: Record<string, string> = {
        rectangle: 'Process',
        diamond: 'Decision?',
        oval: 'Start',
        parallelogram: 'Input',
      };

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: labels[type] || 'New Node' },
        style: {
          width: type === 'diamond' ? 140 : 160,
          height: type === 'diamond' ? 140 : 80,
        },
      };

      // Take snapshot before adding new node
      takeSnapshot();
      setNodesState((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodesState, takeSnapshot]
  );

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'copy';
  }, []);

  // Dynamic theme styles for React Flow
  const themeStyles = useMemo(() => `
    .react-flow-dark {
      --xy-edge-stroke: ${theme.primary};
      --xy-edge-stroke-selected: ${theme.primaryLight};
      --xy-handle: ${theme.primary};
      --xy-node-border: rgba(${theme.primaryRgb}, 0.3);
      --xy-node-border-selected: ${theme.primary};
      --xy-node-boxshadow-selected: 0 0 0 2px rgba(${theme.primaryRgb}, 0.5);
    }
  `, [theme]);

  return (
    <div className="flex h-full w-full">
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />

      <ShapePalette onDragStart={onDragStart} />

      <Toolbar
        onUndo={undo}
        onRedo={redo}
        onDelete={handleDelete}
        onClearCanvas={handleClearCanvas}
        onFitView={handleFitView}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        canUndo={canUndo}
        canRedo={canRedo}
        selectedCount={selectedCount}
      />

      <div className="flex-1 react-flow-dark relative" ref={reactFlowWrapper}>
        {/* Debug Panel */}
        <div className="absolute top-4 right-4 z-50 bg-black/90 border border-orange-500/30 rounded-lg p-3 text-xs text-white font-mono max-w-sm">
          <div className="font-bold mb-2 text-orange-500">Debug Info</div>
          <div>Nodes: {nodes.length}</div>
          <div>Edges: {edges.length}</div>
          {edges.length > 0 && (
            <>
              <div className="mt-2 space-y-1">
                <div className="font-semibold text-orange-400">Edges:</div>
                {edges.map((edge, idx) => (
                  <div key={edge.id} className="text-[10px] bg-white/5 p-1 rounded">
                    {idx + 1}. {edge.source}({edge.sourceHandle}) → {edge.target}({edge.targetHandle})
                  </div>
                ))}
              </div>
              <button
                onClick={handleClearEdges}
                className="mt-2 w-full px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded text-red-400 text-xs"
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
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          attributionPosition="bottom-left"
          connectOnClick={true}
          elevateEdgesOnSelect={true}
          edgesReconnectable={true}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={theme.primary} />
          <Controls />
          <MiniMap
            nodeColor={theme.primary}
            maskColor="rgba(0, 0, 0, 0.6)"
            style={{
              background: 'rgba(15, 15, 15, 0.9)',
              border: `1px solid rgba(${theme.primaryRgb}, 0.2)`,
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
