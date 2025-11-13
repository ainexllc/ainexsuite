'use client';

import { memo, useState, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { X } from 'lucide-react';

export type StickyNoteData = {
  text: string;
  color: string;
  size?: 'small' | 'medium' | 'large';
  locked?: boolean;
  isDarkMode?: boolean;
  onDelete?: () => void;
  onTextChange?: (text: string) => void;
};

function StickyNoteNode({ data }: NodeProps) {
  const nodeData = data as StickyNoteData;
  const [text, setText] = useState(nodeData.text);
  const noteSize = nodeData.size || 'medium';

  const sizeStyles = {
    small: { width: '150px', minHeight: '100px', textareaHeight: '60px' },
    medium: { width: '200px', minHeight: '150px', textareaHeight: '110px' },
    large: { width: '250px', minHeight: '200px', textareaHeight: '160px' },
  };

  const { isDarkMode = true } = nodeData;

  useEffect(() => {
    setText(nodeData.text);
  }, [nodeData.text]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    nodeData.onTextChange?.(newText);
  };

  return (
    <div
      className={`rounded-lg p-3 select-none transition-shadow ${
        nodeData.locked ? 'cursor-not-allowed' : 'cursor-move'
      }`}
      style={{
        backgroundColor: nodeData.color,
        ...sizeStyles[noteSize],
        color: 'rgb(17 24 39)',
        boxShadow: isDarkMode
          ? '0 8px 30px -12px rgba(56, 189, 248, 0.3)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          border: '3px solid #0a0a0a',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #3b82f6, 0 0 8px #3b82f6',
          zIndex: 10,
          top: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          border: '3px solid #0a0a0a',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #3b82f6, 0 0 8px #3b82f6',
          zIndex: 10,
          right: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          border: '3px solid #0a0a0a',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #3b82f6, 0 0 8px #3b82f6',
          zIndex: 10,
          bottom: 0,
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          background: '#3b82f6',
          width: 12,
          height: 12,
          border: '3px solid #0a0a0a',
          borderRadius: '50%',
          boxShadow: '0 0 0 2px #3b82f6, 0 0 8px #3b82f6',
          zIndex: 10,
          left: 0,
        }}
      />

      <div className="flex justify-end mb-1">
        <button
          onClick={nodeData.onDelete}
          className="p-1 rounded transition-colors hover:bg-black/10 text-gray-700"
          title="Delete note"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        className="w-full bg-transparent border-none outline-none resize-none text-sm placeholder:text-gray-500 text-gray-800 nodrag"
        placeholder="Type your note..."
        style={{
          fontFamily: 'Courier New, monospace',
          height: sizeStyles[noteSize].textareaHeight
        }}
      />
    </div>
  );
}

export default memo(StickyNoteNode);
