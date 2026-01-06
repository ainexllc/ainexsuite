'use client';

import { memo, useCallback, useState } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useWorkflowTheme } from '@/lib/use-workflow-theme';
import { LockBadge } from './LockBadge';

interface DocumentsNodeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  bgColor?: string;
  locked?: boolean;
}

export type DocumentsNodeType = Node<DocumentsNodeData, 'documents'>;

function DocumentsNode({ data, selected }: NodeProps<DocumentsNodeType>) {
  const theme = useWorkflowTheme();
  const nodeColor = (data.color as string) || theme.primary;
  const nodeBgColor = (data.bgColor as string) || 'rgba(10, 10, 10, 0.75)';
  const isLocked = data.locked || false;
  const [label, setLabel] = useState((data.label as string) || 'Documents');
  const [isEditing, setIsEditing] = useState(false);
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
      <LockBadge locked={isLocked} />
      <NodeResizer color={nodeColor} isVisible={selected && !isLocked} minWidth={160} minHeight={130} />

      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: 0 }} />

      <div className="relative flex h-full w-full items-center justify-center">
        {[0, 1, 2].map((layer) => (
          <div
            key={layer}
            className="absolute inset-0 rounded-lg border bg-foreground/5"
            style={{
              transform: `translate(${layer * 6}px, ${layer * -6}px)`,
              borderColor: layer === 2 ? (selected ? nodeColor : `${nodeColor}50`) : 'rgba(var(--border-rgb, 255, 255, 255), 0.1)',
              backgroundColor: layer === 2 ? nodeBgColor : 'rgba(var(--background-rgb, 0, 0, 0), 0.2)',
              boxShadow: layer === 2 && selected ? `0 0 0 2px ${nodeColor}40` : 'none',
            }}
          >
            {layer === 2 && (
              <div className="flex h-full w-full flex-col gap-2 p-4">
                {[1, 2, 3].map((line) => (
                  <div
                    key={line}
                    className="h-2 rounded bg-foreground/10"
                    style={{ width: `${60 + line * 10}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        <div
          className="absolute inset-x-4 bottom-3"
          onDoubleClick={() => setIsEditing(true)}
        >
          {isEditing ? (
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={stopEditing}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full rounded bg-background/40 px-2 py-1 text-center text-zinc-900 dark:text-zinc-100 outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          ) : (
            <p className="rounded bg-background/30 px-3 py-1 text-center text-sm text-zinc-900 dark:text-zinc-100">
              {label}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(DocumentsNode);
