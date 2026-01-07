"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Users, Check, GitBranch, Circle } from "lucide-react";
import { clsx } from "clsx";
import { ConfirmationDialog, PriorityIcon } from "@ainexsuite/ui";
import type { Workflow } from "@/lib/types/workflow";
import { useWorkflows } from "@/components/providers/workflows-provider";
import { useLabels } from "@/components/providers/labels-provider";
import { FocusIcon } from "@/components/icons/focus-icon";

// Workflow color configurations
const WORKFLOW_COLORS: Record<string, { cardClass: string; accentClass: string }> = {
  default: {
    cardClass: "bg-zinc-50 dark:bg-zinc-900",
    accentClass: "bg-zinc-400",
  },
  "workflow-blue": {
    cardClass: "bg-blue-50 dark:bg-blue-950/30",
    accentClass: "bg-blue-500",
  },
  "workflow-green": {
    cardClass: "bg-emerald-50 dark:bg-emerald-950/30",
    accentClass: "bg-emerald-500",
  },
  "workflow-amber": {
    cardClass: "bg-amber-50 dark:bg-amber-950/30",
    accentClass: "bg-amber-500",
  },
  "workflow-purple": {
    cardClass: "bg-purple-50 dark:bg-purple-950/30",
    accentClass: "bg-purple-500",
  },
  "workflow-pink": {
    cardClass: "bg-pink-50 dark:bg-pink-950/30",
    accentClass: "bg-pink-500",
  },
  "workflow-cyan": {
    cardClass: "bg-cyan-50 dark:bg-cyan-950/30",
    accentClass: "bg-cyan-500",
  },
  "workflow-slate": {
    cardClass: "bg-slate-100 dark:bg-slate-900",
    accentClass: "bg-slate-500",
  },
  "workflow-rose": {
    cardClass: "bg-rose-50 dark:bg-rose-950/30",
    accentClass: "bg-rose-500",
  },
  "workflow-emerald": {
    cardClass: "bg-emerald-50 dark:bg-emerald-950/30",
    accentClass: "bg-emerald-500",
  },
};

type WorkflowCardProps = {
  workflow: Workflow;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (workflowId: string, event: React.MouseEvent) => void;
};

export function WorkflowCard({
  workflow,
  isSelectMode = false,
  isSelected = false,
  onSelect,
}: WorkflowCardProps) {
  const router = useRouter();
  const { togglePin, deleteWorkflow } = useWorkflows();
  const { labels } = useLabels();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const labelMap = useMemo(() => {
    return new Map(labels.map((label) => [label.id, label]));
  }, [labels]);

  const workflowLabels = useMemo(() => {
    return workflow.labelIds
      .map((labelId) => labelMap.get(labelId))
      .filter((label): label is NonNullable<typeof label> => Boolean(label));
  }, [workflow.labelIds, labelMap]);

  const colorConfig = WORKFLOW_COLORS[workflow.color] || WORKFLOW_COLORS.default;

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteWorkflow(workflow.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteConfirm(false);
  };

  const handlePin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await togglePin(workflow.id, !workflow.pinned);
  };

  const handleCardClick = (event: React.MouseEvent) => {
    if (isSelectMode && onSelect) {
      event.preventDefault();
      event.stopPropagation();
      onSelect(workflow.id, event);
    } else {
      router.push(`/workspace/${workflow.id}`);
    }
  };

  return (
    <>
      <article
        className={clsx(
          colorConfig.cardClass,
          "border border-zinc-200 dark:border-zinc-800",
          "group relative cursor-pointer overflow-hidden rounded-2xl",
          "transition-[border-color,box-shadow,transform] duration-200",
          "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md",
          "break-inside-avoid px-4 py-4 h-[220px] flex flex-col",
          isSelected && "border-primary dark:border-primary ring-4 ring-primary/20 scale-[0.98]"
        )}
        onClick={handleCardClick}
      >
        {/* Selection Checkbox */}
        {onSelect && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(workflow.id, event);
            }}
            className={clsx(
              "absolute z-30 h-5 w-5 rounded-full transition-all duration-200",
              "flex items-center justify-center",
              "backdrop-blur-xl border shadow-sm",
              "top-3 right-[36px]",
              isSelected
                ? "bg-primary border-primary scale-110"
                : "border-white/30 dark:border-zinc-600/50 bg-white/80 dark:bg-zinc-800/80",
              isSelectMode ? "opacity-100" : "opacity-0 group-hover:opacity-100 hover:scale-110"
            )}
            aria-label={isSelected ? "Deselect workflow" : "Select workflow"}
          >
            {isSelected ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <div className="h-2 w-2 rounded-full border-[1.5px] border-zinc-400 dark:border-zinc-500" />
            )}
          </button>
        )}

        {/* Corner Focus Badge */}
        <button
          type="button"
          onClick={handlePin}
          className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
          aria-label={workflow.pinned ? "Remove from Focus" : "Add to Focus"}
        >
          {workflow.pinned ? (
            <>
              <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all" />
              <FocusIcon focused className="absolute top-1.5 right-1.5 h-3 w-3 text-white" />
            </>
          ) : (
            <>
              <div
                className={clsx(
                  "absolute top-0 right-0 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all",
                  "opacity-0 group-hover:opacity-100",
                  "bg-zinc-200/50 dark:bg-zinc-700/50"
                )}
              />
              <FocusIcon
                className={clsx(
                  "absolute top-1.5 right-1.5 h-3 w-3 transition-all",
                  "opacity-0 group-hover:opacity-100",
                  "text-[var(--color-primary)]"
                )}
              />
            </>
          )}
        </button>

        {/* Header with title */}
        <div className="relative z-10 -mx-4 -mt-4 px-4 py-2.5 rounded-t-2xl border-b border-transparent mb-2">
          <h3 className="pr-8 text-[14px] font-semibold tracking-[-0.02em] line-clamp-1 text-zinc-900 dark:text-zinc-100">
            {workflow.title || "Untitled Workflow"}
          </h3>
        </div>

        {/* Content area */}
        <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
          <div className="overflow-y-auto pr-1 flex-1">
            {/* Canvas Preview Placeholder */}
            <div className="relative h-20 rounded-lg bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center mb-2">
              {workflow.thumbnail ? (
                <Image
                  src={workflow.thumbnail}
                  alt="Workflow preview"
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600">
                  <GitBranch className="h-5 w-5" />
                  <span className="text-xs font-medium">{workflow.nodeCount} nodes</span>
                </div>
              )}
            </div>

            {/* Description */}
            {workflow.description && (
              <p className="text-[12px] leading-4 text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                {workflow.description}
              </p>
            )}

            {/* Labels */}
            {workflowLabels.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                {workflowLabels.slice(0, 2).map((label) => (
                  <span
                    key={label.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    <Circle className="h-1.5 w-1.5 fill-current" style={{ color: label.color === "default" ? "#9ca3af" : undefined }} />
                    <span>{label.name}</span>
                  </span>
                ))}
                {workflowLabels.length > 2 && (
                  <span className="text-[10px] text-zinc-400">+{workflowLabels.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-auto flex items-center justify-between pt-2 -mx-4 -mb-4 px-4 pb-3 rounded-b-2xl border-t bg-black/5 dark:bg-white/5 border-transparent">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
            {workflow.sharedWithUserIds?.length > 0 && (
              <span className="h-5 flex items-center gap-1 rounded-full px-1.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                <Users className="h-3 w-3" />
                {workflow.sharedWithUserIds.length}
              </span>
            )}
            <span className="h-5 flex items-center px-1.5 rounded-full text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              {(workflow.updatedAt.getTime() !== workflow.createdAt.getTime()
                ? workflow.updatedAt
                : workflow.createdAt
              ).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              {" · "}
              {workflow.updatedAt.getTime() !== workflow.createdAt.getTime() ? "Edited" : "Created"}
            </span>
          </div>

          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
            {workflow.priority && (
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center"
                title={`${workflow.priority.charAt(0).toUpperCase() + workflow.priority.slice(1)} priority`}
              >
                <PriorityIcon priority={workflow.priority} size="sm" showOnlyHighPriority={false} />
              </div>
            )}
            <button
              type="button"
              onClick={handleDeleteClick}
              className="h-5 w-5 rounded-full flex items-center justify-center transition text-red-400 hover:bg-red-500/20 hover:text-red-500"
              aria-label="Delete workflow"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </footer>
      </article>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete this workflow?"
        description="This will move the workflow to the Trash. You can restore it from there within the next 30 days."
        confirmText="Delete workflow"
        cancelText="Keep workflow"
        variant="danger"
      />
    </>
  );
}
