'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useWorkflowTheme } from '@/lib/use-workflow-theme';

interface DiamondNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  bgColor?: string;
}

export type DiamondNodeType = Node<DiamondNodeData, 'diamond'>;

function DiamondNode({ data, selected }: NodeProps<DiamondNodeType>) {
  const theme = useWorkflowTheme();
  const nodeColor = data.color || theme.primary;
  const nodeBgColor = data.bgColor || 'rgba(10, 10, 10, 0.7)';
  const [label, setLabel] = useState(data.label || 'Decision');
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
    }
  }, []);

  const handleStyle = {
    background: nodeColor,
    width: 8,
    height: 8,
    border: '2px solid var(--foreground)',
    borderRadius: '50%',
    zIndex: 10,
    opacity: isHovered || selected ? 1 : 0.4,
    transition: 'opacity 0.2s',
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ width: '100%', height: '100%' }}
    >
      <NodeResizer
        color={nodeColor}
        isVisible={selected}
        minWidth={140}
        minHeight={140}
        keepAspectRatio
      />

      {/* Connection Handles - visible on hover or when selected, positioned close to shape */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ ...handleStyle, top: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ ...handleStyle, right: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ ...handleStyle, bottom: 0 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ ...handleStyle, left: 0 }}
      />

      {/* Diamond Shape */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,5 95,50 50,95 5,50"
          fill={nodeBgColor}
          stroke={selected ? nodeColor : `${nodeColor}50`}
          strokeWidth="2"
          style={{
            filter: selected
              ? `drop-shadow(0 0 6px ${nodeColor}80)`
              : 'none',
          }}
        />
      </svg>

      {/* Node Content */}
      <div
        className="absolute inset-0 flex items-center justify-center px-8 py-8"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-full w-full resize-none bg-transparent text-center text-sm text-zinc-900 dark:text-zinc-100 outline-none"
            style={{ fontFamily: 'inherit' }}
          />
        ) : (
          <div className="text-center text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(DiamondNode);
