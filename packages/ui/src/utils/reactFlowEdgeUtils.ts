/**
 * React Flow Edge Validation and Cleanup Utilities
 *
 * Provides reusable functions for edge validation, cleanup, and debugging
 * that can be shared across multiple apps using React Flow.
 *
 * @module reactFlowEdgeUtils
 */

// Using generic types to avoid hard dependency on @xyflow/react
// This allows the utilities to be used with any React Flow-compatible edge/node structure

/**
 * Generic Edge type - compatible with @xyflow/react Edge
 */
export type GenericEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  [key: string]: unknown;
};

/**
 * Generic Node type - compatible with @xyflow/react Node
 */
export type GenericNode = {
  id: string;
  [key: string]: unknown;
};

/**
 * Result type for edge validation operations
 */
export interface EdgeValidationResult {
  /** Array of valid edges */
  validEdges: GenericEdge[];
  /** Array of orphaned edges that were removed */
  orphanedEdges: GenericEdge[];
  /** Detailed messages about validation issues */
  messages: string[];
}

/**
 * Result type for duplicate edge detection
 */
export interface DuplicateEdgeResult {
  /** Edges with duplicates */
  duplicateEdges: GenericEdge[];
  /** Count of duplicate edges */
  duplicateCount: number;
  /** Messages describing the duplicates */
  messages: string[];
}

/**
 * Validate edges against nodes to ensure referential integrity
 *
 * Filters out edges that reference non-existent nodes (orphaned edges).
 * Logs warnings for each orphaned edge found and returns details about
 * the validation process.
 *
 * @param edges - Array of edges to validate
 * @param nodes - Array of nodes to validate against
 * @returns Object containing valid edges, orphaned edges, and validation messages
 *
 * @example
 * ```typescript
 * const result = validateEdges(edges, nodes);
 * setEdges(result.validEdges);
 * ```
 */
export function validateEdges(edges: GenericEdge[], nodes: GenericNode[]): EdgeValidationResult {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges: GenericEdge[] = [];
  const orphanedEdges: GenericEdge[] = [];
  const messages: string[] = [];

  edges.forEach((edge) => {
    const sourceExists = nodeIds.has(edge.source);
    const targetExists = nodeIds.has(edge.target);

    if (!sourceExists || !targetExists) {
      orphanedEdges.push(edge);
      const missingParts: string[] = [];
      if (!sourceExists) missingParts.push(`source node "${edge.source}" missing`);
      if (!targetExists) missingParts.push(`target node "${edge.target}" missing`);

      const message = `Removing orphaned edge: ${edge.id} (${edge.source} → ${edge.target}): ${missingParts.join(', ')}`;
      messages.push(message);
    } else {
      validEdges.push(edge);
    }
  });

  return { validEdges, orphanedEdges, messages };
}

/**
 * Find orphaned edges that reference non-existent nodes
 *
 * Identifies edges where either the source or target node doesn't exist
 * in the nodes array. Useful for detecting and cleaning up invalid edges.
 *
 * @param edges - Array of edges to check
 * @param nodes - Array of nodes to check against
 * @returns Array of orphaned edges found
 *
 * @example
 * ```typescript
 * const orphaned = findOrphanedEdges(edges, nodes);
 * ```
 */
export function findOrphanedEdges(edges: GenericEdge[], nodes: GenericNode[]): GenericEdge[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  return edges.filter(
    (edge) => !nodeIds.has(edge.source) || !nodeIds.has(edge.target)
  );
}

/**
 * Remove duplicate edges from the edges array
 *
 * A duplicate edge is one that has the same source, target, sourceHandle,
 * and targetHandle as another edge. Keeps the first occurrence and removes
 * subsequent duplicates.
 *
 * @param edges - Array of edges to deduplicate
 * @returns Array of edges with duplicates removed
 *
 * @example
 * ```typescript
 * const uniqueEdges = removeDuplicateEdges(edges);
 * setEdges(uniqueEdges);
 * ```
 */
export function removeDuplicateEdges(edges: GenericEdge[]): GenericEdge[] {
  const seen = new Set<string>();
  const uniqueEdges: GenericEdge[] = [];

  edges.forEach((edge) => {
    const key = `${edge.source}→${edge.target}|${edge.sourceHandle || 'default'}→${edge.targetHandle || 'default'}`;

    if (!seen.has(key)) {
      seen.add(key);
      uniqueEdges.push(edge);
    } else {
      // Logging disabled due to ESLint no-console rule
      // Message: Duplicate edge removed: ${edge.id} (${edge.source} → ${edge.target})
    }
  });

  return uniqueEdges;
}

/**
 * Check if an edge already exists between two nodes
 *
 * Searches for an edge with matching source, target, and optionally
 * sourceHandle and targetHandle. If handles are not provided, checks
 * only source and target matching.
 *
 * @param edges - Array of edges to search
 * @param source - Source node ID
 * @param target - Target node ID
 * @param sourceHandle - Optional source handle ID
 * @param targetHandle - Optional target handle ID
 * @returns true if an edge with these parameters exists, false otherwise
 *
 * @example
 * ```typescript
 * if (!edgeExists(edges, 'node1', 'node2')) {
 *   // Create new edge
 *   const newEdge = { source: 'node1', target: 'node2', ... };
 * }
 * ```
 */
export function edgeExists(
  edges: GenericEdge[],
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string
): boolean {
  return edges.some(
    (edge) =>
      edge.source === source &&
      edge.target === target &&
      edge.sourceHandle === sourceHandle &&
      edge.targetHandle === targetHandle
  );
}

/**
 * Debug information about edges
 */
export interface EdgeDebugInfo {
  /** Total number of edges */
  totalEdges: number;
  /** Number of orphaned edges */
  orphanedEdgeCount: number;
  /** Details about orphaned edges */
  orphanedEdges: Array<{
    id: string;
    source: string;
    target: string;
    reason: string;
  }>;
  /** Number of duplicate edges */
  duplicateEdgeCount: number;
  /** Details about duplicate edges */
  duplicates: Array<{
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    count: number;
  }>;
  /** Edge type distribution */
  edgeTypeDistribution: Record<string, number>;
  /** Summary message */
  summary: string;
}

/**
 * Debug edges and log detailed information about their state
 *
 * Provides comprehensive debugging information including:
 * - Orphaned edges (referencing non-existent nodes)
 * - Duplicate edges
 * - Edge type distribution
 * - Summary of edge state
 *
 * Logs results to console and returns debug info object.
 *
 * @param edges - Array of edges to debug
 * @param nodes - Array of nodes to validate against
 * @returns Object containing detailed debug information
 *
 * @example
 * ```typescript
 * const debugInfo = debugEdges(edges, nodes);
 * ```
 */
export function debugEdges(edges: GenericEdge[], nodes: GenericNode[]): EdgeDebugInfo {
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Find orphaned edges
  const orphanedEdges = edges
    .map((edge) => {
      const sourceExists = nodeIds.has(edge.source);
      const targetExists = nodeIds.has(edge.target);

      if (!sourceExists || !targetExists) {
        const reasons: string[] = [];
        if (!sourceExists) reasons.push(`source "${edge.source}" missing`);
        if (!targetExists) reasons.push(`target "${edge.target}" missing`);

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          reason: reasons.join(', '),
        };
      }
      return null;
    })
    .filter((edge) => edge !== null) as Array<{
      id: string;
      source: string;
      target: string;
      reason: string;
    }>;

  // Find duplicate edges
  const edgeMap = new Map<string, { edge: GenericEdge; count: number }>();
  edges.forEach((edge) => {
    const key = `${edge.source}→${edge.target}|${edge.sourceHandle || 'default'}→${edge.targetHandle || 'default'}`;
    const entry = edgeMap.get(key);
    if (entry) {
      entry.count++;
    } else {
      edgeMap.set(key, { edge, count: 1 });
    }
  });

  const duplicates = Array.from(edgeMap.values())
    .filter(({ count }) => count > 1)
    .map(({ edge, count }) => ({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      count,
    }));

  // Edge type distribution
  const edgeTypeDistribution: Record<string, number> = {};
  edges.forEach((edge) => {
    const type = edge.type || 'default';
    edgeTypeDistribution[type] = (edgeTypeDistribution[type] || 0) + 1;
  });

  // Generate summary
  const issues: string[] = [];
  if (orphanedEdges.length > 0) {
    issues.push(`${orphanedEdges.length} orphaned edge(s)`);
  }
  if (duplicates.length > 0) {
    issues.push(`${duplicates.length} duplicate edge(s)`);
  }

  const summary =
    issues.length === 0
      ? `Edge state healthy: ${edges.length} valid edge(s) across ${nodes.length} node(s)`
      : `Edge state issues: ${issues.join(', ')}`;

  const debugInfo: EdgeDebugInfo = {
    totalEdges: edges.length,
    orphanedEdgeCount: orphanedEdges.length,
    orphanedEdges,
    duplicateEdgeCount: duplicates.length,
    duplicates,
    edgeTypeDistribution,
    summary,
  };

  // Debug information available via return value

  return debugInfo;
}

/**
 * Comprehensive edge cleanup function
 *
 * Performs complete cleanup of edges:
 * 1. Removes orphaned edges
 * 2. Removes duplicate edges
 * 3. Returns validation results
 *
 * @param edges - Array of edges to clean
 * @param nodes - Array of nodes to validate against
 * @returns Object containing cleaned edges and operation results
 *
 * @example
 * ```typescript
 * const result = cleanupEdges(edges, nodes);
 * setEdges(result.cleanedEdges);
 * if (result.hasIssues) {
 * }
 * ```
 */
export function cleanupEdges(
  edges: GenericEdge[],
  nodes: GenericNode[]
): {
  cleanedEdges: GenericEdge[];
  orphanedCount: number;
  duplicateCount: number;
  hasIssues: boolean;
  issueCount: number;
  messages: string[];
} {
  const messages: string[] = [];

  // Step 1: Validate and remove orphaned edges
  const validationResult = validateEdges(edges, nodes);
  const validEdges = validationResult.validEdges;
  const orphanedCount = validationResult.orphanedEdges.length;
  messages.push(...validationResult.messages);

  // Step 2: Remove duplicates from valid edges
  const uniqueEdgesMap = new Map<string, GenericEdge>();
  let duplicateCount = 0;

  validEdges.forEach((edge) => {
    const key = `${edge.source}→${edge.target}|${edge.sourceHandle || 'default'}→${edge.targetHandle || 'default'}`;
    if (uniqueEdgesMap.has(key)) {
      duplicateCount++;
      messages.push(
        `Duplicate edge removed: ${edge.id} (${edge.source} → ${edge.target})`
      );
    } else {
      uniqueEdgesMap.set(key, edge);
    }
  });

  const cleanedEdges = Array.from(uniqueEdgesMap.values());
  const issueCount = orphanedCount + duplicateCount;
  const hasIssues = issueCount > 0;

  if (hasIssues) {
    messages.push(
      `Cleanup complete: removed ${orphanedCount} orphaned edge(s) and ${duplicateCount} duplicate edge(s)`
    );
  } else {
    messages.push('Cleanup complete: no issues found');
  }

  return {
    cleanedEdges,
    orphanedCount,
    duplicateCount,
    hasIssues,
    issueCount,
    messages,
  };
}

/**
 * Get summary statistics about edges
 *
 * @param edges - Array of edges
 * @param nodes - Array of nodes
 * @returns Statistics object
 *
 * @example
 * ```typescript
 * const stats = getEdgeStats(edges, nodes);
 * ```
 */
export function getEdgeStats(
  edges: GenericEdge[],
  nodes: GenericNode[]
): {
  totalEdges: number;
  totalNodes: number;
  connectedNodeCount: number;
  isolatedNodeCount: number;
  averageEdgesPerNode: number;
} {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const connectedNodes = new Set<string>();

  edges.forEach((edge) => {
    if (nodeIds.has(edge.source)) connectedNodes.add(edge.source);
    if (nodeIds.has(edge.target)) connectedNodes.add(edge.target);
  });

  return {
    totalEdges: edges.length,
    totalNodes: nodes.length,
    connectedNodeCount: connectedNodes.size,
    isolatedNodeCount: nodes.length - connectedNodes.size,
    averageEdgesPerNode:
      nodes.length > 0 ? edges.length / nodes.length : 0,
  };
}
