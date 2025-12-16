"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { Check, Circle, Sparkles } from "lucide-react";

export interface ActionItemsProps {
  /** Array of action item strings */
  actions: string[];
  /** Storage key for persisting completed state */
  storageKey?: string;
  /** Gradient colors */
  gradient?: { from: string; to: string };
  /** Additional className */
  className?: string;
  /** Animation delay */
  delay?: number;
}

/**
 * ActionItems - Interactive checklist with animations
 *
 * Features:
 * - Click to mark complete with strikethrough
 * - Completion state persisted in localStorage
 * - Celebration animation on complete
 * - Animated entrance
 */
export function ActionItems({
  actions,
  storageKey = "ai-insights-actions",
  gradient = { from: "#f59e0b", to: "#ec4899" },
  className,
  delay = 0,
}: ActionItemsProps) {
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const [celebratingIndex, setCelebratingIndex] = useState<number | null>(null);

  // Load completed state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCompletedItems(new Set(parsed));
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [storageKey]);

  // Save completed state to localStorage
  const toggleItem = (index: number) => {
    setCompletedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
        // Trigger celebration
        setCelebratingIndex(index);
        setTimeout(() => setCelebratingIndex(null), 1000);
      }

      // Persist to localStorage
      if (typeof window !== "undefined" && storageKey) {
        localStorage.setItem(storageKey, JSON.stringify([...newSet]));
      }

      return newSet;
    });
  };

  if (!actions || actions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay * 0.1 }}
      className={cn("space-y-2", className)}
    >
      {actions.map((action, index) => {
        const isCompleted = completedItems.has(index);
        const isCelebrating = celebratingIndex === index;

        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: delay * 0.1 + index * 0.1,
            }}
            onClick={() => toggleItem(index)}
            className={cn(
              "relative w-full flex items-start gap-3 p-3 rounded-lg",
              "text-left transition-all duration-300",
              "hover:bg-white/5",
              isCompleted ? "opacity-60" : "opacity-100"
            )}
          >
            {/* Checkbox */}
            <div className="relative flex-shrink-0 mt-0.5">
              <motion.div
                animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  "transition-all duration-300",
                  isCompleted
                    ? "border-transparent"
                    : "border-white/30 hover:border-white/50"
                )}
                style={{
                  background: isCompleted
                    ? `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`
                    : "transparent",
                  boxShadow: isCompleted
                    ? `0 0 10px ${gradient.from}50`
                    : "none",
                }}
              >
                <AnimatePresence>
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  ) : (
                    <Circle className="w-3 h-3 text-white/30" />
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Celebration sparkles */}
              <AnimatePresence>
                {isCelebrating && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          opacity: 1,
                          scale: 0,
                          x: 0,
                          y: 0,
                        }}
                        animate={{
                          opacity: 0,
                          scale: 1,
                          x: (Math.random() - 0.5) * 40,
                          y: (Math.random() - 0.5) * 40,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="absolute top-1/2 left-1/2"
                      >
                        <Sparkles
                          className="w-3 h-3"
                          style={{ color: gradient.from }}
                        />
                      </motion.div>
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Action text */}
            <span
              className={cn(
                "text-sm sm:text-base text-white/90 transition-all duration-300",
                isCompleted && "line-through text-white/50"
              )}
            >
              {action}
            </span>

            {/* Background glow on hover */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, ${gradient.from}10 0%, transparent 100%)`,
              }}
            />
          </motion.button>
        );
      })}
    </motion.div>
  );
}
