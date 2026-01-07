'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import type { PlateEditor } from 'platejs/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Link as LinkIcon,
  Highlighter,
  Undo2,
  Redo2,
  Minus,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Superscript,
  Subscript,
  Palette,
  Type,
  // Phase 1
  Table,
  FileCode,
  Indent,
  Outdent,
  // Phase 3
  ImageIcon,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

// Highlight color options
const HIGHLIGHT_COLORS = [
  { name: 'Yellow', color: '#fef08a' },
  { name: 'Green', color: '#bbf7d0' },
  { name: 'Blue', color: '#bfdbfe' },
  { name: 'Pink', color: '#fbcfe8' },
  { name: 'Orange', color: '#fed7aa' },
  { name: 'Purple', color: '#ddd6fe' },
] as const;

// Text color options
const TEXT_COLORS = [
  { name: 'Default', color: null },
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Yellow', color: '#eab308' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Gray', color: '#6b7280' },
] as const;

// Font size options
const FONT_SIZES = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '20px' },
  { label: 'XL', value: '24px' },
] as const;

// Alignment options
const ALIGNMENTS = [
  { name: 'Left', value: 'left', icon: AlignLeft },
  { name: 'Center', value: 'center', icon: AlignCenter },
  { name: 'Right', value: 'right', icon: AlignRight },
  { name: 'Justify', value: 'justify', icon: AlignJustify },
] as const;

interface PlateToolbarProps {
  editor: PlateEditor;
  className?: string;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent focus loss - keeps text selected
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={clsx(
        'p-1.5 rounded-md transition-all duration-150',
        isActive
          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm'
          : 'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-amber-200/60 dark:bg-amber-800/40 mx-1.5" />;
}

export function PlateToolbar({ editor, className }: PlateToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [showTextColors, setShowTextColors] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);
  const [showAlignments, setShowAlignments] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showCalloutPicker, setShowCalloutPicker] = useState(false);
  const [, forceUpdate] = useState({});
  const highlightRef = useRef<HTMLDivElement>(null);
  const textColorRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const alignmentRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);

  // Force re-render to update active states
  useEffect(() => {
    const handleSelectionChange = () => {
      forceUpdate({});
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Focus link input when it opens
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (highlightRef.current && !highlightRef.current.contains(event.target as Node)) {
        setShowHighlightColors(false);
      }
      if (textColorRef.current && !textColorRef.current.contains(event.target as Node)) {
        setShowTextColors(false);
      }
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setShowFontSizes(false);
      }
      if (alignmentRef.current && !alignmentRef.current.contains(event.target as Node)) {
        setShowAlignments(false);
      }
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setShowTablePicker(false);
        setTableHover({ rows: 0, cols: 0 });
      }
      if (imageRef.current && !imageRef.current.contains(event.target as Node)) {
        setShowImageInput(false);
        setImageUrl('');
      }
      if (calloutRef.current && !calloutRef.current.contains(event.target as Node)) {
        setShowCalloutPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeLinkInput = useCallback(() => {
    setShowLinkInput(false);
    setLinkUrl('');
  }, []);

  const setLink = useCallback(() => {
    if (!linkUrl) {
      // Remove link
      try {
        editor.tf.unwrapNodes();
      } catch {
        // Ignore if method doesn't exist
      }
      closeLinkInput();
      return;
    }

    // Add https:// if no protocol is specified
    const url = linkUrl.match(/^https?:\/\//) ? linkUrl : `https://${linkUrl}`;

    try {
      editor.tf.wrapNodes({
        type: 'a',
        url,
        children: [],
      });
    } catch {
      // Fallback: try using the link plugin's API
      console.warn('Link insertion failed');
    }
    closeLinkInput();
  }, [editor, linkUrl, closeLinkInput]);

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
    } else if (e.key === 'Escape') {
      closeLinkInput();
    }
  };

  // Check if a mark is active
  const isMarkActive = (mark: string): boolean => {
    try {
      // Try the API method first
      const marks = editor.api?.marks?.() ?? editor.getMarks;
      if (marks && typeof marks === 'object') {
        return (marks as Record<string, unknown>)[mark] === true ||
               typeof (marks as Record<string, unknown>)[mark] === 'string';
      }
      return false;
    } catch {
      return false;
    }
  };

  // Check if a block type is active
  const isBlockActive = (type: string): boolean => {
    try {
      // Use the editor's API to check block type
      const nodes = editor.api?.nodes?.({
        match: (n: Record<string, unknown>) => n.type === type,
        mode: 'highest',
      });
      if (nodes) {
        const nodeArray = Array.from(nodes);
        return nodeArray.length > 0;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Toggle mark using Plate's API
  const toggleMark = (mark: string) => {
    try {
      editor.tf.toggleMark?.(mark);
    } catch {
      // Fallback to manual toggle
      try {
        if (isMarkActive(mark)) {
          editor.tf.removeMark?.(mark);
        } else {
          editor.tf.addMark?.(mark, true);
        }
      } catch {
        console.warn(`Failed to toggle mark: ${mark}`);
      }
    }
  };

  // Toggle block using Plate's API
  const toggleBlock = (type: string) => {
    try {
      editor.tf.toggleBlock?.(type);
    } catch {
      // Fallback to manual toggle
      try {
        if (isBlockActive(type)) {
          editor.tf.setNodes?.({ type: 'p' });
        } else {
          editor.tf.setNodes?.({ type });
        }
      } catch {
        console.warn(`Failed to toggle block: ${type}`);
      }
    }
  };

  // Toggle list
  const toggleList = (listType: 'ul' | 'ol' | 'action_item') => {
    try {
      if (isBlockActive(listType)) {
        editor.tf.unwrapNodes?.();
        editor.tf.setNodes?.({ type: 'p' });
      } else {
        editor.tf.setNodes?.({ type: 'li' });
        editor.tf.wrapNodes?.({ type: listType, children: [] });
      }
    } catch {
      console.warn(`Failed to toggle list: ${listType}`);
    }
  };

  // Insert horizontal rule
  const insertHorizontalRule = () => {
    try {
      editor.tf.insertNodes?.({
        type: 'hr',
        children: [{ text: '' }],
      });
    } catch {
      console.warn('Failed to insert horizontal rule');
    }
  };

  // Undo/Redo
  const undo = () => {
    try {
      editor.undo?.();
    } catch {
      console.warn('Undo not available');
    }
  };

  const redo = () => {
    try {
      editor.redo?.();
    } catch {
      console.warn('Redo not available');
    }
  };

  // Insert table
  const insertTable = useCallback((rows: number, cols: number) => {
    try {
      // Create table structure
      const tableRows = Array.from({ length: rows }, (_, rowIndex) => ({
        type: 'tr',
        children: Array.from({ length: cols }, () => ({
          type: rowIndex === 0 ? 'th' : 'td',
          children: [{ type: 'p', children: [{ text: '' }] }],
        })),
      }));

      editor.tf.insertNodes?.({
        type: 'table',
        children: tableRows,
      });
    } catch {
      console.warn('Failed to insert table');
    }
    setShowTablePicker(false);
    setTableHover({ rows: 0, cols: 0 });
  }, [editor]);

  // Insert code block
  const insertCodeBlock = useCallback(() => {
    try {
      editor.tf.insertNodes?.({
        type: 'code_block',
        lang: '',
        children: [
          { type: 'code_line', children: [{ text: '' }] },
        ],
      });
    } catch {
      console.warn('Failed to insert code block');
    }
  }, [editor]);

  // Indent - increase indent level on selected blocks
  const indent = useCallback(() => {
    try {
      // Get current selection and increase indent
      const nodes = editor.api?.nodes?.({
        match: (n: Record<string, unknown>) =>
          typeof n.type === 'string' && ['p', 'h1', 'h2', 'h3', 'blockquote'].includes(n.type),
        mode: 'highest',
      });
      if (nodes) {
        const nodeArray = Array.from(nodes);
        for (const [node, path] of nodeArray as [Record<string, unknown>, number[]][]) {
          const currentIndent = (node.indent as number) || 0;
          editor.tf.setNodes?.({ indent: currentIndent + 1 }, { at: path });
        }
      }
    } catch {
      console.warn('Indent not available');
    }
  }, [editor]);

  // Outdent - decrease indent level on selected blocks
  const outdent = useCallback(() => {
    try {
      // Get current selection and decrease indent
      const nodes = editor.api?.nodes?.({
        match: (n: Record<string, unknown>) =>
          typeof n.type === 'string' && ['p', 'h1', 'h2', 'h3', 'blockquote'].includes(n.type),
        mode: 'highest',
      });
      if (nodes) {
        const nodeArray = Array.from(nodes);
        for (const [node, path] of nodeArray as [Record<string, unknown>, number[]][]) {
          const currentIndent = (node.indent as number) || 0;
          if (currentIndent > 0) {
            editor.tf.setNodes?.({ indent: currentIndent - 1 }, { at: path });
          }
        }
      }
    } catch {
      console.warn('Outdent not available');
    }
  }, [editor]);

  // Phase 3: Insert image
  const insertImage = useCallback((url: string) => {
    if (!url) return;
    try {
      editor.tf.insertNodes?.({
        type: 'img',
        url,
        children: [{ text: '' }],
      });
    } catch {
      console.warn('Failed to insert image');
    }
    setShowImageInput(false);
    setImageUrl('');
  }, [editor]);

  // Phase 3: Insert callout
  const insertCallout = useCallback((variant: string) => {
    try {
      editor.tf.insertNodes?.({
        type: 'callout',
        variant,
        children: [{ type: 'p', children: [{ text: '' }] }],
      });
    } catch {
      console.warn('Failed to insert callout');
    }
    setShowCalloutPicker(false);
  }, [editor]);

  // Phase 3: Insert toggle
  const insertToggle = useCallback(() => {
    try {
      editor.tf.insertNodes?.({
        type: 'toggle',
        title: 'Click to expand',
        children: [{ type: 'p', children: [{ text: '' }] }],
      });
    } catch {
      console.warn('Failed to insert toggle');
    }
  }, [editor]);

  // Set highlight color
  const setHighlightColor = useCallback((color: string | null) => {
    try {
      if (color === null) {
        editor.tf.removeMark?.('highlight');
      } else {
        editor.tf.addMark?.('highlight', color);
      }
    } catch {
      console.warn('Failed to set highlight');
    }
    setShowHighlightColors(false);
  }, [editor]);

  // Set text color
  const setTextColor = useCallback((color: string | null) => {
    try {
      if (color === null) {
        editor.tf.removeMark?.('color');
      } else {
        editor.tf.addMark?.('color', color);
      }
    } catch {
      console.warn('Failed to set text color');
    }
    setShowTextColors(false);
  }, [editor]);

  // Set font size
  const setFontSize = useCallback((size: string | null) => {
    try {
      if (size === null || size === '16px') {
        editor.tf.removeMark?.('fontSize');
      } else {
        editor.tf.addMark?.('fontSize', size);
      }
    } catch {
      console.warn('Failed to set font size');
    }
    setShowFontSizes(false);
  }, [editor]);

  // Set alignment
  const setAlignment = useCallback((align: string) => {
    try {
      editor.tf.setNodes?.({ align });
    } catch {
      console.warn('Failed to set alignment');
    }
    setShowAlignments(false);
  }, [editor]);

  // Get current alignment
  const getCurrentAlignment = (): string => {
    try {
      const nodes = editor.api?.nodes?.({
        match: (n: Record<string, unknown>) => n.type === 'p',
        mode: 'highest',
      });
      if (nodes) {
        const nodeArray = Array.from(nodes);
        if (nodeArray.length > 0) {
          const [node] = nodeArray[0] as [Record<string, unknown>, unknown];
          return (node.align as string) || 'left';
        }
      }
      return 'left';
    } catch {
      return 'left';
    }
  };

  // Get current font size
  const getCurrentFontSize = (): string => {
    try {
      const marks = editor.api?.marks?.() ?? editor.getMarks;
      if (marks && typeof marks === 'object') {
        const fontSize = (marks as Record<string, unknown>).fontSize;
        if (typeof fontSize === 'string') return fontSize;
      }
      return '16px';
    } catch {
      return '16px';
    }
  };

  return (
    <div className={clsx(
      'flex items-center gap-0.5 flex-wrap p-2 border-b rounded-t-lg',
      'bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80',
      'dark:from-stone-800/80 dark:via-stone-900/60 dark:to-stone-800/80',
      'border-amber-200/60 dark:border-amber-900/40',
      className
    )}>
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => toggleMark('bold')}
        isActive={isMarkActive('bold')}
        title="Bold (Cmd+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleMark('italic')}
        isActive={isMarkActive('italic')}
        title="Italic (Cmd+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleMark('underline')}
        isActive={isMarkActive('underline')}
        title="Underline (Cmd+U)"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleMark('strikethrough')}
        isActive={isMarkActive('strikethrough')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleMark('superscript')}
        isActive={isMarkActive('superscript')}
        title="Superscript"
      >
        <Superscript className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleMark('subscript')}
        isActive={isMarkActive('subscript')}
        title="Subscript"
      >
        <Subscript className="h-4 w-4" />
      </ToolbarButton>

      {/* Text color picker */}
      <div className="relative" ref={textColorRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowTextColors(!showTextColors);
          }}
          title="Text color"
          className={clsx(
            'flex items-center gap-0.5 p-1.5 rounded-md transition-all duration-150',
            isMarkActive('color')
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          <Palette className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>

        {showTextColors && (
          <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg">
            <div className="grid grid-cols-4 gap-1.5">
              {TEXT_COLORS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setTextColor(item.color);
                  }}
                  title={item.name}
                  className={clsx(
                    'w-6 h-6 rounded border border-amber-200 dark:border-amber-800 hover:scale-110 transition-transform flex items-center justify-center',
                    item.color === null && 'bg-stone-100 dark:bg-stone-700'
                  )}
                  style={item.color ? { backgroundColor: item.color } : undefined}
                >
                  {item.color === null && <span className="text-xs text-stone-500">A</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Highlight with color picker */}
      <div className="relative" ref={highlightRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowHighlightColors(!showHighlightColors);
          }}
          title="Highlight"
          className={clsx(
            'flex items-center gap-0.5 p-1.5 rounded-md transition-all duration-150',
            isMarkActive('highlight')
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          <Highlighter className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>

        {showHighlightColors && (
          <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg">
            <div className="grid grid-cols-3 gap-1.5">
              {HIGHLIGHT_COLORS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setHighlightColor(item.color);
                  }}
                  title={item.name}
                  className="w-6 h-6 rounded border border-amber-200 dark:border-amber-800 hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.color }}
                />
              ))}
            </div>
            {isMarkActive('highlight') && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setHighlightColor(null);
                }}
                className="w-full mt-2 px-2 py-1 text-xs text-stone-500 hover:text-amber-700 dark:hover:text-amber-400 bg-stone-100 dark:bg-stone-700 rounded"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <ToolbarButton
        onClick={() => toggleMark('code')}
        isActive={isMarkActive('code')}
        title="Inline code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      {/* Font size dropdown */}
      <div className="relative" ref={fontSizeRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowFontSizes(!showFontSizes);
          }}
          title="Font size"
          className={clsx(
            'flex items-center gap-0.5 px-2 py-1.5 rounded-md transition-all duration-150 text-xs font-medium',
            'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          <Type className="h-3.5 w-3.5 mr-0.5" />
          {getCurrentFontSize().replace('px', '')}
          <ChevronDown className="h-3 w-3" />
        </button>

        {showFontSizes && (
          <div className="absolute top-full left-0 mt-1 z-50 p-1 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg min-w-[100px]">
            {FONT_SIZES.map((item) => (
              <button
                key={item.value}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFontSize(item.value);
                }}
                className={clsx(
                  'w-full px-3 py-1.5 text-left text-sm rounded transition-colors',
                  getCurrentFontSize() === item.value
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                )}
              >
                {item.label} ({item.value.replace('px', '')})
              </button>
            ))}
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => toggleBlock('h1')}
        isActive={isBlockActive('h1')}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleBlock('h2')}
        isActive={isBlockActive('h2')}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleBlock('h3')}
        isActive={isBlockActive('h3')}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      {/* Alignment dropdown */}
      <div className="relative" ref={alignmentRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowAlignments(!showAlignments);
          }}
          title="Text alignment"
          className={clsx(
            'flex items-center gap-0.5 p-1.5 rounded-md transition-all duration-150',
            'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          {(() => {
            const currentAlign = getCurrentAlignment();
            const AlignIcon = ALIGNMENTS.find(a => a.value === currentAlign)?.icon || AlignLeft;
            return <AlignIcon className="h-4 w-4" />;
          })()}
          <ChevronDown className="h-3 w-3" />
        </button>

        {showAlignments && (
          <div className="absolute top-full left-0 mt-1 z-50 p-1 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg">
            <div className="flex gap-1">
              {ALIGNMENTS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setAlignment(item.value);
                    }}
                    title={item.name}
                    className={clsx(
                      'p-2 rounded transition-colors',
                      getCurrentAlignment() === item.value
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        : 'text-stone-500 dark:text-stone-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => toggleList('ul')}
        isActive={isBlockActive('ul')}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleList('ol')}
        isActive={isBlockActive('ol')}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => toggleList('action_item')}
        isActive={isBlockActive('action_item')}
        title="Task list"
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => toggleBlock('blockquote')}
        isActive={isBlockActive('blockquote')}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={insertHorizontalRule}
        title="Horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      {/* Phase 1: Table */}
      <div className="relative" ref={tableRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowTablePicker(!showTablePicker);
          }}
          title="Insert table"
          className={clsx(
            'flex items-center gap-0.5 p-1.5 rounded-md transition-all duration-150',
            isBlockActive('table')
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          <Table className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>

        {showTablePicker && (
          <div className="absolute top-full left-0 mt-1 z-50 p-3 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg">
            <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-center">
              {tableHover.rows > 0 && tableHover.cols > 0
                ? `${tableHover.rows} × ${tableHover.cols}`
                : 'Select size'}
            </div>
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: 5 }, (_, row) =>
                Array.from({ length: 5 }, (_, col) => (
                  <button
                    key={`${row}-${col}`}
                    type="button"
                    onMouseEnter={() => setTableHover({ rows: row + 1, cols: col + 1 })}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertTable(row + 1, col + 1);
                    }}
                    className={clsx(
                      'w-5 h-5 border rounded transition-colors',
                      row < tableHover.rows && col < tableHover.cols
                        ? 'bg-amber-400 border-amber-500'
                        : 'bg-stone-100 dark:bg-stone-700 border-stone-300 dark:border-stone-600 hover:bg-amber-200 dark:hover:bg-amber-900/40'
                    )}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phase 1: Code block */}
      <ToolbarButton
        onClick={insertCodeBlock}
        isActive={isBlockActive('code_block')}
        title="Code block"
      >
        <FileCode className="h-4 w-4" />
      </ToolbarButton>

      {/* Phase 1: Indent/Outdent */}
      <ToolbarButton
        onClick={outdent}
        title="Decrease indent"
      >
        <Outdent className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={indent}
        title="Increase indent"
      >
        <Indent className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Phase 3: Image */}
      <div className="relative" ref={imageRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowImageInput(!showImageInput);
          }}
          title="Insert image"
          className={clsx(
            'p-1.5 rounded-md transition-all duration-150',
            'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        {showImageInput && (
          <div className="absolute top-full left-0 mt-1 z-50 flex items-center gap-1 p-2 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  insertImage(imageUrl);
                } else if (e.key === 'Escape') {
                  setShowImageInput(false);
                  setImageUrl('');
                }
              }}
              placeholder="Enter image URL..."
              className="w-48 px-2 py-1 text-sm bg-white dark:bg-stone-700 border border-amber-200 dark:border-amber-800 rounded focus:outline-none focus:border-amber-500 dark:focus:border-amber-600 text-stone-700 dark:text-stone-200"
            />
            <button
              type="button"
              onClick={() => insertImage(imageUrl)}
              className="px-2 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Phase 3: Callout */}
      <div className="relative" ref={calloutRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowCalloutPicker(!showCalloutPicker);
          }}
          title="Insert callout"
          className={clsx(
            'flex items-center gap-0.5 p-1.5 rounded-md transition-all duration-150',
            'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>

        {showCalloutPicker && (
          <div className="absolute top-full left-0 mt-1 z-50 p-1 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg min-w-[120px]">
            {(['info', 'warning', 'error', 'success'] as const).map((variant) => (
              <button
                key={variant}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertCallout(variant);
                }}
                className={clsx(
                  'w-full px-3 py-1.5 text-left text-sm rounded transition-colors flex items-center gap-2',
                  'text-stone-600 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                )}
              >
                <span className={clsx(
                  'w-3 h-3 rounded-full',
                  variant === 'info' && 'bg-blue-500',
                  variant === 'warning' && 'bg-yellow-500',
                  variant === 'error' && 'bg-red-500',
                  variant === 'success' && 'bg-green-500'
                )} />
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phase 3: Toggle */}
      <ToolbarButton
        onClick={insertToggle}
        title="Insert collapsible block"
      >
        <ChevronRight className="h-4 w-4" />
      </ToolbarButton>

      {/* Link */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            if (isBlockActive('a')) {
              try {
                editor.tf.unwrapNodes?.();
              } catch {
                // Ignore
              }
            } else {
              setShowLinkInput(!showLinkInput);
            }
          }}
          title="Link (Cmd+K)"
          className={clsx(
            'p-1.5 rounded-md transition-all duration-150',
            isBlockActive('a')
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm'
              : 'text-stone-500 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20'
          )}
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 z-50 flex items-center gap-1 p-2 bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 rounded-lg shadow-lg">
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="Enter URL..."
              className="w-48 px-2 py-1 text-sm bg-white dark:bg-stone-700 border border-amber-200 dark:border-amber-800 rounded focus:outline-none focus:border-amber-500 dark:focus:border-amber-600 text-stone-700 dark:text-stone-200"
            />
            <button
              type="button"
              onClick={setLink}
              className="px-2 py-1 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={closeLinkInput}
              className="px-2 py-1 text-sm text-stone-500 hover:text-amber-700 dark:hover:text-amber-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={undo}
        title="Undo (Cmd+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={redo}
        title="Redo (Cmd+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
