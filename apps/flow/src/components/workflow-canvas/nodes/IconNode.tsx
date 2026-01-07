'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useWorkflowTheme } from '@/lib/use-workflow-theme';
import { LockBadge } from './LockBadge';

interface IconNodeData extends Record<string, unknown> {
  label?: string;
  emoji?: string;
  color?: string;
  bgColor?: string;
  locked?: boolean;
}

export type IconNodeType = Node<IconNodeData, 'icon'>;

function IconNode({ data, selected }: NodeProps<IconNodeType>) {
  const theme = useWorkflowTheme();
  const nodeColor = (data.color as string) || theme.primary;
  const nodeBgColor = (data.bgColor as string) || '#1a1a1a';
  const isLocked = data.locked || false;
  const [label, setLabel] = useState((data.label as string) || 'Service');
  const [emoji, setEmoji] = useState((data.emoji as string) || '🧩');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingEmoji, setIsEditingEmoji] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStyle = {
    background: nodeColor,
    width: 8,
    height: 8,
    border: '2px solid var(--foreground)',
    borderRadius: '50%',
    zIndex: 10,
    opacity: isHovered || selected ? 1 : 0.4,
    transition: 'opacity 0.2s',
  } as const;

  const stopEditingEmoji = useCallback(() => setIsEditingEmoji(false), []);
  const stopEditingLabel = useCallback(() => setIsEditingLabel(false), []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEditingEmoji();
      stopEditingLabel();
    }
  }, [stopEditingEmoji, stopEditingLabel]);

  return (
    <div
      className="h-full w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <LockBadge locked={isLocked} />
      <NodeResizer color={nodeColor} isVisible={selected && !isLocked} minWidth={140} minHeight={140} />

      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: 0 }} />

      <div
        className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 text-center"
        style={{
          borderColor: selected ? nodeColor : `${nodeColor}60`,
          backgroundColor: nodeBgColor,
          boxShadow: selected ? `0 0 0 2px ${nodeColor}40` : 'none',
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-inner"
          style={{
            backgroundColor: `rgba(var(--foreground-rgb, 255, 255, 255), 0.08)`,
            border: `1px solid ${nodeColor}40`,
          }}
          onDoubleClick={() => setIsEditingEmoji(true)}
        >
          {isEditingEmoji ? (
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value.slice(0, 2))}
              onBlur={stopEditingEmoji}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-transparent text-center text-3xl text-zinc-900 dark:text-zinc-100 outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          ) : (
            <span>{emoji}</span>
          )}
        </div>
        <div onDoubleClick={() => setIsEditingLabel(true)} className="w-full">
          {isEditingLabel ? (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={stopEditingLabel}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          ) : (
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{label}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(IconNode);
