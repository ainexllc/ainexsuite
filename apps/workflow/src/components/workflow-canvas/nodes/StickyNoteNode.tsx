'use client';

import { memo, useCallback, useState } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

interface StickyNoteNodeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  bgColor?: string;
}

export type StickyNoteNodeType = Node<StickyNoteNodeData, 'sticky-note'>;

function StickyNoteNode({ data, selected }: NodeProps<StickyNoteNodeType>) {
  const { theme } = useTheme();
  const nodeColor = (data.color as string) || '#713f12';
  const noteBg = (data.bgColor as string) || 'rgba(252, 211, 77, 0.9)';
  const [label, setLabel] = useState((data.label as string) || 'Quick note...');
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStyle = {
    background: theme.primary,
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
      <NodeResizer color={theme.primary} isVisible={selected} minWidth={140} minHeight={120} />

      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: 0 }} />

      <div
        className="relative flex h-full w-full flex-col rounded-lg p-4 text-sm shadow-2xl"
        style={{
          background: noteBg,
          color: nodeColor,
          boxShadow: selected ? `0 8px 20px rgba(0, 0, 0, 0.35)` : '0 4px 12px rgba(0, 0, 0, 0.25)',
        }}
        onDoubleClick={() => setIsEditing(true)}
      >
        <div className="absolute right-0 top-0 h-8 w-8 rounded-bl-full bg-white/50" />
        {isEditing ? (
          <textarea
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={stopEditing}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-full w-full resize-none bg-transparent text-black outline-none"
            style={{ fontFamily: 'inherit' }}
          />
        ) : (
          <p className="whitespace-pre-wrap break-words text-black">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

export default memo(StickyNoteNode);
