'use client';

import { memo, useCallback, useState } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

interface DatabaseNodeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  bgColor?: string;
}

export type DatabaseNodeType = Node<DatabaseNodeData, 'database'>;

function DatabaseNode({ data, selected }: NodeProps<DatabaseNodeType>) {
  const { theme } = useTheme();
  const nodeColor = (data.color as string) || theme.primary;
  const nodeBgColor = (data.bgColor as string) || 'rgba(10, 10, 10, 0.8)';
  const [label, setLabel] = useState((data.label as string) || 'Database');
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStyle = {
    background: nodeColor,
    width: 8,
    height: 8,
    border: '2px solid #fff',
    borderRadius: '50%',
    zIndex: 10,
    opacity: isHovered || selected ? 1 : 0.4,
    transition: 'opacity 0.2s',
  } as const;

  const stopEditing = useCallback(() => setIsEditing(false), []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEditing();
    }
  }, [stopEditing]);

  return (
    <div
      className="h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NodeResizer color={nodeColor} isVisible={selected} minWidth={150} minHeight={150} />

      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: 0 }} />

      <div
        className="relative flex h-full w-full flex-col items-center justify-center gap-3"
      >
        <svg viewBox="0 0 120 140" className="h-full w-full">
          <ellipse
            cx="60"
            cy="25"
            rx="50"
            ry="18"
            fill={nodeBgColor}
            stroke={selected ? nodeColor : `${nodeColor}70`}
            strokeWidth="3"
          />
          <path
            d="M10 25 V105 C10 120 35 130 60 130 C85 130 110 120 110 105 V25"
            fill={nodeBgColor}
            stroke={selected ? nodeColor : `${nodeColor}70`}
            strokeWidth="3"
          />
          <ellipse
            cx="60"
            cy="105"
            rx="50"
            ry="18"
            fill={nodeBgColor}
            stroke={selected ? nodeColor : `${nodeColor}70`}
            strokeWidth="3"
          />
          {[55, 85].map((y) => (
            <ellipse
              key={y}
              cx="60"
              cy={y}
              rx="50"
              ry="18"
              fill="none"
              stroke={`${nodeColor}40`}
              strokeWidth="1"
            />
          ))}
        </svg>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ filter: selected ? `drop-shadow(0 0 10px ${nodeColor}70)` : 'none' }}
        />
        <div
          className="absolute inset-x-0 bottom-4 flex items-center justify-center px-4"
          onDoubleClick={() => setIsEditing(true)}
        >
          {isEditing ? (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={stopEditing}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full rounded bg-black/40 px-2 py-1 text-center text-white outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          ) : (
            <span className="rounded bg-black/30 px-3 py-1 text-sm text-white">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(DatabaseNode);
