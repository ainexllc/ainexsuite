"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckSquare,
  X,
  BellRing,
  CalendarClock,
  Sparkles,
  Loader2,
  Brain,
  Plus,
  Ban,
  Check,
  Trash2,
  GripVertical,
  ChevronRight,
  Circle,
  CheckCircle2,
} from "lucide-react";
import { AnimatedCheckbox } from "./animated-checkbox";
import { ChecklistDueDatePicker } from "./checklist-due-date";
import { ChecklistPriorityPicker } from "./checklist-priority";
// ChecklistItemDetails and DetailsToggleButton available in ./checklist-item-details if needed
import { useChecklistHistory } from "@/hooks/use-checklist-history";
import { RichTextEditor, type RichTextEditorRef } from "@/components/editor/rich-text-editor";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import type {
  ChecklistItem,
  Note,
  NoteAttachment,
  NoteColor,
  NoteDraft,
  NotePriority,
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
import { getBackgroundById, getTextColorClasses, getOverlayClasses, FALLBACK_BACKGROUNDS, OVERLAY_OPTIONS } from "@/lib/backgrounds";
import type { BackgroundOverlay } from "@/lib/types/note";
import { useBackgrounds } from "@/components/providers/backgrounds-provider";
import { useAutoSave } from "@/hooks/use-auto-save";
import { ConfirmationDialog, generateUUID } from "@ainexsuite/ui";
import { useAuth } from "@ainexsuite/auth";
import { ImageModal } from "@/components/ui/image-modal";
import { NoteActionsToolbar } from "@/components/notes/note-actions-toolbar";
import {
  getSubtreeIndices,
  hasChildren,
  getChildrenCompletionStats,
  moveSubtree,
  isHiddenByCollapsedAncestor,
  isInvalidDropTarget,
} from "@/lib/utils/checklist-utils";
import {
  useChecklistHandlers,
  getChecklistPlaceholder,
} from "@/hooks/use-checklist-handlers";
import { fireCelebration } from "@/lib/confetti";

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

// Sortable wrapper for checklist items with drag handle and tree lines
type SortableChecklistItemProps = {
  id: string;
  children: React.ReactNode;
  indentLevel: number;
  subtreeCount?: number; // Number of children being dragged with this item
  isAnyDragging?: boolean; // True when any item is being dragged
};

function SortableChecklistItem({ id, children, indentLevel, subtreeCount: _subtreeCount, isAnyDragging = false }: SortableChecklistItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const INDENT_WIDTH = 12; // Compact indent

  // When dragging, show a gray placeholder
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="relative flex items-start gap-1 py-0.5 rounded-md"
      >
        {/* Indentation spacer */}
        <div style={{ width: `${indentLevel * INDENT_WIDTH}px`, flexShrink: 0 }} />
        {/* Placeholder box */}
        <div className="flex-1 h-7 rounded-md bg-zinc-200/50 dark:bg-zinc-700/50 border-2 border-dashed border-zinc-300 dark:border-zinc-600" />
      </div>
    );
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout={!isAnyDragging}
      layoutId={isAnyDragging ? undefined : id}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.15 },
        y: { type: "spring", stiffness: 500, damping: 30 },
        scale: { duration: 0.15 },
      }}
      className="group relative flex items-start gap-1 py-0.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
    >
      {/* Left border accent for nested items */}
      {indentLevel > 0 && (
        <motion.div
          className="absolute top-0 bottom-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          style={{
            left: '2px',
            width: '2px',
            backgroundColor: 'var(--color-primary)',
          }}
        />
      )}
      {/* Indentation spacer */}
      <div style={{ width: `${indentLevel * INDENT_WIDTH}px`, flexShrink: 0 }} />
      {/* Drag handle - compact */}
      <button
        type="button"
        className="cursor-grab touch-none opacity-0 group-hover:opacity-50 hover:!opacity-80 transition-opacity flex-shrink-0 mt-0.5"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3 w-3 text-zinc-400" />
      </button>
      {children}
    </motion.div>
  );
}

export function NoteEditor({ note, onClose }: NoteEditorProps) {
  const { user } = useAuth();
  const {
    updateNote,
    duplicateNote,
    togglePin,
    removeAttachment,
    attachFiles,
    deleteNote,
  } = useNotes();
  const { labels, createLabel } = useLabels();

  // Only show delete button if current user is the note owner
  const canDelete = !note.ownerId || user?.uid === note.ownerId;
  const { reminders, createReminder, updateReminder, deleteReminder } = useReminders();
  const { preferences } = usePreferences();
  const { spaces } = useSpaces();

  // Get current space for toolbar
  const currentSpace = useMemo(() => {
    return spaces.find((s) => s.id === note.spaceId);
  }, [spaces, note.spaceId]);

  // Get backgrounds from Firestore (with fallback)
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();
  const availableBackgrounds = useMemo(() => {
    return firestoreBackgrounds.length > 0 ? firestoreBackgrounds : FALLBACK_BACKGROUNDS;
  }, [firestoreBackgrounds]);

  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [mode, setMode] = useState<"text" | "checklist">(
    note.type === "checklist" ? "checklist" : "text",
  );
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    note.checklist,
  );
  const [autoSortCompleted, setAutoSortCompleted] = useState(true);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Undo/redo for checklist (keyboard shortcuts Cmd+Z/Cmd+Shift+Z still work)
  const {
    pushHistory: pushChecklistHistory,
  } = useChecklistHistory({
    onUndo: (newChecklist) => setChecklist(newChecklist),
    onRedo: (newChecklist) => setChecklist(newChecklist),
    maxHistorySize: 50,
    enableKeyboardShortcuts: mode === "checklist",
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    itemId: string;
    childCount: number;
  } | null>(null);
  const [color, setColor] = useState<NoteColor>(note.color);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(note.backgroundImage ?? null);
  const [backgroundOverlay, setBackgroundOverlay] = useState<BackgroundOverlay>(note.backgroundOverlay ?? 'auto');

  // Get current background for display (must be after backgroundImage state)
  const currentBackground = useMemo(() => {
    if (!backgroundImage) return null;
    // Search in Firestore backgrounds first, then fallback
    return getBackgroundById(backgroundImage, availableBackgrounds) ?? null;
  }, [backgroundImage, availableBackgrounds]);

  const [pinned, setPinned] = useState(note.pinned);
  const [priority, setPriority] = useState<NotePriority>(note.priority ?? null);
  const [existingAttachments, setExistingAttachments] = useState<NoteAttachment[]>(
    note.attachments,
  );
  const [removedAttachments, setRemovedAttachments] = useState<NoteAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<AttachmentDraft[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedText, setSelectedText] = useState<{ text: string; start: number; end: number } | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [bodyHistory, setBodyHistory] = useState<string[]>([]);
  const [bodyFuture, setBodyFuture] = useState<string[]>([]);
  const editorRef = useRef<RichTextEditorRef>(null);

  // Undo/redo state and refs
  const lastHistorySnapshotRef = useRef(note.body); // Last body value captured to history
  const hasEditedRef = useRef(false); // Track if user has made any edits
  const isUndoRedoRef = useRef(false); // Track when undo/redo is in progress
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // Store debounce timer for cancellation


  // Capture body changes to history with debouncing
  useEffect(() => {
    // Don't save if body hasn't changed from last snapshot
    if (body === lastHistorySnapshotRef.current) return;

    // Skip history changes if this was an undo/redo operation
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      lastHistorySnapshotRef.current = body;
      return;
    }

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Capture the original state before first edit (for proper undo to initial state)
    const originalState = lastHistorySnapshotRef.current;
    const isFirstEdit = !hasEditedRef.current;

    if (isFirstEdit) {
      hasEditedRef.current = true;
    }

    // Debounce all history saves (1 second) for consistent behavior
    debounceTimerRef.current = setTimeout(() => {
      if (isFirstEdit) {
        // First edit: save the original state so user can undo back to it
        setBodyHistory([originalState]);
      } else {
        // Subsequent edits: append to history (keep max 20 states)
        setBodyHistory(prev => [...prev.slice(-19), originalState]);
      }
      setBodyFuture([]); // Clear redo stack on new edit
      lastHistorySnapshotRef.current = body;
      debounceTimerRef.current = null;
    }, 1000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [body]);

  // Save to history before AI changes (immediate, bypasses debounce)
  const saveToHistory = useCallback(() => {
    if (body !== lastHistorySnapshotRef.current) {
      // Clear pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setBodyHistory(prev => [...prev.slice(-19), lastHistorySnapshotRef.current]);
      lastHistorySnapshotRef.current = body;
    }
  }, [body]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (bodyHistory.length > 0) {
      // Clear any pending debounce timer to prevent race condition
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const previousState = bodyHistory[bodyHistory.length - 1];
      isUndoRedoRef.current = true; // Mark as undo/redo operation
      // Move current state to future for redo
      setBodyFuture(prev => [body, ...prev]);
      setBodyHistory(prev => prev.slice(0, -1));
      setBody(previousState);
    }
  }, [bodyHistory, body]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (bodyFuture.length > 0) {
      // Clear any pending debounce timer to prevent race condition
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const nextState = bodyFuture[0];
      isUndoRedoRef.current = true; // Mark as undo/redo operation
      // Move current state to history
      setBodyHistory(prev => [...prev, body]);
      setBodyFuture(prev => prev.slice(1));
      setBody(nextState);
    }
  }, [bodyFuture, body]);

  // Keyboard shortcuts for undo/redo in text mode
  useEffect(() => {
    if (mode !== "text") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is in an input/textarea (let native browser undo work)
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea') {
        return;
      }

      const isUndo =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === "z";

      const isRedo =
        ((event.metaKey || event.ctrlKey) &&
          event.shiftKey &&
          event.key.toLowerCase() === "z") ||
        ((event.metaKey || event.ctrlKey) &&
          !event.shiftKey &&
          event.key.toLowerCase() === "y");

      if (isUndo && bodyHistory.length > 0) {
        event.preventDefault();
        handleUndo();
      } else if (isRedo && bodyFuture.length > 0) {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, handleUndo, handleRedo, bodyHistory.length, bodyFuture.length]);

  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
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

  // Determine text color based on the color's textMode (light or dark)
  const hasColor = currentColorConfig && currentColorConfig.id !== 'default';

  // Get the editor background class (single class, no theme switching)
  const editorBgClass = useMemo(() => {
    if (!currentColorConfig) return undefined;
    return currentColorConfig.bgClass;
  }, [currentColorConfig]);

  // Text color requirements based on textMode
  const forceLightText = !currentBackground && hasColor && currentColorConfig?.textMode === 'light';
  const forceDarkText = !currentBackground && hasColor && currentColorConfig?.textMode === 'dark';

  // Modal is now full-height responsive - no need for content-based sizing
  const [customCron, setCustomCron] = useState("");
  const [reminderPrimed, setReminderPrimed] = useState(false);
  const [reminderPanelOpen, setReminderPanelOpen] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>(note.spaceId || "personal");

  // Auto-save data - tracks all saveable fields
  const autoSaveData = useMemo(() => ({
    title: title.trim(),
    body: mode === "text" ? body.trim() : "",
    checklist: mode === "checklist" ? checklist : [],
    type: mode === "checklist" ? "checklist" as const : "text" as const,
    color,
    labelIds: selectedLabelIds,
    spaceId: selectedSpaceId === "personal" ? undefined : selectedSpaceId,
  }), [title, body, mode, checklist, color, selectedLabelIds, selectedSpaceId]);

  // Auto-save callback
  const handleAutoSave = useCallback(async (data: typeof autoSaveData) => {
    const updates: NoteDraft = {};

    if (data.title !== note.title) updates.title = data.title;
    if (data.body !== note.body) updates.body = data.body;
    if (data.type !== note.type) {
      updates.checklist = data.checklist;
      updates.body = data.body;
    } else if (data.type === "checklist") {
      const checklistChanged = JSON.stringify(data.checklist) !== JSON.stringify(note.checklist);
      if (checklistChanged) updates.checklist = data.checklist;
    }
    if (data.color !== note.color) updates.color = data.color;
    if (JSON.stringify(data.labelIds) !== JSON.stringify(note.labelIds ?? [])) {
      updates.labelIds = data.labelIds;
    }
    const noteSpaceId = note.spaceId || undefined;
    if (data.spaceId !== noteSpaceId) updates.spaceId = data.spaceId;

    if (Object.keys(updates).length > 0) {
      await updateNote(note.id, updates);
    }
  }, [note, updateNote]);

  // Use auto-save hook
  const { status: saveStatus, flush: flushSave } = useAutoSave({
    data: autoSaveData,
    onSave: handleAutoSave,
    enabled: true,
    debounceMs: 1500,
  });

  // Auto-save background and overlay changes
  const handleBackgroundChange = useCallback(async (newBackgroundImage: string | null) => {
    setBackgroundImage(newBackgroundImage);
    // Auto-save to database
    await updateNote(note.id, { backgroundImage: newBackgroundImage });
  }, [note.id, updateNote]);

  const handleOverlayChange = useCallback(async (newOverlay: BackgroundOverlay) => {
    setBackgroundOverlay(newOverlay);
    // Auto-save to database
    await updateNote(note.id, { backgroundOverlay: newOverlay });
  }, [note.id, updateNote]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const checklistInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Use shared checklist handlers with history and auto-sort
  // Note: handleRemoveChecklistItem is not used here because NoteEditor has
  // handleDeleteItem which includes confirmation for items with children
  const {
    handleChecklistChange,
    handleAddChecklistItem,
    handleIndentChange,
    handleBulkToggle,
    handleToggleCollapsed,
    pendingFocusId: pendingChecklistFocusId,
  } = useChecklistHandlers(checklist, setChecklist, {
    onHistoryPush: pushChecklistHistory,
    autoSortCompleted,
    trackCompletedAt: true,
    onAllComplete: fireCelebration,
  });

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

  type EnhanceStyle = "professional" | "casual" | "concise" | "grammar" | "expand";

  const ENHANCE_STYLES: { id: EnhanceStyle; label: string; description: string }[] = [
    { id: "professional", label: "Professional", description: "Polished & formal tone" },
    { id: "casual", label: "Casual", description: "Friendly & conversational" },
    { id: "concise", label: "Concise", description: "Brief & to the point" },
    { id: "grammar", label: "Clean Grammar", description: "Fix spelling & grammar" },
    { id: "expand", label: "Expand", description: "Add more details & depth" },
  ];

  // Handle text selection in rich text editor
  const handleEditorSelectionUpdate = useCallback(() => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from !== to) {
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text.trim()) {
        setSelectedText({ text, start: from, end: to });
        return;
      }
    }
    setSelectedText(null);
  }, []);

  // Handle right-click context menu for rich text editor
  const handleEditorContextMenu = useCallback((e: React.MouseEvent) => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    const { from, to } = editor.state.selection;
    if (from !== to) {
      const text = editor.state.doc.textBetween(from, to, ' ');
      if (text.trim()) {
        e.preventDefault();
        setSelectedText({ text, start: from, end: to });
        setContextMenuPos({ x: e.clientX, y: e.clientY });
      }
    }
  }, []);

  const handleEnhanceBody = async (style: EnhanceStyle) => {
    if (isEnhancing) return;

    const editor = editorRef.current?.editor;

    // Determine what text to enhance - selected text or all
    const textToEnhance = selectedText?.text || (editor ? editor.getText() : body);
    if (!textToEnhance.trim()) return;

    setShowEnhanceMenu(false);
    setContextMenuPos(null);
    setEnhanceError(null); // Clear previous error

    // Save current state for undo
    saveToHistory();

    const startTime = Date.now();

    try {
      setIsEnhancing(true);

      // Map style to task and tone
      const taskMap: Record<EnhanceStyle, { task: string; tone?: string }> = {
        professional: { task: "improve", tone: "professional" },
        casual: { task: "rewrite", tone: "casual" },
        concise: { task: "simplify" },
        grammar: { task: "grammar" },
        expand: { task: "expand" },
      };

      const { task, tone } = taskMap[style];

      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToEnhance, task, tone }),
      });

      // Ensure loading shows for at least 500ms for better UX
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Enhancement failed (${response.status})`);
      }

      const data = await response.json();
      if (data.enhanced) {
        if (selectedText && editor) {
          // Replace only the selected portion using TipTap
          editor.chain()
            .focus()
            .setTextSelection({ from: selectedText.start, to: selectedText.end })
            .insertContent(data.enhanced)
            .run();
          setSelectedText(null);
        } else if (editor) {
          // Replace entire content using TipTap (API returns HTML-formatted content)
          editor.commands.setContent(data.enhanced);
        } else {
          // Fallback for plain text
          setBody(data.enhanced);
        }
      }
    } catch (error) {
      console.error("Failed to enhance body:", error);
      setEnhanceError(error instanceof Error ? error.message : "Failed to enhance text");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle non-auto-saved items on close (attachments, reminders, pin/archive)
  const handleFinalizeAndClose = useCallback(async () => {
    // First flush any pending auto-save
    await flushSave();

    // Handle pin changes
    const pinnedChanged = pinned !== note.pinned;

    if (pinnedChanged) {
      await togglePin(note.id, pinned);
    }

    // Handle priority changes
    const priorityChanged = priority !== (note.priority ?? null);
    if (priorityChanged) {
      await updateNote(note.id, { priority });
    }

    // Handle attachments
    if (removedAttachments.length > 0) {
      await Promise.all(
        removedAttachments.map((attachment) =>
          removeAttachment(note.id, attachment),
        ),
      );
    }

    if (newAttachments.length > 0) {
      await attachFiles(
        note.id,
        newAttachments.map((attachment) => attachment.file),
      );
    }

    // Handle reminders
    const reminderFireAt = reminderEnabled ? parseDateTimeLocalInput(reminderValue) : null;
    const shouldRemoveReminder = !reminderEnabled && Boolean(note.reminderId);
    const shouldCreateReminder = reminderEnabled && !note.reminderId && reminderFireAt;
    const shouldUpdateExisting = reminderEnabled && Boolean(note.reminderId) && Boolean(reminderFireAt);
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

    const activeChannels = reminderChannels.length
      ? reminderChannels
      : [...preferences.reminderChannels];

    if (shouldRemoveReminder && note.reminderId) {
      await deleteReminder(note.reminderId);
      await updateNote(note.id, { reminderAt: null, reminderId: null });
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
    } else if (
      shouldUpdateExisting &&
      reminderFireAt &&
      note.reminderId &&
      (reminderTimeChanged || reminderChannelsChanged || reminderFrequencyChanged || reminderCronChanged)
    ) {
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

    onClose();
  }, [
    flushSave,
    pinned,
    note.pinned,
    priority,
    note.priority,
    removedAttachments,
    newAttachments,
    note.id,
    togglePin,
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
    updateNote,
    preferences.reminderChannels,
    title,
    body,
    mode,
    checklist,
    selectedLabelIds,
    onClose,
  ]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        void handleFinalizeAndClose();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void handleFinalizeAndClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleFinalizeAndClose]);


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
  }, [checklist, pendingChecklistFocusId]);

  const canUseSms = Boolean(preferences.smsNumber?.trim());

  useEffect(() => {
    if (!canUseSms) {
      setReminderChannels((prev) => prev.filter((channel) => channel !== "sms"));
    }
  }, [canUseSms]);

  // Checklist handlers (handleChecklistChange, handleAddChecklistItem, etc.)
  // are now provided by useChecklistHandlers hook

  // Delete item with confirmation if it has children
  const handleDeleteItem = (itemId: string, idx: number) => {
    const childCount = getSubtreeIndices(checklist, idx).length;
    if (childCount > 0) {
      setDeleteConfirmation({ itemId, childCount });
    } else {
      setChecklist((prev) => prev.filter((item) => item.id !== itemId));
    }
  };

  // Confirm deletion of item and all children
  const confirmDeleteWithChildren = () => {
    if (!deleteConfirmation) return;
    const idx = checklist.findIndex((item) => item.id === deleteConfirmation.itemId);
    if (idx !== -1) {
      const subtreeSize = getSubtreeIndices(checklist, idx).length + 1;
      setChecklist((prev) => [
        ...prev.slice(0, idx),
        ...prev.slice(idx + subtreeSize),
      ]);
    }
    setDeleteConfirmation(null);
  };

  // Visible checklist items (filter out collapsed children)
  const visibleChecklist = useMemo(() => {
    return checklist.filter((_, idx) => !isHiddenByCollapsedAncestor(checklist, idx));
  }, [checklist]);

  // Drag and drop sensors for checklist reordering
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle checklist drag start - track active drag for subtree visual grouping
  const handleChecklistDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  // Handle checklist drag end - move entire subtree
  const handleChecklistDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setChecklist((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        // Check if trying to drop into own subtree (invalid)
        if (isInvalidDropTarget(items, oldIndex, newIndex)) {
          return items;
        }

        // Move the entire subtree
        return moveSubtree(items, oldIndex, newIndex);
      });
    }
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
      id: generateUUID(),
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 lg:p-8 print:hidden"
      data-note-editor-backdrop
      onMouseDown={() => void handleFinalizeAndClose()}
    >
      <div
        ref={editorContainerRef}
        data-note-editor-modal
        onMouseDown={(e) => e.stopPropagation()}
        className={clsx(
          "relative w-[95vw] sm:w-[90vw] md:w-[600px] lg:w-[650px] xl:w-[700px] max-w-[90vw] max-h-[90vh] sm:max-h-[88vh] md:max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden print:!static print:!w-full print:!max-w-none print:!max-h-none print:!rounded-none print:!border-none print:!shadow-none print:!bg-white",
          !currentBackground && editorBgClass,
          "border-zinc-200 dark:border-zinc-800",
        )}
      >
        {/* Background Image Layer */}
        {currentBackground && (
          <div
            className="absolute inset-0 z-0 print:hidden"
            style={{
              backgroundImage: `url(${currentBackground.fullImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay for text readability */}
            <div className={clsx(getOverlayClasses(currentBackground, backgroundOverlay), 'z-10')} />
          </div>
        )}

        {/* Corner Favorites Badge - clickable to toggle */}
        <button
          type="button"
          onClick={() => setPinned((prev) => !prev)}
          className="absolute -top-0 -right-0 w-16 h-16 overflow-hidden rounded-tr-2xl z-30 group/pin print:hidden"
          aria-label={pinned ? "Remove from Favorites" : "Add to Favorites"}
        >
          {pinned ? (
            <>
              <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-24 h-24 rotate-45 translate-x-12 -translate-y-12 transition-all" />
              <FocusIcon focused className="absolute top-2.5 right-2.5 h-5 w-5 text-white" />
            </>
          ) : (
            <>
              <div className={clsx(
                "absolute top-0 right-0 w-24 h-24 rotate-45 translate-x-12 -translate-y-12 transition-all",
                "opacity-0 group-hover:opacity-100",
                currentBackground?.brightness === 'light'
                  ? "bg-black/10"
                  : currentBackground
                    ? "bg-white/10"
                    : "bg-zinc-200/50 dark:bg-zinc-700/50"
              )} />
              <FocusIcon className={clsx(
                "absolute top-2.5 right-2.5 h-5 w-5 transition-all",
                "opacity-0 group-hover:opacity-100",
                currentBackground?.brightness === 'light'
                  ? "text-[var(--color-primary)]"
                  : currentBackground
                    ? "text-[var(--color-primary)]/80"
                    : "text-[var(--color-primary)]"
              )} />
            </>
          )}
        </button>

        {/* Header row - title and actions */}
        <div className={clsx(
          "relative z-20 flex items-center justify-between gap-4 pl-4 sm:pl-6 pr-14 sm:pr-20 py-3 sm:py-4 rounded-t-2xl flex-shrink-0 print:!bg-white print:!rounded-none print:!pr-4",
          currentBackground?.brightness === 'light'
            ? "bg-white/30 backdrop-blur-sm"
            : currentBackground
              ? "bg-black/30 backdrop-blur-sm"
              : editorBgClass
        )}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              data-note-editor-title
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              className={clsx(
                "w-full bg-transparent text-base sm:text-lg font-semibold focus:outline-none print:!text-black print:!text-xl print:!font-bold",
                forceDarkText
                  ? "text-zinc-800 placeholder:text-zinc-500"
                  : forceLightText
                    ? "text-zinc-100 placeholder:text-white/60"
                    : clsx(
                        getTextColorClasses(currentBackground, 'title'),
                        currentBackground?.brightness === 'light'
                          ? "placeholder:text-zinc-500"
                          : currentBackground
                            ? "placeholder:text-white/60"
                            : "placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                      )
              )}
            />
            {/* Header actions */}
            <div className="flex items-center gap-2 print:hidden">
              {/* Save status in glass pill */}
              {saveStatus !== "idle" && (
                <div className={clsx(
                  "flex items-center gap-1 px-2 py-1.5 rounded-full backdrop-blur-xl border",
                  currentBackground
                    ? currentBackground.brightness === 'dark'
                      ? "bg-white/10 border-white/20"
                      : "bg-black/5 border-black/10"
                    : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
                )}>
                  {saveStatus === "saving" && (
                    <Loader2 className={clsx(
                      "h-3.5 w-3.5 animate-spin",
                      getTextColorClasses(currentBackground, 'muted')
                    )} />
                  )}
                  {saveStatus === "saved" && (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div
          data-note-editor-body
          className={clsx(
            "relative z-10 flex flex-col gap-3 px-3 sm:px-4 md:px-5 pt-2 pb-4 overflow-y-auto print:!text-black print:!overflow-visible",
            forceDarkText
              ? "text-zinc-700"
              : forceLightText
                ? "text-zinc-200"
                : currentBackground && getTextColorClasses(currentBackground, 'body')
          )}
        >
          {mode === "text" ? (
            <div
              className="relative"
              onContextMenu={handleEditorContextMenu}
            >
              <RichTextEditor
                ref={editorRef}
                content={body}
                onChange={(html) => {
                  setBody(html);
                  handleEditorSelectionUpdate();
                }}
                onBlur={() => {
                  // Delay clearing selection to allow button click
                  setTimeout(() => {
                    if (!showEnhanceMenu && !contextMenuPos) setSelectedText(null);
                  }, 200);
                }}
                placeholder="Write your note…"
                showToolbar={true}
                minHeight="120px"
                editable={!isEnhancing}
                className={clsx(
                  "transition-all duration-300",
                  isEnhancing && "blur-sm opacity-50"
                )}
                editorClassName={clsx(
                  "min-h-[120px] sm:min-h-[150px]",
                  forceDarkText
                    ? "text-zinc-700 [&_.is-editor-empty]:before:text-zinc-500"
                    : forceLightText
                      ? "text-zinc-200 [&_.is-editor-empty]:before:text-white/50"
                      : clsx(
                          getTextColorClasses(currentBackground, 'body'),
                          currentBackground?.brightness === 'light'
                            ? "[&_.is-editor-empty]:before:text-zinc-500"
                            : currentBackground
                              ? "[&_.is-editor-empty]:before:text-white/50"
                              : "[&_.is-editor-empty]:before:text-zinc-400 dark:[&_.is-editor-empty]:before:text-zinc-600"
                        )
                )}
                toolbarClassName="rounded-lg mb-2"
                onImageClick={() => fileInputRef.current?.click()}
                forceLightText={forceLightText}
                forceDarkText={forceDarkText}
                backgroundBrightness={currentBackground?.brightness}
                hasCover={!!currentBackground}
              />
              {/* AI Enhancement overlay */}
              {isEnhancing && (
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
                      <p className="text-sm text-white/60 mt-1">
                        {selectedText ? "Enhancing selection..." : "Enhancing your entire note"}
                      </p>
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
              {/* AI Enhancement error message */}
              {enhanceError && !isEnhancing && (
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-red-500/95 px-5 py-3 border border-red-400/50 shadow-2xl max-w-sm">
                    <div className="flex-1 text-center">
                      <p className="text-sm font-medium text-white">Enhancement failed</p>
                      <p className="text-xs text-white/80 mt-0.5">{enhanceError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnhanceError(null)}
                      className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white/20 transition text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleChecklistDragStart}
              onDragEnd={(event) => {
                handleChecklistDragEnd(event);
                setActiveDragId(null);
              }}
            >
              <SortableContext
                items={visibleChecklist.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence mode="popLayout">
                <div className="space-y-1.5">
                  {checklist.map((item, idx) => {
                    // Skip items hidden by collapsed ancestor
                    if (isHiddenByCollapsedAncestor(checklist, idx)) {
                      return null;
                    }
                    // Skip children of actively dragged parent (they move with parent)
                    if (activeDragId && activeDragId !== item.id) {
                      const dragIdx = checklist.findIndex(i => i.id === activeDragId);
                      if (dragIdx !== -1) {
                        const subtreeIndices = getSubtreeIndices(checklist, dragIdx);
                        if (subtreeIndices.includes(idx)) {
                          return null;
                        }
                      }
                    }
                    const indentLevel = item.indent ?? 0;
                    const itemHasChildren = hasChildren(checklist, idx);
                    const subtreeCount = itemHasChildren ? getSubtreeIndices(checklist, idx).length : 0;
                    const completionStats = itemHasChildren ? getChildrenCompletionStats(checklist, idx) : null;
                    return (
                      <SortableChecklistItem
                        key={item.id}
                        id={item.id}
                        indentLevel={indentLevel}
                        subtreeCount={subtreeCount}
                        isAnyDragging={!!activeDragId}
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                        {/* Collapse/expand button for parent items */}
                        {itemHasChildren ? (
                          <motion.button
                            type="button"
                            onClick={() => handleToggleCollapsed(item.id)}
                            className="h-3.5 w-3.5 flex items-center justify-center flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            aria-label={item.collapsed ? "Expand children" : "Collapse children"}
                            animate={{ rotate: item.collapsed ? 0 : 90 }}
                            transition={{ duration: 0.15 }}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </motion.button>
                        ) : (
                          <div className="w-3.5 flex-shrink-0" />
                        )}
                        <AnimatedCheckbox
                          checked={item.completed}
                          onClick={(event) => {
                            // Shift+click for bulk toggle (parent + all children)
                            if (event.shiftKey && itemHasChildren) {
                              event.preventDefault();
                              handleBulkToggle(item.id, idx);
                            }
                          }}
                          onChange={(checked) =>
                            handleChecklistChange(item.id, {
                              completed: checked,
                            })
                          }
                          className="mt-0.5"
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
                        // Option/Alt + Up to move subtree up
                        if (event.key === "ArrowUp" && event.altKey && idx > 0) {
                          event.preventDefault();
                          setChecklist((prev) => moveSubtree(prev, idx, idx - 1));
                          // Keep focus on the moved item
                          setTimeout(() => checklistInputRefs.current[item.id]?.focus(), 0);
                          return;
                        }
                        // Option/Alt + Down to move subtree down
                        if (event.key === "ArrowDown" && event.altKey) {
                          event.preventDefault();
                          const subtreeSize = getSubtreeIndices(checklist, idx).length + 1;
                          const targetIdx = idx + subtreeSize;
                          if (targetIdx < checklist.length) {
                            setChecklist((prev) => moveSubtree(prev, idx, targetIdx));
                          }
                          // Keep focus on the moved item
                          setTimeout(() => checklistInputRefs.current[item.id]?.focus(), 0);
                          return;
                        }
                        // Cmd/Ctrl+Enter to bulk toggle parent + children
                        if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && itemHasChildren) {
                          event.preventDefault();
                          handleBulkToggle(item.id, idx);
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
                      className={clsx(
                        "flex-1 bg-transparent text-[13px] focus:outline-none transition-all duration-150",
                        forceDarkText
                          ? item.completed
                            ? "text-zinc-500 line-through decoration-zinc-400 placeholder-zinc-500"
                            : "text-zinc-800 placeholder-zinc-500"
                          : forceLightText
                            ? item.completed
                              ? "text-zinc-500 line-through decoration-zinc-400 placeholder-zinc-400"
                              : "text-zinc-100 placeholder-zinc-400"
                            : item.completed
                              ? "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-600 placeholder-zinc-400 dark:placeholder-zinc-500"
                              : "text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500"
                      )}
                    />
                    {/* Divider */}
                    <div className={clsx(
                      "h-3 w-px opacity-0 group-hover:opacity-40 flex-shrink-0",
                      forceDarkText ? "bg-zinc-500" : forceLightText ? "bg-zinc-400" : "bg-zinc-300 dark:bg-zinc-600"
                    )} />
                    {/* Priority picker */}
                    <ChecklistPriorityPicker
                      value={item.priority}
                      onChange={(priority) =>
                        handleChecklistChange(item.id, { priority })
                      }
                    />
                    {/* Divider */}
                    <div className={clsx(
                      "h-3 w-px opacity-0 group-hover:opacity-40 flex-shrink-0",
                      forceDarkText ? "bg-zinc-500" : forceLightText ? "bg-zinc-400" : "bg-zinc-300 dark:bg-zinc-600"
                    )} />
                    {/* Due date picker */}
                    <ChecklistDueDatePicker
                      value={item.dueDate}
                      onChange={(dueDate) =>
                        handleChecklistChange(item.id, { dueDate })
                      }
                    />
                    {/* Progress badge for parent items */}
                    <AnimatePresence>
                    {completionStats && completionStats.total > 0 && (
                      <>
                      {/* Divider */}
                      <div className={clsx(
                        "h-3 w-px opacity-0 group-hover:opacity-40 flex-shrink-0",
                        forceDarkText ? "bg-zinc-500" : forceLightText ? "bg-zinc-400" : "bg-zinc-300 dark:bg-zinc-600"
                      )} />
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={clsx(
                          "text-[11px] font-medium tabular-nums flex-shrink-0 px-1.5 py-0.5 rounded",
                          forceDarkText
                            ? "text-zinc-600 bg-zinc-900/10"
                            : forceLightText
                              ? "text-zinc-300 bg-white/10"
                              : "text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800"
                        )}
                      >
                        {completionStats.completed}/{completionStats.total}
                      </motion.span>
                      </>
                    )}
                    </AnimatePresence>
                    {/* Divider */}
                    <div className={clsx(
                      "h-3 w-px opacity-0 group-hover:opacity-40 flex-shrink-0",
                      forceDarkText ? "bg-zinc-500" : forceLightText ? "bg-zinc-400" : "bg-zinc-300 dark:bg-zinc-600"
                    )} />
                    <button
                      type="button"
                      className="opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100 flex-shrink-0"
                      onClick={() => handleDeleteItem(item.id, idx)}
                      aria-label="Remove checklist item"
                    >
                      <X className={clsx(
                        "h-3.5 w-3.5",
                        forceDarkText
                          ? "text-zinc-600 hover:text-red-600"
                          : forceLightText
                            ? "text-zinc-400 hover:text-red-400"
                            : "text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400"
                      )} />
                    </button>
                          </div>
                        </div>
                      </SortableChecklistItem>
                    );
                  })}
                </div>
                </AnimatePresence>
              </SortableContext>
              <div className={clsx(
                "flex items-center gap-1.5 mt-2.5 pt-2 border-t",
                forceDarkText
                  ? "border-zinc-400/30"
                  : forceLightText
                    ? "border-zinc-500/30"
                    : "border-zinc-200/50 dark:border-zinc-700/50"
              )}>
                <span className={clsx(
                  "text-[11px] tabular-nums flex-shrink-0",
                  forceDarkText
                    ? "text-zinc-600"
                    : forceLightText
                      ? "text-zinc-400"
                      : "text-zinc-400 dark:text-zinc-500"
                )}>
                  {checklist.filter(i => i.text.trim()).length} items
                </span>
                <button
                  type="button"
                  onClick={() => handleAddChecklistItem()}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                    forceDarkText
                      ? "text-zinc-600 hover:bg-zinc-900/10 hover:text-zinc-800"
                      : forceLightText
                        ? "text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300"
                  )}
                >
                  <Plus className="h-3 w-3" /> Add
                </button>
                {checklist.some((item) => item.completed) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setChecklist((prev) => prev.filter((item) => !item.completed))}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                        forceDarkText
                          ? "text-zinc-600 hover:bg-red-100/50 hover:text-red-700"
                          : forceLightText
                            ? "text-zinc-400 hover:bg-red-900/30 hover:text-red-300"
                            : "text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400"
                      )}
                    >
                      <Trash2 className="h-3 w-3" /> Clear done
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoSortCompleted(!autoSortCompleted)}
                      className={clsx(
                        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                        autoSortCompleted
                          ? forceDarkText
                            ? 'bg-emerald-100/50 text-emerald-800'
                            : forceLightText
                              ? 'bg-emerald-900/40 text-emerald-200'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : forceDarkText
                            ? 'text-zinc-600 hover:bg-zinc-900/10 hover:text-zinc-800'
                            : forceLightText
                              ? 'text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                              : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300'
                      )}
                    >
                      <Check className="h-3 w-3" /> Auto-sort
                    </button>
                  </>
                )}
              </div>
              {/* Drag overlay - shows the actual item being dragged */}
              <DragOverlay>
                {activeDragId ? (() => {
                  const draggedItem = checklist.find(item => item.id === activeDragId);
                  const draggedIndex = checklist.findIndex(item => item.id === activeDragId);
                  if (!draggedItem) return null;
                  const subtreeCount = hasChildren(checklist, draggedIndex)
                    ? getSubtreeIndices(checklist, draggedIndex).length
                    : 0;
                  return (
                    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl ring-2 ring-[var(--color-primary)] px-3 py-2 flex items-center gap-2">
                      <GripVertical className="h-3 w-3 text-[var(--color-primary)]" />
                      {draggedItem.completed ? (
                        <CheckCircle2
                          className="h-4 w-4 flex-shrink-0 text-[var(--color-primary)]"
                          fill="var(--color-primary)"
                          strokeWidth={0}
                        />
                      ) : (
                        <Circle className="h-4 w-4 flex-shrink-0 text-zinc-400" strokeWidth={2} />
                      )}
                      <span className={`text-[13px] ${draggedItem.completed ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {draggedItem.text || 'New item'}
                      </span>
                      {subtreeCount > 0 && (
                        <span className="ml-1 text-[11px] font-medium text-white bg-[var(--color-primary)] px-1.5 py-0.5 rounded-full">
                          +{subtreeCount}
                        </span>
                      )}
                    </div>
                  );
                })() : null}
              </DragOverlay>
            </DndContext>
          )}

          {/* Word/char count and AI button - below content (only for text mode) */}
          {mode !== "checklist" && (
            <div className="flex items-center justify-between">
              <div className={clsx(
                "text-[11px] tabular-nums",
                forceDarkText
                  ? "text-zinc-500"
                  : forceLightText
                    ? "text-zinc-400"
                    : currentBackground
                      ? currentBackground.brightness === 'dark'
                        ? "text-white/40"
                        : "text-black/40"
                      : "text-zinc-400 dark:text-zinc-500"
              )}>
                <span>
                  {body.trim().split(/\s+/).filter(w => w).length} words · {body.length} chars
                </span>
              </div>

              {/* Floating AI button */}
              {body.trim() && (
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={() => setShowEnhanceMenu((prev) => !prev)}
                  disabled={isEnhancing}
                  className={clsx(
                    "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                    isEnhancing
                      ? "text-[var(--color-primary)] cursor-wait bg-[var(--color-primary)]/20"
                      : selectedText
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/20"
                        : forceLightText || currentBackground?.brightness === "dark"
                          ? "text-white/50 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20"
                          : "text-zinc-400 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                  )}
                  aria-label="Enhance with AI"
                  title={selectedText ? `Enhance selected text` : "Enhance all text with AI"}
                >
                  {isEnhancing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </button>
              )}
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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {existingAttachments.map((attachment) => (
                <figure
                  key={attachment.id}
                  className="relative overflow-hidden rounded-2xl border border-outline-subtle/60 bg-white/60 shadow-sm cursor-zoom-in hover:brightness-95 transition-all"
                  onClick={() => setPreviewImage(attachment.downloadURL)}
                >
                  <img
                    src={attachment.downloadURL}
                    alt={attachment.name}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white shadow-lg z-10 hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExistingAttachment(attachment);
                    }}
                    aria-label="Remove attachment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </figure>
              ))}
              {newAttachments.map((attachment) => (
                <figure
                  key={attachment.id}
                  className="relative overflow-hidden rounded-2xl border border-outline-subtle/60 bg-white/60 shadow-sm cursor-zoom-in hover:brightness-95 transition-all"
                  onClick={() => setPreviewImage(attachment.preview)}
                >
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white shadow-lg z-10 hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveNewAttachment(attachment.id);
                    }}
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
        <div
          data-note-editor-toolbar
          className={clsx(
            "relative z-10 flex-shrink-0 rounded-b-2xl px-4 sm:px-6 pb-3 sm:pb-4 border-t print:hidden",
            currentBackground?.brightness === 'light'
              ? "bg-white/30 backdrop-blur-sm border-transparent"
              : currentBackground
                ? "bg-black/30 backdrop-blur-sm border-transparent"
                : "border-transparent"
          )}
        >
          {/* Shared toolbar component - same as card footer */}
          <div className="flex items-center justify-end">
            <NoteActionsToolbar
              note={note}
              variant="editor"
              forceLightText={forceLightText}
              forceDarkText={forceDarkText}
              backgroundBrightness={currentBackground?.brightness}
              hasCover={!!currentBackground}
              spaces={spaces}
              currentSpace={currentSpace}
              onMoveToSpace={(spaceId) => setSelectedSpaceId(spaceId)}
              onColorChange={(newColor) => setColor(newColor)}
              onPriorityChange={(newPriority) => setPriority(newPriority)}
              onDuplicate={async () => {
                const newNoteId = await duplicateNote(note.id);
                if (newNoteId) {
                  onClose();
                }
              }}
              onDelete={() => setShowDeleteConfirm(true)}
              color={color}
              priority={priority}
              showBackgroundPicker={showBackgroundPicker}
              onBackgroundPickerToggle={() => setShowBackgroundPicker((prev) => !prev)}
              hasBackgroundImage={!!backgroundImage}
              showLabelPicker={showLabelPicker}
              onLabelPickerToggle={() => setShowLabelPicker((prev) => !prev)}
              hasLabels={selectedLabelIds.length > 0}
              onSave={() => void handleFinalizeAndClose()}
              onPrint={() => window.print()}
              canDelete={canDelete}
              editorExtraButtons={
                mode === "text" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("checklist");
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
                      }}
                      className={clsx(
                        "h-6 w-6 rounded-full flex items-center justify-center transition",
                        forceLightText || currentBackground?.brightness === "dark"
                          ? "text-white/75 hover:text-white hover:bg-white/20"
                          : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/20"
                      )}
                      aria-label="Convert to list"
                      title="Convert to list"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : undefined
              }
            />
          </div>
          {/* Background picker popup - rendered separately */}
          {showBackgroundPicker && (
            <>
              <div
                className="fixed inset-0 z-20"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBackgroundPicker(false);
                }}
              />
              <div
                className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-[400px] md:w-[480px] z-30 rounded-2xl p-3 shadow-2xl backdrop-blur-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                onMouseDown={(e) => e.stopPropagation()}
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
                <div className="grid grid-cols-6 gap-2">
                  <button
                    type="button"
                    onClick={() => void handleBackgroundChange(null)}
                    className={clsx(
                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                      backgroundImage === null
                        ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
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
                  {availableBackgrounds.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => void handleBackgroundChange(bg.id)}
                      className={clsx(
                        "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                        backgroundImage === bg.id
                          ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                      )}
                    >
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
                {backgroundImage && (
                  <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Overlay Style</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {OVERLAY_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => void handleOverlayChange(option.id)}
                          className={clsx(
                            "px-2 py-1.5 rounded-lg text-xs font-medium transition-all",
                            backgroundOverlay === option.id
                              ? "bg-[var(--color-primary)] text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
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
          {showLabelPicker ? (
            <div className="pt-3 mt-3 space-y-3">
              {/* Glass pill container for tags */}
              <div className={clsx(
                "rounded-2xl p-3 backdrop-blur-xl border",
                currentBackground
                  ? currentBackground.brightness === 'dark'
                    ? "bg-white/10 border-white/20"
                    : "bg-black/5 border-black/10"
                  : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
              )}>
                {/* New label input */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative flex-1">
                    <input
                      ref={newLabelInputRef}
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      onKeyDown={handleNewLabelKeyDown}
                      placeholder="Search or create a tag..."
                      className={clsx(
                        "w-full rounded-full border px-4 py-2 text-sm focus:outline-none transition",
                        currentBackground
                          ? currentBackground.brightness === 'dark'
                            ? "bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40"
                            : "bg-black/5 border-black/10 text-zinc-900 placeholder-zinc-500 focus:border-black/20"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600"
                      )}
                      disabled={isCreatingLabel}
                    />
                    {isCreatingLabel && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className={clsx(
                          "h-4 w-4 animate-spin",
                          currentBackground
                            ? currentBackground.brightness === 'dark'
                              ? "text-white/50"
                              : "text-zinc-500"
                            : "text-zinc-400 dark:text-zinc-500"
                        )} />
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
                        className={clsx(
                          "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition disabled:opacity-50",
                          "bg-[var(--color-primary)] text-white hover:brightness-110"
                        )}
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
                            "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                            isSelected
                              ? "bg-[var(--color-primary)] text-white"
                              : currentBackground
                                ? currentBackground.brightness === 'dark'
                                  ? "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                                  : "bg-black/5 text-zinc-600 hover:bg-black/10 hover:text-zinc-900"
                                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                          )}
                          onClick={() => toggleLabelSelection(label.id)}
                        >
                          <span
                            className={clsx(
                              "h-2 w-2 rounded-full",
                              label.color === "default"
                                ? isSelected
                                  ? "bg-white/50"
                                  : currentBackground
                                    ? currentBackground.brightness === 'dark'
                                      ? "bg-white/50"
                                      : "bg-zinc-400"
                                    : "bg-zinc-400 dark:bg-zinc-500"
                                : `bg-${label.color}-500`,
                            )}
                          />
                          {label.name}
                        </button>
                      );
                    })
                  ) : newLabelName.trim() ? (
                    <p className={clsx(
                      "text-xs",
                      currentBackground
                        ? currentBackground.brightness === 'dark'
                          ? "text-white/50"
                          : "text-zinc-500"
                        : "text-zinc-400 dark:text-zinc-500"
                    )}>
                      No matching tags. Press Enter or click Create to add &quot;{newLabelName.trim()}&quot;.
                    </p>
                  ) : (
                    <p className={clsx(
                      "text-xs",
                      currentBackground
                        ? currentBackground.brightness === 'dark'
                          ? "text-white/50"
                          : "text-zinc-500"
                        : "text-zinc-400 dark:text-zinc-500"
                    )}>
                      No tags yet. Type above to create your first tag.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Hidden file input - inside modal to prevent click propagation issues */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          multiple
          onChange={(event) => handleFilesSelected(event.target.files)}
        />
      </div>

      {/* AI Enhance Style Menu */}
      {showEnhanceMenu && !isEnhancing && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/20"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setShowEnhanceMenu(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[85vw] sm:w-64 rounded-2xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
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
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setContextMenuPos(null)}
          />
          <div
            className="fixed z-[70] w-52 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden"
            style={{
              left: Math.min(contextMenuPos.x, window.innerWidth - 220),
              top: Math.min(contextMenuPos.y, window.innerHeight - 200),
            }}
            onMouseDown={(e) => e.stopPropagation()}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          await deleteNote(note.id);
          setShowDeleteConfirm(false);
          onClose();
        }}
        title="Delete this note?"
        description="This will move the note to the Trash. You can restore it from there within the next 30 days."
        confirmText="Delete note"
        cancelText="Keep note"
        variant="danger"
      />

      {/* Delete Checklist Item with Children Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteConfirmation}
        onClose={() => setDeleteConfirmation(null)}
        onConfirm={() => confirmDeleteWithChildren()}
        title="Delete item and sub-items?"
        description={`This will delete the item and ${deleteConfirmation?.childCount || 0} sub-item${(deleteConfirmation?.childCount || 0) === 1 ? '' : 's'}.`}
        confirmText="Delete all"
        cancelText="Cancel"
        variant="danger"
      />

      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        src={previewImage || ""}
      />
    </div>
  );

  return createPortal(content, document.body);
}
