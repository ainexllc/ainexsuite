'use client';

import { useCallback, useState } from 'react';
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
  CheckSquare,
  Quote,
  Link as LinkIcon,
  Highlighter,
  Undo2,
  Redo2,
  Minus,
} from 'lucide-react';
import { clsx } from 'clsx';

// Helper to execute editor commands safely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runCommand = (editor: Editor, fn: (chain: any) => any) => {
  fn(editor.chain().focus()).run();
};

interface EditorToolbarProps {
  editor: Editor;
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
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={clsx(
        'p-1.5 rounded-md transition-colors',
        isActive
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-surface-muted',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

export function EditorToolbar({ editor, className }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const setLink = useCallback(() => {
    if (!linkUrl) {
      runCommand(editor, (c) => c.unsetLink());
      return;
    }

    // Add https:// if no protocol is specified
    const url = linkUrl.match(/^https?:\/\//) ? linkUrl : `https://${linkUrl}`;

    runCommand(editor, (c) => c.setLink({ href: url }));
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
    } else if (e.key === 'Escape') {
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  return (
    <div className={clsx(
      'flex items-center gap-0.5 flex-wrap p-2 border-b border-border bg-surface-muted/30 rounded-t-lg',
      className
    )}>
      {/* Text formatting */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleBold())}
        isActive={editor.isActive('bold')}
        title="Bold (Cmd+B)"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleItalic())}
        isActive={editor.isActive('italic')}
        title="Italic (Cmd+I)"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleUnderline())}
        isActive={editor.isActive('underline')}
        title="Underline (Cmd+U)"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleStrike())}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleHighlight())}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleCode())}
        isActive={editor.isActive('code')}
        title="Inline code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleHeading({ level: 1 }))}
        isActive={editor.isActive('heading', { level: 1 })}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleHeading({ level: 2 }))}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleHeading({ level: 3 }))}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleBulletList())}
        isActive={editor.isActive('bulletList')}
        title="Bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleOrderedList())}
        isActive={editor.isActive('orderedList')}
        title="Numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleTaskList())}
        isActive={editor.isActive('taskList')}
        title="Task list"
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block elements */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.toggleBlockquote())}
        isActive={editor.isActive('blockquote')}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.setHorizontalRule())}
        title="Horizontal rule"
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
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>

        {showLinkInput && (
          <div className="absolute top-full left-0 mt-1 z-50 flex items-center gap-1 p-2 bg-surface border border-border rounded-lg shadow-lg">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              placeholder="Enter URL..."
              autoFocus
              className="w-48 px-2 py-1 text-sm bg-surface-muted border border-border rounded focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={setLink}
              className="px-2 py-1 text-sm bg-primary text-white rounded hover:brightness-110"
            >
              Add
            </button>
          </div>
        )}
      </div>

      <ToolbarDivider />

      {/* Undo/Redo */}
      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.undo())}
        disabled={!editor.can().undo()}
        title="Undo (Cmd+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => runCommand(editor, (c) => c.redo())}
        disabled={!editor.can().redo()}
        title="Redo (Cmd+Shift+Z)"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}
