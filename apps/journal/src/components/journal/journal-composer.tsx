"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Plus, Check, X, Lock, Tag, Loader2, ImagePlus, Ban, BookOpen, Sparkles, Pin } from "lucide-react";
import { clsx } from "clsx";
import type { JournalEntryFormData, EntryColor, BackgroundOverlay } from "@ainexsuite/types";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAuth } from "@ainexsuite/auth";
import { useToast, SpaceTabSelector } from "@ainexsuite/ui";
import { useBackgrounds } from "@/hooks/use-backgrounds";
import { useCovers } from "@/hooks/use-covers";
import { getBackgroundById, getOverlayClasses, OVERLAY_OPTIONS, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { BackgroundProvider } from "@/contexts/background-context";
import { useCoverSettings } from "@/contexts/cover-settings-context";
import { getAdaptiveInputClass } from "@/lib/adaptive-styles";
import { createJournalEntry, updateJournalEntry } from "@/lib/firebase/firestore";
import { JournalForm, JournalFormHandle } from "@/components/journal/journal-form";
import { usePrivacy, PasscodeModal } from "@ainexsuite/privacy";

interface JournalComposerProps {
  onEntryCreated?: () => void;
  onManagePeople?: () => void;
  onManageSpaces?: () => void;
}

export function JournalComposer({ onEntryCreated, onManagePeople, onManageSpaces }: JournalComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();
  const { hasPasscode, setupPasscode, lockNow } = usePrivacy();

  // Expand/collapse state
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const formRef = useRef<JournalFormHandle>(null);
  const composerRef = useRef<HTMLDivElement>(null);

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
  const [coverOverlay, setCoverOverlay] = useState<BackgroundOverlay>('auto');
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  // Fetch backgrounds from Firestore
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();

  // Fetch covers from Firestore
  const { covers } = useCovers();

  // Cover settings (AI summary toggle)
  const { showAiSummary, setShowAiSummary } = useCoverSettings();

  // Get current space name for placeholder
  const currentSpaceName = spaces.find((s) => s.id === currentSpaceId)?.name || 'Personal';

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

  // Handle Tab key to focus editor
  const handleTitleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      formRef.current?.focusEditor();
    }
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
    setExpanded(false);
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
    setCoverOverlay('auto');
    setShowCoverPicker(false);
  }, []);

  // Handle passcode setup when locking for the first time
  const handlePasscodeSubmit = async (passcode: string) => {
    const success = await setupPasscode(passcode);
    if (success) {
      setShowPasscodeModal(false);
      setIsPrivate(true);
      lockNow();
    }
    return success;
  };

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
          coverOverlay,
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
      resetState();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, pinned, archived, color, tags, isPrivate, currentSpaceId, toast, onEntryCreated, resetState, backgroundImage, backgroundOverlay, coverImage, coverOverlay, title, showAiSummary]);

  const handleClose = useCallback(() => {
    resetState();
  }, [resetState]);

  // Click outside handler
  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;
      if (isSubmitting) return;

      handleClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [expanded, handleClose, isSubmitting]);

  return (
    <section className="w-full space-y-3">
      {/* Space tab selector - centered above */}
      {spaces.length > 1 && (
        <SpaceTabSelector
          spaces={spaces}
          currentSpaceId={currentSpaceId || 'personal'}
          onSpaceChange={setCurrentSpace}
          personalLabel="My Journal"
          onManagePeople={onManagePeople}
          onManageSpaces={onManageSpaces}
        />
      )}

      {!expanded ? (
        // Collapsed state
        <div className="flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
          <button
            type="button"
            className="flex-1 min-w-0 text-left text-sm text-zinc-400 dark:text-zinc-500 focus-visible:outline-none"
            onClick={() => setExpanded(true)}
          >
            <span>Create a new entry in <span className="font-medium text-zinc-600 dark:text-zinc-300">{currentSpaceName}</span>...</span>
          </button>
        </div>
      ) : (
        // Expanded state - inline editor
        <div
          ref={composerRef}
          className={clsx(
            "relative w-full rounded-2xl shadow-lg border overflow-hidden",
            "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
          )}
        >
          {/* Background image layer - contained within this form */}
          {currentBackground && (
            <div
              className="absolute inset-0 bg-cover bg-center rounded-2xl"
              style={{ backgroundImage: `url(${currentBackground.fullImage})` }}
            >
              <div className={clsx(getOverlayClasses(currentBackground, backgroundOverlay), "rounded-2xl")} />
            </div>
          )}

          <div className="relative flex flex-col">
            {/* Header with title and actions */}
            <div className="flex items-start gap-2 px-5 pt-4 pb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                placeholder="Title"
                className={clsx(
                  "flex-1 bg-transparent text-lg font-semibold focus:outline-none",
                  getAdaptiveInputClass(currentBackground?.brightness || null)
                )}
                disabled={isSubmitting}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setPinned((prev) => !prev)}
                className={clsx(
                  "p-2 rounded-full transition-colors",
                  pinned
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                aria-label={pinned ? "Unpin" : "Pin"}
              >
                <Pin className={clsx("h-5 w-5", pinned && "fill-current")} />
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Journal Form */}
            <div className="px-5">
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
            </div>

            {/* Tag picker expanded */}
            {showTagPicker && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 px-5 py-3 space-y-3">
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

            {/* Background picker */}
            {showBackgroundPicker && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 px-5 py-3">
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
                <div className="grid grid-cols-6 gap-2">
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

                {/* Overlay selector - only show when background is selected */}
                {backgroundImage && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Background Overlay Style</p>
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
            )}

            {/* Cover picker */}
            {showCoverPicker && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 px-5 py-3">
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
                <div className="grid grid-cols-6 gap-2">
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
                      {/* Overlay preview on selected cover */}
                      {coverImage === cover.id && (
                        <>
                          <div className={getOverlayClasses(
                            { id: 'cover', name: 'cover', thumbnail: '', fullImage: '', brightness: 'dark' },
                            coverOverlay || 'auto'
                          )} />
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className="text-white text-xs font-medium">Aa</span>
                          </div>
                        </>
                      )}
                      {coverImage === cover.id && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Overlay selector - only show when cover is selected */}
                {coverImage && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Cover Overlay Style</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {OVERLAY_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setCoverOverlay(option.id)}
                          className={clsx(
                            'px-2 py-1.5 rounded-lg text-xs font-medium transition-all',
                            coverOverlay === option.id
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
            )}

            {/* Footer toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-zinc-200 dark:border-zinc-800">
              {/* Left side - tool buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-1">
                {/* Background picker button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowBackgroundPicker((prev) => !prev);
                    setShowCoverPicker(false);
                    setShowTagPicker(false);
                  }}
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

                {/* Cover picker button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowCoverPicker((prev) => !prev);
                    setShowBackgroundPicker(false);
                    setShowTagPicker(false);
                  }}
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

                {/* Tag picker button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowTagPicker((prev) => !prev);
                    setShowBackgroundPicker(false);
                    setShowCoverPicker(false);
                  }}
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
                  onClick={() => {
                    if (!isPrivate && !hasPasscode) {
                      setShowPasscodeModal(true);
                    } else if (!isPrivate) {
                      setIsPrivate(true);
                      lockNow();
                    } else {
                      setIsPrivate(false);
                    }
                  }}
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
              </div>

              {/* Right side actions - responsive */}
              <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  className="flex-1 sm:flex-none rounded-full border px-3 sm:px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => formRef.current?.submitDraft()}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none rounded-full border px-3 sm:px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    <span className="hidden sm:inline">Save as Draft</span>
                  )}
                  {!isSubmitting && <span className="sm:hidden">Draft</span>}
                </button>
                <button
                  type="button"
                  onClick={() => formRef.current?.submitPublish()}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none rounded-full bg-[var(--color-primary)] px-3 sm:px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    <span className="hidden sm:inline">Save Entry</span>
                  )}
                  {!isSubmitting && <span className="sm:hidden">Save</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Passcode modal for setting up privacy PIN */}
      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => setShowPasscodeModal(false)}
        onSubmit={handlePasscodeSubmit}
        mode="setup"
        title="Set Privacy Passcode"
      />
    </section>
  );
}
