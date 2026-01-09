"use client";

import { useMemo } from "react";
import { Check, Calendar, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { FocusGlow, PriorityIcon } from "@ainexsuite/ui";
import type { Project } from "@/lib/types/project";
import { useLabels } from "@/components/providers/labels-provider";
import { PROJECT_COLORS } from "@/lib/constants/project-colors";
import { FocusIcon } from "@/components/icons/focus-icon";

// Status configuration
const STATUS_CONFIG: Record<
  Project["status"],
  { label: string; bgClass: string; textClass: string }
> = {
  planning: {
    label: "Planning",
    bgClass: "bg-blue-100 dark:bg-blue-900/50",
    textClass: "text-blue-700 dark:text-blue-300",
  },
  active: {
    label: "Active",
    bgClass: "bg-green-100 dark:bg-green-900/50",
    textClass: "text-green-700 dark:text-green-300",
  },
  on_hold: {
    label: "On Hold",
    bgClass: "bg-amber-100 dark:bg-amber-900/50",
    textClass: "text-amber-700 dark:text-amber-300",
  },
  completed: {
    label: "Completed",
    bgClass: "bg-zinc-100 dark:bg-zinc-800",
    textClass: "text-zinc-600 dark:text-zinc-400",
  },
  archived: {
    label: "Archived",
    bgClass: "bg-zinc-100 dark:bg-zinc-800",
    textClass: "text-zinc-500 dark:text-zinc-500",
  },
};

// Pattern overlay styles
const PATTERN_STYLES: Record<string, string> = {
  none: "",
  dots: "bg-[radial-gradient(circle,_currentColor_1px,_transparent_1px)] bg-[length:12px_12px] opacity-10",
  grid: "bg-[linear-gradient(currentColor_1px,_transparent_1px),_linear-gradient(90deg,_currentColor_1px,_transparent_1px)] bg-[length:16px_16px] opacity-10",
  diagonal:
    "bg-[repeating-linear-gradient(45deg,_currentColor_0,_currentColor_1px,_transparent_0,_transparent_8px)] opacity-10",
  waves:
    "bg-[repeating-linear-gradient(0deg,_transparent,_transparent_4px,_currentColor_4px,_currentColor_5px)] opacity-10",
  circles:
    "bg-[radial-gradient(circle_at_center,_currentColor_0,_currentColor_2px,_transparent_2px,_transparent_16px)] bg-[length:32px_32px] opacity-10",
};

type ProjectCardProps = {
  project: Project;
  onClick: () => void;
  onPin: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
};

export function ProjectCard({
  project,
  onClick,
  onPin,
  selectionMode = false,
  isSelected = false,
  onSelect,
}: ProjectCardProps) {
  const { labels } = useLabels();

  // Map labels for this project
  const labelMap = useMemo(() => {
    return new Map(labels.map((label) => [label.id, label]));
  }, [labels]);

  const projectLabels = useMemo(() => {
    return project.labelIds
      .map((labelId) => labelMap.get(labelId))
      .filter((label): label is NonNullable<typeof label> => Boolean(label));
  }, [project.labelIds, labelMap]);

  // Get color config
  const colorConfig = PROJECT_COLORS.find((c) => c.id === project.color);
  const cardClass = colorConfig?.cardClass || "bg-zinc-50 dark:bg-zinc-900";
  const footerClass =
    colorConfig?.footerClass || "bg-zinc-100 dark:bg-zinc-800/60";

  // Calculate task progress
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const hasProgress = totalTasks > 0;
  const progressPercent = hasProgress
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Check if due date is overdue
  const isOverdue = useMemo(() => {
    if (!project.dueDate) return false;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(project.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < now && project.status !== "completed";
  }, [project.dueDate, project.status]);

  // Format due date
  const formattedDueDate = useMemo(() => {
    if (!project.dueDate) return null;
    const due = new Date(project.dueDate);
    const now = new Date();
    const diffDays = Math.ceil(
      (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays <= 7) return `In ${diffDays}d`;

    return due.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [project.dueDate]);

  // Status config
  const statusConfig = STATUS_CONFIG[project.status];

  // Pattern style
  const patternStyle = project.pattern
    ? PATTERN_STYLES[project.pattern] || ""
    : "";

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect();
    } else {
      onClick();
    }
  };

  const handlePinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onPin();
  };

  const handleSelectClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();
  };

  return (
    <article
      className={clsx(
        // Base card styles
        !project.coverImage && !project.backgroundImage && cardClass,
        "border border-zinc-200 dark:border-zinc-800",
        "group relative cursor-pointer overflow-hidden rounded-2xl",
        // Hover transitions
        "hover:transition-[border-color,box-shadow,transform] hover:duration-200",
        "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md",
        // Layout
        "break-inside-avoid px-4 py-4 h-[240px] flex flex-col",
        // Selection styles
        isSelected &&
          "border-primary dark:border-primary ring-4 ring-primary/20 scale-[0.98]"
      )}
      onClick={handleCardClick}
    >
      {/* Focus glow for pinned cards */}
      {project.pinned && <FocusGlow />}

      {/* Selection Checkbox */}
      {onSelect && (
        <button
          type="button"
          onClick={handleSelectClick}
          className={clsx(
            "absolute z-30 h-5 w-5 rounded-full transition-all duration-200",
            "flex items-center justify-center",
            "backdrop-blur-xl border shadow-sm",
            "top-3 right-[36px]",
            isSelected
              ? "bg-primary border-primary scale-110"
              : clsx(
                  "border-white/30 dark:border-zinc-600/50",
                  project.coverImage || project.backgroundImage
                    ? "bg-black/20"
                    : "bg-white/80 dark:bg-zinc-800/80"
                ),
            selectionMode
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 hover:scale-110"
          )}
          aria-label={isSelected ? "Deselect project" : "Select project"}
        >
          {isSelected ? (
            <Check className="h-3 w-3 text-white" />
          ) : (
            <div
              className={clsx(
                "h-2 w-2 rounded-full border-[1.5px]",
                project.coverImage || project.backgroundImage
                  ? "border-white/50"
                  : "border-zinc-400 dark:border-zinc-500"
              )}
            />
          )}
        </button>
      )}

      {/* Cover Image Layer */}
      {project.coverImage && !project.backgroundImage && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>
      )}

      {/* Background Image Layer */}
      {project.backgroundImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${project.backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>
      )}

      {/* Pattern Overlay */}
      {patternStyle && !project.coverImage && !project.backgroundImage && (
        <div
          className={clsx("absolute inset-0 z-0 pointer-events-none", patternStyle)}
          aria-hidden="true"
        />
      )}

      {/* Pin/Focus Button */}
      <button
        type="button"
        onClick={handlePinClick}
        className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
        aria-label={project.pinned ? "Remove from Focus" : "Add to Focus"}
      >
        {project.pinned ? (
          <>
            <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all" />
            <FocusIcon
              focused
              className="absolute top-1.5 right-1.5 h-3 w-3 text-white"
            />
          </>
        ) : (
          <>
            <div
              className={clsx(
                "absolute top-0 right-0 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all",
                "opacity-0 group-hover:opacity-100",
                project.coverImage || project.backgroundImage
                  ? "bg-white/10"
                  : "bg-zinc-200/50 dark:bg-zinc-700/50"
              )}
            />
            <FocusIcon
              className={clsx(
                "absolute top-1.5 right-1.5 h-3 w-3 transition-all",
                "opacity-0 group-hover:opacity-100",
                project.coverImage || project.backgroundImage
                  ? "text-[var(--color-primary)]/80"
                  : "text-[var(--color-primary)]"
              )}
            />
          </>
        )}
      </button>

      {/* Header with Icon and Title */}
      <div
        className={clsx(
          "relative z-10 -mx-4 -mt-4 px-4 py-2.5 rounded-t-2xl border-b mb-2",
          project.coverImage || project.backgroundImage
            ? "bg-black/30 backdrop-blur-sm border-white/10"
            : "border-transparent"
        )}
      >
        <div className="flex items-center gap-2 pr-8">
          {/* Icon/Emoji */}
          {project.icon && (
            <span className="text-lg flex-shrink-0">{project.icon}</span>
          )}
          {/* Title */}
          <h3
            className={clsx(
              "text-[14px] font-semibold tracking-[-0.02em] line-clamp-1",
              project.coverImage || project.backgroundImage
                ? "text-white"
                : "text-zinc-900 dark:text-zinc-100"
            )}
          >
            {project.title || "Untitled Project"}
          </h3>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
        <div className="overflow-y-auto pr-1 flex-1">
          {/* Description Preview */}
          {project.description && (
            <p
              className={clsx(
                "whitespace-pre-wrap text-[12px] leading-5 tracking-[-0.01em] line-clamp-2 mb-2",
                project.coverImage || project.backgroundImage
                  ? "text-white/80"
                  : "text-zinc-600 dark:text-zinc-400"
              )}
            >
              {project.description}
            </p>
          )}

          {/* Status and Priority Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {/* Status Badge */}
            <span
              className={clsx(
                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
                statusConfig.bgClass,
                statusConfig.textClass
              )}
            >
              {statusConfig.label}
            </span>

            {/* Priority Badge (flame icon for high/urgent) */}
            {project.priority && project.priority !== "low" && (
              <div
                className={clsx(
                  "inline-flex items-center px-1.5 py-0.5 rounded-full",
                  project.priority === "high"
                    ? "bg-orange-100 dark:bg-orange-900/50"
                    : "bg-amber-100 dark:bg-amber-900/50"
                )}
              >
                <PriorityIcon
                  priority={project.priority}
                  size="sm"
                  showOnlyHighPriority={false}
                />
              </div>
            )}
          </div>

          {/* Task Progress */}
          {hasProgress && (
            <div className="flex items-center gap-2 mb-2">
              <div
                className={clsx(
                  "flex-1 h-1.5 rounded-full overflow-hidden",
                  project.coverImage || project.backgroundImage
                    ? "bg-white/20"
                    : "bg-zinc-200 dark:bg-zinc-700"
                )}
              >
                <div
                  className={clsx(
                    "h-full transition-all duration-300",
                    progressPercent === 100
                      ? "bg-green-500"
                      : "bg-[var(--color-primary)]"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium tabular-nums",
                  project.coverImage || project.backgroundImage
                    ? "text-white/70"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}

          {/* Labels */}
          {projectLabels.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              {projectLabels.slice(0, 3).map((label) => {
                const labelColor = PROJECT_COLORS.find(
                  (c) => c.id === label.color
                );
                return (
                  <span
                    key={label.id}
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      project.coverImage || project.backgroundImage
                        ? "bg-white/10 text-white/90"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        labelColor?.swatchClass || "bg-zinc-400"
                      )}
                    />
                    <span className="truncate max-w-[60px]">{label.name}</span>
                  </span>
                );
              })}
              {projectLabels.length > 3 && (
                <span
                  className={clsx(
                    "text-[10px]",
                    project.coverImage || project.backgroundImage
                      ? "text-white/60"
                      : "text-zinc-400"
                  )}
                >
                  +{projectLabels.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        className={clsx(
          "relative z-10 mt-auto flex items-center justify-between pt-1.5 -mx-4 -mb-4 px-4 pb-2 rounded-b-2xl border-t",
          project.coverImage || project.backgroundImage
            ? "bg-black/30 backdrop-blur-sm border-white/10"
            : clsx(footerClass, "border-transparent")
        )}
      >
        {/* Due Date */}
        <div
          className={clsx(
            "flex items-center gap-1 px-1.5 py-0.5 rounded-full backdrop-blur-xl border",
            project.coverImage || project.backgroundImage
              ? "bg-white/10 border-white/20"
              : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
          )}
        >
          {project.dueDate ? (
            <span
              className={clsx(
                "h-5 flex items-center gap-1 px-1 text-[10px] font-medium",
                isOverdue
                  ? "text-red-500 dark:text-red-400"
                  : project.coverImage || project.backgroundImage
                    ? "text-white/70"
                    : "text-zinc-500 dark:text-zinc-400"
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              {formattedDueDate}
            </span>
          ) : (
            <span
              className={clsx(
                "h-5 flex items-center px-1 text-[10px] font-medium",
                project.coverImage || project.backgroundImage
                  ? "text-white/50"
                  : "text-zinc-400 dark:text-zinc-500"
              )}
            >
              No due date
            </span>
          )}
        </div>

        {/* Updated timestamp */}
        <span
          className={clsx(
            "text-[10px]",
            project.coverImage || project.backgroundImage
              ? "text-white/50"
              : "text-zinc-400 dark:text-zinc-500"
          )}
        >
          {project.updatedAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </footer>
    </article>
  );
}
