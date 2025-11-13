# React Flow Expert Skill

**Purpose**: Diagnose and fix React Flow (@xyflow/react v12+) issues across projects
**Icon**: 🔄
**Color**: Cyan (#06b6d4)
**Applies To**: workflow app, projects app, any React Flow implementation

## Expert Knowledge Base

### Package Information
- **Current Package**: `@xyflow/react` (v11 was `reactflow`)
- **Version**: 12.9.2+
- **Docs**: https://reactflow.dev/learn
- **Migration Guide**: https://reactflow.dev/learn/troubleshooting/migrate-to-v12

### Core Imports (v12)
```typescript
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Connection,
  NodeTypes,
  MarkerType,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import '@xyflow/react/dist/base.css';
```

## Common Issues & Fixes

### 1. Connections Not Working

**Symptoms:**
- Can drag from handles but edges don't persist
- `onConnect` not firing
- Edges appear briefly then disappear

**Diagnosis Checklist:**
- [ ] Check all imports are from `@xyflow/react` (not `reactflow`)
- [ ] Verify `onConnect` is properly wired to `setEdges`
- [ ] Ensure `useCallback` is used for `onConnect`
- [ ] Check CSS imports are correct
- [ ] Verify Handle components have proper `type` prop
- [ ] Check if multiple handles have unique `id` props

**Fix Template:**
```typescript
const onConnect = useCallback(
  (params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  },
  [setEdges]
);

<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  // ... other props
/>
```

### 2. Custom Node Handle Configuration

**Correct Handle Setup:**
```typescript
import { Handle, Position } from '@xyflow/react';

export function CustomNode({ data }: NodeProps) {
  return (
    <div>
      {/* Target handles - can receive connections */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          border: '3px solid #0a0a0a',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #3b82f6, 0 0 8px #3b82f6',
          zIndex: 10,
        }}
      />

      {/* Source handles - can create connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          border: '3px solid #0a0a0a',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #3b82f6, 0 0 8px #3b82f6',
          zIndex: 10,
        }}
      />

      <div>{data.label}</div>
    </div>
  );
}
```

**Key Rules:**
- Use `type="target"` for input handles (can receive connections)
- Use `type="source"` for output handles (can create connections)
- Multiple handles of same type need unique `id` props
- Position must be one of: `Position.Top`, `Position.Right`, `Position.Bottom`, `Position.Left`
- Never use `display: none` on handles (use `visibility: hidden` or `opacity: 0`)

### 3. State Management Pattern

**Correct Setup:**
```typescript
function MyFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
    />
  );
}
```

**Important:**
- Always use `useNodesState` and `useEdgesState` hooks
- Wrap handlers in `useCallback` to prevent re-render loops
- Use `addEdge` helper function for adding edges
- Pass `onNodesChange` and `onEdgesChange` for proper interaction

### 4. Edge Configuration

**Default Edge Options:**
```typescript
<ReactFlow
  defaultEdgeOptions={{
    type: 'smoothstep', // 'default' | 'straight' | 'step' | 'smoothstep'
    animated: true,
    style: { stroke: '#06b6d4', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
  }}
/>
```

**Edge Types:**
- `default` - Bezier curve
- `straight` - Straight line
- `step` - Step line (90-degree angles)
- `smoothstep` - Smooth step line (rounded corners)

### 5. ReactFlow Provider

**When to use:**
```typescript
// Needed when using useReactFlow hook in child components
export function App() {
  return (
    <ReactFlowProvider>
      <MyFlow />
    </ReactFlowProvider>
  );
}

function MyFlow() {
  const reactFlowInstance = useReactFlow();
  // Now you can use: fitView(), zoomIn(), zoomOut(), etc.
  return <ReactFlow {...props} />;
}
```

## Diagnostic Commands

### Check Package Versions
```bash
# Check installed version
pnpm list @xyflow/react

# Check for mixed packages (should return empty)
pnpm list reactflow
```

### Find Mixed Imports
```bash
# Search for old package imports (should be none)
grep -r "from 'reactflow'" --include="*.tsx" --include="*.ts" .
grep -r "from \"reactflow\"" --include="*.tsx" --include="*.ts" .
```

### Verify CSS Imports
```bash
# Search for correct CSS imports
grep -r "@xyflow/react/dist/style.css" --include="*.tsx" --include="*.ts" --include="*.css" .
```

## Migration from v11 to v12

### Breaking Changes Checklist
- [ ] Update package: `reactflow` → `@xyflow/react`
- [ ] Update imports: `import { ReactFlow } from 'reactflow'` → `import { ReactFlow } from '@xyflow/react'`
- [ ] Update CSS: `reactflow/dist/style.css` → `@xyflow/react/dist/style.css`
- [ ] Rename: `onEdgeUpdate` → `onReconnect`
- [ ] Rename: `edgesUpdatable` → `edgesReconnectable`
- [ ] Remove: `edgesFocusable` prop (no longer exists)
- [ ] Update: `reactFlowInstance.project()` → `reactFlowInstance.screenToFlowPosition()`

### Migration Script
```bash
# 1. Update package
pnpm remove reactflow
pnpm add @xyflow/react@^12.9.2

# 2. Update imports (find and replace)
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/from 'reactflow'/from '@xyflow\/react'/g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's/from "reactflow"/from "@xyflow\/react"/g'

# 3. Update CSS imports
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/reactflow\/dist\/style.css/@xyflow\/react\/dist\/style.css/g"
find . -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s/reactflow\/dist\/base.css/@xyflow\/react\/dist\/base.css/g"
```

## Performance Best Practices

### 1. Memoize Node Types
```typescript
const nodeTypes: NodeTypes = useMemo(
  () => ({
    custom: CustomNode,
    rectangle: RectangleNode,
  }),
  []
);
```

### 2. Optimize Edge Updates
```typescript
// Use setEdges callback form for updates based on previous state
setEdges((eds) => eds.map((edge) =>
  edge.id === targetId ? { ...edge, animated: true } : edge
));
```

### 3. Debounce Snapshots (for undo/redo)
```typescript
const takeSnapshot = useCallback(() => {
  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }

  debounceTimerRef.current = setTimeout(() => {
    // Save snapshot
  }, 500);
}, [nodes, edges]);
```

## Common Patterns

### Pattern 1: Undo/Redo System
```typescript
function useUndoRedo(nodes, edges, setNodes, setEdges) {
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  const takeSnapshot = useCallback(() => {
    const snapshot = { nodes: [...nodes], edges: [...edges] };
    setPast((prev) => [...prev, snapshot]);
    setFuture([]);
  }, [nodes, edges]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const current = { nodes, edges };

    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [current, ...prev]);
    setNodes(previous.nodes);
    setEdges(previous.edges);
  }, [past, nodes, edges]);

  // ... redo implementation

  return { undo, redo, takeSnapshot };
}
```

### Pattern 2: Save/Load from Database
```typescript
// Save (strip functions before saving)
const saveFlow = useCallback(async () => {
  const nodesToSave = nodes.map((node) => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      // Only save serializable data
      label: node.data.label,
      color: node.data.color,
    },
  }));

  await saveToDatabase({ nodes: nodesToSave, edges });
}, [nodes, edges]);

// Load (restore callbacks)
const loadFlow = useCallback(async () => {
  const { nodes: loadedNodes, edges: loadedEdges } = await loadFromDatabase();

  const nodesWithCallbacks = loadedNodes.map((node) => ({
    ...node,
    data: {
      ...node.data,
      onDelete: () => deleteNode(node.id),
      onChange: (value) => updateNode(node.id, value),
    },
  }));

  setNodes(nodesWithCallbacks);
  setEdges(loadedEdges);
}, []);
```

### Pattern 3: Dynamic Handles
```typescript
import { useUpdateNodeInternals } from '@xyflow/react';

function CustomNode({ id, data }) {
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    // After changing handles, update internals
    updateNodeInternals(id);
  }, [data.handleCount, id, updateNodeInternals]);

  return (
    <div>
      {Array.from({ length: data.handleCount }).map((_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Right}
          id={`output-${i}`}
          style={{ top: `${(i + 1) * 20}px` }}
        />
      ))}
    </div>
  );
}
```

## Troubleshooting Guide

### Issue: "No node id found" Error
**Cause**: Mixing `reactflow` and `@xyflow/react` packages
**Fix**: Ensure all imports come from `@xyflow/react`

### Issue: Edges Not Visible
**Cause**: Missing CSS import
**Fix**: Add `import '@xyflow/react/dist/style.css';`

### Issue: onConnect Not Firing
**Cause**: Missing `onConnect` prop or incorrect signature
**Fix**: Add `onConnect={(params) => setEdges((eds) => addEdge(params, eds))}`

### Issue: Infinite Re-render Loop
**Cause**: Not using `useCallback` for handlers
**Fix**: Wrap all event handlers in `useCallback`

### Issue: Handles Not Connectable
**Cause**: Incorrect `type` prop or missing Position import
**Fix**: Use `type="source"` or `type="target"` with `Position` enum

### Issue: Connection Line Not Showing During Drag
**Cause**: Missing `connectionLineStyle` or wrong color
**Fix**: Add `connectionLineStyle={{ stroke: '#06b6d4', strokeWidth: 2 }}`

## Skill Usage

When you invoke this skill, I will:
1. Analyze your React Flow implementation
2. Check for common issues (imports, handlers, state management)
3. Verify handle configurations in custom nodes
4. Test edge creation and persistence
5. Provide specific fixes for your codebase
6. Apply best practices from React Flow documentation

## Quick Reference

### Essential Props
```typescript
<ReactFlow
  nodes={nodes}                    // Required
  edges={edges}                    // Required
  onNodesChange={onNodesChange}    // Required for interaction
  onEdgesChange={onEdgesChange}    // Required for interaction
  onConnect={onConnect}            // Required for connections
  nodeTypes={nodeTypes}            // For custom nodes
  defaultEdgeOptions={{...}}       // Edge styling
  fitView                          // Auto-fit on mount
  elevateEdgesOnSelect             // Bring selected edges to front
/>
```

### Essential Hooks
- `useNodesState()` - Manage nodes with built-in handlers
- `useEdgesState()` - Manage edges with built-in handlers
- `useReactFlow()` - Access flow instance (fitView, zoomIn, etc.)
- `useUpdateNodeInternals()` - Update node after handle changes
- `useHandleConnections()` - Listen to handle connections (v12+)
- `useConnection()` - Get current connection state during drag (v12+)

### Essential Functions
- `addEdge(connection, edges)` - Add new edge to edges array
- `applyNodeChanges(changes, nodes)` - Apply node changes
- `applyEdgeChanges(changes, edges)` - Apply edge changes
- `getConnectedEdges(nodes, edges)` - Get edges connected to nodes

---

**Last Updated**: 2025-11-13
**React Flow Version**: 12.9.2
**Skill Version**: 1.0.0
