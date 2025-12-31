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
 * Default data for each node type
 */
export const defaultNodeData: Record<string, Record<string, unknown>> = {
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
