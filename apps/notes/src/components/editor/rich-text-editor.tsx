'use client';

import { useCallback, useEffect, forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { clsx } from 'clsx';
import { EditorToolbar } from './editor-toolbar';

export interface RichTextEditorRef {
  getHTML: () => string;
  getText: () => string;
  focus: () => void;
  blur: () => void;
  isEmpty: () => boolean;
  editor: Editor | null;
}

interface RichTextEditorProps {
  content?: string;
  placeholder?: string;
  onChange?: (html: string, text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  className?: string;
  editorClassName?: string;
  showToolbar?: boolean;
  toolbarClassName?: string;
  autofocus?: boolean;
  editable?: boolean;
  minHeight?: string;
}

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      content = '',
      placeholder = 'Write something...',
      onChange,
      onBlur,
      onFocus,
      className,
      editorClassName,
      showToolbar = true,
      toolbarClassName,
      autofocus = false,
      editable = true,
      minHeight = '120px',
    },
    ref
  ) => {
    const editor = useEditor({
      immediatelyRender: false, // Required for SSR to avoid hydration mismatches
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          bulletList: {
            keepMarks: true,
            keepAttributes: false,
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: 'is-editor-empty',
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          HTMLAttributes: {
            class: 'text-primary underline cursor-pointer hover:opacity-80',
          },
        }),
        TaskList.configure({
          HTMLAttributes: {
            class: 'not-prose pl-0',
          },
        }),
        TaskItem.configure({
          nested: true,
          HTMLAttributes: {
            class: 'flex items-start gap-2',
          },
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Underline,
      ],
      content,
      editable,
      autofocus,
      editorProps: {
        attributes: {
          class: clsx(
            'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
            'prose-p:my-1.5 prose-p:leading-relaxed',
            'prose-headings:my-2 prose-headings:font-semibold',
            'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
            'prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5',
            'prose-code:bg-surface-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
            'prose-pre:bg-surface-muted prose-pre:p-3 prose-pre:rounded-lg',
            'prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic',
            editorClassName
          ),
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        const text = editor.getText();
        onChange?.(html, text);
      },
      onBlur: () => {
        onBlur?.();
      },
      onFocus: () => {
        onFocus?.();
      },
    });

    // Track if editor is focused to avoid syncing content while user is typing
    const isFocusedRef = useRef(false);
    const initialContentRef = useRef(content);

    // Track focus state
    useEffect(() => {
      if (!editor) return;

      const handleFocus = () => {
        isFocusedRef.current = true;
      };
      const handleBlur = () => {
        isFocusedRef.current = false;
      };

      editor.on('focus', handleFocus);
      editor.on('blur', handleBlur);

      return () => {
        editor.off('focus', handleFocus);
        editor.off('blur', handleBlur);
      };
    }, [editor]);

    // Only sync content when editor is NOT focused (external changes only)
    useEffect(() => {
      if (!editor) return;

      // Skip syncing if editor is focused (user is typing)
      if (isFocusedRef.current) return;

      // Only sync if content actually changed from initial/external value
      if (content !== initialContentRef.current) {
        editor.commands.setContent(content);
        initialContentRef.current = content;
      }
    }, [editor, content]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() ?? '',
      getText: () => editor?.getText() ?? '',
      focus: () => editor?.commands.focus(),
      blur: () => editor?.commands.blur(),
      isEmpty: () => editor?.isEmpty ?? true,
      editor,
    }));

    // State for triggering link input in toolbar
    const [showLinkInput, setShowLinkInput] = useState(false);

    // Helper to execute editor commands safely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runCommand = useCallback((fn: (chain: any) => any) => {
      if (!editor) return;
      fn(editor.chain().focus()).run();
    }, [editor]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        // Markdown shortcuts
        if (!editor) return;

        // Handle Cmd/Ctrl + shortcuts
        if (event.metaKey || event.ctrlKey) {
          switch (event.key) {
            case 'b':
              event.preventDefault();
              runCommand((c) => c.toggleBold());
              break;
            case 'i':
              event.preventDefault();
              runCommand((c) => c.toggleItalic());
              break;
            case 'u':
              event.preventDefault();
              runCommand((c) => c.toggleUnderline());
              break;
            case 'k':
              event.preventDefault();
              // Toggle link - if link exists, remove it; otherwise show toolbar link input
              if (editor.isActive('link')) {
                runCommand((c) => c.unsetLink());
              } else if (showToolbar) {
                setShowLinkInput(true);
              }
              break;
          }
        }
      },
      [editor, runCommand, showToolbar]
    );

    if (!editor) {
      return null;
    }

    return (
      <div className={clsx('rich-text-editor flex flex-col', className)}>
        {showToolbar && (
          <EditorToolbar
            editor={editor}
            className={toolbarClassName}
            showLinkInputExternal={showLinkInput}
            onLinkInputClosed={() => setShowLinkInput(false)}
          />
        )}
        <div
          className="flex-1 overflow-y-auto cursor-text"
          style={{ minHeight }}
          onKeyDown={handleKeyDown}
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent
            editor={editor}
            className="h-full [&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:h-full"
          />
        </div>
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';
