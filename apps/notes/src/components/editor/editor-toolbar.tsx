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
  Link as LinkIcon,
  Highlighter,
  Undo2,
  Redo2,
  Minus,
  ChevronDown,
  ImageIcon,
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
  showLinkInputExternal?: boolean;
  onLinkInputClosed?: () => void;
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
  showLinkInputExternal,
  onLinkInputClosed,
  onImageClick,
  forceLightText,
  forceDarkText: _forceDarkText,
  backgroundBrightness,
  hasCover,
}: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Determine if we're on a dark note (needs light icons/text)
  const onDarkNote = forceLightText || backgroundBrightness === 'dark' || hasCover;

  // Handle external trigger to show link input (from keyboard shortcut)
  useEffect(() => {
    if (showLinkInputExternal && !showLinkInput) {
      setShowLinkInput(true);
    }
  }, [showLinkInputExternal, showLinkInput]);

  // Focus link input when it opens
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  // Close highlight picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (highlightRef.current && !highlightRef.current.contains(event.target as Node)) {
        setShowHighlightColors(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeLinkInput = useCallback(() => {
    setShowLinkInput(false);
    setLinkUrl('');
    onLinkInputClosed?.();
  }, [onLinkInputClosed]);

  const setLink = useCallback(() => {
    if (!linkUrl) {
      runCommand(editor, (c) => c.unsetLink());
      closeLinkInput();
      return;
    }

    // Add https:// if no protocol is specified
    const url = linkUrl.match(/^https?:\/\//) ? linkUrl : `https://${linkUrl}`;

    runCommand(editor, (c) => c.setLink({ href: url }));
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

  const setHighlightColor = useCallback((color: string | null) => {
    if (color === null) {
      runCommand(editor, (c) => c.unsetHighlight());
    } else {
      runCommand(editor, (c) => c.toggleHighlight({ color }));
    }
    setShowHighlightColors(false);
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
            'flex items-center gap-0.5 p-1.5 rounded-md transition-colors',
            editor.isActive('highlight')
              ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
              : onDarkNote
                ? 'text-white/75 hover:text-white hover:bg-white/15'
                : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/15'
          )}
        >
          <Highlighter className="h-4 w-4" />
          <ChevronDown className="h-3 w-3" />
        </button>

        {showHighlightColors && (
          <div className="absolute top-full left-0 mt-1 z-50 p-2 bg-surface border border-border rounded-lg shadow-lg">
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
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.color }}
                />
              ))}
            </div>
            {editor.isActive('highlight') && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setHighlightColor(null);
                }}
                className="w-full mt-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-surface-muted rounded"
              >
                Remove
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

      {/* Link */}
      <div className="relative">
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('link')) {
              runCommand(editor, (c) => c.unsetLink());
            } else {
              setShowLinkInput(!showLinkInput);
            }
          }}
          isActive={editor.isActive('link')}
          title="Link (Cmd+K)"
          onDarkNote={onDarkNote}
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 z-50 flex items-center gap-1 p-2 bg-surface border border-border rounded-lg shadow-lg">
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="Enter URL..."
              className="w-48 px-2 py-1 text-sm bg-surface-muted border border-border rounded focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setLink();
              }}
              className="px-2 py-1 text-sm bg-primary text-white rounded hover:brightness-110"
            >
              Add
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                closeLinkInput();
              }}
              className="px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

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
