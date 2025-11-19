'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

interface SwimlaneNodeData extends Record<string, unknown> {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  lanes?: number;
  color?: string;
  bgColor?: string;
}

export type SwimlaneNodeType = Node<SwimlaneNodeData, 'swimlane'>;

function SwimlaneNode({ data, selected }: NodeProps<SwimlaneNodeType>) {
  const { theme } = useTheme();
  const nodeColor = (data.color as string) || theme.primary;
  const shellBg = (data.bgColor as string) || 'rgba(10, 10, 10, 0.5)';
  const orientation = data.orientation === 'vertical' ? 'vertical' : 'horizontal';
  const laneCountRaw = typeof data.lanes === 'number' ? data.lanes : 3;
  const laneCount = Math.min(Math.max(laneCountRaw, 2), 5);
  const [label, setLabel] = useState((data.label as string) || 'Swimlane');
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleDoubleClick = useCallback(() => setIsEditing(true), []);
  const handleBlur = useCallback(() => setIsEditing(false), []);
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
    opacity: isHovered || selected ? 1 : 0.4,
    transition: 'opacity 0.2s',
  } as const;

  const lanes = Array.from({ length: laneCount });

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full w-full"
    >
      <NodeResizer
        color={nodeColor}
        isVisible={selected}
        minWidth={260}
        minHeight={160}
      />

      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: 0 }} />

      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-xl border-2"
        style={{
          borderColor: selected ? nodeColor : `${nodeColor}40`,
          backgroundColor: shellBg,
          boxShadow: selected ? `0 0 0 2px ${nodeColor}50` : 'none',
        }}
      >
        <div
          className="flex items-center justify-between border-b px-4 py-2 text-[11px] uppercase tracking-wide"
          style={{ borderColor: `${nodeColor}30` }}
          onDoubleClick={handleDoubleClick}
        >
          {isEditing ? (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-transparent text-white outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          ) : (
            <span className="text-white">{label}</span>
          )}
          <span className="text-white/50 text-[10px]">
            {orientation === 'horizontal' ? 'Horizontal' : 'Vertical'}
          </span>
        </div>

        <div
          className={`flex h-full w-full ${orientation === 'horizontal' ? 'flex-col' : 'flex-row'} bg-black/20`}
        >
          {lanes.map((_, index) => {
            const dividerStyle =
              orientation === 'horizontal'
                ? { borderTop: index === 0 ? 'none' : '1px dashed rgba(255, 255, 255, 0.1)' }
                : { borderLeft: index === 0 ? 'none' : '1px dashed rgba(255, 255, 255, 0.1)' };

            return (
              <div
                key={`lane-${index}`}
                className="relative flex-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  ...dividerStyle,
                }}
              >
                <span className="absolute right-2 top-2 text-[9px] uppercase text-white/30">
                  Lane {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(SwimlaneNode);
