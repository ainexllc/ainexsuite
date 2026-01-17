'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
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
  Quote,
  Type,
  Undo2,
  Redo2,
  Minus,
  ChevronDown,
  ImageIcon,
} from 'lucide-react';
import { clsx } from 'clsx';

// Font color options
const FONT_COLORS = [
  { name: 'Red', color: '#ef4444' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#8b5cf6' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Gray', color: '#6b7280' },
] as const;

// Helper to execute editor commands safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runCommand = (editor: Editor, fn: (chain: any) => any) => {
  // Use focus() to ensure editor is focused and selection is restored
  const chain = editor.chain().focus();
  fn(chain).run();
};

interface EditorToolbarProps {
  editor: Editor;
  className?: string;
  onImageClick?: () => void;
  // Adaptive styling props
  forceLightText?: boolean;
  forceDarkText?: boolean;
  backgroundBrightness?: 'light' | 'dark';
  hasCover?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  onDarkNote?: boolean;
}

function ToolbarButton({ onClick, isActive, disabled, title, children, onDarkNote }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent focus loss - keeps text selected
        e.stopPropagation();
        // Execute immediately in onMouseDown to ensure editor state hasn't changed
        if (!disabled) {
          onClick();
        }
      }}
      onClick={(e) => {
        // Prevent any onClick handling since we handle everything in onMouseDown
        e.preventDefault();
        e.stopPropagation();
      }}
      disabled={disabled}
      aria-label={title}
      aria-pressed={isActive}
      title={title}
      className={clsx(
        'p-1.5 rounded-md transition-colors',
        isActive
          ? onDarkNote
            ? 'bg-white/25 text-white'
            : 'bg-black/15 dark:bg-white/20 text-zinc-900 dark:text-white'
          : onDarkNote
            ? 'text-white/75 hover:text-white hover:bg-white/15'
            : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/15',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider({ onDarkNote }: { onDarkNote?: boolean }) {
  return (
    <div
      className={clsx(
        'w-px h-5 mx-1',
        onDarkNote ? 'bg-white/25' : 'bg-zinc-400/40 dark:bg-zinc-500/50'
      )}
    />
  );
}

export function EditorToolbar({
  editor,
  className,
  onImageClick,
  forceLightText,
  forceDarkText: _forceDarkText,
  backgroundBrightness,
  hasCover,
}: EditorToolbarProps) {
  const [showFontColors, setShowFontColors] = useState(false);
  const fontColorRef = useRef<HTMLDivElement>(null);

  // Determine if we're on a dark note (needs light icons/text)
  const onDarkNote = forceLightText || backgroundBrightness === 'dark' || hasCover;

  // Close font color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fontColorRef.current && !fontColorRef.current.contains(event.target as Node)) {
        setShowFontColors(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const setFontColor = useCallback((color: string | null) => {
    if (color === null) {
      runCommand(editor, (c) => c.unsetColor());
    } else {
      runCommand(editor, (c) => c.setColor(color));
    }
    setShowFontColors(false);
  }, [editor]);

  return (
    <div className={clsx(
      'flex items-center gap-0.5 flex-wrap p-2 border-b rounded-t-lg backdrop-blur-sm',
      // Adaptive glass background
      onDarkNote
        ? 'bg-black/50 dark:bg-black/60 border-white/15 dark:border-white/20'
        : 'bg-white/70 dark:bg-zinc-900/80 border-black/10 dark:border-white/15',
      className
    )}>
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleBold())}
        isActive={editor.isActive('bold')}
        title="Bold (Cmd+B)"
        onDarkNote={onDarkNote}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleItalic())}
        isActive={editor.isActive('italic')}
        title="Italic (Cmd+I)"
        onDarkNote={onDarkNote}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleUnderline())}
        isActive={editor.isActive('underline')}
        title="Underline (Cmd+U)"
        onDarkNote={onDarkNote}
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleStrike())}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
        onDarkNote={onDarkNote}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      {/* Font color picker */}
      <div className="relative" ref={fontColorRef}>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setShowFontColors(!showFontColors);
          }}
          aria-label="Text color"
          aria-expanded={showFontColors}
          title="Text color"
          className={clsx(
            'flex items-center gap-0.5 p-1.5 rounded-md transition-colors',
            editor.getAttributes('textStyle').color
              ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
              : onDarkNote
                ? 'text-white/75 hover:text-white hover:bg-white/15'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/15'
          )}
        >
          <Type className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>

        {showFontColors && (
          <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-surface border border-border rounded-lg shadow-lg">
            <div className="grid grid-cols-4 gap-1.5">
              {FONT_COLORS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setFontColor(item.color);
                  }}
                  aria-label={`Set text color to ${item.name}`}
                  title={item.name}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-white text-[10px] font-bold drop-shadow" aria-hidden="true">A</span>
                </button>
              ))}
            </div>
            {editor.getAttributes('textStyle').color && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFontColor(null);
                }}
                aria-label="Reset text color to default"
                className="w-full mt-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-surface-muted rounded"
              >
                Default
              </button>
            )}
          </div>
        )}
      </div>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleCode())}
        isActive={editor.isActive('code')}
        title="Inline code"
        onDarkNote={onDarkNote}
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider onDarkNote={onDarkNote} />

      {/* Headings */}
      <ToolbarButton
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        }}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
        onDarkNote={onDarkNote}
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
        onDarkNote={onDarkNote}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => {
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
        onDarkNote={onDarkNote}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider onDarkNote={onDarkNote} />

      {/* Lists */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleBulletList())}
        isActive={editor.isActive('bulletList')}
        title="Bullet list"
        onDarkNote={onDarkNote}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleOrderedList())}
        isActive={editor.isActive('orderedList')}
        title="Numbered list"
        onDarkNote={onDarkNote}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider onDarkNote={onDarkNote} />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleBlockquote())}
        isActive={editor.isActive('blockquote')}
        title="Quote"
        onDarkNote={onDarkNote}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.setHorizontalRule())}
        title="Horizontal rule"
        onDarkNote={onDarkNote}
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      {/* Image */}
      {onImageClick && (
        <ToolbarButton
          onClick={onImageClick}
          title="Add image"
          onDarkNote={onDarkNote}
        >
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      )}

      <ToolbarDivider onDarkNote={onDarkNote} />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.undo())}
        disabled={!editor.can().undo()}
        title="Undo (Cmd+Z)"
        onDarkNote={onDarkNote}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.redo())}
        disabled={!editor.can().redo()}
        title="Redo (Cmd+Shift+Z)"
        onDarkNote={onDarkNote}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
