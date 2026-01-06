/**
 * Node type definitions for the palette
 */
export const paletteNodeTypes = [
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

export type PaletteNodeType = typeof paletteNodeTypes[number];

/**
 * Default solid background color for nodes
 * Users can change to transparent later via the bgColor picker
 */
export const DEFAULT_NODE_BG_COLOR = '#1a1a1a';
export const DEFAULT_NODE_BG_COLOR_LIGHT = '#f5f5f5';

/**
 * Default data for each node type
 */
export const defaultNodeData: Record<string, Record<string, unknown>> = {
  rectangle: { label: 'Process', bgColor: DEFAULT_NODE_BG_COLOR },
  diamond: { label: 'Decision?', bgColor: DEFAULT_NODE_BG_COLOR },
  oval: { label: 'Start', bgColor: DEFAULT_NODE_BG_COLOR },
  parallelogram: { label: 'Input', bgColor: DEFAULT_NODE_BG_COLOR },
  swimlane: { label: 'Swimlane', orientation: 'horizontal', lanes: 3, bgColor: DEFAULT_NODE_BG_COLOR },
  subprocess: { label: 'Subprocess', detail: 'Describe the nested flow...', bgColor: DEFAULT_NODE_BG_COLOR },
  'sticky-note': { label: 'Quick note...', bgColor: '#fef3c7' }, // Amber tint for sticky notes
  icon: { label: 'Service', emoji: '🧩', bgColor: DEFAULT_NODE_BG_COLOR },
  database: { label: 'Database', bgColor: DEFAULT_NODE_BG_COLOR },
  documents: { label: 'Documents', bgColor: DEFAULT_NODE_BG_COLOR },
};

/**
 * Get default dimensions for each node type
 */
export function getNodeDimensions(nodeType: string): { width: number; height: number } {
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
}
