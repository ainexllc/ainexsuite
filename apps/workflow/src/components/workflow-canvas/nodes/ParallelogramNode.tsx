'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

interface ParallelogramNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  bgColor?: string;
}

export type ParallelogramNodeType = Node<ParallelogramNodeData, 'parallelogram'>;

function ParallelogramNode({ data, selected }: NodeProps<ParallelogramNodeType>) {
  const { theme } = useTheme();
  const nodeColor = data.color || theme.primary;
  const nodeBgColor = data.bgColor || 'rgba(10, 10, 10, 0.7)';
  const [label, setLabel] = useState(data.label || 'Input/Output');
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
    border: '2px solid #fff',
    borderRadius: '50%',
    zIndex: 10,
    opacity: isHovered || selected ? 1 : 0,
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

      {/* Parallelogram Shape */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="15,5 100,5 85,95 0,95"
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
        className="absolute inset-0 flex items-center justify-center px-6 py-4"
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <textarea
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-full w-full resize-none bg-transparent text-center text-sm text-white outline-none"
            style={{ fontFamily: 'inherit' }}
          />
        ) : (
          <div className="text-center text-sm text-white whitespace-pre-wrap break-words">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ParallelogramNode);
