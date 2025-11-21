'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { JournalEntryFormData, MoodType, ContentEnhancementStyle } from '@ainexsuite/types';
import { moodConfig } from '@/lib/utils/mood';
import { cn } from '@/lib/utils';
import { Loader2, Upload, X, Link, Sparkles, Scissors, Compass, Copy } from 'lucide-react';
import { RichTextEditorEnhanced } from '@/components/ui/rich-text-editor-enhanced';
// TODO: Port InlinePrompt component from journalnex-app
// import { InlinePrompt } from '@/components/prompts/inline-prompt';
import { ModernTagInput } from '@/components/ui/modern-tag-input';
import { useToast } from '@/lib/toast';
import { auth } from '@ainexsuite/firebase';
import { plainText } from '@/lib/utils/text';
import type { Editor } from '@tiptap/react';
import { DOMSerializer } from '@tiptap/pm/model';

const journalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()),
  mood: z.enum([
    'happy', 'sad', 'neutral', 'excited', 'anxious',
    'grateful', 'angry', 'peaceful', 'stressed', 'hopeful',
    'tired', 'energetic', 'confused', 'confident', 'lonely',
    'loved', 'frustrated', 'inspired', 'bored', 'content'
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
}

export const JournalForm = forwardRef<JournalFormHandle, JournalFormProps>(
function JournalForm({ initialData, onSubmit, isSubmitting, onContentChange }, ref) {
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [linkInput, setLinkInput] = useState('');
  const [links, setLinks] = useState<string[]>(initialData?.links || []);
  const [enhancingStyle, setEnhancingStyle] = useState<ContentEnhancementStyle | null>(null);
  const [lastEnhancedContent, setLastEnhancedContent] = useState<string | null>(null);
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

  const selectedMood = watch('mood');
  const contentValue = watch('content');
  const contentPlain = plainText(contentValue || '');
  const minBoostWordCount = 40;
  const wordCount = contentPlain.trim().length
    ? contentPlain.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const missingWords = Math.max(minBoostWordCount - wordCount, 0);
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
  }));

  const handleFormSubmit = async (
    data: JournalEntryFormData,
    mode: 'publish' | 'draft',
  ) => {
    await onSubmit(
      {
        ...data,
        tags,
        links,
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

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setValue('tags', newTags);
  };

  const addLink = () => {
    const trimmedLink = linkInput.trim();
    if (trimmedLink && !links.includes(trimmedLink)) {
      // Basic URL validation
      try {
        new URL(trimmedLink);
        const newLinks = [...links, trimmedLink];
        setLinks(newLinks);
        setValue('links', newLinks);
        setLinkInput('');
      } catch {
        // If URL is invalid, try adding https:// prefix
        try {
          new URL(`https://${trimmedLink}`);
          const fullUrl = `https://${trimmedLink}`;
          const newLinks = [...links, fullUrl];
          setLinks(newLinks);
          setValue('links', newLinks);
          setLinkInput('');
        } catch {
          // Still invalid, don't add it
          toast({
            title: 'Invalid URL',
            description: 'Please enter a valid URL',
            variant: 'error',
          });
        }
      }
    }
  };

  const removeLink = (link: string) => {
    const newLinks = links.filter(l => l !== link);
    setLinks(newLinks);
    setValue('links', newLinks);
  };

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
    <form onSubmit={submitPublish} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Title
        </label>
        <input
          {...register('title')}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-accent-500 dark:focus:ring-accent-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          placeholder="Give your entry a title..."
          disabled={isSubmitting}
          onKeyDown={handleTitleKeyDown}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{String(errors.title.message)}</p>
        )}
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Content
        </label>
        <div className="relative">
          <RichTextEditorEnhanced
            content={contentValue || ''}
            onChange={(value) => setValue('content', value)}
            placeholder="Write your thoughts..."
            disabled={isSubmitting || isEnhancing}
            onEditorReady={(focus) => {
              editorFocusRef.current = focus;
            }}
            onEditorInstance={(instance) => {
              editorInstanceRef.current = instance;
            }}
          />
          {isEnhancing && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
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

      <div
        className={cn(
          'rounded-2xl border px-4 py-4 shadow-sm transition-colors',
          canEnhance
            ? 'border-orange-500/60 dark:border-orange-400/60 bg-white dark:bg-gray-900'
            : 'border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI boosts</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Quick rewrites tuned to your draft—apply or undo in one tap.
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              canEnhance
                ? 'bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
            )}
          >
            {canEnhance ? `Ready • ${wordCount} words` : `Need ${missingWords} more words`}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {ENHANCEMENT_STYLES.map((style) => {
            const isActive = enhancingStyle === style.id;
            const wasLastApplied = lastEnhancedStyle === style.id;
            const isPreviewing = boostPreview?.style === style.id;
            const isLoading = isActive || (isPreviewing && boostPreview?.status === 'loading');

            return (
              <button
                key={style.id}
                type="button"
                title={style.description}
                onClick={() => handleBoostPreview(style.id)}
                disabled={isSubmitting || isLoading || !canEnhance}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-500/40 disabled:cursor-not-allowed disabled:opacity-60',
                  isActive
                    ? 'border-orange-500 dark:border-orange-400 bg-orange-500 dark:bg-orange-400 text-white shadow-sm'
                    : isPreviewing && boostPreview?.status === 'ready'
                      ? 'border-orange-500/80 dark:border-orange-400/80 bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400'
                      : wasLastApplied
                      ? 'border-orange-500/90 dark:border-orange-400/90 text-orange-600 dark:text-orange-400 bg-white/70 dark:bg-gray-900/70'
                      : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-500 dark:hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400',
                )}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : style.icon}
                </span>
                {style.label}
              </button>
            );
          })}
          {lastEnhancedContent && (
            <button
              type="button"
              onClick={handleUndoEnhancement}
              disabled={enhancingStyle !== null}
              className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 transition hover:text-gray-900 dark:hover:text-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Undo last change
            </button>
          )}
        </div>
        {!canEnhance && (
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            AI boosts unlock around {minBoostWordCount} words. Capture a little more detail to try them out.
          </p>
        )}
      </div>

      {boostPreview && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40 px-4"
          onClick={closeBoostPreview}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl"
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          How are you feeling?
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
          {(Object.keys(moodConfig) as MoodType[]).map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => setValue('mood', mood)}
              disabled={isSubmitting}
              className={cn(
                'p-1.5 rounded-lg border transition-all flex flex-col items-center gap-0.5 hover:scale-105',
                'bg-white dark:bg-zinc-900',
                selectedMood === mood
                  ? 'border-orange-500 dark:border-orange-400 bg-orange-500/10 dark:bg-orange-400/20 shadow-md shadow-orange-500/20'
                  : 'border-white/10 dark:border-white/10 hover:border-orange-500/40 dark:hover:border-orange-400/40'
              )}
              title={moodConfig[mood].label}
            >
              {(() => {
                const Icon = moodConfig[mood].icon;
                return <Icon className={cn(
                  "h-4 w-4 transition-colors",
                  selectedMood === mood ? "text-orange-500 dark:text-orange-400" : "text-gray-600 dark:text-gray-300"
                )} />;
              })()}
              <span className={cn(
                "text-[10px] font-medium leading-tight",
                selectedMood === mood
                  ? "text-orange-500 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-400"
              )}>{moodConfig[mood].label}</span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            Selected: <span className="font-semibold text-orange-500 dark:text-orange-400">{moodConfig[selectedMood as MoodType].label}</span>
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Tags
        </label>
        <ModernTagInput
          tags={tags}
          onTagsChange={handleTagsChange}
          disabled={isSubmitting}
          placeholder="Type and press Enter to add tags..."
          maxTags={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
          Links
        </label>
        <div className="flex gap-2 mb-2">
          <div className="flex-1 relative">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLink();
                }
              }}
              className="w-full pl-9 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
              placeholder="Add links (YouTube, articles, etc.)..."
              disabled={isSubmitting}
            />
          </div>
          <button
            type="button"
            onClick={addLink}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <span
              key={link}
              className="inline-flex items-center gap-1 bg-[#f97316]/20 text-[#f97316] px-3 py-1 rounded-full text-sm"
            >
              <Link className="w-3 h-3" />
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-40"
              >
                {link.length > 30 ? `${link.substring(0, 30)}...` : link}
              </a>
              <button
                type="button"
                onClick={() => removeLink(link)}
                disabled={isSubmitting}
                className="hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
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
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-3"
              >
                <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  disabled={isSubmitting}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          {...register('isPrivate')}
          type="checkbox"
          id="isPrivate"
          className="rounded border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-orange-500 dark:focus:ring-orange-400"
          disabled={isSubmitting}
        />
        <label
          htmlFor="isPrivate"
          className="text-sm text-gray-700 dark:text-gray-300"
        >
          Keep this entry private
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-4">
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
    </form>
  );
});

JournalForm.displayName = 'JournalForm';
