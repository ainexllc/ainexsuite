import { Edge, Node, EdgeLabelRenderer } from '@xyflow/react';

interface EdgeLabelOverlayProps {
  edges: Edge[];
  nodes: Node[];
  editingEdge: string | null;
  setEditingEdge: (edgeId: string | null) => void;
  onLabelChange: (edgeId: string, label: string) => void;
  themePrimary: string;
  themePrimaryRgb: string;
}

/**
 * Renders edge labels with inline editing capability
 */
export function EdgeLabelOverlay({
  edges,
  nodes,
  editingEdge,
  setEditingEdge,
  onLabelChange,
  themePrimary,
  themePrimaryRgb,
}: EdgeLabelOverlayProps) {
  return (
    <EdgeLabelRenderer>
      {edges.map((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (!sourceNode || !targetNode) return null;

        const sourceX = sourceNode.position.x + (sourceNode.width || 0) / 2;
        const sourceY = sourceNode.position.y + (sourceNode.height || 0) / 2;
        const targetX = targetNode.position.x + (targetNode.width || 0) / 2;
        const targetY = targetNode.position.y + (targetNode.height || 0) / 2;

        const labelX = (sourceX + targetX) / 2;
        const labelY = (sourceY + targetY) / 2;

        if (editingEdge === edge.id) {
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
                  onLabelChange(edge.id, e.target.value);
                  setEditingEdge(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onLabelChange(edge.id, e.currentTarget.value);
                    setEditingEdge(null);
                  } else if (e.key === 'Escape') {
                    setEditingEdge(null);
                  }
                }}
                className="nodrag nopan px-2 py-1 text-xs rounded border-2 outline-none"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.95)',
                  borderColor: themePrimary,
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
          return (
            <div
              key={edge.id}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
                padding: '4px 8px',
                backgroundColor: 'rgba(10, 10, 10, 0.85)',
                border: `1px solid rgba(${themePrimaryRgb}, 0.3)`,
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
  );
}
