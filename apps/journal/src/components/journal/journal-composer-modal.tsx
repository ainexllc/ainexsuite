"use client";

import { useCallback, useState, useRef, useMemo } from "react";
import { X, Lock, Tag, Plus, Loader2, ImagePlus, Check, Ban, BookOpen, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import type { JournalEntryFormData, EntryColor, BackgroundOverlay } from "@ainexsuite/types";
import { useBackgrounds } from "@/hooks/use-backgrounds";
import { useCovers } from "@/hooks/use-covers";
import { getBackgroundById, getOverlayClasses, OVERLAY_OPTIONS, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { BackgroundProvider } from "@/contexts/background-context";
import { useCoverSettings } from "@/contexts/cover-settings-context";
import { getAdaptiveInputClass } from "@/lib/adaptive-styles";
import { useAuth } from "@ainexsuite/auth";
import { createJournalEntry, updateJournalEntry } from "@/lib/firebase/firestore";
import { JournalForm, JournalFormHandle } from "@/components/journal/journal-form";
import { useToast, EntryEditorShell } from "@ainexsuite/ui";
import { useSpaces } from "@/components/providers/spaces-provider";

type JournalComposerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEntryCreated?: () => void;
};

export function JournalComposerModal({ isOpen, onClose, onEntryCreated }: JournalComposerModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentSpaceId } = useSpaces();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<JournalFormHandle>(null);

  // Entry state
  const [pinned, setPinned] = useState(false);
  const [archived, setArchived] = useState(false);
  const [color, setColor] = useState<EntryColor>('default');
  const [title, setTitle] = useState('');

  // Footer toolbar state
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Background state
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOverlay, setBackgroundOverlay] = useState<BackgroundOverlay>('auto');
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  // Cover state
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // Fetch backgrounds from Firestore
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();

  // Fetch covers from Firestore
  const { covers } = useCovers();

  // Cover settings (AI summary toggle)
  const { showAiSummary, setShowAiSummary } = useCoverSettings();

  // Merge Firestore backgrounds with fallbacks
  const availableBackgrounds = useMemo(() => {
    if (firestoreBackgrounds.length > 0) {
      return firestoreBackgrounds;
    }
    return FALLBACK_BACKGROUNDS;
  }, [firestoreBackgrounds]);

  // Get current background object for display
  const currentBackground = useMemo(() => {
    if (!backgroundImage) return null;
    return getBackgroundById(backgroundImage, availableBackgrounds) || null;
  }, [backgroundImage, availableBackgrounds]);

  // Sync title changes to the form
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    formRef.current?.setTitle(newTitle);
  };

  // Helper functions for tags
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const resetState = useCallback(() => {
    setPinned(false);
    setArchived(false);
    setColor('default');
    setTitle('');
    setShowTagPicker(false);
    setTags([]);
    setIsPrivate(false);
    setTagInput('');
    setBackgroundImage(null);
    setBackgroundOverlay('auto');
    setShowBackgroundPicker(false);
    setCoverImage(null);
    setShowCoverPicker(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  // Images are uploaded directly to Firebase Storage via the rich text editor toolbar
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = useCallback(async (data: JournalEntryFormData, _newFiles: File[]) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const isDraft = data.isDraft ?? false;

      // Generate AI summary if cover image is set and AI summary is enabled
      let coverSummary: string | null = null;
      if (showAiSummary && coverImage && data.content) {
        try {
          const response = await fetch('/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: data.content,
              title: data.title || title,
            }),
          });
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.summary) {
              coverSummary = result.summary;
            }
          }
        } catch {
          // Summary generation is optional, continue without it
        }
      }

      // Create the entry with form data + footer state
      const entryId = await createJournalEntry(user.uid, {
        ...data,
        tags,
        isPrivate,
        pinned,
      }, currentSpaceId);

      // Update with additional properties not in form data type
      if (archived || color !== 'default' || backgroundImage || coverImage || coverSummary) {
        await updateJournalEntry(entryId, {
          archived,
          color,
          backgroundImage,
          backgroundOverlay,
          coverImage,
          coverSummary,
        });
      }

      toast({
        title: isDraft ? "Draft saved" : "Entry created",
        description: isDraft
          ? "Your draft has been saved."
          : "Your journal entry has been created.",
        variant: "success",
      });

      onEntryCreated?.();
      handleClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, pinned, archived, color, tags, isPrivate, currentSpaceId, toast, onEntryCreated, handleClose, backgroundImage, backgroundOverlay, coverImage, title, showAiSummary]);

  if (!isOpen) return null;

  return (
    <EntryEditorShell
      isOpen={true}
      onClose={handleClose}
      color={color}
      onColorChange={setColor}
      backgroundImageUrl={currentBackground?.fullImage || null}
      backgroundOverlayClass={currentBackground ? getOverlayClasses(currentBackground, backgroundOverlay) : undefined}
      backgroundBrightness={currentBackground?.brightness || null}
      pinned={pinned}
      onPinChange={setPinned}
      archived={archived}
      onArchiveChange={setArchived}
      titleContent={
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Title"
          className={clsx(
            "w-full text-lg font-semibold focus:outline-none",
            getAdaptiveInputClass(currentBackground?.brightness || null)
          )}
          disabled={isSubmitting}
          autoFocus
        />
      }
      toolbarActions={
        <>
          {/* Background picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBackgroundPicker((prev) => !prev)}
              className={clsx(
                'h-9 w-9 rounded-full flex items-center justify-center transition',
                showBackgroundPicker || backgroundImage
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              )}
              aria-label="Set background image"
              title="Set background image"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
            {showBackgroundPicker && (
              <>
                {/* Click outside to close */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowBackgroundPicker(false);
                  }}
                />
                <div
                  className="absolute bottom-12 left-0 z-30 w-72 max-h-[60vh] overflow-y-auto rounded-2xl p-3 shadow-2xl backdrop-blur-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Background Image</p>
                    <button
                      type="button"
                      onClick={() => setShowBackgroundPicker(false)}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* No background option */}
                    <button
                      type="button"
                      onClick={() => setBackgroundImage(null)}
                      className={clsx(
                        'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                        backgroundImage === null
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                      )}
                    >
                      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Ban className="h-4 w-4 text-zinc-400" />
                      </div>
                      {backgroundImage === null && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                    {/* Background options */}
                    {availableBackgrounds.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setBackgroundImage(bg.id)}
                        className={clsx(
                          'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                          backgroundImage === bg.id
                            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={bg.thumbnail}
                          alt={bg.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {backgroundImage === bg.id && (
                          <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {availableBackgrounds.length === 0 && (
                    <p className="text-xs text-zinc-400 text-center py-2">No backgrounds available</p>
                  )}

                  {/* Overlay selector - only show when background is selected */}
                  {backgroundImage && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Overlay Style</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        {OVERLAY_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setBackgroundOverlay(option.id)}
                            className={clsx(
                              'px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                              backgroundOverlay === option.id
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            )}
                            title={option.description}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Cover picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCoverPicker((prev) => !prev)}
              className={clsx(
                'h-9 w-9 rounded-full flex items-center justify-center transition',
                showCoverPicker || coverImage
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              )}
              aria-label="Set cover image"
              title="Set cover image"
            >
              <BookOpen className="h-4 w-4" />
            </button>
            {showCoverPicker && (
              <>
                {/* Click outside to close */}
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCoverPicker(false);
                  }}
                />
                <div
                  className="absolute bottom-12 left-0 z-30 w-72 max-h-[60vh] overflow-y-auto rounded-2xl p-3 shadow-2xl backdrop-blur-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Cover Image</p>
                    <button
                      type="button"
                      onClick={() => setShowCoverPicker(false)}
                      className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* No cover option */}
                    <button
                      type="button"
                      onClick={() => setCoverImage(null)}
                      className={clsx(
                        'relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all',
                        coverImage === null
                          ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                      )}
                    >
                      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <Ban className="h-4 w-4 text-zinc-400" />
                      </div>
                      {coverImage === null && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                    {/* Cover options */}
                    {covers.map((cover) => (
                      <button
                        key={cover.id}
                        type="button"
                        onClick={() => setCoverImage(cover.id)}
                        className={clsx(
                          'relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all',
                          coverImage === cover.id
                            ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cover.thumbnail}
                          alt={cover.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        {coverImage === cover.id && (
                          <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {covers.length === 0 && (
                    <p className="text-xs text-zinc-400 text-center py-2">No covers available</p>
                  )}

                  {/* AI Summary Toggle */}
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <button
                      type="button"
                      onClick={() => setShowAiSummary(!showAiSummary)}
                      className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className={clsx(
                          "h-4 w-4",
                          showAiSummary ? "text-[var(--color-primary)]" : "text-zinc-400"
                        )} />
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">AI Summary</span>
                      </div>
                      <div className={clsx(
                        "w-8 h-5 rounded-full transition-colors relative",
                        showAiSummary ? "bg-[var(--color-primary)]" : "bg-zinc-300 dark:bg-zinc-600"
                      )}>
                        <div className={clsx(
                          "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                          showAiSummary ? "translate-x-3.5" : "translate-x-0.5"
                        )} />
                      </div>
                    </button>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 px-2">
                      Show AI-generated summary on cards with covers
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tag picker */}
          <button
            type="button"
            onClick={() => setShowTagPicker((prev) => !prev)}
            className={clsx(
              'h-9 w-9 rounded-full flex items-center justify-center transition',
              showTagPicker || tags.length > 0
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
            aria-label="Manage tags"
          >
            <Tag className="h-4 w-4" />
          </button>

          {/* Private toggle */}
          <button
            type="button"
            onClick={() => setIsPrivate((prev) => !prev)}
            className={clsx(
              'h-9 w-9 rounded-full flex items-center justify-center transition',
              isPrivate
                ? 'bg-amber-500 text-white'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            )}
            aria-label={isPrivate ? 'Make public' : 'Make private'}
            title={isPrivate ? 'Make public' : 'Make private'}
          >
            <Lock className="h-4 w-4" />
          </button>
        </>
      }
      footerExpandedContent={
        <>
          {/* Tag picker expanded */}
          {showTagPicker && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Search or create a tag..."
                    className="w-full rounded-full border px-4 py-2 text-sm focus:outline-none bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600"
                  />
                </div>
                {tagInput.trim() && (
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500 hover:text-red-700 dark:hover:text-red-400"
                    >
                      #{tag}
                      <X className="h-3 w-3" />
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No tags yet. Type above to add tags.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      }
      footerRightContent={
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.submitDraft()}
            disabled={isSubmitting}
            className="rounded-full border px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Saving...
              </>
            ) : (
              'Save as Draft'
            )}
          </button>
          <button
            type="button"
            onClick={() => formRef.current?.submitPublish()}
            disabled={isSubmitting}
            className="rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Saving...
              </>
            ) : (
              'Save Entry'
            )}
          </button>
        </div>
      }
    >
      {/* Journal Form */}
      <BackgroundProvider brightness={currentBackground?.brightness || null}>
        <JournalForm
          ref={formRef}
          initialData={{
            title: '',
            content: '',
            tags: [],
            mood: 'neutral',
            links: [],
            isPrivate: false,
            isDraft: false,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          hideButtons={true}
          hideTitle={true}
        />
      </BackgroundProvider>
    </EntryEditorShell>
  );
}
