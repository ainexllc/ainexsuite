"use client";

import { useMemo, useState } from "react";
import { FileText, Loader2, GripVertical } from "lucide-react";
import Masonry from "react-masonry-css";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { NoteCard } from "@/components/notes/note-card";
import { ColumnSelector } from "@/components/notes/column-selector";
import { useNotes } from "@/components/providers/notes-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { clsx } from "clsx";
import type { Note } from "@/lib/types/note";

const SKELETON_BREAKPOINTS = { default: 2, 640: 1 };

function NotesSkeleton() {
  return (
    <Masonry
      breakpointCols={SKELETON_BREAKPOINTS}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-40 rounded-3xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </Masonry>
  );
}

// Sortable wrapper for drag-and-drop
function SortableNoteCard({ note }: { note: Note }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx("mb-4 relative group/sortable", isDragging && "shadow-2xl")}
    >
      {/* Drag handle - transparent overlay at far left border */}
      <button
        type="button"
        className={clsx(
          "absolute left-0 top-0 bottom-0 z-50",
          "w-[10px] flex items-center justify-center",
          "rounded-l-2xl bg-zinc-500/15 dark:bg-zinc-400/15",
          "opacity-0 group-hover/sortable:opacity-100 transition-opacity",
          "cursor-grab active:cursor-grabbing",
          "hover:bg-zinc-500/30 dark:hover:bg-zinc-400/30"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-zinc-600/40 dark:text-zinc-300/40" />
      </button>
      <NoteCard note={note} />
    </div>
  );
}

export function NoteBoard() {
  const {
    pinned,
    displayedOthers,
    loading,
    notes,
    searchQuery,
    hasMore,
    isLoadingMore,
    totalCount,
    sentinelRef,
    reorderNotes,
  } = useNotes();
  const { preferences } = usePreferences();

  // Track local order for optimistic updates during drag
  const [localPinnedOrder, setLocalPinnedOrder] = useState<string[] | null>(null);
  const [localOthersOrder, setLocalOthersOrder] = useState<string[] | null>(null);

  // Drag sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Separate breakpoints for Favorites and Library sections
  const focusBreakpoints = useMemo(() => ({
    default: preferences.focusColumns || 2,
    640: 1,
  }), [preferences.focusColumns]);

  const libraryBreakpoints = useMemo(() => ({
    default: preferences.libraryColumns || 2,
    640: 1,
  }), [preferences.libraryColumns]);

  // Use pinned and displayedOthers directly - they're already sorted by the provider
  // Only apply local order overrides during drag operations
  const sortedPinned = useMemo(() => {
    if (localPinnedOrder) {
      // Apply local order for optimistic update
      const orderMap = new Map(localPinnedOrder.map((id, idx) => [id, idx]));
      return [...pinned].sort((a, b) => {
        const aIdx = orderMap.get(a.id) ?? 999;
        const bIdx = orderMap.get(b.id) ?? 999;
        return aIdx - bIdx;
      });
    }
    return pinned;
  }, [pinned, localPinnedOrder]);

  const sortedOthers = useMemo(() => {
    if (localOthersOrder) {
      // Apply local order for optimistic update
      const orderMap = new Map(localOthersOrder.map((id, idx) => [id, idx]));
      return [...displayedOthers].sort((a, b) => {
        const aIdx = orderMap.get(a.id) ?? 999;
        const bIdx = orderMap.get(b.id) ?? 999;
        return aIdx - bIdx;
      });
    }
    return displayedOthers;
  }, [displayedOthers, localOthersOrder]);

  const hasNotes = useMemo(() => sortedPinned.length + sortedOthers.length > 0, [sortedPinned, sortedOthers]);

  // Handle drag end for favorites
  const handlePinnedDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedPinned.findIndex((n) => n.id === active.id);
    const newIndex = sortedPinned.findIndex((n) => n.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(sortedPinned.map((n) => n.id), oldIndex, newIndex);
      setLocalPinnedOrder(newOrder);
      await reorderNotes(newOrder, true);
      setLocalPinnedOrder(null); // Clear after save
    }
  };

  // Handle drag end for library
  const handleOthersDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedOthers.findIndex((n) => n.id === active.id);
    const newIndex = sortedOthers.findIndex((n) => n.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(sortedOthers.map((n) => n.id), oldIndex, newIndex);
      setLocalOthersOrder(newOrder);
      await reorderNotes(newOrder, false);
      setLocalOthersOrder(null); // Clear after save
    }
  };

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {loading ? (
        <NotesSkeleton />
      ) : hasNotes ? (
        <div className="space-y-4">
          {sortedPinned.length ? (
            <ListSection
              title="Favorites"
              count={sortedPinned.length}
              action={<ColumnSelector section="focus" />}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePinnedDragEnd}
              >
                <SortableContext
                  items={sortedPinned.map((n) => n.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Masonry
                    breakpointCols={focusBreakpoints}
                    className="flex -ml-4 w-auto"
                    columnClassName="pl-4 bg-clip-padding"
                  >
                    {sortedPinned.map((note) => (
                      <SortableNoteCard key={note.id} note={note} />
                    ))}
                  </Masonry>
                </SortableContext>
              </DndContext>
            </ListSection>
          ) : null}

          {/* Hero Divider - only shown when both Favorites and Library have notes */}
          {sortedPinned.length > 0 && sortedOthers.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 py-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-950">
                  All Notes
                </span>
              </div>
            </div>
          )}

          {sortedOthers.length ? (
            <ListSection
              title={sortedPinned.length > 0 ? "" : "All Notes"}
              count={sortedPinned.length ? totalCount : undefined}
              action={<ColumnSelector section="library" />}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleOthersDragEnd}
              >
                <SortableContext
                  items={sortedOthers.map((n) => n.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Masonry
                    breakpointCols={libraryBreakpoints}
                    className="flex -ml-4 w-auto"
                    columnClassName="pl-4 bg-clip-padding"
                  >
                    {sortedOthers.map((note) => (
                      <SortableNoteCard key={note.id} note={note} />
                    ))}
                  </Masonry>
                </SortableContext>
              </DndContext>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" aria-hidden="true" />

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading more notes...</span>
                </div>
              )}

              {/* End of notes indicator */}
              {!loading && !isLoadingMore && !hasMore && totalCount > 0 && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-xs text-muted-foreground">
                    {totalCount} {totalCount === 1 ? 'note' : 'notes'}
                  </span>
                </div>
              )}
            </ListSection>
          ) : null}
        </div>
      ) : notes.length === 0 && searchQuery.trim() ? (
        <EmptyState
          title="No notes found"
          description="Try a different keyword or remove filters to see more notes."
          icon={FileText}
          variant="default"
        />
      ) : (
        <EmptyState
          title="Notes you add will appear here"
          description="Create text notes, checklists, and attach images. Pin important items to keep them at the top."
          icon={FileText}
          variant="default"
        />
      )}
    </div>
  );
}
