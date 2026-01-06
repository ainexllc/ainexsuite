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
  SelectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
import './workflow-canvas.css';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';
import { WORKFLOW_COLLECTIONS } from '@/lib/firebase/collections';

// Node components
import RectangleNode from './nodes/RectangleNode';
import DiamondNode from './nodes/DiamondNode';
import OvalNode from './nodes/OvalNode';
import ParallelogramNode from './nodes/ParallelogramNode';
import SwimlaneNode from './nodes/SwimlaneNode';
import SubprocessNode from './nodes/SubprocessNode';
import StickyNoteNode from './nodes/StickyNoteNode';
import IconNode from './nodes/IconNode';
import DatabaseNode from './nodes/DatabaseNode';
import DocumentsNode from './nodes/DocumentsNode';

// Edge components
import { SmartEdge } from './edges/SmartEdge';

// UI components
import { ShapePalette } from './ShapePalette';
import { ConfirmationModal } from './ConfirmationModal';
import { EdgeLabelOverlay, EmptyCanvasOverlay, ContextMenu, type ContextMenuType } from './components';

// Hooks
import { useUndoRedo, useKeyboardShortcuts, useThemeColors, useNodeAlignment, useClipboard } from './hooks';

// Utilities
import {
  validateEdges,
  sanitizeForFirestore,
  getMarkerConfig,
  isAnimatedStyle,
  createEdgeStyle,
  paletteNodeTypes,
  defaultNodeData,
  getNodeDimensions,
  type LineStyleType,
  type ArrowType,
  type EdgeStyleType,
} from './utils';

// Define nodeTypes outside component to prevent re-creation
const nodeTypes = {
  rectangle: RectangleNode,
  diamond: DiamondNode,
  oval: OvalNode,
  parallelogram: ParallelogramNode,
  swimlane: SwimlaneNode,
  subprocess: SubprocessNode,
  'sticky-note': StickyNoteNode,
  icon: IconNode,
  database: DatabaseNode,
  documents: DocumentsNode,
};

interface WorkflowCanvasWithIdInnerProps {
  workflowId: string;
}

function WorkflowCanvasWithIdInner({ workflowId }: WorkflowCanvasWithIdInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);
  const getId = useCallback(() => `node_${nodeIdCounter.current++}`, []);
  const isInitialLoad = useRef(true);

  // React Flow state
  const [nodes, setNodesState, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Edge styling state
  const [edgeType, setEdgeType] = useState<EdgeStyleType>('smoothstep');
  const [arrowType, setArrowType] = useState<ArrowType>('end');
  const [lineStyle, setLineStyle] = useState<LineStyleType>('solid');

  // UI state
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    type: ContextMenuType;
    flowPosition?: { x: number; y: number };
  }>({ isOpen: false, position: { x: 0, y: 0 }, type: null });

  const { user } = useAuth();

  // Theme colors from CSS variables
  const { themePrimary, themePrimaryRgb, themePrimaryLight } = useThemeColors();

  // Track selected edges
  const hasSelectedEdges = useMemo(() => edges.some(e => e.selected), [edges]);

  // Get selected node color
  const selectedNodeColor = useMemo(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return null;

    const firstColor = (selectedNodes[0].data as { color?: string }).color || themePrimary;
    const allSameColor = selectedNodes.every(
      (n) => ((n.data as { color?: string }).color || themePrimary) === firstColor
    );

    return allSameColor ? firstColor : null;
  }, [nodes, themePrimary]);

  // Undo/Redo
  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo(
    nodes,
    edges,
    setNodesState,
    setEdgesState
  );

  // Node alignment
  const { handleAlignNodes, handleDistributeNodes } = useNodeAlignment({
    nodes,
    setNodes: setNodesState,
    takeSnapshot,
  });

  // Clipboard operations
  const {
    copy,
    cut,
    paste,
    duplicate,
    selectAll,
    deselectAll,
    hasClipboardContent,
    hasSelection,
  } = useClipboard({
    nodes,
    edges,
    setNodes: setNodesState,
    setEdges: setEdgesState,
    takeSnapshot,
    getId,
  });

  // Nudge selected nodes with arrow keys
  const handleNudge = useCallback(
    (direction: { x: number; y: number }) => {
      const selectedNodes = nodes.filter((n) => n.selected);
      if (selectedNodes.length === 0) return;

      takeSnapshot();
      setNodesState((nds) =>
        nds.map((node) =>
          node.selected
            ? {
                ...node,
                position: {
                  x: node.position.x + direction.x,
                  y: node.position.y + direction.y,
                },
              }
            : node
        )
      );
    },
    [nodes, setNodesState, takeSnapshot]
  );

  // Z-index management
  const handleBringToFront = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    takeSnapshot();
    const maxZIndex = Math.max(...nodes.map((n) => (n.zIndex ?? 0)));
    setNodesState((nds) =>
      nds.map((node) =>
        node.selected ? { ...node, zIndex: maxZIndex + 1 } : node
      )
    );
  }, [nodes, setNodesState, takeSnapshot]);

  const handleSendToBack = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    takeSnapshot();
    const minZIndex = Math.min(...nodes.map((n) => (n.zIndex ?? 0)));
    setNodesState((nds) =>
      nds.map((node) =>
        node.selected ? { ...node, zIndex: minZIndex - 1 } : node
      )
    );
  }, [nodes, setNodesState, takeSnapshot]);

  // Node locking
  const handleLockNodes = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    takeSnapshot();
    setNodesState((nds) =>
      nds.map((node) =>
        node.selected
          ? { ...node, draggable: false, data: { ...node.data, locked: true } }
          : node
      )
    );
  }, [nodes, setNodesState, takeSnapshot]);

  const handleUnlockNodes = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return;

    takeSnapshot();
    setNodesState((nds) =>
      nds.map((node) =>
        node.selected
          ? { ...node, draggable: true, data: { ...node.data, locked: false } }
          : node
      )
    );
  }, [nodes, setNodesState, takeSnapshot]);

  // Check if any selected node is locked
  const hasLockedSelection = useMemo(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    return selectedNodes.some((n) => (n.data as { locked?: boolean }).locked);
  }, [nodes]);

  // Toggle lock state for keyboard shortcut
  const handleToggleLock = useCallback(() => {
    if (hasLockedSelection) {
      handleUnlockNodes();
    } else {
      handleLockNodes();
    }
  }, [hasLockedSelection, handleLockNodes, handleUnlockNodes]);

  // Context menu handlers
  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, type: null });
  }, []);

  const onPaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      const flowPosition = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        type: 'canvas',
        flowPosition,
      });
    },
    [reactFlowInstance]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();

      // Select the node if not already selected
      if (!node.selected) {
        setNodesState((nds) =>
          nds.map((n) => ({ ...n, selected: n.id === node.id }))
        );
        setEdgesState((eds) => eds.map((e) => ({ ...e, selected: false })));
      }

      setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        type: 'node',
      });
    },
    [setNodesState, setEdgesState]
  );

  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();

      // Select the edge
      setEdgesState((eds) => eds.map((e) => ({ ...e, selected: e.id === edge.id })));
      setNodesState((nds) => nds.map((n) => ({ ...n, selected: false })));

      setContextMenu({
        isOpen: true,
        position: { x: event.clientX, y: event.clientY },
        type: 'edge',
      });
    },
    [setEdgesState, setNodesState]
  );

  const handleAddNodeFromContextMenu = useCallback(
    (type: string) => {
      if (!contextMenu.flowPosition) return;

      const baseData = defaultNodeData[type] ? { ...defaultNodeData[type] } : { label: 'New Node' };

      const newNode: Node = {
        id: getId(),
        type,
        position: contextMenu.flowPosition,
        data: baseData,
        style: getNodeDimensions(type),
      };

      takeSnapshot();
      setNodesState((nds) => [...nds, newNode]);
    },
    [contextMenu.flowPosition, getId, setNodesState, takeSnapshot]
  );

  const handleEditSelectedEdgeLabel = useCallback(() => {
    const selectedEdge = edges.find((e) => e.selected);
    if (selectedEdge) {
      setEditingEdge(selectedEdge.id);
    }
  }, [edges]);

  // Selected count for toolbar
  const selectedCount = useMemo(() => {
    return nodes.filter((n) => n.selected).length + edges.filter((e) => e.selected).length;
  }, [nodes, edges]);

  // Edge types
  const edgeTypes = useMemo(() => ({ smart: SmartEdge }), []);

  // Default edge options
  const defaultEdgeOptions = useMemo(
    () => ({
      type: edgeType as Edge['type'],
      animated: isAnimatedStyle(lineStyle),
      style: createEdgeStyle(themePrimary, lineStyle),
      ...getMarkerConfig(arrowType, themePrimary),
    }),
    [themePrimary, edgeType, arrowType, lineStyle]
  );

  // Subscribe to workflow document for real-time updates
  useEffect(() => {
    if (!user?.uid || !workflowId || !reactFlowInstance) return;

    const workflowRef = doc(db, WORKFLOW_COLLECTIONS.workflows(user.uid), workflowId);

    const unsubscribe = onSnapshot(workflowRef, (snapshot) => {
      if (!snapshot.exists() || !isInitialLoad.current) return;

      const data = snapshot.data();

      if (data.nodes) {
        setNodesState(data.nodes);

        // Update ID counter to prevent duplicate IDs
        const maxId = data.nodes.reduce((max: number, node: Node) => {
          const match = node.id.match(/node_(\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, -1);
        nodeIdCounter.current = maxId + 1;
      }

      // Restore preferences
      if (data.edgeType) setEdgeType(data.edgeType);
      if (data.arrowType) setArrowType(data.arrowType);
      if (data.lineStyle) setLineStyle(data.lineStyle);

      if (data.edges) {
        const { validEdges, orphanedEdges } = validateEdges(data.edges, data.nodes || []);

        // Clean up orphaned edges if found
        if (orphanedEdges.length > 0) {
          updateDoc(workflowRef, { edges: validEdges }).catch(console.error);
        }

        const savedArrowType = data.arrowType || 'end';
        const savedLineStyle = data.lineStyle || 'solid';

        const edgesWithTheme = validEdges.map((edge: Edge) => ({
          ...edge,
          animated: isAnimatedStyle(savedLineStyle),
          style: createEdgeStyle(themePrimary, savedLineStyle),
          ...getMarkerConfig(savedArrowType, themePrimary),
        }));
        setEdgesState(edgesWithTheme);
      }

      if (data.viewport && reactFlowInstance) {
        reactFlowInstance.setViewport(data.viewport);
      }

      isInitialLoad.current = false;
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, workflowId, reactFlowInstance]);

  // Update edges when style changes
  useEffect(() => {
    setEdgesState((eds) =>
      eds.map((edge) => {
        const shouldUpdate = !hasSelectedEdges || edge.selected;
        if (!shouldUpdate) return edge;

        return {
          ...edge,
          type: edgeType as Edge['type'],
          animated: isAnimatedStyle(lineStyle),
          style: createEdgeStyle(themePrimary, lineStyle),
          ...getMarkerConfig(arrowType, themePrimary),
        };
      })
    );
  }, [themePrimary, edgeType, arrowType, lineStyle, hasSelectedEdges, setEdgesState]);

  // Validate edges when nodes change
  useEffect(() => {
    if (edges.length === 0 || nodes.length === 0) return;

    const { validEdges, orphanedEdges } = validateEdges(edges, nodes);
    if (orphanedEdges.length > 0) {
      setEdgesState(validEdges);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  // Auto-save workflow (1-second debounce)
  useEffect(() => {
    if (!user?.uid || !workflowId || !reactFlowInstance || isInitialLoad.current) return;

    const timeoutId = setTimeout(async () => {
      try {
        const viewport = reactFlowInstance.getViewport();
        const workflowRef = doc(db, WORKFLOW_COLLECTIONS.workflows(user.uid), workflowId);

        await updateDoc(workflowRef, sanitizeForFirestore({
          nodes,
          edges,
          viewport,
          edgeType,
          arrowType,
          lineStyle,
          nodeCount: nodes.length,
          updatedAt: serverTimestamp(),
        }));
      } catch (error) {
        console.error('Failed to auto-save workflow:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, user?.uid, workflowId, reactFlowInstance, edgeType, arrowType, lineStyle]);

  // Delete selected nodes/edges (skip locked nodes)
  const handleDelete = useCallback(() => {
    // Filter out locked nodes from deletion
    const selectedNodes = nodes.filter(
      (n) => n.selected && !(n.data as { locked?: boolean }).locked
    );
    const selectedEdges = edges.filter((e) => e.selected);
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;

    takeSnapshot();

    const deletedNodeIds = new Set(selectedNodes.map((n) => n.id));
    const remainingNodes = nodes.filter((n) => !deletedNodeIds.has(n.id));
    const remainingEdges = edges.filter((e) => {
      if (e.selected) return false;
      if (deletedNodeIds.has(e.source) || deletedNodeIds.has(e.target)) return false;
      return true;
    });

    setNodesState(remainingNodes);
    setEdgesState(remainingEdges);
  }, [nodes, edges, setNodesState, setEdgesState, takeSnapshot]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (nodes.length === 0 && edges.length === 0) return;
    setShowClearModal(true);
  }, [nodes.length, edges.length]);

  const confirmClearCanvas = useCallback(() => {
    takeSnapshot();
    setNodesState([]);
    setEdgesState([]);
  }, [setNodesState, setEdgesState, takeSnapshot]);

  // Zoom controls
  const handleFitView = useCallback(() => {
    reactFlowInstance?.fitView({ padding: 0.2, maxZoom: 1 });
  }, [reactFlowInstance]);

  const handleZoomIn = useCallback(() => {
    reactFlowInstance?.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance?.zoomOut();
  }, [reactFlowInstance]);

  // Node color change
  const handleNodeColorChange = useCallback(
    (color: string) => {
      takeSnapshot();
      setNodesState((nds) =>
        nds.map((node) =>
          node.selected ? { ...node, data: { ...node.data, color } } : node
        )
      );
    },
    [setNodesState, takeSnapshot]
  );

  const handleNodeBgColorChange = useCallback(
    (bgColor: string) => {
      takeSnapshot();
      setNodesState((nds) =>
        nds.map((node) =>
          node.selected ? { ...node, data: { ...node.data, bgColor } } : node
        )
      );
    },
    [setNodesState, takeSnapshot]
  );

  // Edge label change
  const handleEdgeLabelChange = useCallback(
    (edgeId: string, label: string) => {
      setEdgesState((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, label, data: { ...edge.data, label } }
            : edge
        )
      );
    },
    [setEdgesState]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: handleDelete,
    onCopy: copy,
    onPaste: paste,
    onCut: cut,
    onDuplicate: duplicate,
    onSelectAll: selectAll,
    onDeselectAll: deselectAll,
    onNudge: handleNudge,
    onToggleLock: handleToggleLock,
  });

  // Connect handler
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (!sourceNode || !targetNode) return;

      setEdgesState((eds) => {
        const isDuplicate = eds.some(
          (edge) =>
            edge.source === params.source &&
            edge.target === params.target &&
            edge.sourceHandle === params.sourceHandle &&
            edge.targetHandle === params.targetHandle
        );
        if (isDuplicate) return eds;

        const newEdges = addEdge(params, eds).map((edge) => ({
          ...edge,
          type: edgeType as Edge['type'],
          animated: isAnimatedStyle(lineStyle),
          style: createEdgeStyle(themePrimary, lineStyle),
          ...getMarkerConfig(arrowType, themePrimary),
        }));

        takeSnapshot();
        return newEdges;
      });
    },
    [nodes, setEdgesState, takeSnapshot, edgeType, lineStyle, themePrimary, arrowType]
  );

  // Edge click handler
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEdgesState((eds) => eds.map((e) => ({ ...e, selected: e.id === edge.id })));
      setNodesState((nds) => nds.map((n) => ({ ...n, selected: false })));
    },
    [setEdgesState, setNodesState]
  );

  // Drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !reactFlowInstance) return;
      if (!(paletteNodeTypes as readonly string[]).includes(type)) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const baseData = defaultNodeData[type] ? { ...defaultNodeData[type] } : { label: 'New Node' };

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: baseData,
        style: getNodeDimensions(type),
      };

      takeSnapshot();
      setNodesState((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodesState, takeSnapshot, getId]
  );

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'copy';
  }, []);

  // Dynamic theme styles
  const themeStyles = useMemo(
    () => `
    .react-flow-dark {
      --xy-edge-stroke: ${themePrimary};
      --xy-edge-stroke-selected: ${themePrimaryLight};
      --xy-handle: ${themePrimary};
      --xy-node-border: rgba(${themePrimaryRgb}, 0.3);
      --xy-node-border-selected: ${themePrimary};
      --xy-node-boxshadow-selected: 0 0 0 2px rgba(${themePrimaryRgb}, 0.5);
    }
  `,
    [themePrimary, themePrimaryLight, themePrimaryRgb]
  );

  return (
    <div className="flex h-full w-full">
      <style>{themeStyles}</style>

      <ShapePalette
        onDragStart={onDragStart}
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
        edgeType={edgeType}
        onEdgeTypeChange={setEdgeType}
        arrowType={arrowType}
        onArrowTypeChange={setArrowType}
        lineStyle={lineStyle}
        onLineStyleChange={setLineStyle}
        selectedNodeColor={selectedNodeColor}
        onNodeColorChange={handleNodeColorChange}
        onNodeBgColorChange={handleNodeBgColorChange}
        snapToGrid={snapToGrid}
        onSnapToGridToggle={() => setSnapToGrid(!snapToGrid)}
        onAlignNodes={handleAlignNodes}
        onDistributeNodes={handleDistributeNodes}
      />

      <div className="flex-1 react-flow-dark relative" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onEdgeDoubleClick={(_e, edge) => setEditingEdge(edge.id)}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneContextMenu={onPaneContextMenu}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          snapToGrid={snapToGrid}
          snapGrid={[20, 20]}
          fitView
          fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          selectionOnDrag={true}
          panOnDrag={[1, 2]}
          selectionMode={SelectionMode.Partial}
          attributionPosition="bottom-left"
          connectOnClick={true}
          elevateEdgesOnSelect={true}
          edgesReconnectable={true}
          edgeTypes={edgeTypes}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={themePrimary} />
          <Controls />
          <MiniMap
            nodeColor={themePrimary}
            maskColor="rgba(0, 0, 0, 0.6)"
            style={{
              background: 'rgba(15, 15, 15, 0.9)',
              border: `1px solid rgba(${themePrimaryRgb}, 0.2)`,
            }}
          />

          <EdgeLabelOverlay
            edges={edges}
            nodes={nodes}
            editingEdge={editingEdge}
            setEditingEdge={setEditingEdge}
            onLabelChange={handleEdgeLabelChange}
            themePrimary={themePrimary}
            themePrimaryRgb={themePrimaryRgb}
          />
        </ReactFlow>

        {nodes.length === 0 && <EmptyCanvasOverlay />}
      </div>

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        type={contextMenu.type}
        onClose={closeContextMenu}
        onCopy={copy}
        onCut={cut}
        onPaste={paste}
        onDuplicate={duplicate}
        onDelete={handleDelete}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onLock={handleLockNodes}
        onUnlock={handleUnlockNodes}
        onSelectAll={selectAll}
        onFitView={handleFitView}
        onAddNode={handleAddNodeFromContextMenu}
        onEditEdgeLabel={handleEditSelectedEdgeLabel}
        hasSelection={hasSelection()}
        hasClipboard={hasClipboardContent()}
        isLocked={hasLockedSelection}
      />

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearCanvas}
        title="Clear Canvas?"
        message={`This will delete all ${nodes.length} node(s) and ${edges.length} connector(s). This action cannot be undone.`}
        confirmText="Clear Canvas"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

interface WorkflowCanvasWithIdProps {
  workflowId: string;
}

export function WorkflowCanvasWithId({ workflowId }: WorkflowCanvasWithIdProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasWithIdInner workflowId={workflowId} />
    </ReactFlowProvider>
  );
}
