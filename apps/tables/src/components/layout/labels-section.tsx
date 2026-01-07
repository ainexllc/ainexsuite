"use client";

import { useCallback, useMemo, useState } from "react";
import { Tag, Pencil, Trash2, Check, X } from "lucide-react";
import { clsx } from "clsx";
import { NavigationSection, ConfirmationDialog } from "@ainexsuite/ui";
import { useLabels } from "@/components/providers/labels-provider";
import { useTables } from "@/components/providers/tables-provider";
import type { Label } from "@/lib/types/table";

type LabelNode = {
  label: Label;
  depth: number;
};

function buildLabelNodes(labels: Label[]): LabelNode[] {
  const nodeMap = new Map<string, { label: Label; children: Label[] }>();

  labels.forEach((label) => {
    nodeMap.set(label.id, { label, children: [] });
  });

  nodeMap.forEach((entry) => {
    const parentId = entry.label.parentId;
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId)!.children.push(entry.label);
    }
  });

  const sortByName = (entries: { label: Label; children: Label[] }[]) =>
    entries.sort((a, b) =>
      a.label.name.localeCompare(b.label.name, undefined, {
        sensitivity: "base",
      }),
    );

  const roots = Array.from(nodeMap.values()).filter((entry) => {
    const parentId = entry.label.parentId;
    return !parentId || !nodeMap.has(parentId);
  });

  const nodes: LabelNode[] = [];
  const visit = (entry: { label: Label; children: Label[] }, depth: number) => {
    nodes.push({ label: entry.label, depth });
    const children = entry.children
      .map((child) => nodeMap.get(child.id)!)
      .filter(Boolean);
    sortByName(children);
    children.forEach((child) => visit(child, depth + 1));
  };

  sortByName(roots);
  roots.forEach((root) => visit(root, 0));

  return nodes;
}

type LabelsSectionProps = {
  onClose: () => void;
};

export function LabelsSection({ onClose }: LabelsSectionProps) {
  const { labels, loading: labelsLoading, createLabel, updateLabel, deleteLabel } = useLabels();
  const { activeLabelIds, setActiveLabelIds, tables } = useTables();
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);

  const labelNodes = useMemo(() => buildLabelNodes(labels), [labels]);

  // Count tables per label
  const tableCounts = useMemo(() => {
    const counts = new Map<string, number>();
    tables.forEach(table => {
      table.labelIds?.forEach((labelId) => {
        counts.set(labelId, (counts.get(labelId) || 0) + 1);
      });
    });
    return counts;
  }, [tables]);

  const toggleLabelFilter = useCallback(
    (labelId: string) => {
      if (activeLabelIds.includes(labelId)) {
        setActiveLabelIds([]);
      } else {
        setActiveLabelIds([labelId]);
      }
      onClose();
    },
    [activeLabelIds, setActiveLabelIds, onClose],
  );

  const handleCreateLabel = useCallback(async () => {
    const name = newLabelName.trim();
    if (!name) {
      return;
    }

    await createLabel({ name });
    setNewLabelName("");
    setIsAddingLabel(false);
  }, [createLabel, newLabelName]);

  const handleStartEdit = useCallback((label: Label, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLabelId(label.id);
    setEditingName(label.name);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingLabelId) return;
    const name = editingName.trim();
    if (!name) {
      setEditingLabelId(null);
      setEditingName("");
      return;
    }

    await updateLabel(editingLabelId, { name });
    setEditingLabelId(null);
    setEditingName("");
  }, [editingLabelId, editingName, updateLabel]);

  const handleCancelEdit = useCallback(() => {
    setEditingLabelId(null);
    setEditingName("");
  }, []);

  const handleDeleteClick = useCallback((label: Label, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingLabel(label);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingLabel) return;
    await deleteLabel(deletingLabel.id);
    setDeletingLabel(null);
  }, [deletingLabel, deleteLabel]);

  return (
    <NavigationSection title="Labels">
      <div className="space-y-1">
        {labelsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-9 rounded-xl bg-surface-muted/80 shadow-inner animate-pulse"
              />
            ))}
          </div>
        ) : labelNodes.length > 0 ? (
          labelNodes.map(({ label, depth }) => {
            const isActive = activeLabelIds.includes(label.id);
            const isEditing = editingLabelId === label.id;
            const docCount = tableCounts.get(label.id) || 0;

            // Editing mode
            if (isEditing) {
              return (
                <div
                  key={label.id}
                  className="flex items-center gap-2 rounded-xl px-3 py-2"
                  style={{ paddingLeft: `${12 + depth * 16}px` }}
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/10 flex-shrink-0"
                  >
                    <span
                      className={clsx(
                        "h-2.5 w-2.5 rounded-full",
                        label.color === "default"
                          ? "bg-ink-400"
                          : `bg-${label.color}`,
                      )}
                    />
                  </span>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleSaveEdit();
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-ink-700 dark:text-ink-300 focus:outline-none border-b border-ink-300 dark:border-ink-600 pb-0.5"
                  />
                  {/* Save/Cancel glass pill */}
                  <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
                    <button
                      type="button"
                      onClick={() => void handleSaveEdit()}
                      className="h-6 w-6 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 hover:bg-green-500/20 transition"
                      aria-label="Save"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="h-6 w-6 rounded-full flex items-center justify-center text-ink-400 hover:bg-ink-500/20 hover:text-ink-600 dark:hover:text-ink-300 transition"
                      aria-label="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // Normal display mode
            return (
              <div
                key={label.id}
                className="group relative"
              >
                <button
                  type="button"
                  onClick={() => toggleLabelFilter(label.id)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                    isActive
                      ? "bg-ink-200 text-ink-900"
                      : "text-ink-500 hover:bg-surface-muted hover:text-ink-700",
                  )}
                  style={{ paddingLeft: `${12 + depth * 16}px` }}
                >
                  <span
                    className="grid h-8 w-8 place-items-center rounded-lg bg-foreground/10 flex-shrink-0"
                  >
                    <span
                      className={clsx(
                        "h-2.5 w-2.5 rounded-full",
                        label.color === "default"
                          ? "bg-ink-400"
                          : `bg-${label.color}`,
                      )}
                    />
                  </span>
                  <span
                    className={clsx(
                      "flex-1 truncate text-left",
                      isActive ? "text-ink-900" : "text-inherit",
                    )}
                  >
                    {label.name}
                  </span>
                  {/* Note count badge */}
                  {docCount > 0 && !isActive && (
                    <span className="text-[10px] font-medium text-ink-400 group-hover:hidden">
                      {docCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400 group-hover:hidden">
                      Active
                    </span>
                  )}
                </button>
                {/* Hover actions glass pill */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 px-1 py-0.5 rounded-full backdrop-blur-xl border bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50">
                  <button
                    type="button"
                    onClick={(e) => handleStartEdit(label, e)}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-ink-400 hover:bg-ink-500/20 hover:text-ink-600 dark:hover:text-ink-300 transition"
                    aria-label="Rename tag"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(label, e)}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:text-red-500 transition"
                    aria-label="Delete tag"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="px-3 py-2 text-xs text-muted">
            No labels yet. Create one to organize docs.
          </p>
        )}
      </div>

      {isAddingLabel ? (
        <form
          className="mt-3 flex items-center gap-2 px-3"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateLabel();
          }}
        >
          <div className="flex-1 rounded-lg border border-outline-subtle bg-surface-muted px-2 py-1 text-xs">
            <input
              value={newLabelName}
              onChange={(event) => setNewLabelName(event.target.value)}
              autoFocus
              placeholder="Label name"
              className="w-full bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-ink-50"
          >
            Save
          </button>
          <button
            type="button"
            className="text-xs text-muted"
            onClick={() => {
              setIsAddingLabel(false);
              setNewLabelName("");
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingLabel(true)}
          className="mt-3 flex items-center gap-2 px-3 py-1 text-xs font-medium text-ink-500 hover:text-ink-700"
        >
          <Tag className="h-3.5 w-3.5" />
          New label
        </button>
      )}

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={!!deletingLabel}
        onClose={() => setDeletingLabel(null)}
        onConfirm={() => void handleConfirmDelete()}
        title={`Delete "${deletingLabel?.name}"?`}
        description={`This will remove the tag from ${tableCounts.get(deletingLabel?.id || "") || 0} doc${(tableCounts.get(deletingLabel?.id || "") || 0) === 1 ? "" : "s"}. This action cannot be undone.`}
        confirmText="Delete tag"
        cancelText="Cancel"
        variant="danger"
      />
    </NavigationSection>
  );
}
