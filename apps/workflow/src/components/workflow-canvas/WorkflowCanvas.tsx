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
  EdgeLabelRenderer,
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
import SwimlaneNode from './nodes/SwimlaneNode';
import SubprocessNode from './nodes/SubprocessNode';
import StickyNoteNode from './nodes/StickyNoteNode';
import IconNode from './nodes/IconNode';
import DatabaseNode from './nodes/DatabaseNode';
import DocumentsNode from './nodes/DocumentsNode';
import { SmartEdge } from './edges/SmartEdge';
import { ShapePalette } from './ShapePalette';
import { ConfirmationModal } from './ConfirmationModal';
import { useUndoRedo } from './hooks/useUndoRedo';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from '@/contexts/ThemeContext';

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

/**
 * Firestore does not allow undefined values, so we serialize and parse objects
 * before saving to strip any `undefined` keys React Flow may add.
 */
const sanitizeForFirestore = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

const paletteNodeTypes = [
  'rectangle',
  'diamond',
  'oval',
  'parallelogram',
  'swimlane',
  'subprocess',
  'sticky-note',
  'icon',
  'database',
  'documents',
] as const;

const defaultNodeData: Record<string, Record<string, unknown>> = {
  rectangle: { label: 'Process' },
  diamond: { label: 'Decision?' },
  oval: { label: 'Start' },
  parallelogram: { label: 'Input' },
  swimlane: { label: 'Swimlane', orientation: 'horizontal', lanes: 3 },
  subprocess: { label: 'Subprocess', detail: 'Describe the nested flow...' },
  'sticky-note': { label: 'Quick note...' },
  icon: { label: 'Service', emoji: '🧩' },
  database: { label: 'Database' },
  documents: { label: 'Documents' },
};

const formatNodeTypeLabel = (type?: string) => {
  if (!type) return 'Unknown';
  return type
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const getNodeDimensions = (nodeType: string) => {
  switch (nodeType) {
    case 'diamond':
      return { width: 140, height: 140 };
    case 'oval':
      return { width: 120, height: 120 };
    case 'swimlane':
      return { width: 320, height: 220 };
    case 'subprocess':
      return { width: 220, height: 140 };
    case 'sticky-note':
      return { width: 180, height: 140 };
    case 'icon':
      return { width: 160, height: 160 };
    case 'database':
      return { width: 180, height: 180 };
    case 'documents':
      return { width: 200, height: 140 };
    default:
      return { width: 160, height: 80 };
  }
};

function WorkflowCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);
  const getId = useCallback(() => `node_${nodeIdCounter.current++}`, []);
  const edgeIdCounter = useRef(0);
  const getEdgeId = useCallback(() => `edge_${edgeIdCounter.current++}`, []);
  const [nodes, setNodesState, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdgesState, onEdgesChange] = useEdgesState<Edge>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [edgeType, setEdgeType] = useState<'default' | 'straight' | 'step' | 'smoothstep'>('smoothstep');
  const [arrowType, setArrowType] = useState<'none' | 'end' | 'start' | 'both'>('end');
  const [lineStyle, setLineStyle] = useState<'solid' | 'dashed' | 'dotted' | 'animated-solid' | 'animated-dashed' | 'animated-dotted'>('solid');
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [editingEdge, setEditingEdge] = useState<string | null>(null);
  const { user } = useAuth();
  const { theme } = useTheme();
  const prevThemeIdRef = useRef(theme.id);

  // Track if we have selected edges
  const hasSelectedEdges = useMemo(() => edges.some(e => e.selected), [edges]);

  // Get selected node color
  const selectedNodeColor = useMemo(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length === 0) return null;

    // If all selected nodes have the same color, return it
    const firstColor = (selectedNodes[0].data as { color?: string }).color || theme.primary;
    const allSameColor = selectedNodes.every((n) => ((n.data as { color?: string }).color || theme.primary) === firstColor);

    return allSameColor ? firstColor : null;
  }, [nodes, theme.primary]);

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

  // Helper to get marker config based on arrow direction
  const getMarkerConfig = useCallback((direction: 'end' | 'start' | 'both' | 'none') => {
    const markerConfig = {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: theme.primary,
    };

    // Always return both properties, set to undefined if not needed
    // This ensures old markers are removed when changing direction
    return {
      markerEnd: (direction === 'end' || direction === 'both') ? markerConfig : undefined,
      markerStart: (direction === 'start' || direction === 'both') ? markerConfig : undefined,
    };
  }, [theme.primary]);

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

  const edgeTypes = useMemo(
    () => ({
      smart: SmartEdge,
    }),
    []
  );

  // Stable default edge options with proper marker configuration
  const defaultEdgeOptions = useMemo(
    () => ({
      type: edgeType as Edge['type'],
      animated: isAnimatedStyle(lineStyle), // Animate based on style prefix
      style: {
        stroke: theme.primary,
        strokeWidth: 2,
        strokeDasharray: getStrokeDashArray(lineStyle),
      },
      ...getMarkerConfig(arrowType),
    }),
    [theme.primary, edgeType, arrowType, lineStyle, getMarkerConfig, getStrokeDashArray, isAnimatedStyle]
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

          // Restore edge type, arrow type, and line style preferences
          if (data.edgeType) {
            setEdgeType(data.edgeType);
          }
          if (data.arrowType) {
            setArrowType(data.arrowType);
          }
          if (data.lineStyle) {
            setLineStyle(data.lineStyle);
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

            // Use saved preferences or defaults
            const savedArrowType = data.arrowType || 'end';
            const savedLineStyle = data.lineStyle || 'solid';

            // Apply current theme color, arrow markers, and line style to valid edges
            const edgesWithTheme = validEdges.map((edge: Edge) => ({
              ...edge,
              animated: isAnimatedStyle(savedLineStyle),
              style: {
                ...edge.style,
                stroke: theme.primary,
                strokeWidth: 2,
                strokeDasharray: getStrokeDashArray(savedLineStyle),
              },
              ...getMarkerConfig(savedArrowType),
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

  // Update edges when theme, edge type, arrow type, or line style changes
  useEffect(() => {
    // Only update if theme actually changed (not on initial render)
    if (prevThemeIdRef.current !== theme.id) {
      prevThemeIdRef.current = theme.id;
    }

    // If there are selected edges, only update those
    // Otherwise update all edges
    setEdgesState((eds) =>
      eds.map((edge) => {
        // Skip non-selected edges if there are selected edges and we're not changing theme
        const shouldUpdate = !hasSelectedEdges || edge.selected || prevThemeIdRef.current !== theme.id;

        if (!shouldUpdate) {
          return edge;
        }

        return {
          ...edge,
          type: edgeType as Edge['type'],
          animated: isAnimatedStyle(lineStyle),
          style: {
            stroke: theme.primary,
            strokeWidth: 2,
            strokeDasharray: getStrokeDashArray(lineStyle),
          },
          ...getMarkerConfig(arrowType),
        };
      })
    );
  }, [theme.id, theme.primary, edgeType, arrowType, lineStyle, hasSelectedEdges, setEdgesState, getMarkerConfig, getStrokeDashArray, isAnimatedStyle]); // Run when any edge style changes

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
  // Includes viewport (zoom level and position)
  useEffect(() => {
    if (!user || !reactFlowInstance) return;

    const timeoutId = setTimeout(async () => {
      try {
        const viewport = reactFlowInstance.getViewport();
        const workflowRef = doc(db, 'workflows', user.uid);

        const payload = sanitizeForFirestore({
          nodes,
          edges,
          viewport,
          edgeType,
          arrowType,
          lineStyle,
          updatedAt: new Date().toISOString(),
        });

        await setDoc(workflowRef, payload, { merge: true });
      } catch (error) {
        console.error('Error saving workflow:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, user, reactFlowInstance, edgeType, arrowType, lineStyle]);

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
    setShowClearModal(true);
  }, [nodes.length, edges.length]);

  const confirmClearCanvas = useCallback(() => {
    takeSnapshot();
    setNodesState([]);
    setEdgesState([]);
  }, [setNodesState, setEdgesState, takeSnapshot]);

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

  // Handle node color change
  const handleNodeColorChange = useCallback((color: string) => {
    takeSnapshot();
    setNodesState((nds) =>
      nds.map((node) => {
        if (node.selected) {
          return {
            ...node,
            data: {
              ...node.data,
              color,
            },
          };
        }
        return node;
      })
    );
  }, [setNodesState, takeSnapshot]);

  const handleNodeBgColorChange = useCallback((bgColor: string) => {
    takeSnapshot();
    setNodesState((nds) =>
      nds.map((node) => {
        if (node.selected) {
          return {
            ...node,
            data: {
              ...node.data,
              bgColor,
            },
          };
        }
        return node;
      })
    );
  }, [setNodesState, takeSnapshot]);

  // Alignment functions
  const handleAlignNodes = useCallback((alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length < 2) return;

    takeSnapshot();

    if (alignment === 'left') {
      const minX = Math.min(...selectedNodes.map((n) => n.position.x));
      setNodesState((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, x: minX } };
          }
          return node;
        })
      );
    } else if (alignment === 'right') {
      const maxX = Math.max(...selectedNodes.map((n) => n.position.x + (n.width || 0)));
      setNodesState((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, x: maxX - (node.width || 0) } };
          }
          return node;
        })
      );
    } else if (alignment === 'top') {
      const minY = Math.min(...selectedNodes.map((n) => n.position.y));
      setNodesState((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, y: minY } };
          }
          return node;
        })
      );
    } else if (alignment === 'bottom') {
      const maxY = Math.max(...selectedNodes.map((n) => n.position.y + (n.height || 0)));
      setNodesState((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, y: maxY - (node.height || 0) } };
          }
          return node;
        })
      );
    } else if (alignment === 'center-h') {
      const centerX = selectedNodes.reduce((sum, n) => sum + n.position.x + (n.width || 0) / 2, 0) / selectedNodes.length;
      setNodesState((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, x: centerX - (node.width || 0) / 2 } };
          }
          return node;
        })
      );
    } else if (alignment === 'center-v') {
      const centerY = selectedNodes.reduce((sum, n) => sum + n.position.y + (n.height || 0) / 2, 0) / selectedNodes.length;
      setNodesState((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, y: centerY - (node.height || 0) / 2 } };
          }
          return node;
        })
      );
    }
  }, [nodes, setNodesState, takeSnapshot]);

  // Distribute nodes evenly
  const handleDistributeNodes = useCallback((direction: 'horizontal' | 'vertical') => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length < 3) return;

    takeSnapshot();

    if (direction === 'horizontal') {
      // Sort nodes by X position
      const sortedNodes = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
      const minX = sortedNodes[0].position.x;
      const maxX = sortedNodes[sortedNodes.length - 1].position.x + (sortedNodes[sortedNodes.length - 1].width || 0);
      const totalSpace = maxX - minX;
      const totalNodeWidth = sortedNodes.reduce((sum, n) => sum + (n.width || 0), 0);
      const gap = (totalSpace - totalNodeWidth) / (sortedNodes.length - 1);

      let currentX = minX;
      const nodePositions = new Map();
      sortedNodes.forEach((node) => {
        nodePositions.set(node.id, currentX);
        currentX += (node.width || 0) + gap;
      });

      setNodesState((nds) =>
        nds.map((node) => {
          const newX = nodePositions.get(node.id);
          if (newX !== undefined) {
            return { ...node, position: { ...node.position, x: newX } };
          }
          return node;
        })
      );
    } else {
      // Sort nodes by Y position
      const sortedNodes = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
      const minY = sortedNodes[0].position.y;
      const maxY = sortedNodes[sortedNodes.length - 1].position.y + (sortedNodes[sortedNodes.length - 1].height || 0);
      const totalSpace = maxY - minY;
      const totalNodeHeight = sortedNodes.reduce((sum, n) => sum + (n.height || 0), 0);
      const gap = (totalSpace - totalNodeHeight) / (sortedNodes.length - 1);

      let currentY = minY;
      const nodePositions = new Map();
      sortedNodes.forEach((node) => {
        nodePositions.set(node.id, currentY);
        currentY += (node.height || 0) + gap;
      });

      setNodesState((nds) =>
        nds.map((node) => {
          const newY = nodePositions.get(node.id);
          if (newY !== undefined) {
            return { ...node, position: { ...node.position, y: newY } };
          }
          return node;
        })
      );
    }
  }, [nodes, setNodesState, takeSnapshot]);

  // Handle edge label update
  const handleEdgeLabelChange = useCallback((edgeId: string, label: string) => {
    setEdgesState((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            label,
            data: {
              ...edge.data,
              label,
            },
          };
        }
        return edge;
      })
    );
  }, [setEdgesState]);

  // Handle edge double click to start editing
  const handleEdgeDoubleClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setEditingEdge(edge.id);
  }, []);

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

      if (!params.source || !params.target) {
        // eslint-disable-next-line no-console
        console.error('❌ CONNECTION BLOCKED - Missing source or target');
        return;
      }

      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      if (!sourceNode || !targetNode) {
        // eslint-disable-next-line no-console
        console.error('❌ CONNECTION BLOCKED - Source or target node missing in state');
        return;
      }

      const strokeDasharray = getStrokeDashArray(lineStyle);
      const markerConfig = getMarkerConfig(arrowType);
      const animated = isAnimatedStyle(lineStyle);

      setEdgesState((eds) => {
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
          return eds;
        }

        const newEdges = addEdge(params, eds).map((edge) => ({
          ...edge,
          type: edgeType as Edge['type'],
          animated,
          style: {
            stroke: theme.primary,
            strokeWidth: 2,
            strokeDasharray,
          },
          ...markerConfig,
        }));

        // eslint-disable-next-line no-console
        console.log('✅ NEW EDGE CREATED');
        takeSnapshot();
        return newEdges;
      });
    },
    [
      nodes,
      setEdgesState,
      takeSnapshot,
      edgeType,
      lineStyle,
      theme.primary,
      getMarkerConfig,
      getStrokeDashArray,
      isAnimatedStyle,
      arrowType,
    ]
  );

  // Click on edge to select it (not delete)
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      // Select the clicked edge, deselect all others
      setEdgesState((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id,
        }))
      );
      // Deselect all nodes when clicking an edge
      setNodesState((nds) =>
        nds.map((n) => ({
          ...n,
          selected: false,
        }))
      );
    },
    [setEdgesState, setNodesState]
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

      // Only handle drops for supported node types
      if (!(paletteNodeTypes as readonly string[]).includes(type)) {
        return;
      }

      // Use screenToFlowPosition instead of deprecated project method
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

      // Take snapshot before adding new node
      takeSnapshot();
      setNodesState((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodesState, takeSnapshot, getId]
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
          onEdgeDoubleClick={handleEdgeDoubleClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          snapToGrid={snapToGrid}
          snapGrid={[20, 20]}
          fitView
          deleteKeyCode="Delete"
          multiSelectionKeyCode="Shift"
          selectionOnDrag={true}
          panOnDrag={[1, 2]}
          selectionMode="partial"
          attributionPosition="bottom-left"
          connectOnClick={true}
          elevateEdgesOnSelect={true}
          edgesReconnectable={true}
          edgeTypes={edgeTypes}
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

          {/* Edge Label Editor */}
          <EdgeLabelRenderer>
            {edges.map((edge) => {
              if (editingEdge === edge.id) {
                // Calculate label position at edge midpoint
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const sourceX = sourceNode.position.x + (sourceNode.width || 0) / 2;
                const sourceY = sourceNode.position.y + (sourceNode.height || 0) / 2;
                const targetX = targetNode.position.x + (targetNode.width || 0) / 2;
                const targetY = targetNode.position.y + (targetNode.height || 0) / 2;

                const labelX = (sourceX + targetX) / 2;
                const labelY = (sourceY + targetY) / 2;

                return (
                  <div
                    key={edge.id}
                    style={{
                      position: 'absolute',
                      transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                      pointerEvents: 'all',
                    }}
                  >
                    <input
                      autoFocus
                      type="text"
                      defaultValue={(edge.label as string) || ''}
                      onBlur={(e) => {
                        handleEdgeLabelChange(edge.id, e.target.value);
                        setEditingEdge(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEdgeLabelChange(edge.id, e.currentTarget.value);
                          setEditingEdge(null);
                        } else if (e.key === 'Escape') {
                          setEditingEdge(null);
                        }
                      }}
                      className="nodrag nopan px-2 py-1 text-xs rounded border-2 outline-none"
                      style={{
                        backgroundColor: 'rgba(10, 10, 10, 0.95)',
                        borderColor: theme.primary,
                        color: '#fff',
                        minWidth: '100px',
                      }}
                      placeholder="Label..."
                    />
                  </div>
                );
              }

              // Show non-editable label if it exists
              if (edge.label) {
                const sourceNode = nodes.find((n) => n.id === edge.source);
                const targetNode = nodes.find((n) => n.id === edge.target);

                if (!sourceNode || !targetNode) return null;

                const sourceX = sourceNode.position.x + (sourceNode.width || 0) / 2;
                const sourceY = sourceNode.position.y + (sourceNode.height || 0) / 2;
                const targetX = targetNode.position.x + (targetNode.width || 0) / 2;
                const targetY = targetNode.position.y + (targetNode.height || 0) / 2;

                const labelX = (sourceX + targetX) / 2;
                const labelY = (sourceY + targetY) / 2;

                return (
                  <div
                    key={edge.id}
                    style={{
                      position: 'absolute',
                      transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                      pointerEvents: 'all',
                      padding: '4px 8px',
                      backgroundColor: 'rgba(10, 10, 10, 0.85)',
                      border: `1px solid rgba(${theme.primaryRgb}, 0.3)`,
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                    onDoubleClick={() => setEditingEdge(edge.id)}
                  >
                    {edge.label as string}
                  </div>
                );
              }

              return null;
            })}
          </EdgeLabelRenderer>
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center max-w-md animate-fade-in">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-white mb-2">Start Designing</h3>
              <p className="text-white/60 mb-4">
                Drag shapes from the palette on the left to begin mapping your workflow.
              </p>
              <div className="flex justify-center gap-4 text-xs text-white/40">
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Del</kbd> to remove</span>
                <span className="flex items-center gap-1"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">⌘Z</kbd> to undo</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Canvas Confirmation Modal */}
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

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
