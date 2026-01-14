"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, X } from "lucide-react";
import { clsx } from "clsx";

// Toggle button for showing/hiding details
export interface DetailsToggleButtonProps {
  hasNotes: boolean;
  expanded: boolean;
  onClick: () => void;
}

export function DetailsToggleButton({
  hasNotes,
  expanded,
  onClick,
}: DetailsToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        "flex h-5 w-5 items-center justify-center rounded transition-all",
        "hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60",
        // Show always if has notes, otherwise only on group-hover
        hasNotes
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-60 hover:!opacity-100",
        // Highlight if has notes
        hasNotes && !expanded && "text-[var(--color-primary)]"
      )}
      aria-label={expanded ? "Hide notes" : "Show notes"}
      title={hasNotes ? "View notes" : "Add notes"}
    >
      {hasNotes ? (
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3 w-3" />
        </motion.div>
      ) : (
        <FileText className="h-3 w-3" />
      )}
    </button>
  );
}

// Expandable details panel
export interface ChecklistItemDetailsProps {
  notes: string | null | undefined;
  expanded: boolean;
  onNotesChange: (notes: string) => void;
  onToggleExpanded: () => void;
  placeholder?: string;
}

export function ChecklistItemDetails({
  notes,
  expanded,
  onNotesChange,
  onToggleExpanded,
  placeholder = "Add notes or details...",
}: ChecklistItemDetailsProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to calculate proper scrollHeight
    textarea.style.height = "auto";
    // Set to scrollHeight with a minimum
    const minHeight = 48; // ~2 rows
    const maxHeight = 200;
    const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, []);

  // Adjust height when notes change or panel expands
  useEffect(() => {
    if (expanded) {
      adjustTextareaHeight();
    }
  }, [expanded, notes, adjustTextareaHeight]);

  // Focus textarea when expanded
  useEffect(() => {
    if (expanded && textareaRef.current) {
      // Small delay to allow animation to start
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [expanded]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onNotesChange(e.target.value);
    adjustTextareaHeight();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNotesChange("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape to close
    if (e.key === "Escape") {
      e.preventDefault();
      onToggleExpanded();
    }
    // Prevent Enter from bubbling to checklist item (which creates new items)
    if (e.key === "Enter" && !e.shiftKey) {
      e.stopPropagation();
    }
  };

  const hasContent = Boolean(notes?.trim());

  return (
    <AnimatePresence initial={false}>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.2, ease: "easeOut" },
            opacity: { duration: 0.15, ease: "easeOut" },
          }}
          className="overflow-hidden"
        >
          <div className="relative mt-1.5 ml-7">
            {/* Subtle connecting line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />

            <div className="relative pl-3">
              <textarea
                ref={textareaRef}
                value={notes ?? ""}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={2}
                className={clsx(
                  "w-full resize-none rounded-md px-2.5 py-2 text-sm",
                  "bg-zinc-50/80 dark:bg-zinc-800/50",
                  "border border-zinc-200/60 dark:border-zinc-700/60",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                  "focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]/40",
                  "transition-colors"
                )}
                style={{ minHeight: "48px" }}
              />

              {/* Clear button - only show when there's content */}
              {hasContent && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClear}
                  className={clsx(
                    "absolute right-2 top-2",
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    "bg-zinc-200/80 dark:bg-zinc-700/80",
                    "text-zinc-500 dark:text-zinc-400",
                    "hover:bg-zinc-300 dark:hover:bg-zinc-600",
                    "hover:text-zinc-700 dark:hover:text-zinc-200",
                    "transition-colors"
                  )}
                  title="Clear notes"
                  aria-label="Clear notes"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </div>

            {/* Helper text */}
            <p className="mt-1 pl-3 text-[10px] text-zinc-400 dark:text-zinc-500">
              Press Escape to close
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
