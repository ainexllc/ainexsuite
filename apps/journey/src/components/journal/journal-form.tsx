'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { JournalEntryFormData, ContentEnhancementStyle, MoodType } from '@ainexsuite/types';
import { moodConfig } from '@/lib/utils/mood';
import { cn } from '@/lib/utils';
import { Loader2, Upload, X, Sparkles, Scissors, Compass, Copy } from 'lucide-react';
import { RichTextEditorEnhanced } from '@/components/ui/rich-text-editor-enhanced';
// TODO: Port InlinePrompt component from journalnex-app
// import { InlinePrompt } from '@/components/prompts/inline-prompt';
import { useToast } from '@ainexsuite/ui';
import { auth } from '@ainexsuite/firebase';
import { plainText } from '@/lib/utils/text';
import type { Editor } from '@tiptap/react';
import { DOMSerializer } from '@tiptap/pm/model';

const journalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()),
  mood: z.enum([
    'happy', 'excited', 'grateful', 'peaceful', 'neutral',
    'anxious', 'sad', 'frustrated', 'tired'
  ]).optional(),
  links: z.array(z.string().url('Please enter a valid URL')),
  isPrivate: z.boolean(),
  isDraft: z.boolean().optional(),
  date: z.union([z.string(), z.number(), z.date()]).optional(),
});

interface JournalFormProps {
  initialData?: Partial<JournalEntryFormData>;
  onSubmit: (data: JournalEntryFormData, files: File[]) => Promise<void>;
  isSubmitting: boolean;
  onContentChange?: (content: string) => void;
  /** Hide the built-in submit buttons (when buttons are rendered externally) */
  hideButtons?: boolean;
  /** Hide the title field (when title is rendered externally in the shell) */
  hideTitle?: boolean;
  /** Entry ID for image uploads - if provided, images go to entry folder; otherwise temp folder */
  entryId?: string;
}

const ENHANCEMENT_STYLES: Array<{
  id: ContentEnhancementStyle;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    id: 'clarity',
    label: 'Polish clarity',
    description: 'Tighten phrasing and smooth transitions while keeping your voice.',
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: 'concise',
    label: 'Shorten & tighten',
    description: 'Trim repetition and spotlight the essentials.',
    icon: <Scissors className="h-4 w-4" />,
  },
  {
    id: 'reflection',
    label: 'Find the insight',
    description: 'Surface takeaways and reflect on what matters.',
    icon: <Compass className="h-4 w-4" />,
  },
];

type BoostScope = 'entry' | 'selection';

interface BoostPreviewState {
  style: ContentEnhancementStyle;
  scope: BoostScope;
  originalHtml: string;
  originalPlain: string;
  enhancedHtml?: string;
  status: 'loading' | 'ready' | 'error';
  error?: string;
  selectionFrom?: number;
  selectionTo?: number;
}

const getStyleMeta = (style: ContentEnhancementStyle) =>
  ENHANCEMENT_STYLES.find((item) => item.id === style);

const getSelectionHtml = (editor: Editor): string | null => {
  if (!editor) return null;
  const { state } = editor;
  const { from, to, empty } = state.selection;
  if (empty || from === to) {
    return null;
  }

  const slice = state.selection.content();
  const serializer = DOMSerializer.fromSchema(state.schema);
  const domFragment = serializer.serializeFragment(slice.content);
  const container = document.createElement('div');
  container.appendChild(domFragment);
  return container.innerHTML.trim() || null;
};

export interface JournalFormHandle {
  setContent: (value: string) => void;
  appendToContent: (value: string, options?: { prependNewLine?: boolean }) => void;
  setTitle: (value: string) => void;
  submitPublish: () => void;
  submitDraft: () => void;
}

export const JournalForm = forwardRef<JournalFormHandle, JournalFormProps>(
function JournalForm({ initialData, onSubmit, isSubmitting, onContentChange, hideButtons = false, hideTitle = false, entryId }, ref) {
  const [files, setFiles] = useState<File[]>([]);
  const [enhancingStyle, setEnhancingStyle] = useState<ContentEnhancementStyle | null>(null);
  const [lastEnhancedContent, setLastEnhancedContent] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastEnhancedStyle, setLastEnhancedStyle] = useState<ContentEnhancementStyle | null>(null);
  const isEnhancing = enhancingStyle !== null;
  const { toast } = useToast();
  const editorFocusRef = useRef<(() => void) | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const [boostPreview, setBoostPreview] = useState<BoostPreviewState | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(journalSchema as any),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      tags: initialData?.tags || [],
      mood: initialData?.mood || 'neutral',
      links: initialData?.links || [],
      isPrivate: initialData?.isPrivate ?? false,
    },
  });

  const contentValue = watch('content');
  const selectedMood = watch('mood');
  const contentPlain = plainText(contentValue || '');
  const minBoostWordCount = 40;
  const wordCount = contentPlain.trim().length
    ? contentPlain.trim().split(/\s+/).filter(Boolean).length
    : 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const missingWords = Math.max(minBoostWordCount - wordCount, 0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canEnhance = wordCount >= minBoostWordCount;

  useEffect(() => {
    if (onContentChange) {
      onContentChange(contentValue ?? '');
    }
  }, [contentValue, onContentChange]);

  useEffect(() => {
    if (!boostPreview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setBoostPreview(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boostPreview]);

  useImperativeHandle(ref, () => ({
    setContent: (value: string) => {
      setValue('content', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    },
    appendToContent: (value: string, options?: { prependNewLine?: boolean }) => {
      const current = getValues('content') ?? '';
      const needsSpacer = options?.prependNewLine ?? (current.trim().length > 0 && !current.trim().endsWith('\n'));
      const spacer = needsSpacer ? '\n\n' : '';
      const next = `${current}${spacer}${value}`;
      setValue('content', next, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    },
    setTitle: (value: string) => {
      setValue('title', value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    },
    submitPublish: () => {
      submitPublish();
    },
    submitDraft: () => {
      submitDraft();
    },
  }));

  const handleFormSubmit = async (
    data: JournalEntryFormData,
    mode: 'publish' | 'draft',
  ) => {
    await onSubmit(
      {
        ...data,
        isDraft: mode === 'draft',
      },
      files,
    );
  };
  const submitPublish = handleSubmit((data) => handleFormSubmit(data, 'publish'));
  const submitDraft = handleSubmit((data) => handleFormSubmit(data, 'draft'));

  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      editorFocusRef.current?.();
    }
  };

  const closeBoostPreview = () => {
    setBoostPreview(null);
  };

  const applyBoost = (mode: 'replace' | 'insert') => {
    if (!boostPreview || boostPreview.status !== 'ready' || !boostPreview.enhancedHtml) {
      return;
    }

    const editor = editorInstanceRef.current;
    const enhancedHtml = boostPreview.enhancedHtml;
    const styleMeta = getStyleMeta(boostPreview.style);
    const label = styleMeta?.label ?? 'AI boost';

    if (mode === 'replace') {
      if (boostPreview.scope === 'selection' && editor) {
        const previous = editor.getHTML();
        if (
          boostPreview.selectionFrom !== undefined &&
          boostPreview.selectionTo !== undefined
        ) {
          try {
            editor.commands.setTextSelection({
              from: boostPreview.selectionFrom,
              to: boostPreview.selectionTo,
            });
          } catch {
            // Selection may be out of range if the document changed; ignore.
          }
        }
        editor.chain().focus().insertContent(enhancedHtml).run();
        const updated = editor.getHTML();
        setValue('content', updated, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setLastEnhancedContent(previous);
        setLastEnhancedStyle(boostPreview.style);
      } else {
        const previous = getValues('content') ?? '';
        setLastEnhancedContent(previous);
        setLastEnhancedStyle(boostPreview.style);
        setValue('content', enhancedHtml, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    } else {
      if (editor) {
        const previous = editor.getHTML();
        editor.chain().focus().insertContent(enhancedHtml).run();
        const updated = editor.getHTML();
        setValue('content', updated, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
        setLastEnhancedContent(previous);
        setLastEnhancedStyle(boostPreview.style);
      } else {
        const previous = getValues('content') ?? '';
        const spacer = previous.trim().length > 0 ? '\n\n' : '';
        setLastEnhancedContent(previous);
        setLastEnhancedStyle(boostPreview.style);
        setValue('content', `${previous}${spacer}${enhancedHtml}`, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }

    toast({
      title: 'Boost applied',
      description: `${label} applied to ${boostPreview.scope === 'selection' ? 'selected text' : 'your entry'}.`,
      variant: 'success',
    });

    setBoostPreview(null);
  };

  const handleCopyPreview = async () => {
    if (!boostPreview?.enhancedHtml) return;
    try {
      await navigator.clipboard.writeText(plainText(boostPreview.enhancedHtml));
      toast({
        title: 'Copied',
        description: 'Enhanced text copied to clipboard.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard on this device.',
        variant: 'error',
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleBoostPreview = async (style: ContentEnhancementStyle) => {
    if (isEnhancing) return;

    const editor = editorInstanceRef.current;
    const selectionHtml = editor ? getSelectionHtml(editor) : null;
    const hasSelection = Boolean(selectionHtml);
    const scope: BoostScope = hasSelection ? 'selection' : 'entry';
    const sourceHtml = scope === 'selection' ? selectionHtml : getValues('content') ?? '';
    const sourcePlain = plainText(sourceHtml || '');

    if (!sourceHtml || !sourcePlain.trim()) {
      toast({
        title: 'Write a little more first',
        description: 'Add a few sentences so we have something to enhance.',
        variant: 'error',
      });
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast({
        title: 'You need to be signed in',
        description: 'Please sign in again to use AI boosts.',
        variant: 'error',
      });
      return;
    }

    const selectionFrom = editor && scope === 'selection' ? editor.state.selection.from : undefined;
    const selectionTo = editor && scope === 'selection' ? editor.state.selection.to : undefined;

    setEnhancingStyle(style);
    setBoostPreview({
      style,
      scope,
      originalHtml: sourceHtml,
      originalPlain: sourcePlain,
      status: 'loading',
      selectionFrom,
      selectionTo,
    });

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ style, content: sourceHtml }),
      });

      const data = await response.json();
      if (!response.ok || !data?.content) {
        throw new Error(data?.error ?? 'Failed to enhance entry');
      }

      setBoostPreview((prev) =>
        prev && prev.style === style
          ? {
              ...prev,
              enhancedHtml: data.content,
              status: 'ready',
            }
          : prev,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please try again later.';
      setBoostPreview((prev) =>
        prev && prev.style === style
          ? {
              ...prev,
              status: 'error',
              error: message,
            }
          : prev,
      );
      toast({
        title: 'Unable to enhance right now',
        description: message,
        variant: 'error',
      });
    } finally {
      setEnhancingStyle(null);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUndoEnhancement = () => {
    if (!lastEnhancedContent) return;

    setValue('content', lastEnhancedContent, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setLastEnhancedContent(null);
    setLastEnhancedStyle(null);

    toast({
      title: 'Original restored',
      description: 'Your entry is back to its previous form.',
      variant: 'success',
    });
  };

  const isEditing = Boolean(initialData);
  const publishLabel = isEditing
    ? initialData?.isDraft
      ? 'Publish Entry'
      : 'Save Changes'
    : 'Publish Entry';
  const draftLabel = isEditing
    ? initialData?.isDraft
      ? 'Update Draft'
      : 'Save as Draft'
    : 'Save Draft';

  return (
    <form onSubmit={submitPublish} className="space-y-4">
      {!hideTitle && (
        <div>
          <input
            {...register('title')}
            type="text"
            className="w-full bg-transparent text-lg font-semibold focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            placeholder="Title"
            disabled={isSubmitting}
            onKeyDown={handleTitleKeyDown}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{String(errors.title.message)}</p>
          )}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <RichTextEditorEnhanced
            content={contentValue || ''}
            onChange={(value) => setValue('content', value)}
            placeholder="Write your thoughts..."
            disabled={isSubmitting || isEnhancing}
            entryId={entryId}
            onEditorReady={(focus) => {
              editorFocusRef.current = focus;
            }}
            onEditorInstance={(instance) => {
              editorInstanceRef.current = instance;
            }}
          />
          {isEnhancing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-surface-base/90 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Boosting your writing...
              </div>
            </div>
          )}
        </div>
        {/* TODO: Port InlinePrompt component */}
        {/* <InlinePrompt
          currentContent={watch('content') || ''}
          onPromptResponse={(response) => {
            const currentContent = watch('content') || '';
            setValue('content', currentContent + response);
          }}
        /> */}
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{String(errors.content.message)}</p>
        )}
      </div>

      {boostPreview && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 px-4"
          onClick={closeBoostPreview}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl border border-border bg-surface-base shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getStyleMeta(boostPreview.style)?.label ?? 'AI boost preview'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {boostPreview.scope === 'selection'
                    ? 'Previewing changes for your selected text'
                    : 'Previewing changes for your entire entry'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBoostPreview}
                className="rounded-full p-2 text-gray-600 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-6">
              {boostPreview.status === 'loading' && (
                <div className="flex min-h-[180px] items-center justify-center">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating boost preview…
                  </div>
                </div>
              )}

              {boostPreview.status === 'error' && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">We couldn&apos;t preview this boost.</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{boostPreview.error}</p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeBoostPreview}
                      className="rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:border-orange-500 dark:hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {boostPreview.status === 'ready' && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Original</p>
                      <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/70 p-4 text-sm text-gray-900 dark:text-gray-100">
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: boostPreview.originalHtml }}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Boosted preview</p>
                      <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-orange-500/40 dark:border-orange-400/40 bg-orange-500/5 dark:bg-orange-400/5 p-4 text-sm text-gray-900 dark:text-gray-100">
                        <div
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: boostPreview.enhancedHtml ?? '' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => applyBoost('replace')}
                      className="inline-flex items-center gap-2 rounded-full bg-orange-500 dark:bg-orange-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 dark:hover:bg-orange-500"
                    >
                      {boostPreview.scope === 'selection' ? 'Replace selection' : 'Replace entry'}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyBoost('insert')}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition hover:border-orange-500 dark:hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      Insert at cursor
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyPreview}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition hover:border-orange-500 dark:hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <Copy className="h-4 w-4" />
                      Copy text
                    </button>
                    <button
                      type="button"
                      onClick={closeBoostPreview}
                      className="inline-flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mood Picker */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          How are you feeling?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(moodConfig) as MoodType[]).map((mood) => {
            const config = moodConfig[mood];
            const Icon = config.icon;
            const isSelected = selectedMood === mood;
            return (
              <button
                key={mood}
                type="button"
                onClick={() => setValue('mood', mood)}
                disabled={isSubmitting}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all',
                  isSelected
                    ? 'bg-orange-500/15 dark:bg-orange-400/10 ring-2 ring-orange-500 dark:ring-orange-400'
                    : 'bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10'
                )}
              >
                <Icon className={cn(
                  'h-6 w-6',
                  isSelected
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-zinc-600 dark:text-zinc-400'
                )} />
                <span className={cn(
                  'text-[11px] font-medium leading-tight',
                  isSelected
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-zinc-600 dark:text-zinc-500'
                )}>
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Attachments
        </label>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="hidden"
            id="file-upload"
            accept="image/*,.pdf,.txt,.doc,.docx"
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="w-8 h-8 text-gray-500 dark:text-gray-400 mb-2" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Images, PDFs, and documents up to 10MB
            </span>
          </label>
        </div>

        {files.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {files.map((file, index) => {
              const isImage = file.type.startsWith('image/');
              const previewUrl = isImage ? URL.createObjectURL(file) : null;

              return isImage ? (
                <figure
                  key={index}
                  className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl!}
                    alt={file.name}
                    className="h-32 w-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    onLoad={() => {
                      // Revoke URL after image loads to free memory
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting}
                    className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                    <span className="text-xs text-white truncate block">{file.name}</span>
                  </div>
                </figure>
              ) : (
                <div
                  key={index}
                  className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700"
                >
                  <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-600 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!hideButtons && (
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4 pt-4 mt-2 border-t border-border">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitDraft()}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex-1 sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 animate-spin inline" size={18} />
                Saving...
              </>
            ) : (
              draftLabel
            )}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-orange-500 dark:bg-orange-400 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-500 transition-colors flex flex-1 items-center justify-center sm:flex-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 inline" size={20} />
                Saving...
              </>
            ) : (
              publishLabel
            )}
          </button>
        </div>
      )}
    </form>
  );
});

JournalForm.displayName = 'JournalForm';
