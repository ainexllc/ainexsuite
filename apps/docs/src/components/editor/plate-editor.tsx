'use client';

import { useCallback, useEffect, forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import {
  Plate,
  PlateContent,
  usePlateEditor,
  type PlateEditor as PlateEditorType,
} from 'platejs/react';
import type { Value } from 'platejs';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  HighlightPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  BlockquotePlugin,
  HorizontalRulePlugin,
  SuperscriptPlugin,
  SubscriptPlugin,
} from '@platejs/basic-nodes/react';
import {
  FontColorPlugin,
  FontSizePlugin,
  TextAlignPlugin,
} from '@platejs/basic-styles/react';
import {
  ListPlugin,
  BulletedListPlugin,
  NumberedListPlugin,
  ListItemPlugin,
  TodoListPlugin,
} from '@platejs/list-classic/react';
import { LinkPlugin } from '@platejs/link/react';
import { AutoformatPlugin } from '@platejs/autoformat';
// Phase 1: Tables, Code blocks, Indent
import {
  TablePlugin,
  TableRowPlugin,
  TableCellPlugin,
  TableCellHeaderPlugin,
} from '@platejs/table/react';
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from '@platejs/code-block/react';
import { IndentPlugin } from '@platejs/indent/react';
// Phase 2: Drag & Drop
import { DndPlugin } from '@platejs/dnd';
// Note: Slash commands require base plugins; floating toolbar uses hooks
import { BaseSlashPlugin, BaseSlashInputPlugin } from '@platejs/slash-command';
// Phase 3: Media, Callouts, Toggle
import { ImagePlugin, VideoPlugin, MediaEmbedPlugin } from '@platejs/media/react';
import { CalloutPlugin } from '@platejs/callout/react';
import { TogglePlugin } from '@platejs/toggle/react';
// Phase 4: Emoji, Mentions, Block Selection
import { EmojiPlugin } from '@platejs/emoji/react';
import { MentionPlugin, MentionInputPlugin } from '@platejs/mention/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { clsx } from 'clsx';
import { PlateToolbar } from './plate-toolbar';

// Autoformat rules for markdown-like shortcuts
const autoformatRules = [
  // Marks
  { mode: 'mark' as const, type: 'bold', match: '**', },
  { mode: 'mark' as const, type: 'bold', match: '__', },
  { mode: 'mark' as const, type: 'italic', match: '*', },
  { mode: 'mark' as const, type: 'italic', match: '_', },
  { mode: 'mark' as const, type: 'code', match: '`', },
  { mode: 'mark' as const, type: 'strikethrough', match: '~~', },
  // Block elements
  { mode: 'block' as const, type: 'h1', match: '# ', },
  { mode: 'block' as const, type: 'h2', match: '## ', },
  { mode: 'block' as const, type: 'h3', match: '### ', },
  { mode: 'block' as const, type: 'blockquote', match: '> ', },
  { mode: 'block' as const, type: 'ul', match: ['- ', '* '], },
  { mode: 'block' as const, type: 'ol', match: '1. ', },
  { mode: 'block' as const, type: 'action_item', match: '[] ', },
  // Code blocks
  { mode: 'block' as const, type: 'code_block', match: '``` ', },
  { mode: 'block' as const, type: 'code_block', match: '```', },
];

export interface PlateEditorRef {
  getHTML: () => string;
  getText: () => string;
  getValue: () => Value;
  setValue: (value: Value | string) => void;
  focus: () => void;
  blur: () => void;
  isEmpty: () => boolean;
  editor: PlateEditorType | null;
}

interface PlateEditorProps {
  content?: string;
  initialValue?: Value;
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

// Default empty value
const defaultValue: Value = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

// Strip HTML tags safely using DOMParser (XSS-safe)
function stripHtmlTags(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use regex as fallback (for text extraction only)
    return html.replace(/<[^>]*>/g, '');
  }
  // Client-side: use DOMParser (safe, doesn't execute scripts)
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}

// Simple HTML to Plate value conversion
function htmlToPlateValue(html: string): Value {
  if (!html || html.trim() === '') {
    return defaultValue;
  }

  // Extract plain text safely
  const text = stripHtmlTags(html);
  if (text.trim()) {
    return [
      {
        type: 'p',
        children: [{ text }],
      },
    ];
  }

  return defaultValue;
}

// Convert Plate value to plain text
function plateValueToText(value: Value): string {
  if (!value || !Array.isArray(value)) return '';

  const extractText = (node: unknown): string => {
    if (typeof node === 'object' && node !== null) {
      const n = node as Record<string, unknown>;
      if ('text' in n && typeof n.text === 'string') {
        return n.text;
      }
      if ('children' in n && Array.isArray(n.children)) {
        return n.children.map(extractText).join('');
      }
    }
    return '';
  };

  return value.map((node) => extractText(node)).join('\n');
}

// Escape HTML entities for safe output
function escapeHtml(text: string): string {
  const div = typeof document !== 'undefined' ? document.createElement('div') : null;
  if (div) {
    div.textContent = text;
    return div.textContent || '';
  }
  // Fallback for SSR
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Convert Plate value to HTML (simplified)
function plateValueToHTML(value: Value): string {
  if (!value || !Array.isArray(value)) return '';

  const nodeToHTML = (node: unknown): string => {
    if (typeof node === 'object' && node !== null) {
      const n = node as Record<string, unknown>;

      // Text node
      if ('text' in n && typeof n.text === 'string') {
        let text = escapeHtml(n.text);
        if (n.bold) text = `<strong>${text}</strong>`;
        if (n.italic) text = `<em>${text}</em>`;
        if (n.underline) text = `<u>${text}</u>`;
        if (n.strikethrough) text = `<s>${text}</s>`;
        if (n.code) text = `<code>${text}</code>`;
        if (n.highlight) text = `<mark>${text}</mark>`;
        if (n.superscript) text = `<sup>${text}</sup>`;
        if (n.subscript) text = `<sub>${text}</sub>`;
        if (n.fontSize) text = `<span style="font-size:${n.fontSize}">${text}</span>`;
        if (n.color) text = `<span style="color:${n.color}">${text}</span>`;
        return text;
      }

      // Element node
      if ('children' in n && Array.isArray(n.children)) {
        const childrenHTML = n.children.map(nodeToHTML).join('');
        const type = n.type as string;

        switch (type) {
          case 'p': {
            const align = n.align as string | undefined;
            const indent = n.indent as number | undefined;
            const styles: string[] = [];
            if (align) styles.push(`text-align:${align}`);
            if (indent && indent > 0) styles.push(`margin-left:${indent * 24}px`);
            const style = styles.length > 0 ? ` style="${styles.join(';')}"` : '';
            return `<p${style}>${childrenHTML}</p>`;
          }
          case 'h1':
            return `<h1>${childrenHTML}</h1>`;
          case 'h2':
            return `<h2>${childrenHTML}</h2>`;
          case 'h3':
            return `<h3>${childrenHTML}</h3>`;
          case 'blockquote':
            return `<blockquote>${childrenHTML}</blockquote>`;
          case 'ul':
            return `<ul>${childrenHTML}</ul>`;
          case 'ol':
            return `<ol>${childrenHTML}</ol>`;
          case 'li':
            return `<li>${childrenHTML}</li>`;
          case 'action_item': {
            const checked = n.checked ? 'checked' : '';
            return `<li data-checked="${checked}">${childrenHTML}</li>`;
          }
          case 'hr':
            return '<hr />';
          case 'a': {
            const url = typeof n.url === 'string' ? escapeHtml(n.url) : '';
            return `<a href="${url}">${childrenHTML}</a>`;
          }
          // Phase 1: Tables
          case 'table':
            return `<table class="border-collapse w-full">${childrenHTML}</table>`;
          case 'tr':
            return `<tr>${childrenHTML}</tr>`;
          case 'td': {
            const colspan = n.colSpan ? ` colspan="${n.colSpan}"` : '';
            const rowspan = n.rowSpan ? ` rowspan="${n.rowSpan}"` : '';
            return `<td${colspan}${rowspan}>${childrenHTML}</td>`;
          }
          case 'th': {
            const colspan = n.colSpan ? ` colspan="${n.colSpan}"` : '';
            const rowspan = n.rowSpan ? ` rowspan="${n.rowSpan}"` : '';
            return `<th${colspan}${rowspan}>${childrenHTML}</th>`;
          }
          // Phase 1: Code blocks
          case 'code_block': {
            const lang = typeof n.lang === 'string' ? escapeHtml(n.lang) : '';
            const langAttr = lang ? ` class="language-${lang}"` : '';
            return `<pre><code${langAttr}>${childrenHTML}</code></pre>`;
          }
          case 'code_line':
            return `${childrenHTML}\n`;
          // Phase 3: Images
          case 'img': {
            const src = typeof n.url === 'string' ? escapeHtml(n.url) : '';
            const alt = typeof n.alt === 'string' ? escapeHtml(n.alt) : '';
            const width = n.width ? ` width="${n.width}"` : '';
            return `<img src="${src}" alt="${alt}"${width} />`;
          }
          // Phase 3: Video
          case 'video': {
            const src = typeof n.url === 'string' ? escapeHtml(n.url) : '';
            return `<video src="${src}" controls></video>`;
          }
          // Phase 3: Media embed (iframe)
          case 'media_embed': {
            const src = typeof n.url === 'string' ? escapeHtml(n.url) : '';
            return `<iframe src="${src}" frameborder="0" allowfullscreen></iframe>`;
          }
          // Phase 3: Callouts
          case 'callout': {
            const variant = (n.variant as string) || 'info';
            const icon = (n.icon as string) || '';
            return `<div class="callout callout-${variant}" data-icon="${icon}">${childrenHTML}</div>`;
          }
          // Phase 3: Toggle/Collapsible
          case 'toggle': {
            const title = typeof n.title === 'string' ? escapeHtml(n.title) : '';
            return `<details><summary>${title}</summary>${childrenHTML}</details>`;
          }
          // Phase 4: Mentions
          case 'mention': {
            const value = typeof n.value === 'string' ? escapeHtml(n.value) : '';
            return `<span class="mention" data-mention="${value}">@${value}</span>`;
          }
          default:
            return childrenHTML;
        }
      }
    }
    return '';
  };

  return value.map(nodeToHTML).join('');
}

export const PlateRichTextEditor = forwardRef<PlateEditorRef, PlateEditorProps>(
  (
    {
      content = '',
      initialValue,
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
    const [isFocused, setIsFocused] = useState(false);

    // Determine initial value
    const startValue = useMemo(() => {
      if (initialValue) return initialValue;
      if (content) return htmlToPlateValue(content);
      return defaultValue;
    }, [initialValue, content]);

    // Create the editor with plugins
    const editor = usePlateEditor({
      plugins: [
        // Marks
        BoldPlugin.configure({ shortcuts: { toggle: { keys: 'mod+b' } } }),
        ItalicPlugin.configure({ shortcuts: { toggle: { keys: 'mod+i' } } }),
        UnderlinePlugin.configure({ shortcuts: { toggle: { keys: 'mod+u' } } }),
        StrikethroughPlugin.configure({ shortcuts: { toggle: { keys: 'mod+shift+x' } } }),
        CodePlugin.configure({ shortcuts: { toggle: { keys: 'mod+e' } } }),
        HighlightPlugin.configure({ shortcuts: { toggle: { keys: 'mod+shift+h' } } }),
        // Font formatting
        FontColorPlugin,
        FontSizePlugin,
        SuperscriptPlugin,
        SubscriptPlugin,
        // Text alignment
        TextAlignPlugin,
        // Block elements
        H1Plugin,
        H2Plugin,
        H3Plugin,
        BlockquotePlugin,
        HorizontalRulePlugin,
        // Lists
        ListPlugin,
        BulletedListPlugin,
        NumberedListPlugin,
        ListItemPlugin,
        TodoListPlugin,
        // Links
        LinkPlugin.configure({
          options: {
            allowedSchemes: ['http', 'https', 'mailto'],
          },
        }),
        // Phase 1: Tables
        TablePlugin,
        TableRowPlugin,
        TableCellPlugin,
        TableCellHeaderPlugin,
        // Phase 1: Code blocks
        CodeBlockPlugin,
        CodeLinePlugin,
        CodeSyntaxPlugin,
        // Phase 1: Indent
        IndentPlugin.configure({
          options: {
            offset: 24,
            unit: 'px',
          },
        }),
        // Phase 2: Drag & Drop
        DndPlugin.configure({
          options: {
            enableScroller: true,
          },
        }),
        // Phase 2: Slash commands (base plugins)
        BaseSlashPlugin,
        BaseSlashInputPlugin.configure({
          options: {
            trigger: '/',
            triggerPreviousCharPattern: /^\s?$/,
          },
        }),
        // Phase 3: Media (Images, Videos, Embeds)
        ImagePlugin,
        VideoPlugin,
        MediaEmbedPlugin,
        // Phase 3: Callouts
        CalloutPlugin,
        // Phase 3: Toggle/Collapsible blocks
        TogglePlugin,
        // Phase 4: Emoji (: trigger)
        EmojiPlugin.configure({
          options: {
            trigger: ':',
          },
        }),
        // Phase 4: Mentions (@ trigger)
        MentionPlugin,
        MentionInputPlugin.configure({
          options: {
            trigger: '@',
          },
        }),
        // Phase 4: Block selection (multi-block select)
        BlockSelectionPlugin,
        // Autoformat for markdown shortcuts
        AutoformatPlugin.configure({
          options: {
            rules: autoformatRules,
          },
        }),
      ],
      value: startValue,
    });

    // Handle content changes
    const handleChange = useCallback(
      ({ value }: { value: Value }) => {
        const html = plateValueToHTML(value);
        const text = plateValueToText(value);
        onChange?.(html, text);
      },
      [onChange]
    );

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getHTML: () => plateValueToHTML(editor.children as Value),
      getText: () => plateValueToText(editor.children as Value),
      getValue: () => editor.children as Value,
      setValue: (value: Value | string) => {
        if (typeof value === 'string') {
          const plateValue = htmlToPlateValue(value);
          editor.tf.setValue(plateValue);
        } else {
          editor.tf.setValue(value);
        }
      },
      focus: () => {
        // Focus the editor using Plate's API
        try {
          editor.tf.focus?.();
        } catch {
          // Fallback to DOM focus
          const editorElement = document.querySelector('[data-slate-editor="true"]');
          if (editorElement instanceof HTMLElement) {
            editorElement.focus();
          }
        }
      },
      blur: () => {
        try {
          editor.tf.blur?.();
        } catch {
          // Fallback to DOM blur
          const editorElement = document.querySelector('[data-slate-editor="true"]');
          if (editorElement instanceof HTMLElement) {
            editorElement.blur();
          }
        }
      },
      isEmpty: () => {
        const value = editor.children as Value;
        if (!value || value.length === 0) return true;
        if (value.length === 1) {
          const first = value[0] as Record<string, unknown>;
          if (first.type === 'p' && Array.isArray(first.children) && first.children.length === 1) {
            const child = first.children[0] as Record<string, unknown>;
            if ('text' in child && child.text === '') return true;
          }
        }
        return false;
      },
      editor,
    }));

    // Handle focus/blur
    useEffect(() => {
      if (isFocused) {
        onFocus?.();
      }
    }, [isFocused, onFocus]);

    // Autofocus
    useEffect(() => {
      if (autofocus) {
        setTimeout(() => {
          try {
            editor.tf.focus?.();
          } catch {
            const editorElement = document.querySelector('[data-slate-editor="true"]');
            if (editorElement instanceof HTMLElement) {
              editorElement.focus();
            }
          }
        }, 100);
      }
    }, [autofocus, editor]);

    return (
      <div className={clsx('plate-editor flex flex-col', className)}>
        <Plate
          editor={editor}
          onChange={handleChange}
        >
          {showToolbar && (
            <PlateToolbar editor={editor} className={toolbarClassName} />
          )}
          {/* Scrollable area with canvas background */}
          <div
            className="flex-1 overflow-y-auto cursor-text bg-neutral-200 dark:bg-neutral-900"
            style={{ minHeight }}
          >
            {/* Pages container */}
            <div className="py-6 px-4 flex flex-col items-center gap-6">
              {/* Page with shadow and page-break styling */}
              <div
                className="bg-white dark:bg-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] relative"
                style={{
                  width: '816px',      // 8.5" at 96dpi (letter width)
                  minHeight: '1056px', // 11" at 96dpi (letter height)
                  maxWidth: '100%',    // Responsive on smaller screens
                }}
              >
                <PlateContent
                  readOnly={!editable}
                  placeholder={placeholder}
                  onBlur={() => {
                    setIsFocused(false);
                    onBlur?.();
                  }}
                  onFocus={() => setIsFocused(true)}
                  className={clsx(
                    'prose prose-sm dark:prose-invert max-w-none focus:outline-none',
                    'prose-p:my-1.5 prose-p:leading-relaxed',
                    'prose-headings:my-2 prose-headings:font-semibold',
                    'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
                    'prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5',
                    'prose-code:bg-surface-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
                    'prose-pre:bg-surface-muted prose-pre:p-3 prose-pre:rounded-lg',
                    'prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic',
                    'min-h-full',
                    // Document margins: 1" top/bottom, 0.75" sides (like Word/Docs)
                    'px-[72px] py-[96px]',
                    editorClassName
                  )}
                />

                {/* Page break line at bottom - visual indicator */}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                  <div className="h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-600 to-transparent" />
                </div>
              </div>

              {/* Empty second page - shows continuation */}
              <div
                className="bg-white dark:bg-neutral-800 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]"
                style={{
                  width: '816px',
                  height: '1056px',
                  maxWidth: '100%',
                }}
              />
            </div>
          </div>
        </Plate>
      </div>
    );
  }
);

PlateRichTextEditor.displayName = 'PlateRichTextEditor';
