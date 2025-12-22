"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Loader2, Tag, Plus, ImagePlus, Check, Ban, BookOpen, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import type { JournalEntry, JournalEntryFormData, EntryColor, BackgroundOverlay } from "@ainexsuite/types";
import { useAuth } from "@ainexsuite/auth";
import { getJournalEntry, updateJournalEntry } from "@/lib/firebase/firestore";
import { JournalForm, JournalFormHandle } from "@/components/journal/journal-form";
import { useToast, EntryEditorShell } from "@ainexsuite/ui";
import { sentimentService } from "@/lib/ai/sentiment-service";
import { saveSentimentAnalysis } from "@/lib/firebase/sentiment";
import { usePrivacy, PasscodeModal } from "@ainexsuite/privacy";
import { useBackgrounds } from "@/hooks/use-backgrounds";
import { useCovers } from "@/hooks/use-covers";
import { getBackgroundById, getOverlayClasses, OVERLAY_OPTIONS, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { BackgroundProvider } from "@/contexts/background-context";
import { useCoverSettings } from "@/contexts/cover-settings-context";
import { getAdaptiveInputClass } from "@/lib/adaptive-styles";

type JournalEntryEditorProps = {
  entry: JournalEntry;
  onClose: () => void;
  onSaved?: () => void;
};

export function JournalEntryEditor({ entry, onClose, onSaved }: JournalEntryEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode, lockNow } = usePrivacy();
  const formRef = useRef<JournalFormHandle>(null);

  // Entry state that can be modified via shell buttons
  const [pinned, setPinned] = useState(entry.pinned || false);
  const [archived] = useState(entry.archived || false);
  const [color, setColor] = useState<EntryColor>(entry.color || 'default');
  const [title, setTitle] = useState(entry.title || '');

  // Footer toolbar state (tags and private only - mood/links in form)
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [tags, setTags] = useState<string[]>(entry.tags || []);
  const [isPrivate, setIsPrivate] = useState(entry.isPrivate || false);
  const [tagInput, setTagInput] = useState('');

  // Background state
  const [backgroundImage, setBackgroundImage] = useState<string | null>(entry.backgroundImage || null);
  const [backgroundOverlay, setBackgroundOverlay] = useState<BackgroundOverlay>(entry.backgroundOverlay || 'auto');
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);

  // Cover state
  const [coverImage, setCoverImage] = useState<string | null>(entry.coverImage || null);
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
  useEffect(() => {
    formRef.current?.setTitle(title);
  }, [title]);

  // Determine button labels
  const publishLabel = entry.isDraft ? 'Publish Entry' : 'Save Changes';
  const draftLabel = entry.isDraft ? 'Update Draft' : 'Save as Draft';

  const isLocked = entry.isPrivate && hasPasscode && !isUnlocked;

  // Show passcode modal if entry is private and locked
  useEffect(() => {
    if (isLocked) {
      setShowPasscodeModal(true);
    }
  }, [isLocked]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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

  // Images are uploaded directly to Firebase Storage via the rich text editor toolbar
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSubmit = useCallback(async (data: JournalEntryFormData, _newFiles: File[]) => {
    if (!user || !entry) return;

    setIsSubmitting(true);
    try {
      const isDraft = data.isDraft ?? entry.isDraft ?? false;

      // Generate AI summary when:
      // 1. AI summary setting is enabled
      // 2. Cover is newly set (coverImage set but entry didn't have one)
      // 3. Entry has cover AND content has changed
      const hasCoverImage = coverImage || entry.coverImage;
      const coverNewlySet = coverImage && !entry.coverImage;
      const contentChanged = data.content !== entry.content;
      const shouldGenerateSummary = showAiSummary && hasCoverImage && data.content && (coverNewlySet || contentChanged);

      // If content changed and we have a cover, clear the old summary first
      // This ensures the card will regenerate if our generation fails
      let coverSummary: string | null = (contentChanged && hasCoverImage) ? null : (entry.coverSummary || null);

      if (shouldGenerateSummary) {
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
        } catch (error) {
          // Summary generation failed - coverSummary is null, card will retry
          console.error('Failed to generate summary in editor:', error);
        }
      } else if (!hasCoverImage) {
        // Clear summary if cover is removed
        coverSummary = null;
      }

      // Update the journal entry (include pinned/archived/color and footer state)
      // mood and links come from form data, tags and isPrivate from footer
      const updatePayload = {
        ...data,
        pinned,
        archived,
        color,
        tags,
        isPrivate,
        backgroundImage,
        backgroundOverlay,
        coverImage,
        coverSummary,
      };
      console.log('[JournalEntryEditor] Saving backgroundOverlay:', backgroundOverlay);
      await updateJournalEntry(entry.id, updatePayload);

      // Trigger sentiment re-analysis in the background
      getJournalEntry(entry.id).then(async (updatedEntry) => {
        if (updatedEntry) {
          try {
            const analysis = await sentimentService.analyzeEntry(updatedEntry);
            await saveSentimentAnalysis(analysis);
          } catch {
            // Don't show error to user, analysis is optional
          }
        }
      });

      toast({
        title: isDraft ? "Draft updated" : "Success!",
        description: isDraft
          ? "Your draft changes have been saved."
          : "Your journal entry has been updated.",
        variant: "success",
      });

      onSaved?.();
      onClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [user, entry, toast, onSaved, onClose, pinned, archived, color, tags, isPrivate, backgroundImage, backgroundOverlay, coverImage, title, showAiSummary]);

  const handlePasscodeSubmit = async (passcode: string) => {
    if (hasPasscode) {
      const success = await verifyPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
      }
      return success;
    } else {
      // Setting up passcode for the first time - also lock the entry
      const success = await setupPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
        setIsPrivate(true); // Mark entry as private
        lockNow(); // Immediately lock so content blurs
      }
      return success;
    }
  };

  // Locked state content
  if (isLocked) {
    const content = (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-4xl h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] max-h-[900px] flex flex-col rounded-2xl border shadow-2xl overflow-hidden bg-background border-border"
        >
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Lock className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Private Entry</h2>
            <p className="text-muted-foreground text-center mb-6">
              This entry is private. Enter your passcode to edit.
            </p>
            <button
              onClick={() => setShowPasscodeModal(true)}
              className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:brightness-110 transition"
            >
              Unlock to Edit
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full transition bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>

          <PasscodeModal
            isOpen={showPasscodeModal}
            onClose={onClose}
            onSubmit={handlePasscodeSubmit}
            mode={hasPasscode ? "verify" : "setup"}
            title={hasPasscode ? "Unlock Private Entry" : "Set Privacy Passcode"}
          />
        </div>
      </div>
    );

    return createPortal(content, document.body);
  }

  // Main editor using EntryEditorShell
  // Leather cover only shows on cards, not in modal - treat as default for modal styling
  const modalColor = color === 'entry-leather' ? 'default' : color;

  return (
    <EntryEditorShell
      isOpen={true}
      onClose={onClose}
      color={modalColor}
      onColorChange={setColor}
      backgroundImageUrl={currentBackground?.fullImage || null}
      backgroundOverlayClass={currentBackground ? getOverlayClasses(currentBackground, backgroundOverlay) : undefined}
      backgroundBrightness={currentBackground?.brightness || null}
      pinned={pinned}
      onPinChange={setPinned}
      archived={archived}
      titleContent={
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className={clsx(
            "w-full text-lg font-semibold focus:outline-none",
            getAdaptiveInputClass(currentBackground?.brightness || null)
          )}
          disabled={isSubmitting}
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
            onClick={() => {
              if (!isPrivate && !hasPasscode) {
                // Trying to lock but no passcode set - prompt to set one up
                setShowPasscodeModal(true);
              } else if (!isPrivate) {
                // Locking - mark as private and lock session
                setIsPrivate(true);
                lockNow();
              } else {
                // Unlocking - just toggle off (they'll need passcode to view again)
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
            onClick={onClose}
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
              draftLabel
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
              publishLabel
            )}
          </button>
        </div>
      }
    >
      {/* Journal Form - images are added via toolbar, no separate attachments section */}
      <BackgroundProvider brightness={currentBackground?.brightness || null}>
        <JournalForm
          ref={formRef}
          entryId={entry.id}
          initialData={{
            title: entry.title,
            content: entry.content,
            tags: entry.tags,
            mood: entry.mood,
            links: entry.links || [],
            isPrivate: entry.isPrivate,
            isDraft: entry.isDraft,
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
