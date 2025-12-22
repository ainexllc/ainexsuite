"use client";

import { useEffect, useState, useMemo } from "react";
import { Lock, Tag, Edit, Calendar, ImagePlus } from "lucide-react";
import { clsx } from "clsx";
import type { JournalEntry, EntryColor } from "@ainexsuite/types";
import { EntryEditorShell } from "@ainexsuite/ui";
import { usePrivacy, PasscodeModal, BlurredContent } from "@ainexsuite/privacy";
import { RichTextViewer } from "@/components/ui/rich-text-viewer";
import { getMoodIcon, getMoodLabel } from "@/lib/utils/mood";
import { formatDate } from "@/lib/utils/date";
import { useBackgrounds } from "@/hooks/use-backgrounds";
import { getBackgroundById, getOverlayClasses, getTextColorClasses, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";

type JournalEntryViewerProps = {
  entry: JournalEntry;
  onClose: () => void;
  onEdit?: () => void;
};

export function JournalEntryViewer({ entry, onClose, onEdit }: JournalEntryViewerProps) {
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode } = usePrivacy();

  // Fetch backgrounds from Firestore
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();

  // Merge Firestore backgrounds with fallbacks
  const availableBackgrounds = useMemo(() => {
    if (firestoreBackgrounds.length > 0) {
      return firestoreBackgrounds;
    }
    return FALLBACK_BACKGROUNDS;
  }, [firestoreBackgrounds]);

  // Get current background object
  const currentBackground = useMemo(() => {
    if (!entry.backgroundImage) return null;
    return getBackgroundById(entry.backgroundImage, availableBackgrounds) || null;
  }, [entry.backgroundImage, availableBackgrounds]);

  // Private entries logic - blur content when private, regardless of passcode setup
  const isLocked = entry.isPrivate && !isUnlocked;

  // Show passcode modal if entry is private and locked
  useEffect(() => {
    if (isLocked) {
      setShowPasscodeModal(true);
    }
  }, [isLocked]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handlePasscodeSubmit = async (passcode: string) => {
    if (hasPasscode) {
      const success = await verifyPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
      }
      return success;
    } else {
      const success = await setupPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
      }
      return success;
    }
  };

  const MoodIcon = entry.mood ? getMoodIcon(entry.mood) : null;

  // Leather cover only shows on cards, not in modal - treat as default for modal styling
  const modalColor = entry.color === 'entry-leather' ? 'default' : (entry.color as EntryColor) || 'default';

  // Main viewer using EntryEditorShell (read-only mode - no change callbacks)
  return (
    <EntryEditorShell
      isOpen={true}
      onClose={onClose}
      color={modalColor}
      backgroundImageUrl={currentBackground?.fullImage || null}
      backgroundOverlayClass={currentBackground ? getOverlayClasses(currentBackground, entry.backgroundOverlay || 'auto') : undefined}
      backgroundBrightness={currentBackground?.brightness || null}
      pinned={entry.pinned || false}
      archived={entry.archived || false}
      titleContent={
        <h1 className={clsx(
          "w-full text-lg font-semibold",
          currentBackground
            ? getTextColorClasses(currentBackground, 'title')
            : "text-zinc-900 dark:text-zinc-50"
        )}>
          {entry.title || "Untitled"}
        </h1>
      }
      toolbarActions={
        <>
          {/* Background indicator */}
          {currentBackground && (
            <div
              className={clsx(
                'h-9 w-9 rounded-full flex items-center justify-center',
                'bg-[var(--color-primary)] text-white'
              )}
              aria-label="Has background image"
              title={currentBackground.name}
            >
              <ImagePlus className="h-4 w-4" />
            </div>
          )}

          {/* Tags indicator */}
          {entry.tags.length > 0 && (
            <div
              className={clsx(
                'h-9 w-9 rounded-full flex items-center justify-center',
                'bg-[var(--color-primary)] text-white'
              )}
              aria-label={`${entry.tags.length} tags`}
            >
              <Tag className="h-4 w-4" />
            </div>
          )}

          {/* Private indicator */}
          {entry.isPrivate && (
            <div
              className={clsx(
                'h-9 w-9 rounded-full flex items-center justify-center',
                'bg-amber-500 text-white'
              )}
              aria-label="Private entry"
            >
              <Lock className="h-4 w-4" />
            </div>
          )}
        </>
      }
      footerExpandedContent={
        <>
          {/* Tags display */}
          {entry.tags.length > 0 && (
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-3 mt-3">
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      }
      footerRightContent={
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
            onClick={onClose}
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Entry
            </button>
          )}
        </div>
      }
    >
      {/* Blurred content when locked - title remains visible */}
      <BlurredContent
        isLocked={isLocked}
        onClick={() => setShowPasscodeModal(true)}
      >
        {/* Metadata row */}
        <div className={clsx(
          "flex flex-wrap items-center gap-4 text-sm mb-4",
          currentBackground
            ? getTextColorClasses(currentBackground, 'muted')
            : "text-zinc-500 dark:text-zinc-400"
        )}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(new Date(entry.createdAt))}</span>
          </div>

          {entry.mood && MoodIcon && (
            <div className={clsx(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
              currentBackground
                ? currentBackground.brightness === 'dark'
                  ? "bg-white/10 border-white/20"
                  : "bg-black/5 border-black/10"
                : "bg-white/5 dark:bg-white/5 border-zinc-200 dark:border-zinc-700"
            )}>
              <MoodIcon className="h-4 w-4" />
              <span>{getMoodLabel(entry.mood)}</span>
            </div>
          )}

          {entry.isDraft && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Draft
            </span>
          )}
        </div>

        {/* Content - images are embedded inline via the rich text editor */}
        <div className={clsx(
          "prose prose-sm sm:prose max-w-none min-h-[300px]",
          currentBackground
            ? currentBackground.brightness === 'dark'
              ? "prose-invert"
              : ""
            : "dark:prose-invert"
        )}>
          <RichTextViewer content={entry.content} />
        </div>
      </BlurredContent>

      {/* Passcode modal for unlocking private entries */}
      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => setShowPasscodeModal(false)}
        onSubmit={handlePasscodeSubmit}
        mode={hasPasscode ? "verify" : "setup"}
        title={hasPasscode ? "Unlock Private Entry" : "Set Privacy Passcode"}
      />
    </EntryEditorShell>
  );
}
