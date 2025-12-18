'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Heading2 } from 'lucide-react';
import { clsx } from 'clsx';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-600 underline hover:text-purple-700',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={clsx('rounded-lg border border-gray-300 dark:border-gray-700', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-gray-300 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={clsx(
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor.isActive('bold') && 'bg-gray-200 dark:bg-gray-700'
          )}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={clsx(
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor.isActive('italic') && 'bg-gray-200 dark:bg-gray-700'
          )}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={clsx(
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor.isActive('heading', { level: 2 }) && 'bg-gray-200 dark:bg-gray-700'
          )}
          aria-label="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={clsx(
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor.isActive('bulletList') && 'bg-gray-200 dark:bg-gray-700'
          )}
          aria-label="Bullet list"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={clsx(
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor.isActive('orderedList') && 'bg-gray-200 dark:bg-gray-700'
          )}
          aria-label="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
