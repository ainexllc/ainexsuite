---
name: component-refactor
description: Break down large React components, extract hooks, and improve component architecture. Use when components exceed 300 lines, have too many responsibilities, or need restructuring.
---

# Component Refactoring Guide

## When to Use
- Component exceeds 300 lines
- Component has more than 5-7 useState calls
- Multiple unrelated features in one component
- Prop drilling more than 2 levels deep
- Difficult to test or reason about
- Performance issues from re-renders

## Quick Decision Tree

```
Is component > 300 lines?
├── Yes → Consider splitting
│   ├── Multiple UI sections? → Extract subcomponents
│   ├── Complex state logic? → Extract custom hook
│   └── Shared behavior? → Extract utility function
└── No
    ├── Too many props (>7)? → Use composition or context
    └── Hard to test? → Extract logic to hooks
```

## Refactoring Patterns

### 1. Extract Subcomponents

**Before: Monolithic component**
```tsx
function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  // ... 50 more lines of state and handlers

  return (
    <div>
      {/* Header - 50 lines */}
      <header className="...">
        <h1>Journal</h1>
        <input value={search} onChange={...} />
        <select value={filter} onChange={...}>...</select>
      </header>

      {/* Entry List - 100 lines */}
      <div className="grid">
        {entries.map(entry => (
          <div key={entry.id} className="...">
            {/* 50 lines of entry card markup */}
          </div>
        ))}
      </div>

      {/* Composer - 80 lines */}
      <form onSubmit={...}>
        {/* Complex form markup */}
      </form>
    </div>
  );
}
```

**After: Composed components**
```tsx
function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredEntries = useMemo(() =>
    entries.filter(e => matchesFilter(e, filter, search)),
    [entries, filter, search]
  );

  return (
    <div>
      <JournalHeader
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
      />
      <EntryGrid entries={filteredEntries} />
      <JournalComposer onSubmit={handleSubmit} />
    </div>
  );
}

// components/journal/journal-header.tsx
function JournalHeader({ search, onSearchChange, filter, onFilterChange }) {
  return (
    <header className="...">
      <h1>Journal</h1>
      <SearchInput value={search} onChange={onSearchChange} />
      <FilterSelect value={filter} onChange={onFilterChange} />
    </header>
  );
}

// components/journal/entry-grid.tsx
function EntryGrid({ entries }) {
  return (
    <div className="grid">
      {entries.map(entry => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

### 2. Extract Custom Hooks

**Before: Logic mixed with UI**
```tsx
function WorkflowCanvas() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleNodeDragStart = (nodeId, e) => {
    setIsDragging(true);
    setSelectedNode(nodeId);
    setDragOffset({
      x: e.clientX - nodes.find(n => n.id === nodeId).x,
      y: e.clientY - nodes.find(n => n.id === nodeId).y,
    });
  };

  const handleNodeDrag = (e) => {
    if (!isDragging) return;
    setNodes(nodes.map(n =>
      n.id === selectedNode
        ? { ...n, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
        : n
    ));
  };

  // ... 200 more lines of drag/drop, edge connection, etc.

  return (
    <div onMouseMove={handleNodeDrag}>
      {/* Canvas rendering */}
    </div>
  );
}
```

**After: Logic in hook**
```tsx
// hooks/use-canvas-interactions.ts
function useCanvasInteractions(initialNodes, initialEdges) {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const { isDragging, handlers: dragHandlers } = useNodeDrag(nodes, setNodes);
  const { isConnecting, handlers: connectHandlers } = useEdgeConnect(edges, setEdges);

  return {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    isDragging,
    isConnecting,
    handlers: {
      ...dragHandlers,
      ...connectHandlers,
    },
  };
}

// hooks/use-node-drag.ts
function useNodeDrag(nodes, setNodes) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragState, setDragState] = useState({ nodeId: null, offset: { x: 0, y: 0 } });

  const handleDragStart = useCallback((nodeId, e) => {
    const node = nodes.find(n => n.id === nodeId);
    setIsDragging(true);
    setDragState({
      nodeId,
      offset: { x: e.clientX - node.x, y: e.clientY - node.y },
    });
  }, [nodes]);

  const handleDrag = useCallback((e) => {
    if (!isDragging) return;
    setNodes(prev => prev.map(n =>
      n.id === dragState.nodeId
        ? { ...n, x: e.clientX - dragState.offset.x, y: e.clientY - dragState.offset.y }
        : n
    ));
  }, [isDragging, dragState, setNodes]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragState({ nodeId: null, offset: { x: 0, y: 0 } });
  }, []);

  return {
    isDragging,
    handlers: { handleDragStart, handleDrag, handleDragEnd },
  };
}

// Component is now clean
function WorkflowCanvas({ initialNodes, initialEdges }) {
  const canvas = useCanvasInteractions(initialNodes, initialEdges);

  return (
    <div
      onMouseMove={canvas.handlers.handleDrag}
      onMouseUp={canvas.handlers.handleDragEnd}
    >
      {canvas.nodes.map(node => (
        <CanvasNode
          key={node.id}
          node={node}
          isSelected={node.id === canvas.selectedNode}
          onDragStart={canvas.handlers.handleDragStart}
          onClick={() => canvas.setSelectedNode(node.id)}
        />
      ))}
    </div>
  );
}
```

### 3. Compound Components Pattern

**Before: Prop explosion**
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Entry"
  showCloseButton={true}
  footer={<Button onClick={save}>Save</Button>}
  headerExtra={<Badge>Draft</Badge>}
  size="large"
  // ... 10 more props
>
  {content}
</Modal>
```

**After: Compound components**
```tsx
<Modal isOpen={isOpen} onClose={onClose} size="large">
  <Modal.Header>
    <Modal.Title>Edit Entry</Modal.Title>
    <Badge>Draft</Badge>
    <Modal.CloseButton />
  </Modal.Header>
  <Modal.Body>
    {content}
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={save}>Save</Button>
  </Modal.Footer>
</Modal>
```

### 4. Render Props / Children as Function

**Before: Complex conditional rendering**
```tsx
function DataLoader({ url, render }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { /* fetch logic */ }, [url]);

  if (loading) return <Spinner />;
  if (error) return <ErrorDisplay error={error} />;
  return render(data);
}

// Usage is inflexible
<DataLoader url="/api/data" render={(data) => <DataView data={data} />} />
```

**After: Flexible children pattern**
```tsx
function DataLoader({ url, children }) {
  const { data, loading, error, refetch } = useFetch(url);

  return children({ data, loading, error, refetch });
}

// Usage is flexible
<DataLoader url="/api/data">
  {({ data, loading, error, refetch }) => (
    <>
      {loading && <Spinner />}
      {error && <ErrorBanner error={error} onRetry={refetch} />}
      {data && <DataView data={data} />}
    </>
  )}
</DataLoader>
```

## File Organization

```
components/
├── journal/
│   ├── index.ts              # Exports
│   ├── journal-page.tsx      # Main container
│   ├── journal-header.tsx    # Header subcomponent
│   ├── journal-composer.tsx  # Composer subcomponent
│   ├── entry-grid.tsx        # List/grid view
│   └── entry-card.tsx        # Single entry card
│
├── workflow/
│   ├── index.ts
│   ├── workflow-canvas.tsx   # Main canvas
│   ├── canvas-node.tsx       # Single node
│   ├── canvas-edge.tsx       # Connection line
│   └── node-types/           # Node type components
│       ├── rectangle-node.tsx
│       ├── diamond-node.tsx
│       └── index.ts
```

## Refactoring Checklist

- [ ] Identify the primary responsibility
- [ ] Extract unrelated UI into subcomponents
- [ ] Extract complex state logic into custom hooks
- [ ] Move shared utilities to lib/utils
- [ ] Update imports to use index exports
- [ ] Add/update tests for extracted pieces
- [ ] Verify no regression in functionality

## Warning Signs

| Smell | Solution |
|-------|----------|
| File > 500 lines | Split into multiple components |
| > 7 useState calls | Extract to custom hook |
| > 7 props | Use composition or context |
| Deeply nested JSX | Extract subcomponents |
| Duplicated logic | Extract to shared hook |
| Hard to name component | It's doing too much |

## See Also
- [patterns.md](patterns.md) - More refactoring patterns
- [checklist.md](checklist.md) - Pre-refactor checklist
