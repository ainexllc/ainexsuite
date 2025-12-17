"use client";

import { useCallback, useState, useRef } from "react";
import { X, Lock, Tag, Plus, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import type { JournalEntryFormData, EntryColor } from "@ainexsuite/types";
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

      // Create the entry with form data + footer state
      const entryId = await createJournalEntry(user.uid, {
        ...data,
        tags,
        isPrivate,
        pinned,
      }, currentSpaceId);

      // Update with additional properties not in form data type
      if (archived || color !== 'default') {
        await updateJournalEntry(entryId, {
          archived,
          color,
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
  }, [user, pinned, archived, color, tags, isPrivate, currentSpaceId, toast, onEntryCreated, handleClose]);

  if (!isOpen) return null;

  return (
    <EntryEditorShell
      isOpen={true}
      onClose={handleClose}
      color={color}
      onColorChange={setColor}
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
          className="w-full bg-transparent text-lg font-semibold focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
          disabled={isSubmitting}
          autoFocus
        />
      }
      toolbarActions={
        <>
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
    </EntryEditorShell>
  );
}
