'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createJournalEntry, getJournalEntry, getUserJournalEntries } from '@/lib/firebase/firestore';
import { uploadMultipleFiles } from '@/lib/firebase/storage';
import { JournalForm, JournalFormHandle } from '@/components/journal/journal-form';
import { useToast } from '@/lib/toast';
import type { JournalEntry, JournalEntryFormData } from '@ainexsuite/types';
import { sentimentService } from '@/lib/ai/sentiment-service';
import { saveSentimentAnalysis } from '@/lib/firebase/sentiment';
import { getPromptLibrary, markPromptAsCompleted } from '@/lib/firebase/prompts';
import { ArrowLeft, Sparkles, Lightbulb, Feather, Paperclip, Target } from 'lucide-react';
import Link from 'next/link';
import { plainText } from '@/lib/utils/text';
import { cn } from '@/lib/utils';
import { sampleArray } from '@/lib/utils/random';
import { getMoodLabel } from '@/lib/utils/mood';

const FOCUS_PROMPTS = [
  {
    id: 'gratitude-321',
    title: 'Gratitude 3-2-1',
    description: 'List three bright spots, two supports, and one intention.',
    body: `Gratitude check-in:
- Three bright spots from today:
  1.
  2.
  3.

- Two people I appreciated:
  1.
  2.

- One intention for tomorrow:
`,
  },
  {
    id: 'sensory-scan',
    title: 'Sensory Scan',
    description: 'Anchor in the senses before naming emotions.',
    body: `Sensory scan:
- I can see...
- I can hear...
- I can feel (touch)...
- I can smell/taste...

Emotional pulse:
- What emotion is most present?
- Where do I feel it in my body?
- What is it asking for?
`,
  },
  {
    id: 'story-arc',
    title: 'Mini Story Arc',
    description: 'Capture a moment using beginning, middle, and next.',
    body: `Story snapshot:
- Beginning — The moment started when...
- Middle — The turning point was...
- Next — I want to carry forward...

What I learned:
`,
  },
  {
    id: 'prompt-reflection',
    title: 'Prompt Reflection',
    description: 'Respond to the current reflection prompt in three beats.',
    body: `Prompt reflection:
1. First thought:
2. Hidden detail:
3. What this means for me:
`,
  },
];

const GUIDED_PROMPT_FALLBACKS = [
  'What energized you most today?',
  'Describe a moment you felt truly present.',
  'What small worry can you release right now?',
  'Who supported you recently and how?',
  'Capture a sensory detail from today (a sound, scent, or texture).',
  'What is one intention you want to set for tomorrow?',
  'When did you surprise yourself this week?',
  'List three things you are grateful for in this moment.',
];

function toDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }
  if (value && typeof (value as any).toDate === 'function') {
    return (value as any).toDate();
  }
  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

function buildStarterIdeasFromEntries(entries: JournalEntry[]): string[] {
  if (entries.length === 0) {
    return [];
  }

  const prompts: string[] = [];
  const seenTags = new Set<string>();
  const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

  entries.forEach((entry) => {
    const referenceDate = dateFormatter.format(toDate(entry.updatedAt ?? entry.createdAt));
    const title = entry.title?.trim();

    if (title) {
      prompts.push(`Revisit "${title}" and note what's shifted since ${referenceDate}.`);
    } else {
      prompts.push(`Return to your ${referenceDate} entry and capture what has evolved since then.`);
    }

    const tags = Array.isArray(entry.tags) ? entry.tags : [];
    let selectedTag: string | null = null;
    for (const rawTag of tags) {
      const normalized = rawTag.trim().toLowerCase();
      if (!normalized) continue;
      if (seenTags.has(normalized)) continue;
      seenTags.add(normalized);
      selectedTag = rawTag;
      break;
    }

    if (!selectedTag && tags.length > 0) {
      selectedTag = tags[0];
    }

    if (selectedTag) {
      prompts.push(
        `Follow up on ${selectedTag} from ${referenceDate}—what new detail can you add today?`,
      );
    }

    if (entry.mood) {
      const moodLabel = getMoodLabel(entry.mood);
      prompts.push(
        `You noted feeling ${moodLabel.toLowerCase()} on ${referenceDate}. How does that emotion show up now?`,
      );
    }
  });

  return prompts;
}

function normalizePrompts(prompts: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const prompt of prompts) {
    const text = plainText(prompt);
    if (!text) continue;
    const key = text.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(text.trim());
    }
  }
  return result;
}

export default function NewJournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptText, setPromptText] = useState<string | null>(null);
  const [promptId, setPromptId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [contentMetrics, setContentMetrics] = useState({
    wordCount: 0,
    charCount: 0,
    readingMinutes: 0,
  });
  const [guidedPrompts, setGuidedPrompts] = useState<string[]>(() =>
    sampleArray(GUIDED_PROMPT_FALLBACKS, 3),
  );
  const [guidedLoading, setGuidedLoading] = useState(false);
  const [guidedError, setGuidedError] = useState(false);
  const formRef = useRef<JournalFormHandle>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Check if we have a prompt from URL params
    const urlPromptId = searchParams.get('promptId');
    const urlPromptText = searchParams.get('promptText');

    if (urlPromptId && urlPromptText) {
      setPromptId(urlPromptId);
      setPromptText(decodeURIComponent(urlPromptText));
    }
  }, [searchParams]);

  const fetchGuidedPrompts = useCallback(async () => {
    if (!user) return;

    setGuidedLoading(true);
    setGuidedError(false);

    try {
      const { entries } = await getUserJournalEntries(user.uid, {
        limit: 12,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      if (!isMountedRef.current) return;

      let prompts = normalizePrompts(buildStarterIdeasFromEntries(entries));
      const lower = new Set(prompts.map((prompt) => prompt.toLowerCase()));

      const addFromPool = (pool: string[]): number => {
        if (prompts.length >= 3) return 0;
        const available = pool.filter((prompt) => {
          const normalized = prompt.trim().toLowerCase();
          return normalized && !lower.has(normalized);
        });
        if (!available.length) return 0;
        const needed = Math.min(3 - prompts.length, available.length);
        const selection = sampleArray(available, needed);
        selection.forEach((prompt) => {
          prompts.push(prompt);
          lower.add(prompt.trim().toLowerCase());
        });
        return selection.length;
      };

      let usedFallbackPool = false;

      if (prompts.length < 3) {
        const library = await getPromptLibrary();
        if (!isMountedRef.current) return;
        const normalizedLibrary = normalizePrompts(library.map((entry) => entry.text ?? ''));
        addFromPool(normalizedLibrary);
      }

      if (prompts.length < 3) {
        const fallbackNormalized = normalizePrompts(GUIDED_PROMPT_FALLBACKS);
        const added = addFromPool(fallbackNormalized);
        if (added > 0) {
          usedFallbackPool = true;
        }
      }

      if (prompts.length === 0) {
        prompts = sampleArray(normalizePrompts(GUIDED_PROMPT_FALLBACKS), 3);
        usedFallbackPool = true;
      }

      setGuidedPrompts(prompts.slice(0, 3));
      setGuidedError(usedFallbackPool);
    } catch (error) {
      if (!isMountedRef.current) return;
      setGuidedPrompts(sampleArray(normalizePrompts(GUIDED_PROMPT_FALLBACKS), 3));
      setGuidedError(true);
    } finally {
      if (isMountedRef.current) {
        setGuidedLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setGuidedPrompts(sampleArray(GUIDED_PROMPT_FALLBACKS, 3));
      setGuidedLoading(false);
      setGuidedError(false);
      return;
    }
    void fetchGuidedPrompts();
  }, [user, fetchGuidedPrompts]);

  const handleContentChange = useCallback((content: string) => {
    const text = plainText(content);
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const readingMinutes = words === 0 ? 0 : Math.max(1, Math.round(words / 180));

    setContentMetrics((prev) => {
      if (
        prev.wordCount === words &&
        prev.charCount === chars &&
        prev.readingMinutes === readingMinutes
      ) {
        return prev;
      }
      return { wordCount: words, charCount: chars, readingMinutes };
    });
  }, []);

  useEffect(() => {
    if (promptText) {
      handleContentChange(`**${promptText}**`);
    }
  }, [promptText, handleContentChange]);

  const handleSubmit = async (data: JournalEntryFormData, files: File[]) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const isDraft = data.isDraft ?? true;
      // Create the journal entry first
      const entryId = await createJournalEntry(user.uid, data);

      // Upload attachments if any
      if (files.length > 0) {
        await uploadMultipleFiles(user.uid, entryId, files);
      }

      // Trigger sentiment analysis in the background
      getJournalEntry(entryId).then(async (entry) => {
        if (entry) {
          try {
            const analysis = await sentimentService.analyzeEntry(entry);
            await saveSentimentAnalysis(analysis);
          } catch (error) {
            console.error('Sentiment analysis failed:', error);
            // Don't show error to user, analysis is optional
          }
        }
      });

      toast({
        title: isDraft ? 'Draft saved' : 'Success!',
        description: isDraft
          ? 'We saved your draft so you can revisit it anytime.'
          : 'Your journal entry has been created.',
        variant: 'success',
      });

      if (!isDraft && promptId && user) {
        void markPromptAsCompleted(user.uid, promptId).catch((error) => {
          console.error('Failed to mark prompt as completed:', error);
        });
      }

      router.push(isDraft ? `/workspace/${entryId}` : '/workspace');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create journal entry',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const focusModeLabel = useMemo(
    () => (isFocusMode ? 'Exit focus mode' : 'Enter focus mode'),
    [isFocusMode],
  );

  const handleApplyFocusPrompt = (templateId: string) => {
    const template = FOCUS_PROMPTS.find((item) => item.id === templateId);
    if (!template) return;

    formRef.current?.appendToContent(template.body, { prependNewLine: true });
    toast({
      title: 'Template added',
      description: `${template.title} has been inserted into your draft.`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(249,115,22,0.45)] backdrop-blur">
        <Link
          href="/workspace"
          className="mb-6 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </Link>

        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#f97316]">
              <Sparkles className="h-4 w-4" />
              New Entry
            </div>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              {promptText ? 'Respond to prompt' : 'Create new entry'}
            </h1>
            <p className="text-sm text-white/60">
              {promptText ? (
                "Share your thoughts on today's reflection question."
              ) : (
                "Capture today's moment, mood, or story."
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                <Lightbulb className="h-4 w-4 text-[#f97316]/70" />
                Autosave enabled
              </div>
              <button
                type="button"
                onClick={() => setIsFocusMode((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                  isFocusMode
                    ? 'bg-[#f97316] text-black shadow-[0_14px_45px_rgba(249,115,22,0.45)] hover:bg-[#ff8a3d]'
                    : 'border border-white/10 text-white hover:border-[#f97316]/60 hover:text-[#f97316]',
                )}
              >
                <Target className="h-4 w-4" />
                {focusModeLabel}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'grid gap-6 transition-all',
          isFocusMode
            ? 'max-w-3xl mx-auto'
            : 'lg:grid-cols-[minmax(0,2fr)_minmax(0,0.85fr)]',
        )}
      >
        <div className="space-y-6">
          {promptText && (
            <div className="rounded-2xl border border-white/10 bg-zinc-800/90 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                    Reflection Prompt
                  </p>
                  <p className="text-sm leading-relaxed text-white">
                    {promptText}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-zinc-800/90 p-6 shadow-sm">
            <JournalForm
              initialData={promptText ? { content: `**${promptText}**\n\n` } : undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onContentChange={handleContentChange}
              ref={formRef}
            />

            {isFocusMode && (
              <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-zinc-800/90 p-5 shadow-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Focus templates</h2>
                    <p className="text-xs text-white/60">
                      Drop in a structured starter to keep the words moving.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {FOCUS_PROMPTS.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleApplyFocusPrompt(template.id)}
                      className="flex flex-1 min-w-[180px] max-w-[220px] flex-col gap-2 rounded-xl border border-white/10 bg-zinc-700/60 p-3 text-left shadow-sm transition hover:border-[#f97316]/60 hover:shadow-md"
                    >
                      <span className="text-sm font-semibold text-white">{template.title}</span>
                      <span className="text-xs text-white/60">{template.description}</span>
                      <span className="text-[11px] uppercase tracking-wide text-[#f97316]">
                        Insert template
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isFocusMode && (
          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-[#f97316]" />
                <h2 className="text-sm font-semibold text-white">Session stats</h2>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-xl border border-white/10 bg-zinc-700/60 p-3">
                  <dt className="text-xs uppercase tracking-wide text-white/60">Words</dt>
                  <dd className="mt-1 text-lg font-semibold text-white">{contentMetrics.wordCount}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-700/60 p-3">
                  <dt className="text-xs uppercase tracking-wide text-white/60">Characters</dt>
                  <dd className="mt-1 text-lg font-semibold text-white">{contentMetrics.charCount}</dd>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-700/60 p-3">
                  <dt className="text-xs uppercase tracking-wide text-white/60">Read time</dt>
                  <dd className="mt-1 text-lg font-semibold text-white">
                    {contentMetrics.readingMinutes ? `${contentMetrics.readingMinutes} min` : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <Feather className="h-5 w-5 text-[#f97316]" />
                <h2 className="text-sm font-semibold text-white">Writing cues</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-white/60">
                <li>• Start with one moment you can still feel or see clearly.</li>
                <li>• Describe the emotion in your body before naming it in your mind.</li>
                <li>• Close with a small intention or takeaway, even if it feels unfinished.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-800/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <Paperclip className="h-5 w-5 text-[#f97316]" />
                <h2 className="text-sm font-semibold text-white">Attachments</h2>
              </div>
              <p className="mt-3 text-sm text-white/60">
                Add photos, PDFs, or voice notes. Everything is encrypted in transit and stored with your account.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
