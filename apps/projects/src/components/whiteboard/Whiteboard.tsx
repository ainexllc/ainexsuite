'use client';

import { useCallback, useState, useEffect, useMemo } from 'react';
import {
  StickyNote as StickyNoteIcon, Trash2, Sun, Moon, Undo2, Redo2, CheckSquare, Trash, Network, Download, Upload, Maximize2, Minimize2,
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
  useReactFlow,
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
  const { screenToFlowPosition } = useReactFlow();
  const whiteboardRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      (window as Window & { whiteboardElement?: HTMLDivElement }).whiteboardElement = node;
    }
  }, []);

  // React Flow state
  const [nodes, setNodesState, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdgesState, onEdgesChangeRaw] = useEdgesState<Edge>([]);

  // Wrap onEdgesChange with proper typing
  const onEdgesChange = onEdgesChangeRaw;

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stickyNoteColor, setStickyNoteColor] = useState('#fef08a');
  const [stickyNoteFontSize] = useState<'xs' | 'sm' | 'base' | 'lg' | 'xl'>('sm');
  const [stickyNoteFontFamily] = useState<'sans' | 'serif' | 'mono' | 'cursive'>('sans');
  const [edgeType, setEdgeType] = useState<'smoothstep' | 'straight' | 'default' | 'step'>('smoothstep');
  const [arrowType, setArrowType] = useState<'none' | 'end' | 'start' | 'both'>('end');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted' | 'animated-solid' | 'animated-dashed' | 'animated-dotted'>('solid');

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

  // Track if we have selected edges
  const hasSelectedEdges = useMemo(() => edges.some(e => e.selected), [edges]);

  // Helper to get marker config based on arrow direction
  const getMarkerConfig = useCallback((direction: 'end' | 'start' | 'both' | 'none') => {
    const markerConfig = {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#06b6d4',
    };

    // Always return both properties, set to undefined if not needed
    // This ensures old markers are removed when changing direction
    return {
      markerEnd: (direction === 'end' || direction === 'both') ? markerConfig : undefined,
      markerStart: (direction === 'start' || direction === 'both') ? markerConfig : undefined,
    };
  }, []);

  // Helper to get stroke dash array based on line style
  const getStrokeDashArray = useCallback((style: 'solid' | 'dashed' | 'dotted' | 'animated-solid' | 'animated-dashed' | 'animated-dotted') => {
    switch (style) {
      case 'dashed':
      case 'animated-dashed':
        return '10 5'; // 10px dash, 5px gap
      case 'dotted':
      case 'animated-dotted':
        return '2 4'; // 2px dot, 4px gap
      case 'solid':
      case 'animated-solid':
      default:
        return undefined; // No dash array = solid line
    }
  }, []);

  // Helper to determine if line style should be animated
  const isAnimatedStyle = useCallback((style: 'solid' | 'dashed' | 'dotted' | 'animated-solid' | 'animated-dashed' | 'animated-dotted') => {
    return style.startsWith('animated-');
  }, []);

  // Stable default edge options with proper marker configuration
  const defaultEdgeOptions = useMemo(
    () => ({
      type: edgeType,
      animated: isAnimatedStyle(lineStyle), // Animate based on style prefix
      style: {
        stroke: '#06b6d4',
        strokeWidth: 2,
        strokeDasharray: getStrokeDashArray(lineStyle),
      },
      ...getMarkerConfig(arrowType),
    }),
    [edgeType, arrowType, lineStyle, getMarkerConfig, getStrokeDashArray, isAnimatedStyle]
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
                onTitleChange: (title: string) => updateNodeTitle(node.id, title),
                onResize: (width: number, height: number) => updateNodeSize(node.id, width, height),
              },
            }));
            setNodes(nodesWithCallbacks);

            // Load edges (connections) with validation
            if (data.edges) {
              // Validate edges before loading - filter out orphaned edges
              const { validEdges, orphanedEdges } = validateEdges(data.edges, nodesWithCallbacks);

              if (orphanedEdges.length > 0) {
                // Clean up orphaned edges from Firestore
                try {
                  void setDoc(whiteboardRef, {
                    nodes: data.nodes,
                    edges: validEdges,
                    isDarkMode: data.isDarkMode,
                    updatedAt: new Date().toISOString(),
                  });
                } catch (updateError) {
                }
              }

              // Restore edge preferences
              if (data.edgeType) {
                setEdgeType(data.edgeType);
              }
              if (data.arrowType) {
                setArrowType(data.arrowType);
              }
              if (data.lineStyle) {
                setLineStyle(data.lineStyle);
              }

              // Apply saved preferences to edges
              const savedArrowType = data.arrowType || 'end';
              const savedLineStyle = data.lineStyle || 'solid';

              const edgesWithSettings = validEdges.map((edge: Edge) => ({
                ...edge,
                animated: isAnimatedStyle(savedLineStyle),
                style: {
                  ...edge.style,
                  stroke: '#06b6d4',
                  strokeWidth: 2,
                  strokeDasharray: getStrokeDashArray(savedLineStyle),
                },
                ...getMarkerConfig(savedArrowType),
              }));

              setEdges(edgesWithSettings);
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
        setIsLoaded(true);
      }
    };

    void loadWhiteboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        };

        // Include title if it exists
        if (node.data.title) {
          data.title = node.data.title;
        }

        // Include dimensions if custom
        if (node.data.width) {
          data.width = node.data.width;
        }
        if (node.data.height) {
          data.height = node.data.height;
        }

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

      // Clean edges to remove undefined values
      const edgesToSave = validEdges.map((edge) => {
        const cleanEdge: Record<string, unknown> = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
        };

        // Only add defined optional properties
        if (edge.type !== undefined) cleanEdge.type = edge.type;
        if (edge.sourceHandle !== undefined) cleanEdge.sourceHandle = edge.sourceHandle;
        if (edge.targetHandle !== undefined) cleanEdge.targetHandle = edge.targetHandle;
        if (edge.animated !== undefined) cleanEdge.animated = edge.animated;
        if (edge.style !== undefined) cleanEdge.style = edge.style;
        if (edge.markerEnd !== undefined) cleanEdge.markerEnd = edge.markerEnd;
        if (edge.markerStart !== undefined) cleanEdge.markerStart = edge.markerStart;

        return cleanEdge;
      });

      await setDoc(whiteboardRef, {
        nodes: nodesToSave,
        edges: edgesToSave,
        isDarkMode,
        edgeType,
        arrowType,
        lineStyle,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
    }
  }, [user, nodes, edges, isDarkMode, edgeType, arrowType, lineStyle, isLoaded]);

  // Auto-save when nodes, edges, or dark mode changes
  useEffect(() => {
    if (!isLoaded) return;

    const timeoutId = setTimeout(() => {
      void saveWhiteboard();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, isDarkMode, saveWhiteboard, isLoaded]);

  // Update edges when edge type, arrow type, or line style changes
  useEffect(() => {
    if (!isLoaded) return;

    // If there are selected edges, only update those
    // Otherwise update all edges
    setEdgesState((eds) =>
      eds.map((edge) => {
        // Skip non-selected edges if there are selected edges
        const shouldUpdate = !hasSelectedEdges || edge.selected;

        if (!shouldUpdate) {
          return edge;
        }

        return {
          ...edge,
          type: edgeType,
          animated: isAnimatedStyle(lineStyle),
          style: {
            stroke: '#06b6d4',
            strokeWidth: 2,
            strokeDasharray: getStrokeDashArray(lineStyle),
          },
          ...getMarkerConfig(arrowType),
        };
      })
    );
  }, [edgeType, arrowType, lineStyle, hasSelectedEdges, setEdgesState, getMarkerConfig, getStrokeDashArray, isAnimatedStyle, isLoaded]);

  // React Flow connection handler
  const onConnect = useCallback(
    (params: Connection) => {
      // Validate that both source and target nodes exist
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) {
        return;
      }

      setEdgesState((eds) => {
        // Check for duplicate edges (same source and target)
        const isDuplicate = eds.some(
          (edge) =>
            edge.source === params.source &&
            edge.target === params.target &&
            edge.sourceHandle === params.sourceHandle &&
            edge.targetHandle === params.targetHandle
        );

        if (isDuplicate) {
          return eds;
        }

        const newEdges = addEdge(params, eds);
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

  const updateNodeTitle = useCallback(
    (nodeId: string, title: string) => {
      setNodesState((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, title } } : n
        )
      );
    },
    [setNodesState]
  );

  const updateNodeSize = useCallback(
    (nodeId: string, width: number, height: number) => {
      setNodesState((nds) =>
        nds.map((n) =>
          n.id === nodeId ? {
            ...n,
            data: { ...n.data, width, height },
            style: { ...n.style, width: `${width}px`, height: `${height}px` }
          } : n
        )
      );
    },
    [setNodesState]
  );

  // Note: Sticky notes are added via drag and drop from the toolbar

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

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const elem = (window as Window & { whiteboardElement?: HTMLDivElement }).whiteboardElement;

    if (!elem) return;

    if (!isFullscreen) {
      if (elem.requestFullscreen) {
        void elem.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle drag and drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const color = event.dataTransfer.getData('color');

      if (type === 'stickyNote') {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        takeSnapshot();
        const nodeId = `note-${Date.now()}`;
        const newNode: Node = {
          id: nodeId,
          type: 'stickyNote',
          position,
          data: {
            text: '',
            title: '',
            color: color || stickyNoteColor,
            fontSize: stickyNoteFontSize,
            fontFamily: stickyNoteFontFamily,
            isDarkMode,
            onDelete: () => deleteNode(nodeId),
            onTextChange: (text: string) => updateNodeText(nodeId, text),
            onTitleChange: (title: string) => updateNodeTitle(nodeId, title),
            onResize: (width: number, height: number) => updateNodeSize(nodeId, width, height),
          },
        };

        setNodesState((nds) => [...nds, newNode]);
      }
    },
    [screenToFlowPosition, stickyNoteColor, stickyNoteFontSize, stickyNoteFontFamily, isDarkMode, setNodesState, deleteNode, updateNodeText, updateNodeTitle, takeSnapshot]
  );

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
          width: n.data.width,
          height: n.data.height,
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
            onTitleChange: (title: string) => updateNodeTitle(node.id, title),
            onResize: (width: number, height: number) => updateNodeSize(node.id, width, height),
          },
        }));

        setNodesState(restoredNodes);
        setEdgesState(importData.edges);
      } catch (error) {
        alert('Failed to import whiteboard. Please check the file format.');
      }
    };
    input.click();
  }, [isDarkMode, deleteNode, updateNodeText, updateNodeTitle, setNodesState, setEdgesState, takeSnapshot]);

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
    <div ref={whiteboardRef} className={`w-full h-full relative rounded-lg overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
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
        <Controls position="top-right" className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''} />
        <MiniMap
          className={isDarkMode ? 'bg-gray-700' : ''}
          nodeColor={isDarkMode ? '#60a5fa' : '#3b82f6'}
        />

        {/* Toolbar Panel - Full View No Scroll */}
        <Panel position="top-left" className={`backdrop-blur-xl rounded-xl shadow-2xl border ${
          isDarkMode
            ? 'bg-gradient-to-br from-gray-800/85 to-gray-900/85 border-white/10'
            : 'bg-gradient-to-br from-white/85 to-gray-50/85 border-gray-200'
        }`}>
          <div className="flex flex-col gap-1 p-2">
          {/* Sticky Notes Section */}
          <div className="flex flex-col gap-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Sticky Notes
            </span>

            {/* Draggable Color Swatches */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { color: '#fef08a', label: 'Yellow' },
                { color: '#a7f3d0', label: 'Green' },
                { color: '#bfdbfe', label: 'Blue' },
                { color: '#fbbf24', label: 'Amber' },
                { color: '#fca5a5', label: 'Red' },
                { color: '#e9d5ff', label: 'Purple' },
              ].map(({ color, label }) => (
                <div
                  key={color}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow', 'stickyNote');
                    e.dataTransfer.setData('color', color);
                    e.dataTransfer.effectAllowed = 'move';
                    setStickyNoteColor(color);
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg border shadow-md transition-all cursor-move hover:scale-105 ${
                    stickyNoteColor === color
                      ? 'ring-1 ring-cyan-500'
                      : isDarkMode
                      ? 'border-white/20'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Drag ${label} note`}
                >
                  <StickyNoteIcon className="w-4 h-4 text-gray-700" />
                  <span className="text-[9px] font-medium text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} />

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

          {/* Arrow Direction Selector */}
          <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Arrow Direction
            </span>
            <div className="grid grid-cols-2 gap-1">
              {([
                { type: 'end' as const, label: 'End', symbol: '—▶' },
                { type: 'start' as const, label: 'Start', symbol: '◀—' },
                { type: 'both' as const, label: 'Both', symbol: '◀—▶' },
                { type: 'none' as const, label: 'None', symbol: '——' },
              ]).map(({ type, label, symbol }) => (
                <button
                  key={type}
                  onClick={() => setArrowType(type)}
                  className={`px-2 py-1.5 text-xs rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                    arrowType === type
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium'
                      : isDarkMode
                      ? 'bg-white/10 text-white/70 hover:bg-white/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={`Arrow: ${label}`}
                >
                  <span className="text-sm leading-none font-mono">{symbol}</span>
                  <span className="text-[10px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`h-px ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'} my-1`} />

          {/* Line Style Selector */}
          <div className="flex flex-col gap-1.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
              Line Style
            </span>

            {/* Static Styles */}
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                Static
              </span>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { style: 'solid' as const, label: 'Solid', preview: '────' },
                  { style: 'dashed' as const, label: 'Dashed', preview: '─ ─ ─' },
                  { style: 'dotted' as const, label: 'Dotted', preview: '· · · ·' },
                ]).map(({ style, label, preview }) => (
                  <button
                    key={style}
                    onClick={() => setLineStyle(style)}
                    className={`px-1.5 py-1.5 text-xs rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                      lineStyle === style
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium'
                        : isDarkMode
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={`Line: ${label}`}
                  >
                    <span className="text-xs leading-none font-mono tracking-wider">{preview}</span>
                    <span className="text-[9px]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animated Styles */}
            <div className="flex flex-col gap-1">
              <span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                Animated
              </span>
              <div className="grid grid-cols-3 gap-1">
                {([
                  { style: 'animated-solid' as const, label: 'Solid', preview: '⟿⟿⟿' },
                  { style: 'animated-dashed' as const, label: 'Dashed', preview: '⟿ ⟿' },
                  { style: 'animated-dotted' as const, label: 'Dotted', preview: '⋯⋯⋯' },
                ]).map(({ style, label, preview }) => (
                  <button
                    key={style}
                    onClick={() => setLineStyle(style)}
                    className={`px-1.5 py-1.5 text-xs rounded-lg transition-all flex flex-col items-center gap-0.5 ${
                      lineStyle === style
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium'
                        : isDarkMode
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={`Line: ${label} (Animated)`}
                  >
                    <span className="text-xs leading-none font-mono tracking-wider">{preview}</span>
                    <span className="text-[9px]">{label}</span>
                  </button>
                ))}
              </div>
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

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                isDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-white/90'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Fullscreen</span>
                </>
              )}
            </button>
          </div>
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
