'use client';

import { memo, useState, useEffect } from 'react';
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react';
import { X, FolderPlus } from 'lucide-react';

export type StickyNoteData = {
  text: string;
  title?: string;
  color: string;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  fontFamily?: 'sans' | 'serif' | 'mono' | 'cursive';
  locked?: boolean;
  isDarkMode?: boolean;
  width?: number;
  height?: number;
  onDelete?: () => void;
  onTextChange?: (text: string) => void;
  onTitleChange?: (title: string) => void;
  onResize?: (width: number, height: number) => void;
};

function StickyNoteNode({ data, selected }: NodeProps) {
  const nodeData = data as StickyNoteData;
  const [text, setText] = useState(nodeData.text);
  const [title, setTitle] = useState(nodeData.title || '');
  const [isHovered, setIsHovered] = useState(false);

  const defaultWidth = 320;
  const defaultHeight = 280;

  const width = nodeData.width || defaultWidth;
  const height = nodeData.height || defaultHeight;

  // isDarkMode available in nodeData but not currently used for styling

  useEffect(() => {
    setText(nodeData.text);
  }, [nodeData.text]);

  useEffect(() => {
    setTitle(nodeData.title || '');
  }, [nodeData.title]);

  const handleTextChange = (newText: string) => {
    setText(newText);
    nodeData.onTextChange?.(newText);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    nodeData.onTitleChange?.(newTitle);
  };

  // Font size mapping
  const fontSizeMap = {
    xs: 'text-xs',    // 12px
    sm: 'text-sm',    // 14px (default)
    base: 'text-base', // 16px
    lg: 'text-lg',    // 18px
    xl: 'text-xl',    // 20px
  };

  // Font family mapping
  const fontFamilyMap = {
    sans: 'font-sans',           // Default sans-serif
    serif: 'font-serif',         // Serif fonts
    mono: 'font-mono',           // Monospace
    cursive: 'font-cursive',     // Cursive/handwriting style
  };

  const fontSize = fontSizeMap[nodeData.fontSize || 'sm'];
  const fontFamily = fontFamilyMap[nodeData.fontFamily || 'sans'];

  const handleStyle = {
    background: '#3b82f6',
    width: 12,
    height: 12,
    border: '3px solid #0a0a0a',
    borderRadius: '50%',
    boxShadow: '0 0 0 2px #3b82f6, 0 0 8px #3b82f6',
    zIndex: 10,
    opacity: isHovered ? 1 : 0.2,
    transition: 'opacity 0.2s',
  };

  return (
    <>
      {!nodeData.locked && (
        <NodeResizer
          color="#06b6d4"
          isVisible={isHovered || selected}
          minWidth={150}
          minHeight={100}
          maxWidth={500}
          maxHeight={1000}
          handleStyle={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: '#06b6d4',
            border: '3px solid #0a0a0a',
          }}
          lineStyle={{
            borderColor: '#06b6d4',
            borderWidth: 2,
          }}
          onResize={(event, params) => {
            nodeData.onResize?.(params.width, params.height);
          }}
        />
      )}
      <div
        className={`rounded-3xl select-none transition-shadow border-2 border-transparent hover:border-cyan-500 shadow-lg flex flex-col overflow-hidden ${
          nodeData.locked ? 'cursor-not-allowed' : 'cursor-move'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          backgroundColor: nodeData.color,
          width: `${width}px`,
          height: `${height}px`,
          color: 'rgb(17 24 39)',
        }}
      >
      {/* Connection Handles - Only visible on hover */}
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

      {/* Pin button - hidden by default, shown on hover (matching notes app) */}
      <button
        onClick={nodeData.onDelete}
        className={`absolute right-4 top-4 rounded-full bg-white/70 p-2 text-gray-700 shadow-sm transition ${
          isHovered ? 'flex' : 'hidden'
        }`}
        title="Delete note"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Content container with padding matching notes app (px-5 py-4) - Scrollable */}
      <div className="px-5 pt-4 pb-2 flex-1 overflow-y-auto">
        {/* Title - always visible */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-base font-semibold placeholder:text-gray-500/60 text-gray-900 nodrag pr-6"
          placeholder="Title"
        />

        {/* Note Content - matching notes app spacing (mt-3) */}
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className={`w-full bg-transparent border-none outline-none resize-none placeholder:text-gray-500/60 text-gray-800 nodrag whitespace-pre-wrap mt-3 ${fontSize} ${fontFamily}`}
          placeholder="Take a note..."
          style={{
            minHeight: '60px',
          }}
        />
      </div>

      {/* Footer - matching notes app */}
      <footer className="px-5 pb-3 pt-2 flex items-center justify-end border-t border-gray-900/10">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="nodrag p-2 rounded-full transition-colors hover:bg-gray-900/10 text-gray-700"
            title="Create project from note"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement create project functionality
              alert('Create project from this note');
            }}
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
    </>
  );
}

export default memo(StickyNoteNode);
