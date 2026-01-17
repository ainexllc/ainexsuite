/**
 * Rich Text Editor Components
 *
 * A full-featured rich text editor built on TipTap with customizable
 * toolbar, adaptive styling, and comprehensive formatting options.
 *
 * @module @ainexsuite/ui/components/rich-text-editor
 */

export {
  RichTextEditor,
  type RichTextEditorRef,
  type RichTextEditorProps,
} from "./rich-text-editor";

export {
  EditorToolbar,
  ToolbarButton,
  ToolbarDivider,
  runCommand,
  FONT_COLORS,
  type EditorToolbarProps,
  type ToolbarButtonProps,
  type FontColor,
} from "./editor-toolbar";

// Re-export TipTap types for convenience
export type { Editor } from "@tiptap/react";
