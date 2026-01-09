"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  X,
  Palette,
  Tag,
  Loader2,
  Check,
  Trash2,
  Copy,
  GripVertical,
  ChevronDown,
  Plus,
  Calendar,
  Paperclip,
  Image as ImageIcon,
  Archive,
  ExternalLink,
  Layout,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import type {
  Project,
  ProjectDraft,
  ProjectAttachment,
  ProjectColor,
  ProjectPriority,
  ProjectStatus,
  ProjectType,
  ProjectTask,
} from "@/lib/types/project";
import { useProjects } from "@/components/providers/projects-provider";
import { PROJECT_COLORS } from "@/lib/constants/project-colors";
import { useLabels } from "@/components/providers/labels-provider";
import {
  ConfirmationDialog,
  generateUUID,
  PriorityIcon,
  type PriorityLevel,
} from "@ainexsuite/ui";

// Status configuration
const STATUS_CONFIG: Array<{
  id: ProjectStatus;
  label: string;
  bgClass: string;
  textClass: string;
}> = [
  {
    id: "planning",
    label: "Planning",
    bgClass: "bg-blue-100 dark:bg-blue-900/50",
    textClass: "text-blue-700 dark:text-blue-300",
  },
  {
    id: "active",
    label: "Active",
    bgClass: "bg-green-100 dark:bg-green-900/50",
    textClass: "text-green-700 dark:text-green-300",
  },
  {
    id: "on_hold",
    label: "On Hold",
    bgClass: "bg-amber-100 dark:bg-amber-900/50",
    textClass: "text-amber-700 dark:text-amber-300",
  },
  {
    id: "completed",
    label: "Completed",
    bgClass: "bg-zinc-100 dark:bg-zinc-800",
    textClass: "text-zinc-600 dark:text-zinc-400",
  },
  {
    id: "archived",
    label: "Archived",
    bgClass: "bg-zinc-100 dark:bg-zinc-800",
    textClass: "text-zinc-500 dark:text-zinc-500",
  },
];

// Project type configuration
const PROJECT_TYPE_CONFIG: Array<{
  id: ProjectType;
  label: string;
  emoji: string;
}> = [
  { id: "app", label: "App", emoji: "📱" },
  { id: "video", label: "Video", emoji: "🎬" },
  { id: "design", label: "Design", emoji: "🎨" },
  { id: "marketing", label: "Marketing", emoji: "📣" },
  { id: "research", label: "Research", emoji: "🔬" },
  { id: "other", label: "Other", emoji: "📁" },
];

// Auto-save hook
type SaveStatus = "idle" | "saving" | "saved" | "error";

type AutoSaveOptions<T> = {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
};

function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 1500,
  enabled = true,
}: AutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const dataRef = useRef(data);
  const lastSavedRef = useRef<string>(JSON.stringify(data));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const performSave = useCallback(async () => {
    if (isSavingRef.current) return;

    const currentData = dataRef.current;
    const currentJson = JSON.stringify(currentData);

    if (currentJson === lastSavedRef.current) {
      return;
    }

    isSavingRef.current = true;
    setStatus("saving");

    try {
      await onSave(currentData);
      lastSavedRef.current = currentJson;
      setStatus("saved");

      setTimeout(() => {
        setStatus((prev) => (prev === "saved" ? "idle" : prev));
      }, 1500);
    } catch (error) {
      setStatus("error");
      console.error("Auto-save failed:", error);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await performSave();
  }, [performSave]);

  useEffect(() => {
    if (!enabled) return;

    const currentJson = JSON.stringify(data);
    const hasChanges = currentJson !== lastSavedRef.current;

    if (!hasChanges) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      void performSave();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, debounceMs, performSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { status, flush };
}

// Attachment draft type
type AttachmentDraft = {
  id: string;
  file: File;
  preview: string;
};

type ProjectEditorProps = {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
};

// Sortable wrapper for task items with drag handle
type SortableTaskItemProps = {
  id: string;
  children: React.ReactNode;
  indentLevel: number;
};

function SortableTaskItem({ id, children, indentLevel }: SortableTaskItemProps) {
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
    paddingLeft: `${indentLevel * 24}px`,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2"
    >
      <button
        type="button"
        className="cursor-grab touch-none opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity flex-shrink-0"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4 text-zinc-400" />
      </button>
      {children}
    </div>
  );
}

export function ProjectEditor({ project, isOpen, onClose }: ProjectEditorProps) {
  const {
    updateProject,
    duplicateProject,
    togglePin,
    toggleArchive,
    removeAttachment,
    attachFiles,
    deleteProject,
  } = useProjects();
  const { labels, createLabel } = useLabels();

  // State for all editable fields
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [projectType, setProjectType] = useState<ProjectType>(project.type);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [color, setColor] = useState<ProjectColor>(project.color);
  const [pinned, setPinned] = useState(project.pinned);
  const [priority, setPriority] = useState<ProjectPriority>(project.priority ?? null);
  const [tasks, setTasks] = useState<ProjectTask[]>(project.tasks);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>(project.labelIds ?? []);
  const [startDate, setStartDate] = useState<string>(
    project.startDate ? formatDateForInput(project.startDate) : ""
  );
  const [dueDate, setDueDate] = useState<string>(
    project.dueDate ? formatDateForInput(project.dueDate) : ""
  );

  // UI state
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  // Attachments
  const [existingAttachments, setExistingAttachments] = useState<ProjectAttachment[]>(
    project.attachments
  );
  const [removedAttachments, setRemovedAttachments] = useState<ProjectAttachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<AttachmentDraft[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Refs
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const taskInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingTaskFocusId = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newLabelInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Get current color config
  const currentColorConfig = useMemo(() => {
    return PROJECT_COLORS.find((c) => c.id === color) || PROJECT_COLORS[0];
  }, [color]);

  // Calculate task progress
  const taskProgress = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [tasks]);

  // Auto-save data
  const autoSaveData = useMemo(
    () => ({
      title: title.trim(),
      description: description.trim(),
      type: projectType,
      status,
      color,
      labelIds: selectedLabelIds,
      tasks,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
    }),
    [title, description, projectType, status, color, selectedLabelIds, tasks, startDate, dueDate]
  );

  // Auto-save callback
  const handleAutoSave = useCallback(
    async (data: typeof autoSaveData) => {
      const updates: ProjectDraft = {};

      if (data.title !== project.title) updates.title = data.title;
      if (data.description !== project.description) updates.description = data.description;
      if (data.type !== project.type) updates.type = data.type;
      if (data.status !== project.status) updates.status = data.status;
      if (data.color !== project.color) updates.color = data.color;
      if (JSON.stringify(data.labelIds) !== JSON.stringify(project.labelIds ?? [])) {
        updates.labelIds = data.labelIds;
      }
      if (JSON.stringify(data.tasks) !== JSON.stringify(project.tasks)) {
        updates.tasks = data.tasks;
      }

      // Handle dates
      const projectStartDate = project.startDate ? formatDateForInput(project.startDate) : "";
      const projectDueDate = project.dueDate ? formatDateForInput(project.dueDate) : "";
      const newStartDate = data.startDate ? formatDateForInput(data.startDate) : "";
      const newDueDate = data.dueDate ? formatDateForInput(data.dueDate) : "";

      if (newStartDate !== projectStartDate) updates.startDate = data.startDate;
      if (newDueDate !== projectDueDate) updates.dueDate = data.dueDate;

      if (Object.keys(updates).length > 0) {
        await updateProject(project.id, updates);
      }
    },
    [project, updateProject]
  );

  // Use auto-save hook
  const { status: saveStatus, flush: flushSave } = useAutoSave({
    data: autoSaveData,
    onSave: handleAutoSave,
    enabled: true,
    debounceMs: 1500,
  });

  // Auto-resize description textarea
  useEffect(() => {
    const textarea = descriptionRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [description]);

  // Focus pending task input
  useEffect(() => {
    if (!pendingTaskFocusId.current) return;

    const target = taskInputRefs.current[pendingTaskFocusId.current];
    if (target) {
      target.focus();
      pendingTaskFocusId.current = null;
    }
  }, [tasks]);

  // Cleanup attachment previews
  useEffect(
    () => () => {
      newAttachments.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [newAttachments]
  );

  // Handle close with save
  const handleFinalizeAndClose = useCallback(async () => {
    await flushSave();

    // Handle pin changes
    if (pinned !== project.pinned) {
      await togglePin(project.id, pinned);
    }

    // Handle priority changes
    if (priority !== (project.priority ?? null)) {
      await updateProject(project.id, { priority });
    }

    // Handle attachments
    if (removedAttachments.length > 0) {
      await Promise.all(
        removedAttachments.map((attachment) => removeAttachment(project.id, attachment))
      );
    }

    if (newAttachments.length > 0) {
      await attachFiles(
        project.id,
        newAttachments.map((attachment) => attachment.file)
      );
    }

    onClose();
  }, [
    flushSave,
    pinned,
    project.pinned,
    project.id,
    project.priority,
    priority,
    removedAttachments,
    newAttachments,
    togglePin,
    updateProject,
    removeAttachment,
    attachFiles,
    onClose,
  ]);

  // Keyboard shortcuts
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

  // Task management
  const taskTemplate = (): ProjectTask => ({
    id: generateUUID(),
    text: "",
    completed: false,
    indent: 0,
  });

  const handleAddTask = (afterIndex?: number, inheritIndent?: number) => {
    const newTask = {
      ...taskTemplate(),
      indent: inheritIndent ?? 0,
    };
    pendingTaskFocusId.current = newTask.id;
    if (afterIndex !== undefined) {
      setTasks((prev) => [
        ...prev.slice(0, afterIndex + 1),
        newTask,
        ...prev.slice(afterIndex + 1),
      ]);
    } else {
      setTasks((prev) => [...prev, newTask]);
    }
  };

  const handleTaskChange = (taskId: string, next: Partial<ProjectTask>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...next } : task))
    );
  };

  const handleIndentChange = (taskId: string, delta: number) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const currentIndent = task.indent ?? 0;
          const newIndent = Math.max(0, Math.min(3, currentIndent + delta));
          return { ...task, indent: newIndent };
        }
        return task;
      })
    );
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTaskDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Attachment management
  const handleFilesSelected = (files: FileList | null) => {
    if (!files?.length) return;

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

  const handleRemoveExistingAttachment = (attachment: ProjectAttachment) => {
    setExistingAttachments((prev) => prev.filter((item) => item.id !== attachment.id));
    setRemovedAttachments((prev) => [...prev, attachment]);
  };

  const handleRemoveNewAttachment = (attachmentId: string) => {
    setNewAttachments((prev) => {
      prev
        .filter((item) => item.id === attachmentId)
        .forEach((item) => URL.revokeObjectURL(item.preview));
      return prev.filter((item) => item.id !== attachmentId);
    });
  };

  // Label management
  const toggleLabelSelection = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const handleCreateNewLabel = useCallback(async () => {
    const name = newLabelName.trim();
    if (!name || isCreatingLabel) return;

    const existingLabel = labels.find(
      (label) => label.name.toLowerCase() === name.toLowerCase()
    );
    if (existingLabel) {
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

  // Filter labels based on search
  const filteredLabels = useMemo(() => {
    if (!newLabelName.trim()) return labels;
    const searchTerm = newLabelName.toLowerCase();
    return labels.filter((label) => label.name.toLowerCase().includes(searchTerm));
  }, [labels, newLabelName]);

  // Handle duplicate
  const handleDuplicate = async () => {
    const newProjectId = await duplicateProject(project.id);
    if (newProjectId) {
      onClose();
    }
  };

  // Handle archive
  const handleArchive = async () => {
    await toggleArchive(project.id, !project.archived);
    onClose();
  };

  // Handle delete
  const handleDelete = async () => {
    await deleteProject(project.id);
    onClose();
  };

  // Format helpers
  function formatDateForInput(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  // Get status config
  const currentStatusConfig = STATUS_CONFIG.find((s) => s.id === status) || STATUS_CONFIG[0];

  // Get type config
  const currentTypeConfig =
    PROJECT_TYPE_CONFIG.find((t) => t.id === projectType) || PROJECT_TYPE_CONFIG[5];

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 lg:p-8"
      onMouseDown={() => void handleFinalizeAndClose()}
    >
      <div
        ref={editorContainerRef}
        onMouseDown={(e) => e.stopPropagation()}
        className={clsx(
          "relative w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] xl:w-[75vw] max-w-5xl min-h-[500px] max-h-[90vh] sm:max-h-[88vh] md:max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden",
          currentColorConfig.cardClass,
          "border-zinc-200 dark:border-zinc-800"
        )}
      >
        {/* Header */}
        <div
          className={clsx(
            "relative z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl border-b flex-shrink-0",
            "bg-zinc-50/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700/50"
          )}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Icon/Emoji */}
            {project.icon && (
              <span className="text-2xl flex-shrink-0">{project.icon}</span>
            )}
            {/* Title Input */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project Title"
              className={clsx(
                "w-full bg-transparent text-xl font-semibold focus:outline-none",
                "text-zinc-900 dark:text-zinc-100",
                "placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              )}
            />
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Pin Button */}
            <div className="flex items-center px-1.5 py-1 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
              <button
                type="button"
                onClick={() => setPinned((prev) => !prev)}
                className={clsx(
                  "h-7 w-7 rounded-full flex items-center justify-center transition",
                  pinned
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
                aria-label={pinned ? "Remove from Focus" : "Add to Focus"}
              >
                <FocusIcon focused={pinned} className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Priority Picker */}
            <div className="relative">
              <div className="flex items-center px-1.5 py-1 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
                <button
                  type="button"
                  onClick={() => setShowPriorityPicker((prev) => !prev)}
                  className={clsx(
                    "h-7 w-7 rounded-full flex items-center justify-center transition",
                    priority === "high"
                      ? "bg-red-500/20"
                      : priority === "medium"
                        ? "bg-amber-500/20"
                        : priority === "low"
                          ? "bg-green-500/20"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                  aria-label="Set priority"
                >
                  <PriorityIcon
                    priority={(priority as PriorityLevel) || "none"}
                    size="sm"
                    showOnlyHighPriority={false}
                  />
                </button>
              </div>
              {showPriorityPicker && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPriorityPicker(false)}
                  />
                  <div className="absolute top-10 right-0 z-50 flex flex-col gap-1 rounded-xl bg-zinc-900/95 border border-white/10 p-2 shadow-2xl backdrop-blur-xl min-w-[140px]">
                    {(["high", "medium", "low"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPriority(p);
                          setShowPriorityPicker(false);
                        }}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                          priority === p
                            ? p === "high"
                              ? "bg-red-500/20 text-red-400"
                              : p === "medium"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-green-500/20 text-green-400"
                            : "text-zinc-300 hover:bg-white/10"
                        )}
                      >
                        <PriorityIcon priority={p} size="sm" showOnlyHighPriority={false} />
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                    {priority && (
                      <>
                        <div className="h-px bg-white/10 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setPriority(null);
                            setShowPriorityPicker(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-white/10 transition"
                        >
                          <X className="h-4 w-4" />
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Save Status, Actions, Close */}
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
              {saveStatus !== "idle" && (
                <div className="flex items-center justify-center w-7 h-7">
                  {saveStatus === "saving" && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                  )}
                  {saveStatus === "saved" && <Check className="h-3.5 w-3.5 text-green-500" />}
                </div>
              )}
              <button
                type="button"
                onClick={handleDuplicate}
                className="h-7 w-7 rounded-full flex items-center justify-center transition text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label="Duplicate project"
                title="Duplicate project"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleArchive}
                className="h-7 w-7 rounded-full flex items-center justify-center transition text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label={project.archived ? "Unarchive project" : "Archive project"}
                title={project.archived ? "Unarchive project" : "Archive project"}
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="h-7 w-7 rounded-full flex items-center justify-center transition text-red-400 hover:bg-red-500/10 hover:text-red-500"
                aria-label="Delete project"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="w-px h-4 bg-zinc-300/60 dark:bg-zinc-600/60" />
              <button
                type="button"
                onClick={() => void handleFinalizeAndClose()}
                className="h-7 w-7 rounded-full flex items-center justify-center transition text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 py-5 space-y-6">
            {/* Status, Type, Dates Row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusPicker((prev) => !prev)}
                  className={clsx(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition",
                    currentStatusConfig.bgClass,
                    currentStatusConfig.textClass
                  )}
                >
                  {currentStatusConfig.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showStatusPicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowStatusPicker(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 z-50 flex flex-col gap-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 shadow-xl min-w-[140px]">
                      {STATUS_CONFIG.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setStatus(s.id);
                            setShowStatusPicker(false);
                          }}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                            status === s.id
                              ? clsx(s.bgClass, s.textClass)
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Type Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTypePicker((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  <span>{currentTypeConfig.emoji}</span>
                  {currentTypeConfig.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showTypePicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowTypePicker(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 z-50 flex flex-col gap-1 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-2 shadow-xl min-w-[140px]">
                      {PROJECT_TYPE_CONFIG.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setProjectType(t.id);
                            setShowTypePicker(false);
                          }}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                            projectType === t.id
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          <span>{t.emoji}</span>
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-400 focus:outline-none"
                    placeholder="Start"
                  />
                </div>
                <span className="text-zinc-400">-</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent text-xs font-medium text-zinc-600 dark:text-zinc-400 focus:outline-none"
                    placeholder="Due"
                  />
                </div>
              </div>

              {/* Whiteboard Link */}
              {project.whiteboardId ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
                >
                  <Layout className="h-3.5 w-3.5" />
                  Open Whiteboard
                  <ExternalLink className="h-3 w-3" />
                </button>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition border border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
                >
                  <Layout className="h-3.5 w-3.5" />
                  Create Whiteboard
                </button>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2 block">
                Description
              </label>
              <textarea
                ref={descriptionRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className={clsx(
                  "w-full min-h-[120px] resize-none bg-transparent text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed focus:outline-none",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                )}
              />
            </div>

            {/* Labels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Labels
                </label>
                <button
                  type="button"
                  onClick={() => setShowLabelPicker((prev) => !prev)}
                  className="text-xs text-[var(--color-primary)] hover:underline"
                >
                  {showLabelPicker ? "Done" : "Manage"}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedLabelIds.map((labelId) => {
                  const label = labels.find((l) => l.id === labelId);
                  if (!label) return null;
                  const labelColor = PROJECT_COLORS.find((c) => c.id === label.color);
                  return (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    >
                      <span
                        className={clsx(
                          "h-2 w-2 rounded-full",
                          labelColor?.swatchClass || "bg-zinc-400"
                        )}
                      />
                      {label.name}
                      <button
                        type="button"
                        onClick={() => toggleLabelSelection(label.id)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
                {selectedLabelIds.length === 0 && !showLabelPicker && (
                  <span className="text-xs text-zinc-400">No labels</span>
                )}
              </div>
              {showLabelPicker && (
                <div className="mt-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                  <input
                    ref={newLabelInputRef}
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={handleNewLabelKeyDown}
                    placeholder="Search or create label..."
                    className="w-full px-3 py-2 mb-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredLabels.map((label) => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabelSelection(label.id)}
                        className={clsx(
                          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition text-left",
                          selectedLabelIds.includes(label.id)
                            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        )}
                      >
                        <span
                          className={clsx(
                            "h-2.5 w-2.5 rounded-full",
                            PROJECT_COLORS.find((c) => c.id === label.color)?.swatchClass ||
                              "bg-zinc-400"
                          )}
                        />
                        {label.name}
                        {selectedLabelIds.includes(label.id) && (
                          <Check className="h-4 w-4 ml-auto" />
                        )}
                      </button>
                    ))}
                    {newLabelName.trim() &&
                      !labels.some(
                        (l) => l.name.toLowerCase() === newLabelName.trim().toLowerCase()
                      ) && (
                        <button
                          type="button"
                          onClick={() => void handleCreateNewLabel()}
                          disabled={isCreatingLabel}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition"
                        >
                          <Plus className="h-4 w-4" />
                          Create &ldquo;{newLabelName.trim()}&rdquo;
                          {isCreatingLabel && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
                        </button>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Tasks Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Tasks
                </label>
                {taskProgress.total > 0 && (
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {taskProgress.completed}/{taskProgress.total} ({taskProgress.percent}%)
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {taskProgress.total > 0 && (
                <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 mb-4 overflow-hidden">
                  <div
                    className={clsx(
                      "h-full transition-all duration-300",
                      taskProgress.percent === 100
                        ? "bg-green-500"
                        : "bg-[var(--color-primary)]"
                    )}
                    style={{ width: `${taskProgress.percent}%` }}
                  />
                </div>
              )}

              {/* Task List */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleTaskDragEnd}
              >
                <SortableContext
                  items={tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {tasks.map((task, idx) => {
                      const indentLevel = task.indent ?? 0;
                      return (
                        <SortableTaskItem
                          key={task.id}
                          id={task.id}
                          indentLevel={indentLevel}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={(e) =>
                              handleTaskChange(task.id, { completed: e.target.checked })
                            }
                            className="h-4 w-4 accent-[var(--color-primary)] flex-shrink-0 rounded"
                          />
                          <input
                            value={task.text}
                            onChange={(e) =>
                              handleTaskChange(task.id, { text: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Tab" && !e.shiftKey) {
                                e.preventDefault();
                                handleIndentChange(task.id, 1);
                                return;
                              }
                              if (e.key === "Tab" && e.shiftKey) {
                                e.preventDefault();
                                handleIndentChange(task.id, -1);
                                return;
                              }
                              if (e.key === "ArrowUp" && e.altKey && idx > 0) {
                                e.preventDefault();
                                setTasks((prev) => {
                                  const newList = [...prev];
                                  [newList[idx - 1], newList[idx]] = [
                                    newList[idx],
                                    newList[idx - 1],
                                  ];
                                  return newList;
                                });
                                setTimeout(() => taskInputRefs.current[task.id]?.focus(), 0);
                                return;
                              }
                              if (e.key === "ArrowDown" && e.altKey && idx < tasks.length - 1) {
                                e.preventDefault();
                                setTasks((prev) => {
                                  const newList = [...prev];
                                  [newList[idx], newList[idx + 1]] = [
                                    newList[idx + 1],
                                    newList[idx],
                                  ];
                                  return newList;
                                });
                                setTimeout(() => taskInputRefs.current[task.id]?.focus(), 0);
                                return;
                              }
                              if (e.key === "ArrowUp" && !e.altKey && idx > 0) {
                                e.preventDefault();
                                const prevTask = tasks[idx - 1];
                                taskInputRefs.current[prevTask.id]?.focus();
                                return;
                              }
                              if (e.key === "ArrowDown" && !e.altKey && idx < tasks.length - 1) {
                                e.preventDefault();
                                const nextTask = tasks[idx + 1];
                                taskInputRefs.current[nextTask.id]?.focus();
                                return;
                              }
                              if (
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                !e.nativeEvent.isComposing
                              ) {
                                e.preventDefault();
                                handleAddTask(idx, indentLevel);
                              }
                              if (e.key === "Backspace" && task.text === "") {
                                e.preventDefault();
                                if (indentLevel > 0) {
                                  handleIndentChange(task.id, -1);
                                } else if (tasks.length > 1) {
                                  const prevTask = tasks[idx - 1];
                                  if (prevTask) {
                                    taskInputRefs.current[prevTask.id]?.focus();
                                  }
                                  setTasks((prev) =>
                                    prev.filter((t) => t.id !== task.id)
                                  );
                                }
                              }
                            }}
                            placeholder="Add a task..."
                            ref={(el) => {
                              if (el) {
                                taskInputRefs.current[task.id] = el;
                              } else {
                                delete taskInputRefs.current[task.id];
                              }
                            }}
                            className={clsx(
                              "flex-1 bg-transparent text-sm focus:outline-none transition",
                              task.completed
                                ? "text-zinc-400 line-through"
                                : "text-zinc-700 dark:text-zinc-300",
                              "placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                            )}
                          />
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 transition p-1"
                            onClick={() =>
                              setTasks((prev) => prev.filter((t) => t.id !== task.id))
                            }
                            aria-label="Remove task"
                          >
                            <X className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                          </button>
                        </SortableTaskItem>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add Task Button */}
              <button
                type="button"
                onClick={() => handleAddTask()}
                className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add task
              </button>

              {/* Keyboard Hints */}
              <p className="mt-2 text-[10px] text-zinc-400 dark:text-zinc-500">
                Tab/Shift+Tab to indent, Enter to add, Backspace to delete empty, Arrow keys to
                navigate
              </p>
            </div>

            {/* Attachments */}
            {(existingAttachments.length > 0 || newAttachments.length > 0) && (
              <div>
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3 block">
                  Attachments ({existingAttachments.length + newAttachments.length})
                </label>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  {existingAttachments.map((attachment) => (
                    <figure
                      key={attachment.id}
                      className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:brightness-95 transition-all group/att"
                      onClick={() => setPreviewImage(attachment.downloadURL)}
                    >
                      <img
                        src={attachment.downloadURL}
                        alt={attachment.name}
                        className="h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveExistingAttachment(attachment);
                        }}
                        aria-label="Remove attachment"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </figure>
                  ))}
                  {newAttachments.map((attachment) => (
                    <figure
                      key={attachment.id}
                      className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:brightness-95 transition-all group/att"
                      onClick={() => setPreviewImage(attachment.preview)}
                    >
                      <img
                        src={attachment.preview}
                        alt={attachment.file.name}
                        className="h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition-opacity hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNewAttachment(attachment.id);
                        }}
                        aria-label="Remove attachment"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white text-[10px] font-medium">
                        Pending upload
                      </div>
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Toolbar */}
        <div
          className={clsx(
            "relative z-10 flex-shrink-0 mt-auto rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t",
            currentColorConfig.footerClass,
            "border-zinc-200 dark:border-zinc-700/50"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Tools */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
              {/* Color Palette */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPalette((prev) => !prev)}
                  className={clsx(
                    "h-7 w-7 rounded-full flex items-center justify-center transition",
                    showPalette
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  )}
                  aria-label="Change color"
                >
                  <Palette className="h-3.5 w-3.5" />
                </button>
                {showPalette && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPalette(false);
                      }}
                    />
                    <div
                      className="absolute bottom-12 left-1/2 z-30 flex flex-row flex-nowrap items-center -translate-x-1/2 gap-2 rounded-2xl p-3 shadow-2xl backdrop-blur-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {PROJECT_COLORS.map((option) => (
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
                            option.id === color && "ring-2 ring-[var(--color-primary)]"
                          )}
                          aria-label={`Set color ${option.label}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Add Attachments */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 w-7 rounded-full flex items-center justify-center transition text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                aria-label="Add attachments"
              >
                <ImageIcon className="h-3.5 w-3.5" />
              </button>

              {/* Labels */}
              <button
                type="button"
                onClick={() => setShowLabelPicker((prev) => !prev)}
                className={clsx(
                  "h-7 w-7 rounded-full flex items-center justify-center transition",
                  showLabelPicker
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                )}
                aria-label="Manage labels"
              >
                <Tag className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right Info */}
            <div className="flex items-center gap-3 text-[10px] text-zinc-400 dark:text-zinc-500">
              {existingAttachments.length + newAttachments.length > 0 && (
                <span className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {existingAttachments.length + newAttachments.length}
                </span>
              )}
              <span>
                Updated{" "}
                {project.updatedAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year:
                    project.updatedAt.getFullYear() !== new Date().getFullYear()
                      ? "numeric"
                      : undefined,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action can be undone from the trash."
        confirmText="Delete"
        variant="danger"
      />

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-zinc-800 shadow-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
}
