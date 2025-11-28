'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useWorkflowTheme } from '@/lib/use-workflow-theme';

interface RectangleNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  bgColor?: string;
}

export type RectangleNodeType = Node<RectangleNodeData, 'rectangle'>;

function RectangleNode({ data, selected }: NodeProps<RectangleNodeType>) {
  const theme = useWorkflowTheme();
  const nodeColor = data.color || theme.primary;
  const nodeBgColor = data.bgColor || 'rgba(10, 10, 10, 0.7)';
  const [label, setLabel] = useState(data.label || 'Process');
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
        minWidth={120}
        minHeight={60}
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

      {/* Node Content */}
      <div
        className="flex h-full w-full items-center justify-center rounded-lg border-2 px-4 py-2 transition-all"
        style={{
          backgroundColor: nodeBgColor,
          borderColor: selected ? nodeColor : `${nodeColor}50`,
          boxShadow: selected ? `0 0 0 2px ${nodeColor}80` : 'none',
        }}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-full w-full resize-none bg-transparent text-center text-sm text-foreground outline-none"
            style={{ fontFamily: 'inherit' }}
          />
        ) : (
          <div className="text-center text-sm text-foreground whitespace-pre-wrap break-words">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(RectangleNode);
