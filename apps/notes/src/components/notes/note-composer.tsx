"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useMemo, useRef, useState, useEffect, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  CheckSquare,
  Image as ImageIcon,
  CalendarClock,
  Calculator,
  Palette,
  Plus,
  BellRing,
  Tag,
  X,
  Sparkles,
  Loader2,
  Brain,
  Flame,
} from "lucide-react";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import { useNotes } from "@/components/providers/notes-provider";
import type { ChecklistItem, NoteColor, NotePriority } from "@/lib/types/note";
import { NOTE_COLORS } from "@/lib/constants/note-colors";
import { useLabels } from "@/components/providers/labels-provider";
import { QUICK_CAPTURE_EVENT } from "@/lib/constants/events";
import { useReminders } from "@/components/providers/reminders-provider";
import { InlineCalculator } from "@/components/notes/inline-calculator";
import { RichTextEditor, type RichTextEditorRef } from "@/components/editor";
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
import { generateUUID, InlineSpacePicker } from "@ainexsuite/ui";
import { DateSuggestions } from "@ainexsuite/date-detection";
import { useSpaces } from "@/components/providers/spaces-provider";
import { Hint, HINTS } from "@/components/hints";

type AttachmentDraft = {
  id: string;
  file: File;
  preview: string;
};

const checklistTemplate = (): ChecklistItem => ({
  id: generateUUID(),
  text: "",
  completed: false,
});

// Contextual placeholder examples for checklist items
const getChecklistPlaceholder = (index: number): string => {
  const examples = [
    "Add item...",
    "e.g., Milk",
    "e.g., Pick up dry cleaning",
    "e.g., Call mom",
    "e.g., Bread",
    "e.g., Eggs",
  ];
  return examples[index % examples.length];
};

// Quick templates for new notes
type NoteTemplate = {
  id: string;
  label: string;
  icon: string;
  mode: "text" | "checklist";
  title?: string;
  checklist?: ChecklistItem[];
};

const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: "blank",
    label: "Blank",
    icon: "📝",
    mode: "text",
  },
  {
    id: "shopping",
    label: "Shopping List",
    icon: "🛒",
    mode: "checklist",
    title: "Shopping List",
    checklist: [
      { id: generateUUID(), text: "", completed: false },
    ],
  },
  {
    id: "todo",
    label: "To-do",
    icon: "✓",
    mode: "checklist",
    title: "",
    checklist: [
      { id: generateUUID(), text: "", completed: false },
    ],
  },
];

interface NoteComposerProps {
  /** Callback to open member manager for current space */
  onManagePeople?: () => void;
  /** Callback to open space management modal */
  onManageSpaces?: () => void;
}

export function NoteComposer({ onManagePeople, onManageSpaces }: NoteComposerProps) {
  const { createNote, updateNote, deleteNote } = useNotes();
  const { spaces, currentSpace, setCurrentSpace } = useSpaces();
  const { createReminder } = useReminders();
  const { preferences } = usePreferences();
  const { labels, createLabel } = useLabels();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [mode, setMode] = useState<"text" | "checklist">("text");
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [color, setColor] = useState<NoteColor>("default");
  const [pinned, setPinned] = useState(false);
  const [priority, setPriority] = useState<NotePriority>(null);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Auto-create: track created note ID for auto-save
  const [createdNoteId, setCreatedNoteId] = useState<string | null>(null);
  const isCreatingRef = useRef(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
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
  const [showCalculator, setShowCalculator] = useState(false);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showTemplates, setShowTemplates] = useState(false);

  // Apply a template to the composer
  const applyTemplate = useCallback((template: NoteTemplate) => {
    setMode(template.mode);
    if (template.title !== undefined) {
      setTitle(template.title);
    }
    if (template.checklist) {
      // Generate fresh IDs for checklist items
      setChecklist(template.checklist.map(item => ({
        ...item,
        id: generateUUID(),
      })));
    } else {
      setChecklist([]);
    }
    setShowTemplates(false);
    setExpanded(true);
    // Focus the title input after a short delay
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newLabelInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const richTextEditorRef = useRef<RichTextEditorRef>(null);
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
    setPriority(null);
    setShowPriorityPicker(false);
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
    setShowCalculator(false);
    setShowEnhanceMenu(false);
    setNewLabelName("");
    setIsCreatingLabel(false);
    setCreatedNoteId(null);
    isCreatingRef.current = false;
  }, [preferences.reminderChannels]);

  // Auto-create note on first content
  useEffect(() => {
    if (!expanded || createdNoteId || isCreatingRef.current) return;

    // Check if there's text content (not just attachments for initial create)
    const hasTextContent = title.trim() || body.trim() ||
      (mode === "checklist" && checklist.some((item) => item.text.trim()));

    if (!hasTextContent) return;

    const createDraftNote = async () => {
      isCreatingRef.current = true;
      try {
        const noteId = await createNote({
          title: title.trim(),
          body: body.trim(),
          type: mode,
          checklist: mode === "checklist" ? checklist : [],
          color,
          pinned: false,
          priority: null,
          archived: false,
          labelIds: [],
          reminderAt: null,
          attachments: [],
        });
        if (noteId) {
          setCreatedNoteId(noteId);
        }
      } catch (error) {
        console.error("[NoteComposer] Failed to auto-create note:", error);
      } finally {
        isCreatingRef.current = false;
      }
    };

    void createDraftNote();
  }, [expanded, createdNoteId, title, body, mode, checklist, color, createNote]);

  // Auto-save changes to created note (debounced)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!createdNoteId) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounced save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateNote(createdNoteId, {
          title: title.trim(),
          body: mode === "text" ? body.trim() : "",
          checklist: mode === "checklist" ? checklist : [],
          color,
          labelIds: selectedLabelIds,
        });
      } catch (error) {
        console.error("[NoteComposer] Auto-save failed:", error);
      }
    }, 1500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [createdNoteId, title, body, mode, checklist, color, selectedLabelIds, updateNote]);

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

  type EnhanceStyle = "professional" | "casual" | "concise" | "grammar";

  const ENHANCE_STYLES: { id: EnhanceStyle; label: string; description: string }[] = [
    { id: "professional", label: "Professional", description: "Polished & formal tone" },
    { id: "casual", label: "Casual", description: "Friendly & conversational" },
    { id: "concise", label: "Concise", description: "Brief & to the point" },
    { id: "grammar", label: "Clean Grammar", description: "Fix spelling & grammar" },
  ];

  const handleEnhanceBody = async (style: EnhanceStyle) => {
    if (!body.trim() || isEnhancing) return;

    setShowEnhanceMenu(false);

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
        body: JSON.stringify({ text: body, task, tone }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.enhanced) {
          setBody(data.enhanced);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to enhance body:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCalculatorInsert = useCallback((result: string) => {
    setBody((prev) => {
      const newBody = prev ? `${prev} ${result}` : result;
      return newBody;
    });
    setShowCalculator(false);
  }, []);

  // Handler for rich text editor content changes
  const handleRichTextChange = useCallback((html: string, text: string) => {
    // Store the plain text for backward compatibility
    // The HTML is what gets rendered, but we save the text version for search/compatibility
    setBody(text);
  }, []);

  // Handle close: finalize note with attachments/reminders/pin or delete if empty
  const handleClose = useCallback(async () => {
    if (isSubmitting) return;

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // If no note was created and no content, just close
    if (!createdNoteId && !hasContent) {
      resetState();
      return;
    }

    // If note was created but now empty, delete it
    if (createdNoteId && !hasContent) {
      try {
        await deleteNote(createdNoteId);
      } catch (error) {
        console.error("[NoteComposer] Failed to delete empty note:", error);
      }
      resetState();
      return;
    }

    // If no note was created yet but there's content, create it now
    let noteId = createdNoteId;
    if (!noteId && hasContent) {
      setIsSubmitting(true);
      try {
        noteId = await createNote({
          title: title.trim(),
          body: body.trim(),
          type: mode,
          checklist: mode === "checklist" ? checklist : [],
          color,
          pinned: false,
          priority: null,
          archived: false,
          labelIds: selectedLabelIds,
          reminderAt: null,
          attachments: [],
        });
      } catch (error) {
        console.error("[NoteComposer] Failed to create note on close:", error);
        setIsSubmitting(false);
        return;
      }
    }

    if (!noteId) {
      resetState();
      return;
    }

    try {
      setIsSubmitting(true);

      // Finalize: handle pin, priority, attachments, reminders
      const updates: Record<string, unknown> = {};

      if (pinned) updates.pinned = true;
      if (priority) updates.priority = priority;

      // Save any final state (in case auto-save didn't catch it)
      updates.title = title.trim();
      updates.body = mode === "text" ? body.trim() : "";
      updates.checklist = mode === "checklist" ? checklist : [];
      updates.color = color;
      updates.labelIds = selectedLabelIds;

      if (Object.keys(updates).length > 0) {
        await updateNote(noteId, updates);
      }

      // Handle attachments
      // Note: For simplicity, we're not handling attachment uploads in composer
      // Users can add attachments by editing the note after creation

      // Handle reminder
      const fireAt = reminderEnabled ? reminderFireAt : null;
      if (fireAt && reminderEnabled) {
        const activeChannels = reminderChannels.length
          ? reminderChannels
          : preferences.reminderChannels;

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
    createdNoteId,
    hasContent,
    resetState,
    deleteNote,
    createNote,
    title,
    body,
    mode,
    checklist,
    color,
    selectedLabelIds,
    pinned,
    priority,
    updateNote,
    reminderEnabled,
    reminderFireAt,
    reminderChannels,
    preferences.reminderChannels,
    createReminder,
    reminderFrequency,
    customCron,
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

  const handleAddChecklistItem = (afterIndex?: number, inheritIndent?: number) => {
    const newItem = {
      ...checklistTemplate(),
      indent: inheritIndent ?? 0,
    };
    pendingChecklistFocusId.current = newItem.id;
    if (afterIndex !== undefined) {
      setChecklist((prev) => [
        ...prev.slice(0, afterIndex + 1),
        newItem,
        ...prev.slice(afterIndex + 1),
      ]);
    } else {
      setChecklist((prev) => [...prev, newItem]);
    }
  };

  const handleIndentChange = (itemId: string, delta: number) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentIndent = item.indent ?? 0;
          const newIndent = Math.max(0, Math.min(3, currentIndent + delta));
          return { ...item, indent: newIndent };
        }
        return item;
      })
    );
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || !files.length) {
      return;
    }

    const drafts: AttachmentDraft[] = Array.from(files).map((file) => ({
      id: generateUUID(),
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
      console.error("[NoteComposer] Failed to create label:", error);
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

  const colorConfig = NOTE_COLORS.find((c) => c.id === color) || NOTE_COLORS[0];
  const backgroundClass = colorConfig.cardClass;


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

      void handleClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [expanded, handleClose, isSubmitting]);

  // Check if user only has personal space (for hint display)
  const hasOnlyPersonalSpace = spaces.length === 1 && spaces[0]?.type === 'personal';

  return (
    <section className="w-full">
      {!expanded ? (
        <Hint hint={HINTS.SHARED_NOTES} showWhen={hasOnlyPersonalSpace}>
          <div className="flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
            <button
              type="button"
              className="flex-1 min-w-0 text-left text-sm text-zinc-400 dark:text-zinc-500 focus-visible:outline-none"
              onClick={() => applyTemplate(NOTE_TEMPLATES[0])}
            >
              <span>Take a note...</span>
            </button>
            {/* Quick template buttons */}
            <div className="flex items-center gap-1">
              {NOTE_TEMPLATES.slice(1).map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
                  title={template.label}
                >
                  <span>{template.icon}</span>
                  <span className="hidden sm:inline">{template.label}</span>
                </button>
              ))}
            </div>
            {/* Compact space selector */}
            <InlineSpacePicker
              spaces={spaces}
              currentSpace={currentSpace}
              onSpaceChange={setCurrentSpace}
              onManagePeople={onManagePeople}
              onManageSpaces={onManageSpaces}
            />
          </div>
        </Hint>
      ) : (
        <div
          ref={composerRef}
          className={clsx(
            "w-full rounded-2xl shadow-lg border transition-all",
            backgroundClass,
            "border-zinc-200 dark:border-zinc-800",
          )}
        >
          <div className="flex flex-col gap-3 px-5 py-4">
            <div className="flex items-start gap-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                className="w-full bg-transparent text-lg font-semibold focus:outline-none text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
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
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                )}
                aria-label={pinned ? "Remove from Focus" : "Add to Focus"}
              >
                <FocusIcon focused={pinned} className="h-5 w-5" />
              </button>
              {/* Priority Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowPriorityPicker((prev) => !prev);
                    setShowPalette(false);
                    setShowLabelPicker(false);
                    setShowCalculator(false);
                    setShowEnhanceMenu(false);
                  }}
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    priority === "high"
                      ? "text-red-500 bg-red-500/10"
                      : priority === "medium"
                        ? "text-amber-500 bg-amber-500/10"
                        : priority === "low"
                          ? "text-blue-500 bg-blue-500/10"
                          : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  )}
                  aria-label="Set priority"
                >
                  <Flame className="h-5 w-5" />
                </button>
                {showPriorityPicker && (
                  <div className="absolute top-12 right-0 z-30 flex flex-col gap-1 rounded-xl bg-surface-elevated/95 p-2 shadow-floating backdrop-blur-xl min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => {
                        setPriority("high");
                        setShowPriorityPicker(false);
                      }}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                        priority === "high"
                          ? "bg-red-500/20 text-red-500"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Flame className="h-4 w-4 text-red-500" />
                      High
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPriority("medium");
                        setShowPriorityPicker(false);
                      }}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                        priority === "medium"
                          ? "bg-amber-500/20 text-amber-500"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Flame className="h-4 w-4 text-amber-500" />
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPriority("low");
                        setShowPriorityPicker(false);
                      }}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                        priority === "low"
                          ? "bg-blue-500/20 text-blue-500"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      )}
                    >
                      <Flame className="h-4 w-4 text-blue-500" />
                      Low
                    </button>
                    {priority && (
                      <>
                        <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setPriority(null);
                            setShowPriorityPicker(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                        >
                          <X className="h-4 w-4" />
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => void handleClose()}
                className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mode === "text" ? (
              <div className="relative">
                <RichTextEditor
                  ref={richTextEditorRef}
                  content={body}
                  placeholder="What's on your mind?..."
                  onChange={handleRichTextChange}
                  editable={!isEnhancing}
                  showToolbar={true}
                  minHeight={attachments.length ? "80px" : "120px"}
                  className={clsx(
                    "transition-all duration-300",
                    isEnhancing && "blur-sm opacity-50"
                  )}
                  editorClassName="text-[15px] leading-7 tracking-[-0.01em] text-zinc-700 dark:text-zinc-300"
                />
                {/* AI Enhancement overlay */}
                {isEnhancing && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-900 px-8 py-5 border border-[var(--color-primary)]/40 shadow-2xl">
                      <div className="relative w-12 h-12 flex items-center justify-center">
                        <div className="absolute inset-0 animate-ping opacity-20 flex items-center justify-center">
                          <Brain className="h-10 w-10 text-[var(--color-primary)]" />
                        </div>
                        <Brain className="h-10 w-10 text-[var(--color-primary)] animate-pulse" />
                        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-[var(--color-primary)] animate-bounce" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">AI is thinking...</p>
                        <p className="text-xs text-white/60 mt-0.5">Enhancing your note</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-[var(--color-primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {checklist.map((item, idx) => {
                  const indentLevel = item.indent ?? 0;
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center gap-3"
                      style={{ paddingLeft: `${indentLevel * 24}px` }}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={(event) =>
                          handleChecklistChange(item.id, {
                            completed: event.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-accent-500 flex-shrink-0"
                      />
                      <input
                        value={item.text}
                        onChange={(event) =>
                          handleChecklistChange(item.id, {
                            text: event.target.value,
                          })
                        }
                        onKeyDown={(event) => {
                          // Tab to indent
                          if (event.key === "Tab" && !event.shiftKey) {
                            event.preventDefault();
                            handleIndentChange(item.id, 1);
                            return;
                          }
                          // Shift+Tab to unindent
                          if (event.key === "Tab" && event.shiftKey) {
                            event.preventDefault();
                            handleIndentChange(item.id, -1);
                            return;
                          }
                          // Option/Alt + Up to move item up
                          if (event.key === "ArrowUp" && event.altKey && idx > 0) {
                            event.preventDefault();
                            setChecklist((prev) => {
                              const newList = [...prev];
                              [newList[idx - 1], newList[idx]] = [newList[idx], newList[idx - 1]];
                              return newList;
                            });
                            setTimeout(() => checklistInputRefs.current[item.id]?.focus(), 0);
                            return;
                          }
                          // Option/Alt + Down to move item down
                          if (event.key === "ArrowDown" && event.altKey && idx < checklist.length - 1) {
                            event.preventDefault();
                            setChecklist((prev) => {
                              const newList = [...prev];
                              [newList[idx], newList[idx + 1]] = [newList[idx + 1], newList[idx]];
                              return newList;
                            });
                            setTimeout(() => checklistInputRefs.current[item.id]?.focus(), 0);
                            return;
                          }
                          // Arrow Up to navigate to previous item
                          if (event.key === "ArrowUp" && !event.altKey && idx > 0) {
                            event.preventDefault();
                            const prevItem = checklist[idx - 1];
                            checklistInputRefs.current[prevItem.id]?.focus();
                            return;
                          }
                          // Arrow Down to navigate to next item
                          if (event.key === "ArrowDown" && !event.altKey && idx < checklist.length - 1) {
                            event.preventDefault();
                            const nextItem = checklist[idx + 1];
                            checklistInputRefs.current[nextItem.id]?.focus();
                            return;
                          }
                          // Enter to create new item (inherit indent level)
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            !event.nativeEvent.isComposing
                          ) {
                            event.preventDefault();
                            handleAddChecklistItem(idx, indentLevel);
                          }
                          // Backspace on empty item: unindent first, then delete when at level 0
                          if (
                            event.key === "Backspace" &&
                            item.text === ""
                          ) {
                            event.preventDefault();
                            // If indented, unindent first
                            if (indentLevel > 0) {
                              handleIndentChange(item.id, -1);
                            } else if (checklist.length > 1) {
                              // At level 0, delete the item
                              const prevItem = checklist[idx - 1];
                              if (prevItem) {
                                checklistInputRefs.current[prevItem.id]?.focus();
                              }
                              setChecklist((prev) =>
                                prev.filter((entry) => entry.id !== item.id)
                              );
                            }
                          }
                        }}
                        placeholder={getChecklistPlaceholder(idx)}
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
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleAddChecklistItem()}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-subtle px-3 py-1 text-xs font-medium text-ink-600 transition hover:border-outline-strong"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </button>
              </div>
            )}

            {/* Date detection suggestions for calendar */}
            {(title.trim() || body.trim()) && (
              <DateSuggestions
                text={`${title} ${body}`}
                context={{
                  app: 'notes',
                  entryId: createdNoteId || undefined,
                  title: title.trim() || 'Note',
                }}
                className="pb-2"
              />
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

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
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
                            id: generateUUID(),
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
                  className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  aria-label="Lists & checklists"
                  title="Lists & checklists"
                >
                  <CheckSquare className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                      showPalette ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    onClick={() => {
                      setShowPalette((prev) => !prev);
                      setShowLabelPicker(false);
                      setShowCalculator(false);
                      setShowEnhanceMenu(false);
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
                    showLabelPicker ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => {
                    setShowLabelPicker((prev) => !prev);
                    setShowPalette(false);
                    setShowCalculator(false);
                    setShowEnhanceMenu(false);
                  }}
                  aria-label="Manage labels"
                >
                  <Tag className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    reminderPanelOpen ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10" : reminderEnabled ? "text-[var(--color-primary)]" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                    setShowCalculator(false);
                    setShowEnhanceMenu(false);
                  }}
                  aria-label="Set reminder"
                >
                  <BellRing
                    className={clsx("h-5 w-5", reminderEnabled && "fill-current")}
                  />
                </button>
                {/* Calculator */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showCalculator
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    onClick={() => {
                      setShowCalculator((prev) => !prev);
                      setShowPalette(false);
                      setShowLabelPicker(false);
                      setReminderPanelOpen(false);
                      setShowEnhanceMenu(false);
                    }}
                    aria-label="Calculator"
                  >
                    <Calculator className="h-5 w-5" />
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
                {/* AI Enhance button */}
                {mode === "text" && body.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnhanceMenu((prev) => !prev);
                      setShowPalette(false);
                      setShowLabelPicker(false);
                      setShowCalculator(false);
                      setReminderPanelOpen(false);
                    }}
                    disabled={isEnhancing}
                    className={clsx(
                      "transition-all flex items-center gap-1.5 rounded-full h-9 px-3",
                      isEnhancing
                        ? "text-[var(--color-primary)] cursor-wait bg-[var(--color-primary)]/20"
                        : showEnhanceMenu
                          ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                          : "text-zinc-500 dark:text-zinc-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                    )}
                    aria-label="Enhance with AI"
                    title="Enhance text with AI"
                  >
                    {isEnhancing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs font-medium">Enhancing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-medium">All</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <button
                type="button"
                className="text-sm font-medium transition-colors text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                onClick={() => void handleClose()}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Done"}
              </button>
            </div>
          </div>

          {showLabelPicker ? (
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-3 space-y-3">
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
                        onClick={() => toggleLabelSelection(label.id)}
                        className={clsx(
                          "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                          isSelected
                            ? "border-zinc-400 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200",
                        )}
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

          {/* AI Enhance Style Menu */}
          {showEnhanceMenu && !isEnhancing && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-5 py-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  AI Enhance
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Choose a style
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {ENHANCE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => void handleEnhanceBody(style.id)}
                    className="text-left px-3 py-2 rounded-xl transition-colors bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{style.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
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
