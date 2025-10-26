"use client";

import { useCallback, useMemo, useState } from "react";
import { Tag, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from "@/lib/constants/navigation";
import Link from "next/link";
import type { Route } from "next";
import { clsx } from "clsx";
import { useLabels } from "@/components/providers/labels-provider";
import { useNotes } from "@/components/providers/notes-provider";
import type { Label } from "@/lib/types/note";

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

type NavigationPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">
        {title}
      </p>
      <nav className="mt-2 space-y-1">{children}</nav>
    </div>
  );
}

export function NavigationPanel({ isOpen, onClose }: NavigationPanelProps) {
  const pathname = usePathname();
  const { labels, loading: labelsLoading, createLabel } = useLabels();
  const { activeLabelIds, setActiveLabelIds } = useNotes();
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  const sections = useMemo(
    () => [
      {
        title: "Workspace",
        items: PRIMARY_NAV_ITEMS,
      },
      {
        title: "Utilities",
        items: SECONDARY_NAV_ITEMS,
      },
    ],
    [],
  );

  const labelNodes = useMemo(() => buildLabelNodes(labels), [labels]);

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

  return (
    <div
      className={clsx(
        "fixed inset-y-0 left-0 z-40 w-[280px] transform bg-surface-elevated/95 backdrop-blur-2xl border-r border-outline-subtle/60 shadow-2xl rounded-r-3xl transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-outline-subtle/40 px-5 py-4">
          <span className="text-sm font-semibold text-ink-900">Navigation</span>
          <button
            type="button"
            className="icon-button h-8 w-8 rounded-full bg-surface-muted hover:bg-ink-200"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          {sections.map((section) => (
            <NavSection key={section.title} title={section.title}>
              {section.items.map(({ href, icon: Icon, label, badge }) => {
                const isActive =
                  pathname === href || (href !== "/" && pathname?.startsWith(`${href}/`));

                return (
                  <Link
                    key={label}
                    href={href as Route}
                    className={clsx(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                      isActive
                        ? "bg-ink-200 text-ink-900"
                        : "text-ink-500 hover:bg-surface-muted hover:text-ink-700",
                    )}
                    onClick={onClose}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-transparent transition-colors",
                          isActive
                            ? "bg-ink-300/80 text-ink-900"
                            : "bg-surface-muted text-ink-600",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={clsx(isActive ? "text-ink-900" : "text-inherit")}>
                        {label}
                      </span>
                    </span>
                    {badge ? (
                      <span className="ml-auto inline-flex items-center rounded-full bg-ink-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </NavSection>
          ))}

          <NavSection title="Labels">
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
                  return (
                    <button
                      key={label.id}
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
                        className={clsx(
                          "grid h-8 w-8 place-items-center rounded-lg bg-white/10",
                        )}
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
                      {isActive ? (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                          Active
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="px-3 py-2 text-xs text-muted">
                  No labels yet. Create one to organize notes.
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
          </NavSection>
        </div>
      </div>
    </div>
  );
}
