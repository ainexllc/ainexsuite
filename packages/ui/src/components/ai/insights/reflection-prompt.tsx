"use client";

import { motion } from "framer-motion";
import { cn } from "../../../lib/utils";
import { Quote, PenLine, Copy, Check } from "lucide-react";
import { useState } from "react";

export interface ReflectionPromptProps {
  /** The reflection prompt text */
  prompt: string;
  /** Callback when Start Entry is clicked */
  onStartEntry?: () => void;
  /** Gradient colors */
  gradient?: { from: string; to: string };
  /** Additional className */
  className?: string;
  /** Animation delay */
  delay?: number;
}

/**
 * ReflectionPrompt - Beautiful quote display with actions
 *
 * Features:
 * - Large quote typography with gradient
 * - Decorative quote marks
 * - Start Entry CTA button
 * - Copy to clipboard action
 */
export function ReflectionPrompt({
  prompt,
  onStartEntry,
  gradient = { from: "#8b5cf6", to: "#6366f1" },
  className,
  delay = 0,
}: ReflectionPromptProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!prompt) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.1, ease: "easeOut" }}
      className={cn("relative", className)}
    >
      {/* Decorative quote mark - top left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 0.5, delay: delay * 0.1 + 0.2 }}
        className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4"
      >
        <Quote
          className="w-8 h-8 sm:w-12 sm:h-12 transform rotate-180"
          style={{ color: gradient.from }}
        />
      </motion.div>

      {/* Prompt text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: delay * 0.1 + 0.1 }}
        className="relative text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed text-white/90 px-4 sm:px-8 py-2"
        style={{
          textShadow: `0 0 40px ${gradient.from}20`,
        }}
      >
        &ldquo;{prompt}&rdquo;
      </motion.p>

      {/* Decorative quote mark - bottom right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 0.5, delay: delay * 0.1 + 0.3 }}
        className="absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4"
      >
        <Quote
          className="w-8 h-8 sm:w-12 sm:h-12"
          style={{ color: gradient.to }}
        />
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: delay * 0.1 + 0.4 }}
        className="flex items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 px-4 sm:px-8"
      >
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
            "text-xs sm:text-sm text-white/60 hover:text-white",
            "bg-white/5 hover:bg-white/10",
            "border border-white/10 hover:border-white/20",
            "transition-all duration-200"
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" style={{ color: gradient.from }} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        {/* Start Entry button */}
        {onStartEntry && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartEntry}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg",
              "text-sm sm:text-base font-semibold text-white",
              "transition-all duration-200",
              "hover:shadow-lg"
            )}
            style={{
              background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              boxShadow: `0 0 20px ${gradient.from}30`,
            }}
          >
            <PenLine className="w-4 h-4" />
            <span>Start Entry</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
