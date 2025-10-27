"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  CheckSquare,
  Image as ImageIcon,
  LayoutGrid,
  Palette,
  Pin,
  PinOff,
  Tag,
  X,
  BellRing,
  CalendarClock,
  Share2,
} from "lucide-react";
import { clsx } from "clsx";
import type {
  ChecklistItem,
  Note,
  NoteAttachment,
  NoteColor,
  NoteDraft,
  NotePattern,
} from "@/lib/types/note";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { NOTE_PATTERNS } from "@/lib/constants/note-patterns";
import { getTextColorForBackground } from "@/lib/utils/note-colors";
import { useLabels } from "@/components/providers/labels-provider";
import { useReminders } from "@/components/providers/reminders-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import type { ReminderFrequency } from "@/lib/types/reminder";
import type { ReminderChannel } from "@/lib/types/settings";
import type { CollaboratorRole, NoteCollaborator } from "@/lib/types/note";
import { getFirebaseAuth } from "@/lib/firebase/client-app";
import { useAuth } from "@/lib/auth/auth-context";
import { REMINDER_CHANNELS, REMINDER_FREQUENCIES } from "@/components/reminders/reminder-constants";
import {
  formatDateTimeLocalInput,
  parseDateTimeLocalInput,
} from "@/lib/utils/datetime";

function channelsEqual(a: ReminderChannel[], b: ReminderChannel[]) {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((value, index) => value === sortedB[index]);
}

type AttachmentDraft = {
  id: string;
  file: File;
  preview: string;
};

type NoteEditorProps = {
  note: Note;
  onClose: () => void;
};

export function NoteEditor({ note, onClose }: NoteEditorProps) {
  const {
    updateNote,
    togglePin,
    toggleArchive,
    removeAttachment,
    attachFiles,
  } = useNotes();
  const { labels } = useLabels();
  const { reminders, createReminder, updateReminder, deleteReminder } = useReminders();
  const { preferences } = usePreferences();
  const { user: sessionUser } = useAuth();

  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [mode, setMode] = useState<"text" | "checklist">(
    note.type === "checklist" ? "checklist" : "text",
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    note.checklist,
  );
  const [color, setColor] = useState<NoteColor>(note.color);
  const [pattern, setPattern] = useState<NotePattern | undefined>(note.pattern || "none");
  const [pinned, setPinned] = useState(note.pinned);
  const [archived, setArchived] = useState(note.archived);
  const [existingAttachments, setExistingAttachments] = useState<NoteAttachment[]>(
    note.attachments,
  );
  const [removedAttachments, setRemovedAttachments] = useState<NoteAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<AttachmentDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showPatternPicker, setShowPatternPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    note.labelIds ?? [],
  );
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(note.reminderAt));
  const [reminderValue, setReminderValue] = useState(
    note.reminderAt ? formatDateTimeLocalInput(note.reminderAt) : "",
  );
  const [reminderChannels, setReminderChannels] = useState<ReminderChannel[]>(
    () => [...preferences.reminderChannels],
  );
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>("once");
  const [customCron, setCustomCron] = useState("");
  const [reminderPrimed, setReminderPrimed] = useState(false);
  const [reminderPanelOpen, setReminderPanelOpen] = useState(false);
  const [sharePanelOpen, setSharePanelOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<NoteCollaborator[]>(note.sharedWith);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>("viewer");
  const [shareError, setShareError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);
  const canManageSharing = sessionUser?.id === note.ownerId;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const checklistInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingChecklistFocusId = useRef<string | null>(null);
  const existingReminder = useMemo(() => {
    if (!note.reminderId) {
      return null;
    }

    return reminders.find((item) => item.id === note.reminderId) ?? null;
  }, [reminders, note.reminderId]);

  const handleReminderToggle = useCallback(() => {
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
  }, [reminderValue, preferences.reminderChannels]);

  const handleReminderChannelToggle = useCallback((channel: ReminderChannel) => {
    setReminderChannels((prev) => {
      if (prev.includes(channel)) {
        const next = prev.filter((item) => item !== channel);
        return next.length ? next : prev;
      }
      return [...prev, channel];
    });
  }, []);

  const checklistChanged = useMemo(() => {
    if (checklist.length !== note.checklist.length) {
      return true;
    }
    return checklist.some((item, index) => {
      const original = note.checklist[index];
      return (
        !original ||
        original.text !== item.text ||
        original.completed !== item.completed
      );
    });
  }, [checklist, note.checklist]);

  const requestAuthToken = useCallback(async () => {
    const auth = await getFirebaseAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("You must be signed in to manage sharing");
    }
    return currentUser.getIdToken();
  }, []);

  const handleInviteCollaborator = useCallback(async () => {
    if (!canManageSharing) {
      return;
    }

    const trimmedEmail = inviteEmail.trim();
    if (!trimmedEmail) {
      setShareError("Enter an email address to invite.");
      return;
    }

    setIsInviting(true);
    setShareError(null);

    try {
      const token = await requestAuthToken();
      const response = await fetch(`/api/notes/${note.id}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail, role: inviteRole }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to add collaborator");
      }

      const payload = await response.json();

      setCollaborators((prev) => [
        ...prev.filter((entry) => entry.email !== trimmedEmail),
        {
          email: trimmedEmail,
          role: (payload.collaborator?.role as CollaboratorRole) ?? inviteRole,
          userId: payload.collaborator?.userId ?? "",
          invitedAt: new Date(),
        },
      ]);
      setInviteEmail("");
    } catch (error) {
      setShareError(error instanceof Error ? error.message : "Unable to add collaborator");
    } finally {
      setIsInviting(false);
    }
  }, [canManageSharing, inviteEmail, inviteRole, note.id, requestAuthToken]);

  const handleRemoveCollaborator = useCallback(
    async (email: string) => {
      if (!canManageSharing) {
        return;
      }

      setRemovingEmail(email);
      setShareError(null);

      try {
        const token = await requestAuthToken();
        const response = await fetch(`/api/notes/${note.id}/share`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error ?? "Unable to remove collaborator");
        }

        setCollaborators((prev) => prev.filter((entry) => entry.email !== email));
      } catch (error) {
        setShareError(error instanceof Error ? error.message : "Unable to remove collaborator");
      } finally {
        setRemovingEmail(null);
      }
    },
    [canManageSharing, note.id, requestAuthToken],
  );

  const handleInviteSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await handleInviteCollaborator();
    },
    [handleInviteCollaborator],
  );

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const titleChanged = title !== note.title;
    const bodyChanged = body !== note.body;
    const colorChanged = color !== note.color;
    const patternChanged = pattern !== note.pattern;
    const pinnedChanged = pinned !== note.pinned;
    const archivedChanged = archived !== note.archived;
    const attachmentsRemoved = removedAttachments.length > 0;
    const attachmentsAdded = newAttachments.length > 0;
    const originalLabelIds = note.labelIds ?? [];
    const labelsChanged =
      selectedLabelIds.length !== originalLabelIds.length ||
      selectedLabelIds.some((id) => !originalLabelIds.includes(id));
    const modeChanged =
      (mode === "checklist" && note.type !== "checklist") ||
      (mode === "text" && note.type !== "text");
    const reminderFireAt = reminderEnabled ? parseDateTimeLocalInput(reminderValue) : null;
    const shouldRemoveReminder = !reminderEnabled && Boolean(note.reminderId);
    const shouldCreateReminder =
      reminderEnabled && !note.reminderId && reminderFireAt;
    const shouldUpdateExisting =
      reminderEnabled && Boolean(note.reminderId) && Boolean(reminderFireAt);
    const reminderTimeChanged =
      reminderEnabled && reminderFireAt &&
      (!note.reminderAt || note.reminderAt.getTime() !== reminderFireAt.getTime());
    const reminderChannelsChanged =
      reminderEnabled && existingReminder
        ? !channelsEqual(existingReminder.channels, reminderChannels)
        : false;
    const reminderFrequencyChanged =
      reminderEnabled && existingReminder
        ? existingReminder.frequency !== reminderFrequency
        : reminderEnabled && !note.reminderId && reminderFrequency !== "once";
    const reminderCronChanged =
      reminderEnabled && reminderFrequency === "custom"
        ? (existingReminder?.customCron ?? "") !== (customCron || "")
        : false;
    const reminderChanged =
      shouldRemoveReminder ||
      Boolean(shouldCreateReminder) ||
      reminderTimeChanged ||
      reminderChannelsChanged ||
      reminderFrequencyChanged ||
      reminderCronChanged;

    if (
      !titleChanged &&
      !bodyChanged &&
      !colorChanged &&
      !patternChanged &&
      !pinnedChanged &&
      !archivedChanged &&
      !checklistChanged &&
      !attachmentsRemoved &&
      !attachmentsAdded &&
      !labelsChanged &&
      !modeChanged &&
      !reminderChanged
    ) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);

      const updates: NoteDraft = {};

      if (titleChanged) {
        updates.title = title.trim();
      }

      if (mode === "checklist") {
        if (checklistChanged || modeChanged) {
          updates.checklist = checklist;
        }
        updates.body = "";
      } else {
        if (modeChanged) {
          updates.checklist = [];
        }
        if (bodyChanged || modeChanged) {
          updates.body = body.trim();
        }
      }

      if (reminderEnabled && reminderFireAt) {
        if (!note.reminderAt || note.reminderAt.getTime() !== reminderFireAt.getTime()) {
          updates.reminderAt = reminderFireAt;
        }
      } else if (!reminderEnabled && note.reminderAt) {
        updates.reminderAt = null;
        updates.reminderId = null;
      }

      if (colorChanged) {
        updates.color = color;
      }

      if (patternChanged) {
        updates.pattern = pattern;
      }

      if (labelsChanged) {
        updates.labelIds = selectedLabelIds;
      }

      if (Object.keys(updates).length) {
        await updateNote(note.id, updates);
      }

      if (pinnedChanged) {
        await togglePin(note.id, pinned);
      }

      if (archivedChanged) {
        await toggleArchive(note.id, archived);
      }

      if (attachmentsRemoved) {
        await Promise.all(
          removedAttachments.map((attachment) =>
            removeAttachment(note.id, attachment),
          ),
        );
      }

      if (attachmentsAdded) {
        await attachFiles(
          note.id,
          newAttachments.map((attachment) => attachment.file),
        );
      }

      const activeChannels = reminderChannels.length
        ? reminderChannels
        : [...preferences.reminderChannels];

      if (shouldRemoveReminder && note.reminderId) {
        await deleteReminder(note.reminderId);
      }

      if (shouldCreateReminder && reminderFireAt) {
        const reminderId = await createReminder({
          noteId: note.id,
          fireAt: reminderFireAt,
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
          await updateNote(note.id, {
            reminderId,
            reminderAt: reminderFireAt,
          });
        }
      } else if (shouldUpdateExisting && reminderFireAt && note.reminderId) {
        await updateReminder(note.reminderId, {
          fireAt: reminderFireAt,
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
      }
    } finally {
      setIsSaving(false);
      onClose();
    }
  }, [
    isSaving,
    title,
    note.title,
    body,
    note.body,
    color,
    note.color,
    pattern,
    note.pattern,
    pinned,
    note.pinned,
    archived,
    note.archived,
    removedAttachments,
    newAttachments,
    mode,
    note.type,
    checklist,
    checklistChanged,
    selectedLabelIds,
    note.labelIds,
    updateNote,
    note.id,
    togglePin,
    toggleArchive,
    removeAttachment,
    attachFiles,
    reminderEnabled,
    reminderValue,
    reminderChannels,
    reminderFrequency,
    customCron,
    note.reminderId,
    note.reminderAt,
    existingReminder,
    deleteReminder,
    createReminder,
    updateReminder,
    preferences.reminderChannels,
    onClose,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave, onClose]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!editorContainerRef.current) {
        return;
      }

      if (editorContainerRef.current.contains(event.target as Node)) {
        return;
      }

      void handleSave();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [handleSave]);

  useEffect(
    () => () => {
      newAttachments.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [newAttachments],
  );

  useEffect(() => {
    if (!existingReminder || reminderPrimed) {
      return;
    }

    const baseTime = existingReminder.snoozeUntil ?? existingReminder.fireAt;
    setReminderEnabled(true);
    setReminderValue(formatDateTimeLocalInput(baseTime));
    setReminderChannels([...existingReminder.channels]);
    setReminderFrequency(existingReminder.frequency);
    setCustomCron(existingReminder.customCron ?? "");
    setReminderPrimed(true);
  }, [existingReminder, reminderPrimed]);

  useEffect(() => {
    if (!note.reminderId && !reminderEnabled) {
      setReminderChannels([...preferences.reminderChannels]);
    }
  }, [preferences.reminderChannels, note.reminderId, reminderEnabled]);

  useEffect(() => {
    setCollaborators(note.sharedWith);
  }, [note.sharedWith]);

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

  const backgroundClass =
    color === "default"
      ? "bg-surface-elevated"
      : `bg-${color} dark:bg-${color}-dark`;

  const patternClass = pattern && pattern !== "none"
    ? NOTE_PATTERNS.find((p) => p.id === pattern)?.patternClass || ""
    : "";

  const textColors = getTextColorForBackground(color);
  const canUseSms = Boolean(preferences.smsNumber?.trim());

  useEffect(() => {
    if (!canUseSms) {
      setReminderChannels((prev) => prev.filter((channel) => channel !== "sms"));
    }
  }, [canUseSms]);

  const checklistTemplate = (): ChecklistItem => ({
    id: crypto.randomUUID(),
    text: "",
    completed: false,
  });

  const handleAddChecklistItem = () => {
    const newItem = checklistTemplate();
    pendingChecklistFocusId.current = newItem.id;
    setChecklist((prev) => [...prev, newItem]);
  };

  const handleChecklistChange = (
    itemId: string,
    next: Partial<ChecklistItem>,
  ) => {
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

  const handleRemoveExistingAttachment = (attachment: NoteAttachment) => {
    setExistingAttachments((prev) =>
      prev.filter((item) => item.id !== attachment.id),
    );
    setRemovedAttachments((prev) => [...prev, attachment]);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    const drafts: AttachmentDraft[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewAttachments((prev) => [...prev, ...drafts]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveNewAttachment = (attachmentId: string) => {
    setNewAttachments((prev) => {
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

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 px-3 py-6">
      <div
        ref={editorContainerRef}
        className={clsx(
          "relative w-full max-w-2xl rounded-3xl border border-outline-subtle shadow-2xl dark:shadow-[0_8px_20px_-4px_rgba(249,115,22,0.35)]",
          backgroundClass,
          patternClass,
        )}
      >
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className={clsx("w-full bg-transparent text-lg font-semibold focus:outline-none", textColors.title, textColors.placeholder)}
            />
            <div className="flex items-center gap-2 mr-14">
              <button
                type="button"
                className={clsx(
                  "icon-button h-9 w-9",
                  reminderPanelOpen && "bg-accent-100 text-accent-600",
                  reminderEnabled && !reminderPanelOpen && "text-accent-500",
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
                  setSharePanelOpen(false);
                }}
                aria-label="Set reminder"
              >
                <BellRing
                  className={clsx("h-4 w-4", reminderEnabled && "fill-current")}
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSharePanelOpen((prev) => !prev);
                  setReminderPanelOpen(false);
                }}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-full border border-outline-subtle px-3 py-1 text-xs font-medium transition",
                  sharePanelOpen && "border-accent-500 bg-accent-100 text-accent-600",
                )}
                aria-expanded={sharePanelOpen}
              >
                <Share2 className="h-3.5 w-3.5" />
                {collaborators.length ? `${collaborators.length} shared` : "Share"}
              </button>
              <button
                type="button"
                onClick={() => setPinned((prev) => !prev)}
                className={clsx(
                  "icon-button h-9 w-9 rounded-full",
                  pinned
                    ? "bg-accent-100 text-accent-600"
                    : "bg-surface-muted text-ink-500",
                )}
                aria-label={pinned ? "Unpin note" : "Pin note"}
              >
                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {sharePanelOpen ? (
            <div className="rounded-2xl border border-outline-subtle/70 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-ink-800">Collaborators</h2>
                {!canManageSharing ? (
                  <span className="text-xs text-muted">View only</span>
                ) : null}
              </div>
              {shareError ? (
                <p className="mt-2 text-xs text-danger">{shareError}</p>
              ) : null}

              <ul className="mt-3 space-y-2">
                {collaborators.length ? (
                  collaborators.map((collaborator) => (
                    <li
                      key={collaborator.email}
                      className="flex items-center justify-between rounded-xl border border-outline-subtle/60 bg-surface-muted/50 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-800">
                          {collaborator.email === sessionUser?.email
                            ? `${collaborator.email} (you)`
                            : collaborator.email}
                        </p>
                        <p className="text-xs text-muted">
                          {collaborator.role === "editor" ? "Can edit" : "Can view"}
                          {collaborator.invitedAt
                            ? ` · invited ${collaborator.invitedAt.toLocaleDateString()}`
                            : null}
                        </p>
                      </div>
                      {canManageSharing ? (
                        <button
                          type="button"
                          onClick={() => void handleRemoveCollaborator(collaborator.email)}
                          disabled={removingEmail === collaborator.email}
                          className="text-xs font-semibold text-danger hover:underline disabled:opacity-60"
                        >
                          {removingEmail === collaborator.email ? "Removing…" : "Remove"}
                        </button>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li className="rounded-xl border border-dashed border-outline-subtle/60 bg-surface-muted/40 px-3 py-3 text-xs text-muted">
                    No collaborators yet.
                  </li>
                )}
              </ul>

              {canManageSharing ? (
                <form
                  onSubmit={handleInviteSubmit}
                  className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="teammate@example.com"
                    className="flex-1 rounded-full border border-outline-subtle px-4 py-2 text-sm text-ink-700 shadow-sm focus:border-accent-500 focus:outline-none"
                    disabled={isInviting}
                  />
                  <select
                    value={inviteRole}
                    onChange={(event) => setInviteRole(event.target.value as CollaboratorRole)}
                    className="rounded-full border border-outline-subtle bg-white px-3 py-2 text-sm text-ink-700 focus:border-accent-500 focus:outline-none"
                    disabled={isInviting}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-50 transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 disabled:opacity-70"
                  >
                    {isInviting ? "Inviting…" : "Invite"}
                  </button>
                </form>
              ) : (
                <p className="mt-4 text-xs text-muted">
                  Only the note owner can manage collaborators.
                </p>
              )}
            </div>
          ) : null}

          {mode === "text" ? (
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write your note…"
              rows={4}
              className={clsx("min-h-[120px] w-full resize-none bg-transparent text-sm focus:outline-none", textColors.body, textColors.placeholder)}
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
                    className={clsx("flex-1 border-b border-transparent bg-transparent pb-1 text-sm focus:border-outline-strong focus:outline-none", textColors.body, textColors.placeholder)}
                  />
                  <button
                    type="button"
                    className="opacity-0 transition group-hover:opacity-100"
                    onClick={() =>
                      setChecklist((prev) =>
                        prev.filter((entry) => entry.id !== item.id),
                      )
                    }
                    aria-label="Remove checklist item"
                  >
                    <X className="h-4 w-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className={clsx("inline-flex items-center gap-2 rounded-full border border-outline-subtle px-3 py-1 text-xs font-medium transition hover:border-outline-strong", textColors.muted)}
              >
                <CheckSquare className="h-3.5 w-3.5" /> Add item
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

          {(existingAttachments.length > 0 || newAttachments.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {existingAttachments.map((attachment) => (
                <figure
                  key={attachment.id}
                  className="relative overflow-hidden rounded-2xl border border-outline-subtle/60 bg-white/60 shadow-sm"
                >
                  <img
                    src={attachment.downloadURL}
                    alt={attachment.name}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white shadow-lg"
                    onClick={() => handleRemoveExistingAttachment(attachment)}
                    aria-label="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </figure>
              ))}
              {newAttachments.map((attachment) => (
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
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white shadow-lg"
                    onClick={() => handleRemoveNewAttachment(attachment.id)}
                    aria-label="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </figure>
              ))}
            </div>
          )}

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

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
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
                className="icon-button h-10 w-10"
                aria-label="Toggle checklist mode"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="icon-button h-10 w-10"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add images"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPalette((prev) => !prev);
                    setShowLabelPicker(false);
                  }}
                  className={clsx(
                    "icon-button h-10 w-10",
                    showPalette && "bg-accent-100 text-accent-600",
                  )}
                  aria-label="Change color"
                >
                  <Palette className="h-4 w-4" />
                </button>
                {showPalette ? (
                  <div className="absolute bottom-12 left-1/2 z-30 flex flex-row flex-nowrap items-center -translate-x-1/2 gap-2 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl">
                    {NOTE_COLORS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setColor(option.id);
                          setShowPalette(false);
                        }}
                        className={clsx(
                          "inline-flex shrink-0 h-8 w-8 rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                          option.swatchClass,
                          option.id === color && "ring-2 ring-accent-600",
                        )}
                        aria-label={`Set color ${option.label}`}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPatternPicker((prev) => !prev);
                    setShowPalette(false);
                    setShowLabelPicker(false);
                  }}
                  className={clsx(
                    "icon-button h-10 w-10",
                    showPatternPicker && "bg-accent-100 text-accent-600",
                  )}
                  aria-label="Change pattern"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                {showPatternPicker ? (
                  <div
                    className="absolute bottom-12 left-1/2 z-30 -translate-x-1/2 rounded-2xl bg-surface-elevated/95 p-3 shadow-floating backdrop-blur-xl"
                    style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '0.5rem' }}
                  >
                    {NOTE_PATTERNS.map((patternOption) => (
                      <button
                        key={patternOption.id}
                        type="button"
                        onClick={() => {
                          setPattern(patternOption.id);
                          setShowPatternPicker(false);
                        }}
                        style={{ display: 'inline-block', flexShrink: 0, width: '32px', height: '32px' }}
                        className={clsx(
                          "rounded-full border border-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                          patternOption.previewClass,
                          patternOption.id === pattern && "ring-2 ring-accent-600",
                        )}
                        aria-label={`Set pattern ${patternOption.label}`}
                        title={patternOption.description}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowLabelPicker((prev) => !prev);
                  setShowPalette(false);
                  setShowPatternPicker(false);
                }}
                className={clsx(
                  "icon-button h-10 w-10",
                  showLabelPicker && "bg-accent-100 text-accent-600",
                )}
                aria-label="Manage labels"
              >
                <Tag className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={clsx(
                  "icon-button h-10 w-10",
                  archived && "bg-surface-muted text-ink-600",
                )}
                onClick={() => setArchived((prev) => !prev)}
                aria-label={archived ? "Unarchive" : "Archive"}
              >
                <Archive className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-outline-subtle px-4 py-1.5 text-sm font-medium text-ink-600"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                className="rounded-full bg-accent-500 px-5 py-1.5 text-sm font-semibold text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
      {showLabelPicker ? (
        <div className="flex flex-wrap gap-2 border-t border-outline-subtle/60 pt-3">
          {labels.length ? (
            labels.map((label) => {
              const isSelected = selectedLabelIds.includes(label.id);
              return (
                <button
                  key={label.id}
                  type="button"
                  className={clsx(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                    isSelected
                      ? "border-accent-500 bg-accent-100 text-ink-100"
                      : "border-outline-subtle bg-surface-muted text-ink-600 hover:border-outline-strong",
                  )}
                  onClick={() => toggleLabelSelection(label.id)}
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

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
          aria-label="Close editor"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(event) => handleFilesSelected(event.target.files)}
      />
    </div>
  );

  return createPortal(content, document.body);
}
