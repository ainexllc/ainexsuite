"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  CheckSquare,
  Image as ImageIcon,
  CalendarClock,
  Palette,
  Pin,
  PinOff,
  Plus,
  BellRing,
  Tag,
  X,
} from "lucide-react";
import { clsx } from "clsx";
import { useNotes } from "@/components/providers/notes-provider";
import type { ChecklistItem, NoteColor } from "@/lib/types/note";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { useLabels } from "@/components/providers/labels-provider";
import { QUICK_CAPTURE_EVENT } from "@/lib/constants/events";
import { useReminders } from "@/components/providers/reminders-provider";
import type { ReminderFrequency } from "@/lib/types/reminder";
import type { ReminderChannel } from "@/lib/types/settings";
import {
  REMINDER_CHANNELS,
  REMINDER_FREQUENCIES,
} from "@/components/reminders/reminder-constants";
import {
  formatDateTimeLocalInput,
  parseDateTimeLocalInput,
} from "@/lib/utils/datetime";
import { usePreferences } from "@/components/providers/preferences-provider";

type AttachmentDraft = {
  id: string;
  file: File;
  preview: string;
};

const checklistTemplate = (): ChecklistItem => ({
  id: crypto.randomUUID(),
  text: "",
  completed: false,
});


export function NoteComposer() {
  const { createNote, updateNote } = useNotes();
  const { createReminder } = useReminders();
  const { preferences } = usePreferences();
  const { labels } = useLabels();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"text" | "checklist">("text");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [color, setColor] = useState<NoteColor>("default");
  const [pinned, setPinned] = useState(false);
  const [archived, setArchived] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [reminderPanelOpen, setReminderPanelOpen] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderValue, setReminderValue] = useState("");
  const [reminderChannels, setReminderChannels] = useState<ReminderChannel[]>(
    () => [...preferences.reminderChannels],
  );
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>("once");
  const [customCron, setCustomCron] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const checklistInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingChecklistFocusId = useRef<string | null>(null);

  useEffect(
    () => () => {
      attachments.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [attachments],
  );

  useEffect(() => {
    if (!pendingChecklistFocusId.current) {
      return;
    }

    const target =
      checklistInputRefs.current[pendingChecklistFocusId.current];
    if (target) {
      target.focus();
      pendingChecklistFocusId.current = null;
    }
  }, [checklist]);

  useEffect(() => {
    const handleQuickCapture = () => {
      setExpanded(true);
      requestAnimationFrame(() => {
        titleInputRef.current?.focus();
      });
    };

    document.addEventListener(QUICK_CAPTURE_EVENT, handleQuickCapture);
    return () => {
      document.removeEventListener(QUICK_CAPTURE_EVENT, handleQuickCapture);
    };
  }, []);

  useEffect(() => {
    if (!expanded && !reminderEnabled) {
      setReminderChannels([...preferences.reminderChannels]);
    }
  }, [preferences.reminderChannels, expanded, reminderEnabled]);

  const hasContent = useMemo(() => {
    if (title.trim() || body.trim() || attachments.length) {
      return true;
    }

    if (mode === "checklist") {
      return checklist.some((item) => item.text.trim());
    }

    return false;
  }, [title, body, attachments, checklist, mode]);

  const reminderFireAt = useMemo(() => {
    if (!reminderEnabled || !reminderValue) {
      return null;
    }

    return parseDateTimeLocalInput(reminderValue);
  }, [reminderEnabled, reminderValue]);

  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle("");
    setBody("");
    setMode("text");
    setChecklist([]);
    setColor("default");
    setPinned(false);
    setArchived(false);
    setAttachments((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
    setShowPalette(false);
    setShowLabelPicker(false);
    setSelectedLabelIds([]);
    setReminderPanelOpen(false);
    setReminderEnabled(false);
    setReminderValue("");
    setReminderChannels([...preferences.reminderChannels]);
    setReminderFrequency("once");
    setCustomCron("");
  }, [preferences.reminderChannels]);

  const handleReminderToggle = () => {
    setReminderEnabled((prev) => {
      const next = !prev;
      if (next && !reminderValue) {
        const defaultTime = new Date();
        defaultTime.setMinutes(0, 0, 0);
        defaultTime.setHours(defaultTime.getHours() + 1);
        setReminderValue(formatDateTimeLocalInput(defaultTime));
        setReminderChannels([...preferences.reminderChannels]);
      }
      // Auto-close panel when reminder is enabled
      if (next) {
        setReminderPanelOpen(false);
      }
      return next;
    });
  };

  const handleReminderChannelToggle = (channel: ReminderChannel) => {
    setReminderChannels((prev) => {
      if (prev.includes(channel)) {
        const next = prev.filter((item) => item !== channel);
        return next.length ? next : prev;
      }
      return [...prev, channel];
    });
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (!hasContent) {
      resetState();
      return;
    }

    const fireAt = reminderEnabled ? reminderFireAt : null;
    const activeChannels = reminderChannels.length
      ? reminderChannels
      : preferences.reminderChannels;

    try {
      setIsSubmitting(true);
      const noteId = await createNote({
        title: title.trim(),
        body: body.trim(),
        type: mode,
        checklist: mode === "checklist" ? checklist : [],
        color,
        pinned,
        archived,
        labelIds: selectedLabelIds,
        reminderAt: fireAt ?? null,
        attachments: attachments.map((item) => item.file),
      });

      if (noteId && fireAt && reminderEnabled) {
        const reminderId = await createReminder({
          noteId,
          fireAt,
          channels: activeChannels,
          frequency: reminderFrequency,
          customCron: reminderFrequency === "custom" ? customCron || null : null,
          titleSnapshot: title.trim(),
          bodySnapshot:
            mode === "checklist"
              ? checklist.map((item) => item.text).join("\n")
              : body.trim(),
          labelIds: selectedLabelIds,
        });

        if (reminderId) {
          await updateNote(noteId, {
            reminderId,
            reminderAt: fireAt,
          });
        }
      }
    } finally {
      setIsSubmitting(false);
      resetState();
    }
  }, [
    isSubmitting,
    hasContent,
    resetState,
    reminderEnabled,
    reminderFireAt,
    reminderChannels,
    preferences.reminderChannels,
    createNote,
    title,
    body,
    mode,
    checklist,
    color,
    pinned,
    archived,
    selectedLabelIds,
    attachments,
    createReminder,
    reminderFrequency,
    customCron,
    updateNote,
  ]);

  const handleChecklistChange = (itemId: string, next: Partial<ChecklistItem>) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...next,
            }
          : item,
      ),
    );
  };

  const handleAddChecklistItem = () => {
    const newItem = checklistTemplate();
    pendingChecklistFocusId.current = newItem.id;
    setChecklist((prev) => [...prev, newItem]);
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

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

  const toggleLabelSelection = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId],
    );
  };

  const backgroundClass =
    color === "default"
      ? "bg-[#1a1a1a] dark:bg-[#1a1a1a]"
      : `bg-${color} dark:bg-${color}-dark`;

  const canUseSms = Boolean(preferences.smsNumber?.trim());

  useEffect(() => {
    if (!canUseSms) {
      setReminderChannels((prev) => prev.filter((channel) => channel !== "sms"));
    }
  }, [canUseSms]);

  useEffect(() => {
    if (!expanded) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!composerRef.current) {
        return;
      }

      if (composerRef.current.contains(event.target as Node)) {
        return;
      }

      if (isSubmitting) {
        return;
      }

      if (hasContent) {
        void handleSubmit();
      } else {
        resetState();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [expanded, hasContent, handleSubmit, resetState, isSubmitting]);

  return (
    <section className="w-full mb-8">
      {!expanded ? (
        <button
          type="button"
          className="flex w-full items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm text-white/50 shadow-sm transition hover:bg-white/10 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] backdrop-blur-sm"
          onClick={() => setExpanded(true)}
        >
          <span>Take a note...</span>
        </button>
      ) : (
        <div
          ref={composerRef}
          className={clsx(
            "w-full rounded-2xl shadow-xl bg-[#121212] border border-white/10 backdrop-blur-xl transition-all",
            color !== "default" && backgroundClass,
          )}
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
              <button
                type="button"
                onClick={() => setPinned((prev) => !prev)}
                className={clsx(
                  "p-2 rounded-full transition-colors",
                  pinned
                    ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                    : "text-white/40 hover:text-white hover:bg-white/10",
                )}
                aria-label={pinned ? "Unpin note" : "Pin note"}
              >
                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            </div>

            {mode === "text" ? (
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
            ) : (
              <div className="space-y-3">
                {checklist.map((item, idx) => (
                  <div key={item.id} className="group flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(event) =>
                        handleChecklistChange(item.id, {
                          completed: event.target.checked,
                        })
                      }
                      className="h-4 w-4 accent-accent-500"
                    />
                    <input
                      value={item.text}
                      onChange={(event) =>
                        handleChecklistChange(item.id, {
                          text: event.target.value,
                        })
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          !event.nativeEvent.isComposing
                        ) {
                          event.preventDefault();
                          const nextItem = checklist[idx + 1];
                          if (nextItem) {
                            checklistInputRefs.current[nextItem.id]?.focus();
                          } else {
                            handleAddChecklistItem();
                          }
                        }
                      }}
                      placeholder={`Checklist item ${idx + 1}`}
                      ref={(element) => {
                        if (element) {
                          checklistInputRefs.current[item.id] = element;
                        } else {
                          delete checklistInputRefs.current[item.id];
                        }
                      }}
                      className="flex-1 border-b border-transparent bg-transparent pb-1 text-sm text-ink-700 placeholder:text-ink-400 focus:border-outline-strong focus:outline-none"
                    />
                    <button
                      type="button"
                      className="opacity-0 transition group-hover:opacity-100"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      aria-label="Remove checklist item"
                    >
                      <X className="h-4 w-4 text-ink-400 hover:text-ink-600" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-subtle px-3 py-1 text-xs font-medium text-ink-600 transition hover:border-outline-strong"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </button>
              </div>
            )}

            {selectedLabelIds.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {selectedLabelIds.map((labelId) => {
                  const label = labels.find((item) => item.id === labelId);
                  if (!label) {
                    return null;
                  }

                  return (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-600"
                    >
                      {label.name}
                      <button
                        type="button"
                        onClick={() => toggleLabelSelection(label.id)}
                        className="text-ink-400 hover:text-ink-700"
                        aria-label={`Remove label ${label.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : null}

            {attachments.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {attachments.map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="relative overflow-hidden rounded-2xl border border-outline-subtle/60 bg-white/60 shadow-sm"
                  >
                    <img
                      src={attachment.preview}
                      alt={attachment.file.name}
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition hover:bg-black/70"
                      aria-label="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </figure>
                ))}
              </div>
            ) : null}

            {/* Inline Reminder Form */}
            {reminderPanelOpen && (
              <div className="rounded-2xl border border-outline-subtle/60 bg-surface-muted/55 p-4 shadow-inner transition-colors dark:border-outline-subtle/70 dark:bg-surface-muted/80">
                <div className="flex items-start justify-between gap-3 border-b border-outline-subtle/60 pb-3 dark:border-outline-subtle/70">
                  <div>
                    <p className="text-sm font-semibold text-ink-base dark:text-ink-200">
                      Set Reminder
                    </p>
                    <p className="text-xs text-ink-muted dark:text-ink-400">
                      Schedule a nudge via browser, email, or text.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setReminderPanelOpen(false)}
                    className="icon-button h-7 w-7"
                    aria-label="Close reminder panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-3">
                  <button
                    type="button"
                    onClick={handleReminderToggle}
                    className={clsx(
                      "w-full inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      reminderEnabled
                        ? "bg-accent-500 text-white shadow-sm"
                        : "border border-outline-subtle/60 bg-white text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated dark:text-ink-300 dark:hover:text-ink-100",
                    )}
                  >
                    <BellRing className="h-3.5 w-3.5" />
                    {reminderEnabled ? "Enabled" : "Add Reminder"}
                  </button>

                  {reminderEnabled ? (
                    <>
                      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
                        <span className="flex items-center gap-2 text-[11px] text-ink-500 dark:text-ink-400">
                          <CalendarClock className="h-3.5 w-3.5 text-accent-500" />
                          Scheduled for
                        </span>
                        <input
                          type="datetime-local"
                          value={reminderValue}
                          min={formatDateTimeLocalInput(new Date())}
                          onChange={(event) => setReminderValue(event.target.value)}
                          className="w-full rounded-xl border border-outline-subtle/60 bg-white px-3 py-2 text-sm text-ink-base shadow-sm transition-colors focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated dark:text-white"
                        />
                      </label>

                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
                          Channels
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {REMINDER_CHANNELS.map(({ id, label, icon: Icon }) => {
                            const isActive = reminderChannels.includes(id);
                            const isSms = id === "sms";
                            const isDisabled = isSms && !canUseSms;
                            return (
                              <button
                                key={id}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => {
                                  if (isDisabled) {
                                    return;
                                  }
                                  handleReminderChannelToggle(id);
                                }}
                                className={clsx(
                                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                                  isDisabled
                                    ? "cursor-not-allowed border-dashed border-outline-subtle/60 bg-white/60 text-ink-400 opacity-60 dark:border-outline-subtle dark:bg-surface-muted/40 dark:text-ink-500"
                                    : isActive
                                      ? "border-accent-500 bg-accent-100 text-accent-600 dark:bg-accent-500 dark:text-white"
                                      : "border-outline-subtle/60 bg-white text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated dark:text-ink-300 dark:hover:text-ink-100",
                                )}
                                aria-pressed={isActive}
                                aria-disabled={isDisabled}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        {!canUseSms ? (
                          <p className="text-xs text-ink-muted dark:text-ink-400">
                            Add your mobile number in settings to unlock text alerts.
                          </p>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
                          <span className="block text-[11px] text-ink-500 dark:text-ink-400">
                            Frequency
                          </span>
                          <select
                            value={reminderFrequency}
                            onChange={(event) =>
                              setReminderFrequency(
                                event.target.value as ReminderFrequency,
                              )
                            }
                            className="w-full rounded-xl border border-outline-subtle/60 bg-white px-3 py-2 text-sm text-ink-base shadow-sm transition-colors focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated dark:text-white"
                          >
                            {REMINDER_FREQUENCIES.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        {reminderFrequency === "custom" ? (
                          <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
                            <span className="block text-[11px] text-ink-500 dark:text-ink-400">
                              Cron expression
                            </span>
                            <input
                              value={customCron}
                              onChange={(event) => setCustomCron(event.target.value)}
                              placeholder="0 9 * * 1-5"
                              className="w-full rounded-xl border border-outline-subtle/60 bg-white px-3 py-2 text-sm text-ink-base shadow-sm transition-colors focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated dark:text-white"
                            />
                          </label>
                        ) : (
                          <div className="rounded-xl border border-dashed border-outline-subtle/70 bg-surface-muted/60 px-3 py-2 text-xs text-ink-muted dark:border-outline-subtle/50 dark:bg-surface-base/40 dark:text-ink-400">
                            Snooze or auto-repeat options become available once
                            reminders are sent.
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode((prev) => {
                      if (prev === "text") {
                        // Convert text body to checklist items
                        if (body.trim()) {
                          const lines = body.split('\n').filter(line => line.trim());
                          const items = lines.map(line => ({
                            id: crypto.randomUUID(),
                            text: line.trim(),
                            completed: false,
                          }));
                          setChecklist(items);
                          setBody("");
                        }
                        return "checklist";
                      } else {
                        // Convert checklist items to text body
                        if (checklist.length) {
                          const text = checklist.map(item => item.text).filter(t => t.trim()).join('\n');
                          setBody(text);
                          setChecklist([]);
                        }
                        return "text";
                      }
                    });
                  }}
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Toggle checklist mode"
                >
                  <CheckSquare className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add image attachment"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showPalette ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10" : "text-white/50 hover:text-white hover:bg-white/10"
                    )}
                    onClick={() => {
                      setShowPalette((prev) => !prev);
                      setShowLabelPicker(false);
                    }}
                    aria-label="Choose color"
                  >
                    <Palette className="h-5 w-5" />
                  </button>
                  {showPalette ? (
                    <div className="absolute bottom-12 left-1/2 z-30 flex -translate-x-1/2 gap-2 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl">
                      {NOTE_COLORS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setColor(option.id);
                            setShowPalette(false);
                          }}
                          className={clsx(
                            "h-8 w-8 rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                            option.swatchClass,
                            option.id === color && "ring-2 ring-accent-600",
                          )}
                          aria-label={`Set color ${option.label}`}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    showLabelPicker ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10" : "text-white/50 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => {
                    setShowLabelPicker((prev) => !prev);
                    setShowPalette(false);
                  }}
                  aria-label="Manage labels"
                >
                  <Tag className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    reminderPanelOpen ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10" : reminderEnabled ? "text-[var(--color-primary)]" : "text-white/50 hover:text-white hover:bg-white/10"
                  )}
                  onClick={() => {
                    setReminderPanelOpen((prev) => {
                      const willOpen = !prev;
                      // Auto-enable reminder when opening panel
                      if (willOpen && !reminderEnabled) {
                        const defaultTime = new Date();
                        defaultTime.setMinutes(0, 0, 0);
                        defaultTime.setHours(defaultTime.getHours() + 1);
                        setReminderValue(formatDateTimeLocalInput(defaultTime));
                        setReminderChannels([...preferences.reminderChannels]);
                        setReminderEnabled(true);
                      }
                      return willOpen;
                    });
                    setShowPalette(false);
                    setShowLabelPicker(false);
                  }}
                  aria-label="Set reminder"
                >
                  <BellRing
                    className={clsx("h-5 w-5", reminderEnabled && "fill-current")}
                  />
                </button>
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
                  className="rounded-full bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>

          {showLabelPicker ? (
            <div className="flex flex-wrap gap-2 border-t border-outline-subtle/70 px-5 py-3">
              {labels.length ? (
                labels.map((label) => {
                  const isSelected = selectedLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabelSelection(label.id)}
                      className={clsx(
                        "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                        isSelected
                          ? "border-accent-500 bg-accent-100 text-ink-100"
                          : "border-outline-subtle bg-surface-muted text-ink-600 hover:border-outline-strong",
                      )}
                    >
                      <span
                        className={clsx(
                          "h-2 w-2 rounded-full",
                          label.color === "default"
                            ? "bg-ink-400"
                            : `bg-${label.color}`,
                        )}
                      />
                      {label.name}
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-muted">
                  Create labels from the sidebar to organize notes.
                </p>
              )}
            </div>
          ) : null}
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
