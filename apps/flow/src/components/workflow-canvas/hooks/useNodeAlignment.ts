import { useCallback } from 'react';
import { Node } from '@xyflow/react';

type AlignmentType = 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v';
type DistributionType = 'horizontal' | 'vertical';

interface UseNodeAlignmentProps {
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  takeSnapshot: () => void;
}

/**
 * Hook for node alignment and distribution operations
 */
export function useNodeAlignment({ nodes, setNodes, takeSnapshot }: UseNodeAlignmentProps) {
  const handleAlignNodes = useCallback((alignment: AlignmentType) => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length < 2) return;

    takeSnapshot();

    if (alignment === 'left') {
      const minX = Math.min(...selectedNodes.map((n) => n.position.x));
      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, x: minX } };
          }
          return node;
        })
      );
    } else if (alignment === 'right') {
      const maxX = Math.max(...selectedNodes.map((n) => n.position.x + (n.width || 0)));
      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, x: maxX - (node.width || 0) } };
          }
          return node;
        })
      );
    } else if (alignment === 'top') {
      const minY = Math.min(...selectedNodes.map((n) => n.position.y));
      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, y: minY } };
          }
          return node;
        })
      );
    } else if (alignment === 'bottom') {
      const maxY = Math.max(...selectedNodes.map((n) => n.position.y + (n.height || 0)));
      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, y: maxY - (node.height || 0) } };
          }
          return node;
        })
      );
    } else if (alignment === 'center-h') {
      const centerX = selectedNodes.reduce((sum, n) => sum + n.position.x + (n.width || 0) / 2, 0) / selectedNodes.length;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, x: centerX - (node.width || 0) / 2 } };
          }
          return node;
        })
      );
    } else if (alignment === 'center-v') {
      const centerY = selectedNodes.reduce((sum, n) => sum + n.position.y + (n.height || 0) / 2, 0) / selectedNodes.length;
      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected) {
            return { ...node, position: { ...node.position, y: centerY - (node.height || 0) / 2 } };
          }
          return node;
        })
      );
    }
  }, [nodes, setNodes, takeSnapshot]);

  const handleDistributeNodes = useCallback((direction: DistributionType) => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length < 3) return;

    takeSnapshot();

    if (direction === 'horizontal') {
      const sortedNodes = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
      const minX = sortedNodes[0].position.x;
      const maxX = sortedNodes[sortedNodes.length - 1].position.x + (sortedNodes[sortedNodes.length - 1].width || 0);
      const totalSpace = maxX - minX;
      const totalNodeWidth = sortedNodes.reduce((sum, n) => sum + (n.width || 0), 0);
      const gap = (totalSpace - totalNodeWidth) / (sortedNodes.length - 1);

      let currentX = minX;
      const nodePositions = new Map<string, number>();
      sortedNodes.forEach((node) => {
        nodePositions.set(node.id, currentX);
        currentX += (node.width || 0) + gap;
      });

      setNodes((nds) =>
        nds.map((node) => {
          const newX = nodePositions.get(node.id);
          if (newX !== undefined) {
            return { ...node, position: { ...node.position, x: newX } };
          }
          return node;
        })
      );
    } else {
      const sortedNodes = [...selectedNodes].sort((a, b) => a.position.y - b.position.y);
      const minY = sortedNodes[0].position.y;
      const maxY = sortedNodes[sortedNodes.length - 1].position.y + (sortedNodes[sortedNodes.length - 1].height || 0);
      const totalSpace = maxY - minY;
      const totalNodeHeight = sortedNodes.reduce((sum, n) => sum + (n.height || 0), 0);
      const gap = (totalSpace - totalNodeHeight) / (sortedNodes.length - 1);

      let currentY = minY;
      const nodePositions = new Map<string, number>();
      sortedNodes.forEach((node) => {
        nodePositions.set(node.id, currentY);
        currentY += (node.height || 0) + gap;
      });

      setNodes((nds) =>
        nds.map((node) => {
          const newY = nodePositions.get(node.id);
          if (newY !== undefined) {
            return { ...node, position: { ...node.position, y: newY } };
          }
          return node;
        })
      );
    }
  }, [nodes, setNodes, takeSnapshot]);

  return {
    handleAlignNodes,
    handleDistributeNodes,
  };
}
