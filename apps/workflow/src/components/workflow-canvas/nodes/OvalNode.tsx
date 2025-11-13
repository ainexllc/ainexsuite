'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

interface OvalNodeData extends Record<string, unknown> {
  label: string;
}

export type OvalNodeType = Node<OvalNodeData, 'oval'>;

function OvalNode({ data, selected }: NodeProps<OvalNodeType>) {
  const { theme } = useTheme();
  const [label, setLabel] = useState(data.label || 'Start/End');
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
    background: theme.primary,
    width: 12,
    height: 12,
    border: '3px solid #0a0a0a',
    borderRadius: '50%',
    boxShadow: `0 0 0 2px ${theme.primary}, 0 0 8px ${theme.primary}`,
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
        color={theme.primary}
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

      {/* Oval Shape */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <ellipse
          cx="50"
          cy="50"
          rx="48"
          ry="48"
          fill="rgba(10, 10, 10, 0.7)"
          stroke={selected ? theme.primary : `rgba(${theme.primaryRgb}, 0.3)`}
          strokeWidth="2"
          style={{
            filter: selected
              ? `drop-shadow(0 0 6px rgba(${theme.primaryRgb}, 0.5))`
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

export default memo(OvalNode);
