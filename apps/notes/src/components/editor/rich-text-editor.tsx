'use client';

import { useCallback, useEffect, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
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
  onImageClick?: () => void;
  // Adaptive styling props
  forceLightText?: boolean;
  forceDarkText?: boolean;
  backgroundBrightness?: 'light' | 'dark';
  hasCover?: boolean;
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
      onImageClick,
      forceLightText,
      forceDarkText,
      backgroundBrightness,
      hasCover,
    },
    ref
  ) => {
    // Memoize extensions to prevent duplicate registration warnings
    const extensions = useMemo(() => [
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
      TextStyle,
      Color,
      Underline,
    ], [placeholder]);

    const editor = useEditor({
      immediatelyRender: false, // Required for SSR to avoid hydration mismatches
      extensions,
      content,
      editable,
      autofocus,
      editorProps: {
        attributes: {
          class: clsx(
            'max-w-none focus:outline-none text-sm leading-relaxed p-3',
            '[&_p]:my-px',
            '[&_h1]:text-base [&_h1]:font-semibold [&_h1]:my-1.5',
            '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:my-1.5',
            '[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:my-1.5',
            '[&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5',
            '[&_code]:bg-surface-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px]',
            '[&_pre]:bg-surface-muted [&_pre]:p-3 [&_pre]:rounded-lg',
            '[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic',
            '[&_a]:text-primary [&_a]:underline',
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
          }
        }
      },
      [editor, runCommand]
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
            onImageClick={onImageClick}
            forceLightText={forceLightText}
            forceDarkText={forceDarkText}
            backgroundBrightness={backgroundBrightness}
            hasCover={hasCover}
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
