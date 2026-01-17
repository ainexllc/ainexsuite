"use client";

import {
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  useMemo,
} from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { cn } from "../../lib/utils";
import { EditorToolbar, type EditorToolbarProps } from "./editor-toolbar";

/**
 * Ref handle for the RichTextEditor component
 */
export interface RichTextEditorRef {
  /** Get the HTML content of the editor */
  getHTML: () => string;
  /** Get the plain text content of the editor */
  getText: () => string;
  /** Focus the editor */
  focus: () => void;
  /** Blur the editor */
  blur: () => void;
  /** Check if the editor is empty */
  isEmpty: () => boolean;
  /** Direct access to the TipTap editor instance */
  editor: Editor | null;
}

export interface RichTextEditorProps {
  /** Initial HTML content */
  content?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Called when content changes with both HTML and plain text */
  onChange?: (html: string, text: string) => void;
  /** Called when editor loses focus */
  onBlur?: () => void;
  /** Called when editor gains focus */
  onFocus?: () => void;
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the editor content area */
  editorClassName?: string;
  /** Whether to show the toolbar (default: true) */
  showToolbar?: boolean;
  /** Additional CSS classes for the toolbar */
  toolbarClassName?: string;
  /** Auto-focus the editor on mount */
  autofocus?: boolean;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Minimum height of the editor (CSS value) */
  minHeight?: string;
  /** Maximum height of the editor (CSS value, enables scrolling) */
  maxHeight?: string;
  /** Callback when image button is clicked */
  onImageClick?: () => void;
  /** Force light text styling (for dark backgrounds) */
  forceLightText?: boolean;
  /** Force dark text styling (for light backgrounds) */
  forceDarkText?: boolean;
  /** Background brightness hint */
  backgroundBrightness?: "light" | "dark";
  /** Whether the entry has a cover image */
  hasCover?: boolean;
  /** Toolbar configuration options */
  toolbarOptions?: Partial<
    Pick<
      EditorToolbarProps,
      | "showHeadings"
      | "showLists"
      | "showBlockElements"
      | "showUndoRedo"
      | "showTextColor"
      | "showImageButton"
      | "fontColors"
    >
  >;
  /** Enable task lists (checkboxes) */
  enableTaskLists?: boolean;
  /** Enable auto-linking URLs */
  enableLinks?: boolean;
  /** Heading levels to allow (default: [1, 2, 3]) */
  headingLevels?: (1 | 2 | 3 | 4 | 5 | 6)[];
}

/**
 * RichTextEditor - A full-featured rich text editor built on TipTap
 *
 * Features:
 * - Text formatting (bold, italic, underline, strikethrough, code)
 * - Text color selection
 * - Headings (configurable levels)
 * - Lists (bullet, numbered, task lists)
 * - Block elements (quotes, horizontal rules)
 * - Links with auto-detection
 * - Undo/Redo
 * - Image insertion (via callback)
 * - Adaptive styling for dark/light backgrounds
 * - Full keyboard shortcut support
 * - SSR-safe with no hydration mismatches
 *
 * @example
 * ```tsx
 * const editorRef = useRef<RichTextEditorRef>(null);
 *
 * <RichTextEditor
 *   ref={editorRef}
 *   content={initialContent}
 *   placeholder="Write something..."
 *   onChange={(html, text) => saveContent(html)}
 *   onImageClick={() => openImagePicker()}
 *   showToolbar={true}
 * />
 * ```
 */
export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(
  (
    {
      content = "",
      placeholder = "Write something...",
      onChange,
      onBlur,
      onFocus,
      className,
      editorClassName,
      showToolbar = true,
      toolbarClassName,
      autofocus = false,
      editable = true,
      minHeight = "120px",
      maxHeight,
      onImageClick,
      forceLightText,
      forceDarkText,
      backgroundBrightness,
      hasCover,
      toolbarOptions = {},
      enableTaskLists = true,
      enableLinks = true,
      headingLevels = [1, 2, 3],
    },
    ref
  ) => {
    // Memoize extensions to prevent duplicate registration warnings
    const extensions = useMemo(
      () => [
        StarterKit.configure({
          heading: {
            levels: headingLevels,
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
          emptyEditorClass: "is-editor-empty",
        }),
        ...(enableLinks
          ? [
              Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
                HTMLAttributes: {
                  class:
                    "text-primary underline cursor-pointer hover:opacity-80",
                },
              }),
            ]
          : []),
        ...(enableTaskLists
          ? [
              TaskList.configure({
                HTMLAttributes: {
                  class: "not-prose pl-0",
                },
              }),
              TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                  class: "flex items-start gap-2",
                },
              }),
            ]
          : []),
        TextStyle,
        Color,
        Underline,
      ],
      [placeholder, enableLinks, enableTaskLists, headingLevels]
    );

    const editor = useEditor({
      immediatelyRender: false, // Required for SSR to avoid hydration mismatches
      extensions,
      content,
      editable,
      autofocus,
      editorProps: {
        attributes: {
          class: cn(
            "max-w-none focus:outline-none text-sm leading-relaxed p-3",
            "[&_p]:my-px",
            "[&_h1]:text-base [&_h1]:font-semibold [&_h1]:my-1.5",
            "[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:my-1.5",
            "[&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:my-1.5",
            "[&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5",
            "[&_code]:bg-surface-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px]",
            "[&_pre]:bg-surface-muted [&_pre]:p-3 [&_pre]:rounded-lg",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic",
            "[&_a]:text-primary [&_a]:underline",
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

      editor.on("focus", handleFocus);
      editor.on("blur", handleBlur);

      return () => {
        editor.off("focus", handleFocus);
        editor.off("blur", handleBlur);
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
      getHTML: () => editor?.getHTML() ?? "",
      getText: () => editor?.getText() ?? "",
      focus: () => editor?.commands.focus(),
      blur: () => editor?.commands.blur(),
      isEmpty: () => editor?.isEmpty ?? true,
      editor,
    }));

    // Helper to execute editor commands safely
    const runCommand = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (fn: (chain: any) => any) => {
        if (!editor) return;
        fn(editor.chain().focus()).run();
      },
      [editor]
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        // Markdown shortcuts
        if (!editor) return;

        // Handle Cmd/Ctrl + shortcuts
        if (event.metaKey || event.ctrlKey) {
          switch (event.key) {
            case "b":
              event.preventDefault();
              runCommand((c) => c.toggleBold());
              break;
            case "i":
              event.preventDefault();
              runCommand((c) => c.toggleItalic());
              break;
            case "u":
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
      <div className={cn("rich-text-editor flex flex-col", className)}>
        {showToolbar && (
          <EditorToolbar
            editor={editor}
            className={toolbarClassName}
            onImageClick={onImageClick}
            forceLightText={forceLightText}
            forceDarkText={forceDarkText}
            backgroundBrightness={backgroundBrightness}
            hasCover={hasCover}
            {...toolbarOptions}
          />
        )}
        <div
          className="flex-1 overflow-y-auto cursor-text"
          style={{ minHeight, maxHeight }}
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

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
