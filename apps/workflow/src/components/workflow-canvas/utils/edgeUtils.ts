import { MarkerType, Edge, Node } from '@xyflow/react';

export type LineStyleType = 'solid' | 'dashed' | 'dotted' | 'animated-solid' | 'animated-dashed' | 'animated-dotted';
export type ArrowType = 'none' | 'end' | 'start' | 'both';
export type EdgeStyleType = 'default' | 'straight' | 'step' | 'smoothstep';

/**
 * Get marker configuration based on arrow direction
 */
export function getMarkerConfig(direction: ArrowType, color: string) {
  const markerConfig = {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color,
  };

  return {
    markerEnd: (direction === 'end' || direction === 'both') ? markerConfig : undefined,
    markerStart: (direction === 'start' || direction === 'both') ? markerConfig : undefined,
  };
}

/**
 * Get stroke dash array based on line style
 */
export function getStrokeDashArray(style: LineStyleType): string | undefined {
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
}

/**
 * Check if line style should be animated
 */
export function isAnimatedStyle(style: LineStyleType): boolean {
  return style.startsWith('animated-');
}

/**
 * Validates edges to ensure source and target nodes exist.
 * Filters out any orphaned edges that reference non-existent nodes.
 */
export function validateEdges(edges: Edge[], nodes: Node[]) {
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
}

/**
 * Create edge style object
 */
export function createEdgeStyle(
  color: string,
  lineStyle: LineStyleType
): React.CSSProperties {
  return {
    stroke: color,
    strokeWidth: 2,
    strokeDasharray: getStrokeDashArray(lineStyle),
  };
}

/**
 * Firestore does not allow undefined values, so we serialize and parse objects
 * before saving to strip any `undefined` keys React Flow may add.
 */
export function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
