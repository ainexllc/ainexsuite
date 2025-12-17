"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import {
  Archive,
  CheckSquare,
  Image as ImageIcon,
  Palette,
  Pin,
  PinOff,
  Tag,
  X,
  BellRing,
  CalendarClock,
  Calculator,
  Sparkles,
  Loader2,
  Undo2,
  Brain,
  FolderOpen,
  Plus,
} from "lucide-react";
import { clsx } from "clsx";
import type {
  ChecklistItem,
  Note,
  NoteAttachment,
  NoteColor,
  NoteDraft,
} from "@/lib/types/note";
import { useNotes } from "@/components/providers/notes-provider";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { useLabels } from "@/components/providers/labels-provider";
import { useReminders } from "@/components/providers/reminders-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import type { ReminderFrequency } from "@/lib/types/reminder";
import type { ReminderChannel } from "@/lib/types/settings";
import { REMINDER_CHANNELS, REMINDER_FREQUENCIES } from "@/components/reminders/reminder-constants";
import {
  formatDateTimeLocalInput,
  parseDateTimeLocalInput,
} from "@/lib/utils/datetime";
import { InlineCalculator } from "./inline-calculator";

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
  const { labels, createLabel } = useLabels();
  const { reminders, createReminder, updateReminder, deleteReminder } = useReminders();
  const { preferences } = usePreferences();
  const { spaces } = useSpaces();

  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [mode, setMode] = useState<"text" | "checklist">(
    note.type === "checklist" ? "checklist" : "text",
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    note.checklist,
  );
  const [color, setColor] = useState<NoteColor>(note.color);
  const [pinned, setPinned] = useState(note.pinned);
  const [archived, setArchived] = useState(note.archived);
  const [existingAttachments, setExistingAttachments] = useState<NoteAttachment[]>(
    note.attachments,
  );
  const [removedAttachments, setRemovedAttachments] = useState<NoteAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<AttachmentDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [selectedText, setSelectedText] = useState<{ text: string; start: number; end: number } | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [bodyHistory, setBodyHistory] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lastSavedBodyRef = useRef(note.body);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(200, textarea.scrollHeight)}px`;
    }
  }, [body]);

  // Debounced history saving for manual edits
  useEffect(() => {
    // Don't save if body hasn't effectively changed from last save (avoids duplicate entries)
    if (body === lastSavedBodyRef.current) return;

    const timer = setTimeout(() => {
      setBodyHistory(prev => [...prev.slice(-19), lastSavedBodyRef.current]); // Keep last 20 states
      lastSavedBodyRef.current = body;
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [body]);

  // Save to history before AI changes (immediate)
  const saveToHistory = useCallback(() => {
    if (body !== lastSavedBodyRef.current) {
      setBodyHistory(prev => [...prev.slice(-19), lastSavedBodyRef.current]);
      lastSavedBodyRef.current = body;
    }
  }, [body]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (bodyHistory.length > 0) {
      const previousState = bodyHistory[bodyHistory.length - 1];
      setBodyHistory(prev => prev.slice(0, -1));
      setBody(previousState);
      lastSavedBodyRef.current = previousState; // Sync ref so we don't auto-save the undo
    }
  }, [bodyHistory]);

  const handleCalculatorInsert = useCallback((result: string) => {
    setBody((prev) => {
      const newBody = prev ? `${prev} ${result}` : result;
      return newBody;
    });
    setShowCalculator(false);
  }, []);
  const [showPalette, setShowPalette] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(
    note.labelIds ?? [],
  );
  const [newLabelName, setNewLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const newLabelInputRef = useRef<HTMLInputElement>(null);
  const [reminderEnabled, setReminderEnabled] = useState(Boolean(note.reminderAt));
  const [reminderValue, setReminderValue] = useState(
    note.reminderAt ? formatDateTimeLocalInput(note.reminderAt) : "",
  );
  const [reminderChannels, setReminderChannels] = useState<ReminderChannel[]>(
    () => [...preferences.reminderChannels],
  );
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency>("once");

  // Get current color config for the editor
  const currentColorConfig = useMemo(() => {
    return NOTE_COLORS.find((c) => c.id === color) || NOTE_COLORS[0];
  }, [color]);

  // Modal is now full-height responsive - no need for content-based sizing
  const [customCron, setCustomCron] = useState("");
  const [reminderPrimed, setReminderPrimed] = useState(false);
  const [reminderPanelOpen, setReminderPanelOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(note.spaceId || "personal");
  const [showSpacePicker, setShowSpacePicker] = useState(false);

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

  type EnhanceStyle = "professional" | "casual" | "concise" | "grammar";

  const ENHANCE_STYLES: { id: EnhanceStyle; label: string; description: string }[] = [
    { id: "professional", label: "Professional", description: "Polished & formal tone" },
    { id: "casual", label: "Casual", description: "Friendly & conversational" },
    { id: "concise", label: "Concise", description: "Brief & to the point" },
    { id: "grammar", label: "Clean Grammar", description: "Fix spelling & grammar" },
  ];

  // Handle text selection in textarea
  const handleTextSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = body.substring(start, end);

    if (text.trim()) {
      setSelectedText({ text, start, end });
    } else {
      setSelectedText(null);
    }
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = body.substring(start, end);

    if (text.trim()) {
      e.preventDefault();
      setSelectedText({ text, start, end });
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleEnhanceBody = async (style: EnhanceStyle) => {
    if (isEnhancing) return;

    // Determine what text to enhance - selected text or all
    const textToEnhance = selectedText?.text || body;
    if (!textToEnhance.trim()) return;

    setShowEnhanceMenu(false);
    setContextMenuPos(null);

    // Save current state for undo
    saveToHistory();

    try {
      setIsEnhancing(true);

      // Map style to task and tone
      const taskMap: Record<EnhanceStyle, { task: string; tone?: string }> = {
        professional: { task: "improve", tone: "professional" },
        casual: { task: "rewrite", tone: "casual" },
        concise: { task: "simplify" },
        grammar: { task: "grammar" },
      };

      const { task, tone } = taskMap[style];

      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToEnhance, task, tone }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhanced) {
          if (selectedText) {
            // Replace only the selected portion
            const newBody = body.substring(0, selectedText.start) + data.enhanced + body.substring(selectedText.end);
            setBody(newBody);
            setSelectedText(null);
          } else {
            // Replace entire body
            setBody(data.enhanced);
          }
        }
      }
    } catch (error) {
      console.error("Failed to enhance body:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSave = useCallback(async () => {
    if (isSaving) {
      return;
    }

    const titleChanged = title !== note.title;
    const bodyChanged = body !== note.body;
    const colorChanged = color !== note.color;
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
    // Check if space changed (convert "personal" selection to undefined for comparison)
    const currentNoteSpaceId = note.spaceId || "personal";
    const spaceIdChanged = selectedSpaceId !== currentNoteSpaceId;

    if (
      !titleChanged &&
      !bodyChanged &&
      !colorChanged &&
      !pinnedChanged &&
      !archivedChanged &&
      !checklistChanged &&
      !attachmentsRemoved &&
      !attachmentsAdded &&
      !labelsChanged &&
      !modeChanged &&
      !reminderChanged &&
      !spaceIdChanged
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

      if (labelsChanged) {
        updates.labelIds = selectedLabelIds;
      }

      if (spaceIdChanged) {
        // "personal" selection means no spaceId (undefined), otherwise use the selected space ID
        updates.spaceId = selectedSpaceId === "personal" ? undefined : selectedSpaceId;
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
    selectedSpaceId,
    note.spaceId,
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

  const handleCreateNewLabel = useCallback(async () => {
    const name = newLabelName.trim();
    if (!name || isCreatingLabel) {
      return;
    }

    // Check if a label with this name already exists (case-insensitive)
    const existingLabel = labels.find(
      (label) => label.name.toLowerCase() === name.toLowerCase()
    );
    if (existingLabel) {
      // If it exists, just select it and clear the input
      if (!selectedLabelIds.includes(existingLabel.id)) {
        setSelectedLabelIds((prev) => [...prev, existingLabel.id]);
      }
      setNewLabelName("");
      return;
    }

    try {
      setIsCreatingLabel(true);
      const newLabelId = await createLabel({ name });
      if (newLabelId) {
        setSelectedLabelIds((prev) => [...prev, newLabelId]);
      }
      setNewLabelName("");
    } catch (error) {
      console.error("Failed to create label:", error);
    } finally {
      setIsCreatingLabel(false);
    }
  }, [newLabelName, isCreatingLabel, labels, selectedLabelIds, createLabel]);

  const handleNewLabelKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleCreateNewLabel();
    } else if (e.key === "Escape") {
      setNewLabelName("");
      newLabelInputRef.current?.blur();
    }
  };

  // Filter labels based on search input
  const filteredLabels = useMemo(() => {
    if (!newLabelName.trim()) {
      return labels;
    }
    const searchTerm = newLabelName.toLowerCase();
    return labels.filter((label) =>
      label.name.toLowerCase().includes(searchTerm)
    );
  }, [labels, newLabelName]);

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        ref={editorContainerRef}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "relative w-full max-w-4xl h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] max-h-[900px] flex flex-col rounded-2xl border shadow-2xl",
          currentColorConfig.cardClass,
          "border-zinc-200 dark:border-zinc-800",
        )}
      >
        <div className="flex flex-col gap-4 px-6 py-5 flex-1 overflow-y-auto">
          <div className="flex items-start gap-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className="w-full bg-transparent text-lg font-semibold focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={() => setPinned((prev) => !prev)}
              className={clsx(
                "p-2 rounded-full transition-colors",
                pinned
                  ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
              )}
              aria-label={pinned ? "Unpin note" : "Pin note"}
            >
              {pinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {mode === "text" ? (
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(event) => setBody(event.target.value)}
                onSelect={handleTextSelect}
                onContextMenu={handleContextMenu}
                onBlur={() => {
                  // Delay clearing selection to allow button click
                  setTimeout(() => {
                    if (!showEnhanceMenu && !contextMenuPos) setSelectedText(null);
                  }, 200);
                }}
                placeholder="Write your note…"
                className={clsx(
                  "min-h-[300px] sm:min-h-[400px] w-full resize-none overflow-hidden bg-transparent text-[15px] leading-7 tracking-[-0.01em] focus:outline-none transition-all duration-300",
                  "text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                  isEnhancing && !selectedText && "blur-sm opacity-50",
                  isEnhancing && selectedText && "opacity-0"
                )}
                disabled={isEnhancing}
              />
              {/* Text overlay for selected text enhancement - shows text with only selected portion blurred */}
              {isEnhancing && selectedText && (
                <div className="absolute inset-0 pointer-events-none text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words overflow-hidden">
                  <span>{body.substring(0, selectedText.start)}</span>
                  <span className="relative inline">
                    <span className="blur-sm bg-[var(--color-primary)]/20 rounded px-0.5">{body.substring(selectedText.start, selectedText.end)}</span>
                    {/* Small floating indicator above selected text */}
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/95 px-2 py-1 rounded-full border border-[var(--color-primary)]/30 whitespace-nowrap">
                      <Brain className="h-3 w-3 text-[var(--color-primary)] animate-pulse" />
                      <span className="text-[10px] text-white/70">Enhancing...</span>
                    </span>
                  </span>
                  <span>{body.substring(selectedText.end)}</span>
                </div>
              )}
              {/* AI Enhancement overlay - shown when enhancing all text */}
              {isEnhancing && !selectedText && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="flex flex-col items-center gap-4 rounded-2xl bg-zinc-900 px-10 py-6 border border-[var(--color-primary)]/40 shadow-2xl">
                    {/* Animated Brain */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 animate-ping opacity-20 flex items-center justify-center">
                        <Brain className="h-14 w-14 text-[var(--color-primary)]" />
                      </div>
                      <Brain className="h-14 w-14 text-[var(--color-primary)] animate-pulse" />
                      {/* Sparkle accents around brain */}
                      <Sparkles className="absolute -top-2 -right-2 h-5 w-5 text-[var(--color-primary)] animate-bounce" />
                      <Sparkles className="absolute -bottom-2 -left-2 h-4 w-4 text-[var(--color-primary)] animate-bounce" style={{ animationDelay: "200ms" }} />
                      <Sparkles className="absolute top-0 -left-3 h-3 w-3 text-[var(--color-primary)] animate-bounce" style={{ animationDelay: "400ms" }} />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-semibold text-white">AI is thinking...</p>
                      <p className="text-sm text-white/60 mt-1">Enhancing your entire note</p>
                    </div>
                    {/* Animated dots loading indicator */}
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                    className="flex-1 border-b border-transparent bg-transparent pb-1 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-600 focus:outline-none"
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
                className="inline-flex items-center gap-2 rounded-full border border-zinc-400 dark:border-zinc-600 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition hover:border-zinc-500 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
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

        </div>

        {/* Bottom toolbar - anchored to bottom with color */}
        <div className={clsx(
          "flex-shrink-0 mt-auto rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-200 dark:border-zinc-700/50",
          currentColorConfig.footerClass
        )}>
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
                className={clsx(
                  "h-9 w-9 rounded-full flex items-center justify-center transition",
                  mode === "checklist"
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
                aria-label="Toggle checklist mode"
              >
                <CheckSquare className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="h-9 w-9 rounded-full flex items-center justify-center transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
                    setShowCalculator(false);
                  }}
                  className={clsx(
                    "h-9 w-9 rounded-full flex items-center justify-center transition",
                    showPalette
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  )}
                  aria-label="Change color"
                >
                  <Palette className="h-4 w-4" />
                </button>
                {showPalette ? (
                  <div className="absolute bottom-12 left-1/2 z-30 flex flex-row flex-nowrap items-center -translate-x-1/2 gap-2 rounded-2xl p-3 shadow-2xl backdrop-blur-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                    {NOTE_COLORS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setColor(option.id);
                          setShowPalette(false);
                        }}
                        className={clsx(
                          "inline-flex shrink-0 h-8 w-8 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]",
                          option.swatchClass,
                          option.id === color && "ring-2 ring-[var(--color-primary)]",
                        )}
                        aria-label={`Set color ${option.label}`}
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
                  setShowCalculator(false);
                }}
                className={clsx(
                  "h-9 w-9 rounded-full flex items-center justify-center transition",
                  showLabelPicker
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                )}
                aria-label="Manage labels"
              >
                <Tag className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={clsx(
                  "h-9 w-9 rounded-full flex items-center justify-center transition",
                  archived
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                )}
                onClick={() => setArchived((prev) => !prev)}
                aria-label={archived ? "Unarchive" : "Archive"}
              >
                <Archive className="h-4 w-4" />
              </button>
              {/* Calculator */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowCalculator((prev) => !prev);
                    setShowPalette(false);
                    setShowLabelPicker(false);
                  }}
                  className={clsx(
                    "h-9 w-9 rounded-full flex items-center justify-center transition",
                    showCalculator
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  )}
                  aria-label="Calculator"
                  title="Open calculator"
                >
                  <Calculator className="h-4 w-4" />
                </button>
                {showCalculator && (
                  <div className="absolute bottom-12 left-1/2 z-30 -translate-x-1/2">
                    <InlineCalculator
                      onInsert={handleCalculatorInsert}
                      onClose={() => setShowCalculator(false)}
                    />
                  </div>
                )}
              </div>
              {/* Separator */}
              <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600" />
              {/* Undo button */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={bodyHistory.length === 0}
                className={clsx(
                  "h-9 w-9 rounded-full flex items-center justify-center transition text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                  bodyHistory.length === 0 && "opacity-30 cursor-not-allowed"
                )}
                aria-label="Undo"
                title={bodyHistory.length > 0 ? `Undo (${bodyHistory.length} available)` : "Nothing to undo"}
              >
                <Undo2 className="h-4 w-4" />
              </button>
              {/* AI Enhance button */}
              {mode === "text" && body.trim() && (
                <button
                  type="button"
                  onClick={() => setShowEnhanceMenu((prev) => !prev)}
                  disabled={isEnhancing}
                  className={clsx(
                    "transition-all flex items-center gap-1.5 rounded-full h-9 px-3",
                    isEnhancing
                      ? "text-[var(--color-primary)] cursor-wait bg-[var(--color-primary)]/20"
                      : selectedText
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                  )}
                  aria-label="Enhance with AI"
                  title={selectedText ? `Enhance selected text (${selectedText.text.length} chars)` : "Enhance all text with AI"}
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs font-medium">Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {selectedText ? "Selected" : "All"}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Space Selector - only show if user has more than one space */}
              {spaces.length > 1 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSpacePicker((prev) => !prev);
                      setShowPalette(false);
                      setShowLabelPicker(false);
                      setShowCalculator(false);
                    }}
                    className={clsx(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      showSpacePicker
                        ? "border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                        : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                    aria-label="Move to space"
                    title="Move to a different space"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    <span className="max-w-[100px] truncate">
                      {spaces.find((s) => s.id === selectedSpaceId)?.name || "My Notes"}
                    </span>
                  </button>
                  {showSpacePicker && (
                    <div className="absolute bottom-full mb-2 right-0 z-30 min-w-[160px] rounded-xl shadow-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                      <div className="px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">Move to Space</p>
                      </div>
                      <div className="p-1.5 max-h-48 overflow-y-auto">
                        {spaces.map((space) => (
                          <button
                            key={space.id}
                            type="button"
                            onClick={() => {
                              setSelectedSpaceId(space.id);
                              setShowSpacePicker(false);
                            }}
                            className={clsx(
                              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                              space.id === selectedSpaceId
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200"
                            )}
                          >
                            <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{space.name}</span>
                            {space.id === selectedSpaceId && (
                              <span className="ml-auto text-[10px] text-zinc-400 dark:text-zinc-500">current</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                className="rounded-full border px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                className="rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
          {showLabelPicker ? (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3 space-y-3">
              {/* New label input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={newLabelInputRef}
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={handleNewLabelKeyDown}
                    placeholder="Search or create a tag..."
                    className="w-full rounded-full border px-4 py-2 text-sm focus:outline-none bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600"
                    disabled={isCreatingLabel}
                  />
                  {isCreatingLabel && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400 dark:text-zinc-500" />
                    </div>
                  )}
                </div>
                {newLabelName.trim() && !labels.some(
                  (l) => l.name.toLowerCase() === newLabelName.trim().toLowerCase()
                ) && (
                    <button
                      type="button"
                      onClick={() => void handleCreateNewLabel()}
                      disabled={isCreatingLabel}
                      className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition disabled:opacity-50 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create
                    </button>
                  )}
              </div>

              {/* Existing labels */}
              <div className="flex flex-wrap gap-2">
                {filteredLabels.length ? (
                  filteredLabels.map((label) => {
                    const isSelected = selectedLabelIds.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        className={clsx(
                          "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                          isSelected
                            ? "border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200",
                        )}
                        onClick={() => toggleLabelSelection(label.id)}
                      >
                        <span
                          className={clsx(
                            "h-2 w-2 rounded-full",
                            label.color === "default"
                              ? "bg-zinc-400 dark:bg-zinc-500"
                              : `bg-${label.color}-500`,
                          )}
                        />
                        {label.name}
                      </button>
                    );
                  })
                ) : newLabelName.trim() ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No matching tags. Press Enter or click Create to add &quot;{newLabelName.trim()}&quot;.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No tags yet. Type above to create your first tag.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>

      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(event) => handleFilesSelected(event.target.files)}
      />

      {/* AI Enhance Style Menu */}
      {showEnhanceMenu && !isEnhancing && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/20"
            onClick={() => setShowEnhanceMenu(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-64 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                AI Enhance
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {selectedText ? `Enhance selected text (${selectedText.text.length} chars)` : "Enhance all text"}
              </p>
            </div>
            <div className="p-2">
              {ENHANCE_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => void handleEnhanceBody(style.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm font-medium text-white">{style.label}</p>
                  <p className="text-xs text-white/50">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Right-click context menu for AI Enhance */}
      {contextMenuPos && selectedText && !isEnhancing && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setContextMenuPos(null)}
          />
          <div
            className="fixed z-[70] w-52 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
            style={{
              left: Math.min(contextMenuPos.x, window.innerWidth - 220),
              top: Math.min(contextMenuPos.y, window.innerHeight - 200),
            }}
          >
            <div className="px-3 py-2 border-b border-white/10 bg-white/5">
              <p className="text-xs font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                AI Enhance Selected
              </p>
            </div>
            <div className="p-1.5">
              {ENHANCE_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => void handleEnhanceBody(style.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm font-medium text-white">{style.label}</p>
                  <p className="text-[11px] text-white/50">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
