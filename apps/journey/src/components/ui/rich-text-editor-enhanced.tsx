'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { ImageWithDelete } from './image-with-delete';
import { cn } from '@/lib/utils';
import { plainText } from '@/lib/utils/text';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
  Image as ImageIcon,
  Type,
  Heading2
} from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { uploadFile } from '@/lib/firebase/storage';
import { useAuth } from '@ainexsuite/auth';
import { v4 as uuidv4 } from 'uuid';
import { ImageUploadModal } from './image-upload-modal';
import { ImageDropOverlay } from './image-drop-overlay';
import { ImageBubbleMenu } from './image-bubble-menu';
import { ImageLightbox } from './image-lightbox';
import { AISelectionMenu } from './ai-selection-menu';

interface RichTextEditorEnhancedProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  entryId?: string;
  onEditorReady?: (focusEditor: () => void) => void;
  onEditorInstance?: (editor: Editor | null) => void;
}

export function RichTextEditorEnhanced({
  content,
  onChange,
  placeholder = 'Write your thoughts...',
  disabled = false,
  entryId,
  onEditorReady,
  onEditorInstance,
}: RichTextEditorEnhancedProps) {
  const { user } = useAuth();
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string; caption?: string } | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        },
        link: false, // Disable Link from StarterKit so we can use our custom config
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-orange-600 dark:text-orange-400 underline hover:text-orange-700 dark:hover:text-orange-300'
        }
      }),
      ImageWithDelete.configure({
        inline: false,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onCreate: ({ editor: newEditor }) => {
      setIsInitialized(true);
      // Ensure cursor starts at end, not on an image
      requestAnimationFrame(() => {
        const { doc } = newEditor.state;
        newEditor.chain().setTextSelection(doc.content.size - 1).run();
      });
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] max-h-[600px] overflow-y-auto px-4 py-3 text-foreground'
      }
    }
  });

  useEffect(() => {
    if (onEditorInstance) {
      onEditorInstance(editor ?? null);
      return () => {
        onEditorInstance(null);
      };
    }
    return undefined;
  }, [editor, onEditorInstance]);

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      return file;
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const uploadId = uuidv4();
    setUploadingImages(prev => new Set(prev).add(uploadId));

    try {
      // Add loading placeholder
      const loadingHtml = `<p data-upload-id="${uploadId}" class="text-gray-500 dark:text-gray-400">Uploading ${file.name}...</p>`;
      editor?.chain().focus().insertContent(loadingHtml).run();

      // Compress and upload
      const compressedFile = await compressImage(file);
      const tempEntryId = entryId || `temp-${uuidv4()}`;
      const result = await uploadFile(user.uid, tempEntryId, compressedFile);

      // Replace loading placeholder with image
      const content = editor?.getHTML() || '';
      const newContent = content.replace(
        `<p data-upload-id="${uploadId}" class="text-gray-500 dark:text-gray-400">Uploading ${file.name}...</p>`,
        `<img src="${result.url}" alt="${file.name}" />`
      );
      editor?.commands.setContent(newContent);

      return result.url;
    } catch (error) {
      // Remove loading placeholder on error
      const content = editor?.getHTML() || '';
      const newContent = content.replace(
        `<p data-upload-id="${uploadId}" class="text-gray-500 dark:text-gray-400">Uploading ${file.name}...</p>`,
        ''
      );
      editor?.commands.setContent(newContent);
      return null;
    } finally {
      setUploadingImages(prev => {
        const next = new Set(prev);
        next.delete(uploadId);
        return next;
      });
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.type.startsWith('image/')) {
        await uploadImage(file);
      }
    }
  }, [user, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    disabled: disabled || !user
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const validUrl = url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `https://${url}`;

    editor.chain().focus().extendMarkRange('link').setLink({ href: validUrl }).run();
  }, [editor]);

  const handleImageInsert = (imageUrl: string, altText?: string) => {
    if (editor) {
      editor.chain().focus().setImage({
        src: imageUrl,
        alt: altText || 'Image'
      }).run();
    }
  };

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(() => {
        editor.chain().focus('end').run();
      });
    }
  }, [editor, onEditorReady]);

  // Sync external content changes to the editor
  useEffect(() => {
    if (!editor || !isInitialized) return;

    const currentContent = editor.getHTML();
    // Only update if content prop is different from editor content
    if (content !== currentContent) {
      editor.commands.setContent(content);
      // Ensure cursor is at end of text, not selecting an image
      requestAnimationFrame(() => {
        const { doc } = editor.state;
        editor.chain().setTextSelection(doc.content.size - 1).run();
      });
    }
  }, [content, editor, isInitialized]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors',
        isActive && 'bg-gray-100 dark:bg-white/10 text-orange-600 dark:text-orange-400',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="rounded-lg overflow-hidden">
        <div className="border-b border-zinc-200/50 dark:border-zinc-700/30 bg-zinc-900/10 dark:bg-zinc-900/30 backdrop-blur-md px-2 py-1.5 flex items-center gap-1 flex-wrap">
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              disabled={disabled}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              disabled={disabled}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-white/20" />

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              disabled={disabled}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
              disabled={disabled}
              title="Paragraph"
            >
              <Type className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-white/20" />

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              disabled={disabled}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              disabled={disabled}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              disabled={disabled}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-white/20" />

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive('link')}
              disabled={disabled}
              title="Add Link (Ctrl+K)"
            >
              <Link2 className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setShowImageModal(true)}
              disabled={disabled || !user}
              title="Insert Image"
            >
              <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="w-px h-6 bg-zinc-200 dark:bg-white/20" />

          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={disabled || !editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={disabled || !editor.can().redo()}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {uploadingImages.size > 0 && (
            <>
              <div className="w-px h-6 bg-zinc-200 dark:bg-white/20" />
              <div className="text-sm text-orange-600 dark:text-orange-400 px-2">
                Uploading {uploadingImages.size} image{uploadingImages.size > 1 ? 's' : ''}...
              </div>
            </>
          )}
        </div>

        <div
          {...getRootProps()}
          className="relative rounded-b-lg bg-white dark:bg-zinc-900"
        >
          <input {...getInputProps()} />
          <ImageDropOverlay isDragActive={isDragActive} />
          <EditorContent
            editor={editor}
            className={cn(
              "min-h-[300px]",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          />
          {/* Image bubble menu - appears when image is selected */}
          {editor && (
            <ImageBubbleMenu
              editor={editor}
              onOpenLightbox={() => {
                const attrs = editor.getAttributes('image');
                if (attrs.src) {
                  setLightboxImage({
                    src: attrs.src,
                    alt: attrs.alt,
                    caption: attrs.caption,
                  });
                }
              }}
            />
          )}
          {/* AI selection menu - appears when text is selected */}
          {editor && <AISelectionMenu editor={editor} />}
        </div>

        {/* Word count footer */}
        {editor && (() => {
          const text = plainText(editor.getHTML());
          const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
          const chars = text.length;
          const readingTime = Math.max(1, Math.ceil(words / 200));
          return (
            <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200/50 dark:border-zinc-700/30 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-3">
                <span>{words} {words === 1 ? 'word' : 'words'}</span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span>{chars.toLocaleString()} chars</span>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span>~{readingTime} min read</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Lightbox for full-size image view */}
      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        src={lightboxImage?.src || ''}
        alt={lightboxImage?.alt}
        caption={lightboxImage?.caption}
      />

      <ImageUploadModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsert={handleImageInsert}
        entryId={entryId}
      />
    </>
  );
}
