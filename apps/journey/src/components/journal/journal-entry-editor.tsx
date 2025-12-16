"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Paperclip, Loader2 } from "lucide-react";
import type { JournalEntry, JournalEntryFormData, Attachment, EntryColor } from "@ainexsuite/types";
import { useAuth } from "@ainexsuite/auth";
import { getJournalEntry, updateJournalEntry } from "@/lib/firebase/firestore";
import { uploadMultipleFiles, deleteFile } from "@/lib/firebase/storage";
import { JournalForm, JournalFormHandle } from "@/components/journal/journal-form";
import { useToast, EntryEditorShell } from "@ainexsuite/ui";
import { sentimentService } from "@/lib/ai/sentiment-service";
import { saveSentimentAnalysis } from "@/lib/firebase/sentiment";
import { usePrivacy, PasscodeModal } from "@ainexsuite/privacy";

type JournalEntryEditorProps = {
  entry: JournalEntry;
  onClose: () => void;
  onSaved?: () => void;
};

export function JournalEntryEditor({ entry, onClose, onSaved }: JournalEntryEditorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>(entry.attachments || []);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode } = usePrivacy();
  const formRef = useRef<JournalFormHandle>(null);

  // Entry state that can be modified via shell buttons
  const [pinned, setPinned] = useState(entry.pinned || false);
  const [archived, setArchived] = useState(entry.archived || false);
  const [color, setColor] = useState<EntryColor>(entry.color || 'default');

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

  const handleSubmit = useCallback(async (data: JournalEntryFormData, newFiles: File[]) => {
    if (!user || !entry) return;

    setIsSubmitting(true);
    try {
      const isDraft = data.isDraft ?? entry.isDraft ?? false;

      // Update the journal entry (include pinned/archived/color from shell state)
      await updateJournalEntry(entry.id, {
        ...data,
        pinned,
        archived,
        color,
      });

      // Upload new attachments if any
      if (newFiles.length > 0) {
        const uploadedFiles = await uploadMultipleFiles(user.uid, entry.id, newFiles);
        const newAttachments = uploadedFiles.map(file => ({
          ...file,
          uploadedAt: new Date(),
        }));

        // Update attachments state
        setAttachments([...attachments, ...newAttachments]);
      }

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
  }, [user, entry, attachments, toast, onSaved, onClose, pinned, archived, color]);

  const handleDeleteAttachment = useCallback(async (attachment: Attachment) => {
    if (!user || !entry) return;

    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      // Extract filename from URL or use attachment ID
      const fileName = attachment.url.split("/").pop()?.split("?")[0] || attachment.id;

      // Delete from storage
      await deleteFile(user.uid, entry.id, fileName);

      // Update attachments state
      const updatedAttachments = attachments.filter(a => a.id !== attachment.id);
      setAttachments(updatedAttachments);

      toast({
        title: "Attachment deleted",
        description: "The attachment has been removed.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "error",
      });
    }
  }, [user, entry, attachments, toast]);

  const handlePasscodeSubmit = async (passcode: string) => {
    if (hasPasscode) {
      const success = await verifyPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
      }
      return success;
    } else {
      const success = await setupPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
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
  return (
    <EntryEditorShell
      isOpen={true}
      onClose={onClose}
      color={color}
      onColorChange={setColor}
      pinned={pinned}
      onPinChange={setPinned}
      archived={archived}
      onArchiveChange={setArchived}
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
      {/* Current attachments */}
      {attachments.length > 0 && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 p-4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
            Current Attachments
          </h3>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-lg p-3 border border-zinc-200 dark:border-zinc-700"
              >
                <div className="flex items-center gap-3">
                  <Paperclip className="w-4 h-4 text-[var(--color-primary)]" />
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-[var(--color-primary)] truncate"
                  >
                    {attachment.name}
                  </a>
                </div>
                <button
                  onClick={() => handleDeleteAttachment(attachment)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Form */}
      <JournalForm
        ref={formRef}
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
      />
    </EntryEditorShell>
  );
}
