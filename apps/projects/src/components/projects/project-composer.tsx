"use client";

/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  CheckSquare,
  CalendarClock,
  Palette,
  Plus,
  Tag,
  X,
  Flame,
  Calendar,
  ListTodo,
  Code,
  Video,
  Paintbrush,
  Megaphone,
  Search,
  MoreHorizontal,
  ChevronDown,
  Paperclip,
  Clock,
  Play,
} from "lucide-react";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import { useProjects } from "@/components/providers/projects-provider";
import type {
  ProjectTask,
  ProjectColor,
  ProjectPriority,
  ProjectType,
  ProjectStatus,
} from "@/lib/types/project";
import { PROJECT_COLORS } from "@/lib/constants/project-colors";
import { useLabels } from "@/components/providers/labels-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { generateUUID } from "@ainexsuite/ui";

type AttachmentDraft = {
  id: string;
  file: File;
  preview: string;
};

const taskTemplate = (): ProjectTask => ({
  id: generateUUID(),
  text: "",
  completed: false,
  indent: 0,
});

// Contextual placeholder examples for task items
const getTaskPlaceholder = (index: number): string => {
  const examples = [
    "Add task...",
    "e.g., Set up project structure",
    "e.g., Create wireframes",
    "e.g., Write documentation",
    "e.g., Review pull request",
    "e.g., Deploy to staging",
  ];
  return examples[index % examples.length];
};

// Quick templates for new projects
type ProjectTemplate = {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: ProjectType;
  title?: string;
  tasks?: ProjectTask[];
};

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "blank",
    label: "Blank",
    icon: <ListTodo className="h-3.5 w-3.5" />,
    type: "other",
  },
  {
    id: "app",
    label: "App",
    icon: <Code className="h-3.5 w-3.5" />,
    type: "app",
    title: "",
    tasks: [{ id: generateUUID(), text: "", completed: false, indent: 0 }],
  },
  {
    id: "video",
    label: "Video",
    icon: <Video className="h-3.5 w-3.5" />,
    type: "video",
    title: "",
    tasks: [{ id: generateUUID(), text: "", completed: false, indent: 0 }],
  },
  {
    id: "design",
    label: "Design",
    icon: <Paintbrush className="h-3.5 w-3.5" />,
    type: "design",
    title: "",
    tasks: [{ id: generateUUID(), text: "", completed: false, indent: 0 }],
  },
];

// Project type options
const PROJECT_TYPES: { id: ProjectType; label: string; icon: React.ReactNode }[] = [
  { id: "app", label: "App", icon: <Code className="h-4 w-4" /> },
  { id: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
  { id: "design", label: "Design", icon: <Paintbrush className="h-4 w-4" /> },
  { id: "marketing", label: "Marketing", icon: <Megaphone className="h-4 w-4" /> },
  { id: "research", label: "Research", icon: <Search className="h-4 w-4" /> },
  { id: "other", label: "Other", icon: <MoreHorizontal className="h-4 w-4" /> },
];

// Project status options
const PROJECT_STATUSES: { id: ProjectStatus; label: string; color: string }[] = [
  { id: "planning", label: "Planning", color: "bg-slate-500" },
  { id: "active", label: "Active", color: "bg-green-500" },
  { id: "on_hold", label: "On Hold", color: "bg-amber-500" },
];

// Priority options
const PRIORITY_OPTIONS: { id: ProjectPriority; label: string; color: string }[] = [
  { id: "high", label: "High", color: "text-red-500 bg-red-500/10" },
  { id: "medium", label: "Medium", color: "text-amber-500 bg-amber-500/10" },
  { id: "low", label: "Low", color: "text-blue-500 bg-blue-500/10" },
];

interface ProjectComposerProps {
  placeholder?: string;
}

export function ProjectComposer({ placeholder = "Add new project..." }: ProjectComposerProps) {
  const { createProject, updateProject, deleteProject } = useProjects();
  const { currentSpaceId } = useSpaces();
  const { labels, createLabel } = useLabels();

  // Core state
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState<ProjectType>("other");
  const [status, setStatus] = useState<ProjectStatus>("planning");
  const [color, setColor] = useState<ProjectColor>("default");
  const [pinned, setPinned] = useState(false);
  const [priority, setPriority] = useState<ProjectPriority>(null);

  // Date fields
  const [startDate, setStartDate] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  // Tasks (checklist)
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [showTaskList, setShowTaskList] = useState(false);

  // Labels
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  // Attachments
  const [attachments, setAttachments] = useState<AttachmentDraft[]>([]);

  // UI state
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-create: track created project ID for auto-save
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const isCreatingRef = useRef(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newLabelInputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const taskInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const pendingTaskFocusId = useRef<string | null>(null);

  // Cleanup attachment previews on unmount
  useEffect(
    () => () => {
      attachments.forEach((item) => URL.revokeObjectURL(item.preview));
    },
    [attachments]
  );

  // Focus newly added task input
  useEffect(() => {
    if (!pendingTaskFocusId.current) {
      return;
    }

    const target = taskInputRefs.current[pendingTaskFocusId.current];
    if (target) {
      target.focus();
      pendingTaskFocusId.current = null;
    }
  }, [tasks]);

  // Apply a template to the composer
  const applyTemplate = useCallback((template: ProjectTemplate) => {
    setProjectType(template.type);
    if (template.title !== undefined) {
      setTitle(template.title);
    }
    if (template.tasks) {
      // Generate fresh IDs for task items
      setTasks(
        template.tasks.map((item) => ({
          ...item,
          id: generateUUID(),
        }))
      );
      setShowTaskList(true);
    } else {
      setTasks([]);
      setShowTaskList(false);
    }
    setExpanded(true);
    // Focus the title input after a short delay
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  }, []);

  // Check if there's meaningful content
  const hasContent = useMemo(() => {
    if (title.trim() || description.trim() || attachments.length) {
      return true;
    }

    if (showTaskList) {
      return tasks.some((item) => item.text.trim());
    }

    return false;
  }, [title, description, attachments, tasks, showTaskList]);

  // Reset all state
  const resetState = useCallback(() => {
    setExpanded(false);
    setTitle("");
    setDescription("");
    setProjectType("other");
    setStatus("planning");
    setColor("default");
    setPinned(false);
    setPriority(null);
    setStartDate("");
    setDueDate("");
    setTasks([]);
    setShowTaskList(false);
    setSelectedLabelIds([]);
    setAttachments((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.preview));
      return [];
    });
    setShowPriorityPicker(false);
    setShowPalette(false);
    setShowLabelPicker(false);
    setShowTypePicker(false);
    setShowStatusPicker(false);
    setShowDatePicker(false);
    setNewLabelName("");
    setIsCreatingLabel(false);
    setCreatedProjectId(null);
    isCreatingRef.current = false;
  }, []);

  // Auto-create project on first content
  useEffect(() => {
    if (!expanded || createdProjectId || isCreatingRef.current) return;

    // Check if there's text content (not just attachments for initial create)
    const hasTextContent =
      title.trim() ||
      description.trim() ||
      (showTaskList && tasks.some((item) => item.text.trim()));

    if (!hasTextContent) return;

    const createDraftProject = async () => {
      isCreatingRef.current = true;
      try {
        const projectId = await createProject({
          title: title.trim(),
          description: description.trim(),
          type: projectType,
          status: "planning",
          color,
          pinned: false,
          priority: null,
          labelIds: [],
          tasks: showTaskList ? tasks : [],
          spaceId: currentSpaceId ?? "personal",
        });
        if (projectId) {
          setCreatedProjectId(projectId);
        }
      } catch (error) {
        console.error("[ProjectComposer] Failed to auto-create project:", error);
      } finally {
        isCreatingRef.current = false;
      }
    };

    void createDraftProject();
  }, [
    expanded,
    createdProjectId,
    title,
    description,
    projectType,
    color,
    tasks,
    showTaskList,
    currentSpaceId,
    createProject,
  ]);

  // Auto-save changes to created project (debounced)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!createdProjectId) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounced save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateProject(createdProjectId, {
          title: title.trim(),
          description: description.trim(),
          type: projectType,
          status,
          color,
          labelIds: selectedLabelIds,
          tasks: showTaskList ? tasks : [],
          startDate: startDate ? new Date(startDate) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
        });
      } catch (error) {
        console.error("[ProjectComposer] Auto-save failed:", error);
      }
    }, 1500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [
    createdProjectId,
    title,
    description,
    projectType,
    status,
    color,
    selectedLabelIds,
    tasks,
    showTaskList,
    startDate,
    dueDate,
    updateProject,
  ]);

  // Handle close: finalize project or delete if empty
  const handleClose = useCallback(async () => {
    if (isSubmitting) return;

    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // If no project was created and no content, just close
    if (!createdProjectId && !hasContent) {
      resetState();
      return;
    }

    // If project was created but now empty, delete it
    if (createdProjectId && !hasContent) {
      try {
        await deleteProject(createdProjectId);
      } catch (error) {
        console.error("[ProjectComposer] Failed to delete empty project:", error);
      }
      resetState();
      return;
    }

    // If no project was created yet but there's content, create it now
    let projectId = createdProjectId;
    if (!projectId && hasContent) {
      setIsSubmitting(true);
      try {
        projectId = await createProject({
          title: title.trim(),
          description: description.trim(),
          type: projectType,
          status,
          color,
          pinned: false,
          priority: null,
          labelIds: selectedLabelIds,
          tasks: showTaskList ? tasks : [],
          startDate: startDate ? new Date(startDate) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          spaceId: currentSpaceId ?? "personal",
        });
      } catch (error) {
        console.error("[ProjectComposer] Failed to create project on close:", error);
        setIsSubmitting(false);
        return;
      }
    }

    if (!projectId) {
      resetState();
      return;
    }

    try {
      setIsSubmitting(true);

      // Finalize: handle pin, priority, etc.
      const updates: Record<string, unknown> = {};

      if (pinned) updates.pinned = true;
      if (priority) updates.priority = priority;

      // Save any final state (in case auto-save didn't catch it)
      updates.title = title.trim();
      updates.description = description.trim();
      updates.type = projectType;
      updates.status = status;
      updates.color = color;
      updates.labelIds = selectedLabelIds;
      updates.tasks = showTaskList ? tasks : [];
      updates.startDate = startDate ? new Date(startDate) : null;
      updates.dueDate = dueDate ? new Date(dueDate) : null;

      if (Object.keys(updates).length > 0) {
        await updateProject(projectId, updates);
      }
    } finally {
      setIsSubmitting(false);
      resetState();
    }
  }, [
    isSubmitting,
    createdProjectId,
    hasContent,
    resetState,
    deleteProject,
    createProject,
    title,
    description,
    projectType,
    status,
    color,
    selectedLabelIds,
    tasks,
    showTaskList,
    startDate,
    dueDate,
    currentSpaceId,
    pinned,
    priority,
    updateProject,
  ]);

  // Task handlers
  const handleTaskChange = (itemId: string, next: Partial<ProjectTask>) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              ...next,
            }
          : item
      )
    );
  };

  const handleAddTask = (afterIndex?: number, inheritIndent?: number) => {
    const newItem = {
      ...taskTemplate(),
      indent: inheritIndent ?? 0,
    };
    pendingTaskFocusId.current = newItem.id;
    if (afterIndex !== undefined) {
      setTasks((prev) => [
        ...prev.slice(0, afterIndex + 1),
        newItem,
        ...prev.slice(afterIndex + 1),
      ]);
    } else {
      setTasks((prev) => [...prev, newItem]);
    }
  };

  const handleIndentChange = (itemId: string, delta: number) => {
    setTasks((prev) =>
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

  const handleRemoveTask = (itemId: string) => {
    setTasks((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Attachment handlers
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

  // Label handlers
  const toggleLabelSelection = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
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
      console.error("[ProjectComposer] Failed to create label:", error);
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
    return labels.filter((label) => label.name.toLowerCase().includes(searchTerm));
  }, [labels, newLabelName]);

  // Close all pickers
  const closeAllPickers = useCallback(() => {
    setShowPriorityPicker(false);
    setShowPalette(false);
    setShowLabelPicker(false);
    setShowTypePicker(false);
    setShowStatusPicker(false);
    setShowDatePicker(false);
  }, []);

  // Get color config
  const colorConfig = PROJECT_COLORS.find((c) => c.id === color) || PROJECT_COLORS[0];
  const backgroundClass = colorConfig.cardClass;

  // Click outside handler
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

  // Get type icon
  const getTypeIcon = (type: ProjectType) => {
    const typeConfig = PROJECT_TYPES.find((t) => t.id === type);
    return typeConfig?.icon || <MoreHorizontal className="h-4 w-4" />;
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <section className="w-full">
      {!expanded ? (
        <div className="flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
          <button
            type="button"
            className="flex-1 min-w-0 text-left text-sm text-zinc-400 dark:text-zinc-500 focus-visible:outline-none"
            onClick={() => applyTemplate(PROJECT_TEMPLATES[0])}
          >
            <span>{placeholder}</span>
          </button>
          {/* Quick template buttons */}
          <div className="flex items-center gap-1">
            {PROJECT_TEMPLATES.slice(1).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => applyTemplate(template)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
                title={template.label}
              >
                {template.icon}
                <span className="hidden sm:inline">{template.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={composerRef}
          className={clsx(
            "w-full rounded-2xl shadow-lg border transition-all",
            backgroundClass,
            "border-zinc-200 dark:border-zinc-800"
          )}
        >
          <div className="flex flex-col gap-3 px-5 py-4">
            {/* Header: Title + Quick Actions */}
            <div className="flex items-start gap-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Project title..."
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
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
                    closeAllPickers();
                    setShowPriorityPicker((prev) => !prev);
                  }}
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    priority === "high"
                      ? "text-red-500 bg-red-500/10"
                      : priority === "medium"
                        ? "text-amber-500 bg-amber-500/10"
                        : priority === "low"
                          ? "text-blue-500 bg-blue-500/10"
                          : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  aria-label="Set priority"
                >
                  <Flame className="h-5 w-5" />
                </button>
                {showPriorityPicker && (
                  <div className="absolute top-12 right-0 z-30 flex flex-col gap-1 rounded-xl bg-white dark:bg-zinc-900 p-2 shadow-lg border border-zinc-200 dark:border-zinc-700 min-w-[140px]">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setPriority(opt.id);
                          setShowPriorityPicker(false);
                        }}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                          priority === opt.id
                            ? opt.color
                            : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <Flame
                          className={clsx(
                            "h-4 w-4",
                            opt.id === "high" && "text-red-500",
                            opt.id === "medium" && "text-amber-500",
                            opt.id === "low" && "text-blue-500"
                          )}
                        />
                        {opt.label}
                      </button>
                    ))}
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

            {/* Description */}
            <textarea
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full bg-transparent text-sm focus:outline-none text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none"
            />

            {/* Meta row: Type + Status + Dates */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeAllPickers();
                    setShowTypePicker((prev) => !prev);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                >
                  {getTypeIcon(projectType)}
                  <span className="capitalize">{projectType}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
                {showTypePicker && (
                  <div className="absolute top-10 left-0 z-30 flex flex-col gap-1 rounded-xl bg-white dark:bg-zinc-900 p-2 shadow-lg border border-zinc-200 dark:border-zinc-700 min-w-[150px]">
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => {
                          setProjectType(type.id);
                          setShowTypePicker(false);
                        }}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition",
                          projectType === type.id
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        {type.icon}
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeAllPickers();
                    setShowStatusPicker((prev) => !prev);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                >
                  <span
                    className={clsx(
                      "h-2 w-2 rounded-full",
                      PROJECT_STATUSES.find((s) => s.id === status)?.color
                    )}
                  />
                  <span className="capitalize">{status.replace("_", " ")}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
                {showStatusPicker && (
                  <div className="absolute top-10 left-0 z-30 flex flex-col gap-1 rounded-xl bg-white dark:bg-zinc-900 p-2 shadow-lg border border-zinc-200 dark:border-zinc-700 min-w-[140px]">
                    {PROJECT_STATUSES.map((s) => (
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
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        )}
                      >
                        <span className={clsx("h-2 w-2 rounded-full", s.color)} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    closeAllPickers();
                    setShowDatePicker((prev) => !prev);
                  }}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                    startDate || dueDate
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-zinc-200 dark:border-zinc-700"
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {startDate || dueDate ? (
                    <span>
                      {startDate && formatDateDisplay(startDate)}
                      {startDate && dueDate && " - "}
                      {dueDate && formatDateDisplay(dueDate)}
                    </span>
                  ) : (
                    "Add dates"
                  )}
                </button>
                {showDatePicker && (
                  <div className="absolute top-10 left-0 z-30 flex flex-col gap-3 rounded-xl bg-white dark:bg-zinc-900 p-4 shadow-lg border border-zinc-200 dark:border-zinc-700 min-w-[260px]">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <Play className="h-3.5 w-3.5" />
                        Start date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <Clock className="h-3.5 w-3.5" />
                        Due date
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={startDate || undefined}
                        className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    {(startDate || dueDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate("");
                          setDueDate("");
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear dates
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Task List */}
            {showTaskList && (
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                    Tasks
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {tasks.filter((t) => t.completed).length}/{tasks.length} completed
                  </span>
                </div>
                {tasks.map((item, idx) => {
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
                          handleTaskChange(item.id, {
                            completed: event.target.checked,
                          })
                        }
                        className="h-4 w-4 accent-indigo-500 flex-shrink-0 rounded"
                      />
                      <input
                        value={item.text}
                        onChange={(event) =>
                          handleTaskChange(item.id, {
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
                            setTasks((prev) => {
                              const newList = [...prev];
                              [newList[idx - 1], newList[idx]] = [
                                newList[idx],
                                newList[idx - 1],
                              ];
                              return newList;
                            });
                            setTimeout(
                              () => taskInputRefs.current[item.id]?.focus(),
                              0
                            );
                            return;
                          }
                          // Option/Alt + Down to move item down
                          if (
                            event.key === "ArrowDown" &&
                            event.altKey &&
                            idx < tasks.length - 1
                          ) {
                            event.preventDefault();
                            setTasks((prev) => {
                              const newList = [...prev];
                              [newList[idx], newList[idx + 1]] = [
                                newList[idx + 1],
                                newList[idx],
                              ];
                              return newList;
                            });
                            setTimeout(
                              () => taskInputRefs.current[item.id]?.focus(),
                              0
                            );
                            return;
                          }
                          // Arrow Up to navigate to previous item
                          if (event.key === "ArrowUp" && !event.altKey && idx > 0) {
                            event.preventDefault();
                            const prevItem = tasks[idx - 1];
                            taskInputRefs.current[prevItem.id]?.focus();
                            return;
                          }
                          // Arrow Down to navigate to next item
                          if (
                            event.key === "ArrowDown" &&
                            !event.altKey &&
                            idx < tasks.length - 1
                          ) {
                            event.preventDefault();
                            const nextItem = tasks[idx + 1];
                            taskInputRefs.current[nextItem.id]?.focus();
                            return;
                          }
                          // Enter to create new item (inherit indent level)
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey &&
                            !event.nativeEvent.isComposing
                          ) {
                            event.preventDefault();
                            handleAddTask(idx, indentLevel);
                          }
                          // Backspace on empty item: unindent first, then delete when at level 0
                          if (event.key === "Backspace" && item.text === "") {
                            event.preventDefault();
                            // If indented, unindent first
                            if (indentLevel > 0) {
                              handleIndentChange(item.id, -1);
                            } else if (tasks.length > 1) {
                              // At level 0, delete the item
                              const prevItem = tasks[idx - 1];
                              if (prevItem) {
                                taskInputRefs.current[prevItem.id]?.focus();
                              }
                              setTasks((prev) =>
                                prev.filter((entry) => entry.id !== item.id)
                              );
                            }
                          }
                        }}
                        placeholder={getTaskPlaceholder(idx)}
                        ref={(element) => {
                          if (element) {
                            taskInputRefs.current[item.id] = element;
                          } else {
                            delete taskInputRefs.current[item.id];
                          }
                        }}
                        className={clsx(
                          "flex-1 border-b border-transparent bg-transparent pb-1 text-sm placeholder:text-zinc-400 focus:border-zinc-300 dark:focus:border-zinc-600 focus:outline-none",
                          item.completed
                            ? "text-zinc-400 dark:text-zinc-500 line-through"
                            : "text-zinc-700 dark:text-zinc-300"
                        )}
                      />
                      <button
                        type="button"
                        className="opacity-0 transition group-hover:opacity-100"
                        onClick={() => handleRemoveTask(item.id)}
                        aria-label="Remove task"
                      >
                        <X className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
                      </button>
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleAddTask()}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 transition hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add task
                </button>
              </div>
            )}

            {/* Selected Labels Display */}
            {selectedLabelIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedLabelIds.map((labelId) => {
                  const label = labels.find((item) => item.id === labelId);
                  if (!label) {
                    return null;
                  }

                  return (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400"
                    >
                      {label.name}
                      <button
                        type="button"
                        onClick={() => toggleLabelSelection(label.id)}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        aria-label={`Remove label ${label.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-3">
                {attachments.map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/60 shadow-sm"
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
            )}

            {/* Bottom Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-1">
                {/* Task List Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskList((prev) => {
                      if (!prev && tasks.length === 0) {
                        // Add initial empty task when enabling
                        setTasks([taskTemplate()]);
                      }
                      return !prev;
                    });
                  }}
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    showTaskList
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  aria-label="Toggle task list"
                  title="Task list"
                >
                  <CheckSquare className="h-5 w-5" />
                </button>

                {/* Attachments */}
                <button
                  type="button"
                  className="p-2 rounded-full transition-colors text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add attachment"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                {/* Color Palette */}
                <div className="relative">
                  <button
                    type="button"
                    className={clsx(
                      "p-2 rounded-full transition-colors",
                      showPalette
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    onClick={() => {
                      closeAllPickers();
                      setShowPalette((prev) => !prev);
                    }}
                    aria-label="Choose color"
                  >
                    <Palette className="h-5 w-5" />
                  </button>
                  {showPalette && (
                    <div className="absolute bottom-12 left-1/2 z-30 flex flex-wrap -translate-x-1/2 gap-2 rounded-2xl bg-white dark:bg-zinc-900 p-3 shadow-lg border border-zinc-200 dark:border-zinc-700 max-w-[280px]">
                      {PROJECT_COLORS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setColor(option.id);
                            setShowPalette(false);
                          }}
                          className={clsx(
                            "h-8 w-8 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
                            option.swatchClass,
                            option.id === color && "ring-2 ring-indigo-600"
                          )}
                          aria-label={`Set color ${option.label}`}
                          title={option.label}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Labels */}
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    showLabelPicker
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => {
                    closeAllPickers();
                    setShowLabelPicker((prev) => !prev);
                  }}
                  aria-label="Manage labels"
                >
                  <Tag className="h-5 w-5" />
                </button>

                {/* Due Date Quick Access */}
                <button
                  type="button"
                  className={clsx(
                    "p-2 rounded-full transition-colors",
                    dueDate
                      ? "text-indigo-500 bg-indigo-500/10"
                      : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                  onClick={() => {
                    closeAllPickers();
                    setShowDatePicker((prev) => !prev);
                  }}
                  aria-label="Set due date"
                >
                  <CalendarClock className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
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
          </div>

          {/* Label Picker Panel */}
          {showLabelPicker && (
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
                    placeholder="Search or create a label..."
                    className="w-full rounded-full border px-4 py-2 text-sm focus:outline-none bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-300 dark:focus:border-zinc-600"
                    disabled={isCreatingLabel}
                  />
                </div>
                {newLabelName.trim() &&
                  !labels.some(
                    (l) =>
                      l.name.toLowerCase() === newLabelName.trim().toLowerCase()
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
                {filteredLabels.length > 0 ? (
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
                            : "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-800 dark:hover:text-zinc-200"
                        )}
                      >
                        <span
                          className={clsx(
                            "h-2 w-2 rounded-full",
                            label.color === "default"
                              ? "bg-zinc-400 dark:bg-zinc-500"
                              : label.color.startsWith("project-")
                                ? PROJECT_COLORS.find((c) => c.id === label.color)
                                    ?.swatchClass ?? "bg-zinc-400"
                                : "bg-zinc-400"
                          )}
                        />
                        {label.name}
                      </button>
                    );
                  })
                ) : newLabelName.trim() ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No matching labels. Press Enter or click Create to add &quot;
                    {newLabelName.trim()}&quot;.
                  </p>
                ) : (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    No labels yet. Type above to create your first label.
                  </p>
                )}
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
