"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, GitBranch, Palette, Tag, X } from "lucide-react";
import { clsx } from "clsx";
import { useWorkflows } from "@/components/providers/workflows-provider";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useLabels } from "@/components/providers/labels-provider";
import type { WorkflowColor } from "@/lib/types/workflow";

interface WorkflowComposerProps {
  placeholder?: string;
}

// Color options for workflows
const COLOR_OPTIONS: { id: WorkflowColor; label: string; bgClass: string; dotClass: string }[] = [
  { id: "default", label: "Default", bgClass: "bg-zinc-100 dark:bg-zinc-800", dotClass: "bg-zinc-400" },
  { id: "workflow-blue", label: "Blue", bgClass: "bg-blue-100 dark:bg-blue-900/30", dotClass: "bg-blue-500" },
  { id: "workflow-green", label: "Green", bgClass: "bg-emerald-100 dark:bg-emerald-900/30", dotClass: "bg-emerald-500" },
  { id: "workflow-amber", label: "Amber", bgClass: "bg-amber-100 dark:bg-amber-900/30", dotClass: "bg-amber-500" },
  { id: "workflow-purple", label: "Purple", bgClass: "bg-purple-100 dark:bg-purple-900/30", dotClass: "bg-purple-500" },
  { id: "workflow-pink", label: "Pink", bgClass: "bg-pink-100 dark:bg-pink-900/30", dotClass: "bg-pink-500" },
  { id: "workflow-cyan", label: "Cyan", bgClass: "bg-cyan-100 dark:bg-cyan-900/30", dotClass: "bg-cyan-500" },
];

export function WorkflowComposer({ placeholder = "Create a new workflow..." }: WorkflowComposerProps) {
  const router = useRouter();
  const { createWorkflow } = useWorkflows();
  const { currentSpaceId } = useSpaces();
  const { labels } = useLabels();

  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<WorkflowColor>("default");
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!title.trim() && !isCreating) {
          setIsExpanded(false);
          setColor("default");
          setSelectedLabelIds([]);
          setShowColorPicker(false);
          setShowLabelPicker(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, isCreating]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleCreate = useCallback(async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const workflowId = await createWorkflow({
        title: title.trim() || "Untitled Workflow",
        color,
        labelIds: selectedLabelIds,
        spaceId: currentSpaceId === "personal" ? undefined : currentSpaceId,
      });

      if (workflowId) {
        // Navigate to the new workflow editor
        router.push(`/workspace/${workflowId}`);
      }

      // Reset form
      setTitle("");
      setColor("default");
      setSelectedLabelIds([]);
      setIsExpanded(false);
    } finally {
      setIsCreating(false);
    }
  }, [createWorkflow, title, color, selectedLabelIds, currentSpaceId, router, isCreating]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleCreate();
    } else if (event.key === "Escape") {
      setIsExpanded(false);
      setTitle("");
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const selectedColor = COLOR_OPTIONS.find((c) => c.id === color) || COLOR_OPTIONS[0];

  if (!isExpanded) {
    return (
      <div
        className={clsx(
          "flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition",
          "bg-zinc-50 dark:bg-zinc-900",
          "border-zinc-200 dark:border-zinc-800",
          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
          "hover:border-zinc-300 dark:hover:border-zinc-700"
        )}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex-1 min-w-0 text-left text-sm text-zinc-400 dark:text-zinc-500 focus-visible:outline-none flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>{placeholder}</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-3">
      <div
        className={clsx(
          "rounded-xl border p-4 shadow-sm transition-all duration-200",
          "bg-white dark:bg-zinc-900",
          "border-zinc-200 dark:border-zinc-700"
        )}
      >
        {/* Title input */}
        <div className="flex items-center gap-3 mb-3">
          <GitBranch className="h-5 w-5 text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Workflow title..."
            className={clsx(
              "flex-1 bg-transparent text-base font-medium",
              "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
              "focus:outline-none"
            )}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Color picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowLabelPicker(false);
                }}
                className={clsx(
                  "h-8 px-2 rounded-lg flex items-center gap-1.5",
                  "text-zinc-600 dark:text-zinc-400",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  "transition-colors"
                )}
                title="Color"
              >
                <div className={clsx("h-3 w-3 rounded-full", selectedColor.dotClass)} />
                <Palette className="h-4 w-4" />
              </button>

              {showColorPicker && (
                <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg z-50">
                  <div className="flex flex-wrap gap-1 w-36">
                    {COLOR_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setColor(option.id);
                          setShowColorPicker(false);
                        }}
                        className={clsx(
                          "h-7 w-7 rounded-lg flex items-center justify-center",
                          "hover:ring-2 ring-primary/50 transition-all",
                          color === option.id && "ring-2 ring-primary"
                        )}
                        title={option.label}
                      >
                        <div className={clsx("h-4 w-4 rounded-full", option.dotClass)} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Label picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowLabelPicker(!showLabelPicker);
                  setShowColorPicker(false);
                }}
                className={clsx(
                  "h-8 px-2 rounded-lg flex items-center gap-1.5",
                  "text-zinc-600 dark:text-zinc-400",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  "transition-colors",
                  selectedLabelIds.length > 0 && "text-primary"
                )}
                title="Labels"
              >
                <Tag className="h-4 w-4" />
                {selectedLabelIds.length > 0 && (
                  <span className="text-xs">{selectedLabelIds.length}</span>
                )}
              </button>

              {showLabelPicker && labels.length > 0 && (
                <div className="absolute top-full left-0 mt-1 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg z-50 min-w-[160px]">
                  <div className="space-y-1">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabel(label.id)}
                        className={clsx(
                          "w-full px-2 py-1.5 rounded-md flex items-center gap-2 text-left text-sm",
                          "hover:bg-zinc-100 dark:hover:bg-zinc-700",
                          selectedLabelIds.includes(label.id) && "bg-zinc-100 dark:bg-zinc-700"
                        )}
                      >
                        <div className="h-2 w-2 rounded-full bg-zinc-400" />
                        <span className="flex-1 truncate">{label.name}</span>
                        {selectedLabelIds.includes(label.id) && (
                          <span className="text-primary">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setTitle("");
                setColor("default");
                setSelectedLabelIds([]);
              }}
              className={clsx(
                "h-8 px-3 rounded-lg text-sm font-medium",
                "text-zinc-600 dark:text-zinc-400",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                "transition-colors"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className={clsx(
                "h-8 px-4 rounded-lg text-sm font-medium",
                "bg-primary text-white",
                "hover:brightness-110",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all"
              )}
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        {/* Selected labels display */}
        {selectedLabelIds.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {selectedLabelIds.map((labelId) => {
              const label = labels.find((l) => l.id === labelId);
              if (!label) return null;
              return (
                <span
                  key={labelId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800"
                >
                  {label.name}
                  <button
                    type="button"
                    onClick={() => toggleLabel(labelId)}
                    className="hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
