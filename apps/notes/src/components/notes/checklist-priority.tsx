"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";
import { clsx } from "clsx";

type Priority = "high" | "medium" | "low" | null;

interface ChecklistPriorityPickerProps {
  value: Priority | undefined;
  onChange: (priority: Priority) => void;
  className?: string;
}

const PRIORITY_CONFIG = {
  high: {
    label: "High",
    iconClass: "text-red-500",
    hoverBgClass: "hover:bg-red-500/10",
    selectedBgClass: "bg-red-500/15",
  },
  medium: {
    label: "Medium",
    iconClass: "text-amber-500",
    hoverBgClass: "hover:bg-amber-500/10",
    selectedBgClass: "bg-amber-500/15",
  },
  low: {
    label: "Low",
    iconClass: "text-blue-500",
    hoverBgClass: "hover:bg-blue-500/10",
    selectedBgClass: "bg-blue-500/15",
  },
} as const;

export function ChecklistPriorityPicker({
  value,
  onChange,
  className,
}: ChecklistPriorityPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position and open (show LEFT of button)
  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 120; // Approximate height
      const dropdownWidth = 100;

      // Check if dropdown fits below, otherwise show above
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < dropdownHeight + 20;

      // Position to LEFT of button, check if it fits
      let left = rect.left - dropdownWidth - 8;
      if (left < 10) {
        // Not enough space on left, show to the right
        left = rect.right + 8;
      }

      setDropdownPos({
        top: showAbove ? rect.top - dropdownHeight + rect.height : rect.top,
        left,
      });
    }
    setIsOpen(true);
  };

  // Close on outside click (check both button and portal dropdown)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedButton = containerRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedButton && !clickedDropdown) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Close on significant scroll (since we use fixed positioning)
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    let initialScrollY = window.scrollY;

    function handleScroll() {
      // Only close on significant scroll (more than 50px)
      const scrollDelta = Math.abs(window.scrollY - initialScrollY);
      if (scrollDelta > 50) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      initialScrollY = window.scrollY;
      // Delay adding scroll listener to avoid immediate close from click
      scrollTimeout = setTimeout(() => {
        window.addEventListener("scroll", handleScroll, true);
      }, 100);
      return () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen]);

  const handleSelect = (priority: Priority) => {
    onChange(priority);
    setIsOpen(false);
  };

  const currentPriority = value ? PRIORITY_CONFIG[value] : null;

  return (
    <div ref={containerRef} className={clsx("relative", className)}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
        className={clsx(
          "flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/20",
          currentPriority
            ? "h-5 w-5 opacity-90 hover:opacity-100"
            : "h-5 w-5 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-white/10"
        )}
        title={currentPriority ? `Priority: ${currentPriority.label}` : "Set priority"}
        aria-label={currentPriority ? `Priority: ${currentPriority.label}` : "Set priority"}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Flame
          className={clsx(
            "h-3 w-3",
            currentPriority?.iconClass ?? "text-white/50"
          )}
        />
      </button>

      {/* Dropdown popover - rendered via portal to escape overflow containers */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && dropdownPos && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="fixed z-[9999] min-w-[100px] rounded-lg bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
              role="listbox"
              aria-label="Priority options"
            >
              {/* Priority options */}
              {(["high", "medium", "low"] as const).map((priority) => {
                const config = PRIORITY_CONFIG[priority];
                const isSelected = value === priority;

                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => handleSelect(priority)}
                    className={clsx(
                      "w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors",
                      isSelected
                        ? config.selectedBgClass
                        : config.hoverBgClass
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <Flame
                      className={clsx("h-3.5 w-3.5 flex-shrink-0", config.iconClass)}
                    />
                    <span
                      className={clsx(
                        "text-xs font-medium",
                        isSelected ? "text-white" : "text-white/80"
                      )}
                    >
                      {config.label}
                    </span>
                  </button>
                );
              })}

              {/* None option - only show if there's a value */}
              {value && (
                <>
                  <div className="h-px bg-white/10 mx-2" />
                  <button
                    type="button"
                    onClick={() => handleSelect(null)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors hover:bg-white/10"
                    role="option"
                    aria-selected={false}
                  >
                    <X className="h-3 w-3 text-white/40 flex-shrink-0" />
                    <span className="text-xs font-medium text-white/60">None</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
