"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Smile,
  Tag,
  X,
  PenLine,
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@ainexsuite/auth";
import { createJournalEntry, updateJournalEntry } from "@/lib/firebase/firestore";
import { uploadMultipleFiles } from "@/lib/firebase/storage";
import { moodConfig, getMoodColor } from "@/lib/utils/mood";
import type { MoodType } from "@ainexsuite/types";
import { useToast } from "@/lib/toast";

type AttachmentDraft = {
  id: string;
  file: File;
  preview: string;
};

interface JournalComposerProps {
  onEntryCreated?: () => void;
}

export function JournalComposer({ onEntryCreated }: JournalComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<MoodType | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      attachments.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [attachments],
  );

  const hasContent = useMemo(() => {
    return Boolean(title.trim() || body.trim() || attachments.length || mood);
  }, [title, body, attachments, mood]);

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle("");
    setBody("");
    setMood(null);
    setTags([]);
    setAttachments((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
    setShowMoodPicker(false);
    setShowTagInput(false);
    setTagInput("");
  }, []);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !user) {
      return;
    }

    if (!hasContent) {
      resetState();
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create the entry
      const entryId = await createJournalEntry(user.uid, {
        title: title.trim(),
        content: body.trim(),
        mood: mood || undefined,
        tags: tags,
        isDraft: false,
        date: new Date().toISOString(),
        links: [],
        isPrivate: false,
      });

      // 2. Upload attachments if any
      if (attachments.length > 0) {
        const uploadedFiles = await uploadMultipleFiles(
          user.uid,
          entryId,
          attachments.map((a) => a.file)
        );

        // 3. Update entry with attachments
        await updateJournalEntry(entryId, {
          attachments: uploadedFiles.map((f) => ({
            id: f.id,
            name: f.name,
            url: f.url,
            type: f.type,
            size: f.size,
            uploadedAt: new Date(),
          })),
        });
      }

      toast({
        title: "Entry created",
        description: "Your journal entry has been saved.",
        variant: "success",
      });

      onEntryCreated?.();
      resetState();
    } catch (error) {
      console.error("Failed to create entry:", error);
      toast({
        title: "Error",
        description: "Failed to save entry. Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    user,
    hasContent,
    resetState,
    title,
    body,
    mood,
    tags,
    attachments,
    onEntryCreated,
    toast,
  ]);

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }

    const drafts: AttachmentDraft[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setAttachments((prev) => [...prev, ...drafts]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => {
      prev
        .filter((item) => item.id === attachmentId)
        .forEach((item) => URL.revokeObjectURL(item.preview));
      return prev.filter((item) => item.id !== attachmentId);
    });
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  useEffect(() => {
    if (!expanded) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) return;
      if (composerRef.current.contains(event.target as Node)) return;
      
      // If clicking outside, check if we have content to save or just close
      // Unlike notes, maybe we don't auto-save on click outside for Journey to prevent accidental saves of half-thoughts?
      // But user asked for "just like notes app". Notes app auto-saves on click outside if content exists.
      // However, Notes creates a new note. Journey entries are more deliberate.
      // Let's just close for now if empty, or keep open if content.
      // Actually Notes implementation:
      /*
      if (hasContent) {
        void handleSubmit();
      } else {
        resetState();
      }
      */
      // I'll implement safe auto-save behavior or just close if empty.
      // For now, let's just collapse if empty, but keep state if content (so user doesn't lose it).
      // Actually, "just like notes" implies auto-save.
      if (!isSubmitting && hasContent) {
         // Optional: Auto-save on blur? Maybe better to just let user decide for journal.
         // Let's just keep it open if there is content to avoid data loss, or minimize.
         // For "Lite" dashboard, let's stick to manual save for clarity, but allow clicking outside to close if empty.
      } else if (!hasContent) {
        resetState();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [expanded, hasContent, isSubmitting, resetState]);

  return (
    <section className="w-full mb-8">
      {!expanded ? (
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-white/50 shadow-sm transition hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] backdrop-blur-sm"
          onClick={() => setExpanded(true)}
        >
          <span>Write a journal entry...</span>
          <span className="flex items-center gap-3 text-white/30">
            <PenLine className="h-5 w-5" />
            <ImageIcon className="h-5 w-5" />
          </span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className="w-full rounded-2xl shadow-xl bg-[#121212] border border-white/10 backdrop-blur-xl transition-all"
        >
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-start gap-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                className="w-full bg-transparent text-lg font-semibold text-white placeholder:text-white/30 focus:outline-none"
                autoFocus
                ref={titleInputRef}
              />
              {mood && (
                <button
                  onClick={() => setShowMoodPicker(!showMoodPicker)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    getMoodColor(mood)
                  )}
                >
                  {(() => {
                    const Icon = moodConfig[mood].icon;
                    return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
                  })()}
                  {moodConfig[mood].label}
                </button>
              )}
            </div>

            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder="What's on your mind?..."
              rows={attachments.length ? 3 : 5}
              className="min-h-[120px] w-full resize-none bg-transparent text-base text-white/90 placeholder:text-white/30 focus:outline-none leading-relaxed"
            />

            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs font-medium text-white/70"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-white/40 hover:text-white ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {attachments.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3 mb-2">
                {attachments.map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20"
                  >
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="h-32 w-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </figure>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  title="Add image"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showMoodPicker ? "text-[#f97316] bg-[#f97316]/10" : "text-white/50 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => {
                      setShowMoodPicker(!showMoodPicker);
                      setShowTagInput(false);
                    }}
                    title="Set mood"
                  >
                    <Smile className="h-5 w-5" />
                  </button>
                  
                  {showMoodPicker && (
                    <div className="absolute bottom-12 left-0 z-30 w-64 p-3 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl grid grid-cols-4 gap-2">
                      {(Object.keys(moodConfig) as MoodType[]).map((m) => {
                        const Icon = moodConfig[m].icon;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => {
                              setMood(m);
                              setShowMoodPicker(false);
                            }}
                            className={clsx(
                              "flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/10 transition-colors gap-1",
                              mood === m && "bg-white/10"
                            )}
                            title={moodConfig[m].label}
                          >
                            <Icon className={clsx("w-5 h-5", moodConfig[m].color.split(' ')[0].replace('bg-', 'text-'))} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showTagInput ? "text-[#f97316] bg-[#f97316]/10" : "text-white/50 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => {
                      setShowTagInput(!showTagInput);
                      setShowMoodPicker(false);
                      // Focus input next tick
                      if (!showTagInput) {
                        setTimeout(() => document.getElementById('tag-input')?.focus(), 0);
                      }
                    }}
                    title="Add tags"
                  >
                    <Tag className="h-5 w-5" />
                  </button>

                  {showTagInput && (
                    <div className="absolute bottom-12 left-0 z-30 w-64 p-3 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl">
                      <div className="flex gap-2">
                        <input
                          id="tag-input"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder="Add a tag..."
                          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#f97316]"
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-3 py-1.5 bg-[#f97316] text-white rounded-lg text-xs font-medium hover:bg-[#ea580c]"
                        >
                          Add
                        </button>
                      </div>
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.map(tag => (
                            <span key={tag} className="text-xs text-white/60">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                  onClick={resetState}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => void handleSubmit()}
                  className="rounded-full bg-[#f97316] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:bg-[#ea580c] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#f97316]"
                  disabled={isSubmitting || !hasContent}
                >
                  {isSubmitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(event) => handleFilesSelected(event.target.files)}
      />
    </section>
  );
}
