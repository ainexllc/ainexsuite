'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeResizer, type Node, type NodeProps } from '@xyflow/react';
import { useTheme } from '@/contexts/ThemeContext';

interface SubprocessNodeData extends Record<string, unknown> {
  label?: string;
  detail?: string;
  color?: string;
  bgColor?: string;
}

export type SubprocessNodeType = Node<SubprocessNodeData, 'subprocess'>;

function SubprocessNode({ data, selected }: NodeProps<SubprocessNodeType>) {
  const { theme } = useTheme();
  const nodeColor = (data.color as string) || theme.primary;
  const nodeBgColor = (data.bgColor as string) || 'rgba(10, 10, 10, 0.7)';
  const [label, setLabel] = useState((data.label as string) || 'Subprocess');
  const [detail, setDetail] = useState((data.detail as string) || 'Describe the nested flow...');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStyle = {
    background: nodeColor,
    width: 8,
    height: 8,
    border: '2px solid #fff',
    borderRadius: '50%',
    zIndex: 10,
    opacity: isHovered || selected ? 1 : 0,
    transition: 'opacity 0.2s',
  } as const;

  const stopEditingLabel = useCallback(() => setIsEditingLabel(false), []);
  const stopEditingDetail = useCallback(() => setIsEditingDetail(false), []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEditingLabel();
      stopEditingDetail();
    }
  }, [stopEditingDetail, stopEditingLabel]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="h-full w-full"
    >
      <NodeResizer color={nodeColor} isVisible={selected} minWidth={200} minHeight={120} />

      <Handle type="target" position={Position.Top} id="top" style={{ ...handleStyle, top: 0 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ ...handleStyle, right: 0 }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ ...handleStyle, bottom: 0 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ ...handleStyle, left: 0 }} />

      <div
        className="flex h-full w-full flex-col rounded-xl border-2 p-4"
        style={{
          borderColor: selected ? nodeColor : `${nodeColor}60`,
          backgroundColor: nodeBgColor,
          boxShadow: selected ? `0 0 0 2px ${nodeColor}50` : 'inset 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
          <div onDoubleClick={() => setIsEditingLabel(true)} className="flex-1">
            {isEditingLabel ? (
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={stopEditingLabel}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full bg-transparent text-white outline-none"
                style={{ fontFamily: 'inherit' }}
              />
            ) : (
              <span className="text-white">{label}</span>
            )}
          </div>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-white/60">
            Nested Flow
          </span>
        </div>

        <div
          className="mt-3 flex-1 rounded-lg border border-dashed border-white/20 bg-black/20 p-3 text-sm text-white/80"
          onDoubleClick={() => setIsEditingDetail(true)}
        >
          {isEditingDetail ? (
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              onBlur={stopEditingDetail}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-full w-full resize-none bg-transparent text-white outline-none"
              style={{ fontFamily: 'inherit' }}
            />
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed text-white/80">{detail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(SubprocessNode);
