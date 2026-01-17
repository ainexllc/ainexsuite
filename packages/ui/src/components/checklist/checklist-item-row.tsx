"use client";

import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { AnimatedCheckbox } from "./animated-checkbox";
import type { ChecklistItem } from "@ainexsuite/types";

// Constants
const INDENT_WIDTH = 18; // Pixels per indent level
const MAX_INDENT_LEVEL = 3;

export interface ChecklistItemRowProps {
  /** The checklist item data */
  item: ChecklistItem;
  /** Index of this item in the list */
  index: number;
  /** Whether this item is currently being dragged */
  isDragging: boolean;
  /** Whether this is the drag overlay (clone shown while dragging) */
  isOverlay: boolean;
  /** Callback when item completion is toggled */
  onToggle: (id: string, completed: boolean) => void;
  /** Callback when item text changes */
  onTextChange: (id: string, text: string) => void;
  /** Callback when item is deleted */
  onDelete: (id: string) => void;
  /** Callback for keyboard events on the input */
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, id: string, index: number) => void;
  /** Callback when collapse/expand toggle is clicked (for parent items) */
  onCollapseToggle: (id: string) => void;
  /** Whether this item has children */
  hasChildren: boolean;
  /** Stats for children completion */
  childrenStats: { completed: number; total: number } | null;
  /** Ref to the text input for focus management */
  inputRef: React.RefObject<HTMLInputElement | null>;
  /** Placeholder text for empty input */
  placeholder?: string;
  /** Callback for bulk toggle (Shift+Click on checkbox) */
  onBulkToggle?: (id: string, index: number) => void;
  /** Number of items in the subtree (shown while dragging) */
  subtreeCount?: number;
  /** Disable drag functionality */
  disableDrag?: boolean;
}

// Animation variants
const itemVariants = {
  initial: {
    opacity: 0,
    y: -8,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

// Strikethrough animation for completed items
const textVariants = {
  incomplete: {
    opacity: 1,
    textDecoration: "none",
  },
  completed: {
    opacity: 0.5,
    textDecoration: "line-through",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

/**
 * ChecklistItemRow - A single row in a checklist with drag-and-drop support
 *
 * Features:
 * - Drag handle with @dnd-kit/sortable
 * - Animated checkbox
 * - Nested indentation (up to 3 levels)
 * - Collapse/expand for parent items
 * - Progress badge for children
 * - Delete button on hover
 * - Keyboard navigation support
 * - Bulk toggle with Shift+Click
 *
 * @example
 * ```tsx
 * <DndContext>
 *   <SortableContext items={items.map(i => i.id)}>
 *     {items.map((item, index) => (
 *       <ChecklistItemRow
 *         key={item.id}
 *         item={item}
 *         index={index}
 *         // ...other props
 *       />
 *     ))}
 *   </SortableContext>
 * </DndContext>
 * ```
 */
export const ChecklistItemRow = forwardRef<HTMLDivElement, ChecklistItemRowProps>(
  function ChecklistItemRow(
    {
      item,
      index,
      isDragging,
      isOverlay,
      onToggle,
      onTextChange,
      onDelete,
      onKeyDown,
      onCollapseToggle,
      hasChildren,
      childrenStats,
      inputRef,
      placeholder = "Add item...",
      onBulkToggle,
      subtreeCount = 0,
      disableDrag = false,
    },
    ref
  ) {
    const indentLevel = Math.min(item.indent ?? 0, MAX_INDENT_LEVEL);

    // Sortable hook for drag-and-drop
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isSortableDragging,
    } = useSortable({ id: item.id, disabled: disableDrag });

    // Combine refs
    const combinedRef = (node: HTMLDivElement | null) => {
      setNodeRef(node);
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Style for drag transform
    const sortableStyle = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    // Handle checkbox click with bulk toggle support
    const handleCheckboxClick = (e: React.MouseEvent) => {
      if (e.shiftKey && hasChildren && onBulkToggle) {
        e.preventDefault();
        onBulkToggle(item.id, index);
      }
    };

    // Handle checkbox change
    const handleCheckboxChange = (checked: boolean) => {
      onToggle(item.id, checked);
    };

    // Handle text input change
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onTextChange(item.id, e.target.value);
    };

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown(e, item.id, index);
    };

    // Handle delete click
    const handleDelete = () => {
      onDelete(item.id);
    };

    // Handle collapse toggle
    const handleCollapseToggle = () => {
      onCollapseToggle(item.id);
    };

    // Base content (shared between regular and overlay)
    const content = (
      <>
        {/* Left border accent for nested items */}
        {indentLevel > 0 && (
          <motion.div
            className="absolute top-0 bottom-0 rounded-full"
            style={{
              left: "4px",
              width: "2px",
              backgroundColor: "var(--color-primary)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}

        {/* Indentation spacer */}
        <div
          style={{ width: `${indentLevel * INDENT_WIDTH}px` }}
          className="flex-shrink-0"
        />

        {/* Drag handle */}
        {!disableDrag && (
          <button
            type="button"
            className="cursor-grab touch-none opacity-0 group-hover:opacity-50 hover:!opacity-80 transition-opacity flex-shrink-0"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-3 w-3 text-zinc-400" />
          </button>
        )}

        {/* Collapse/expand button for parent items */}
        {hasChildren ? (
          <button
            type="button"
            onClick={handleCollapseToggle}
            className="h-3.5 w-3.5 flex items-center justify-center flex-shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label={item.collapsed ? "Expand children" : "Collapse children"}
          >
            <motion.div
              animate={{ rotate: item.collapsed ? 0 : 90 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <ChevronRight className="h-3 w-3" />
            </motion.div>
          </button>
        ) : (
          <div className="w-3.5 flex-shrink-0" />
        )}

        {/* Animated Checkbox */}
        <AnimatedCheckbox
          checked={item.completed}
          onChange={handleCheckboxChange}
          onClick={handleCheckboxClick}
        />

        {/* Text input with animated strikethrough */}
        <motion.input
          value={item.text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          ref={inputRef}
          variants={textVariants}
          animate={item.completed ? "completed" : "incomplete"}
          className={cn(
            "flex-1 bg-transparent text-sm leading-relaxed placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none transition-colors",
            item.completed
              ? "text-zinc-400 dark:text-zinc-500 line-through decoration-zinc-300 dark:decoration-zinc-600"
              : "text-zinc-700 dark:text-zinc-300"
          )}
        />

        {/* Progress badge for parent items */}
        <AnimatePresence mode="wait">
          {childrenStats && childrenStats.total > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded"
            >
              {childrenStats.completed}/{childrenStats.total}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Delete button */}
        <button
          type="button"
          className="opacity-0 transition-opacity group-hover:opacity-60 hover:!opacity-100"
          onClick={handleDelete}
          aria-label="Remove checklist item"
        >
          <X className="h-3.5 w-3.5 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors" />
        </button>

        {/* Subtree count indicator while dragging */}
        <AnimatePresence>
          {(isDragging || isSortableDragging) && subtreeCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="ml-1 text-[9px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded-full"
            >
              +{subtreeCount}
            </motion.span>
          )}
        </AnimatePresence>
      </>
    );

    // Overlay version (used in DragOverlay)
    if (isOverlay) {
      return (
        <div
          ref={ref}
          className="group relative flex items-center gap-1 py-px bg-white dark:bg-zinc-900 shadow-lg rounded-md px-2"
          style={{ opacity: 0.9 }}
        >
          {content}
        </div>
      );
    }

    // Regular sortable version with animations
    return (
      <motion.div
        ref={combinedRef}
        layoutId={item.id}
        variants={itemVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={sortableStyle}
        className={cn(
          "group relative flex items-center gap-1 py-px",
          (isDragging || isSortableDragging) && "opacity-50"
        )}
      >
        {content}
      </motion.div>
    );
  }
);

ChecklistItemRow.displayName = "ChecklistItemRow";

export default ChecklistItemRow;
