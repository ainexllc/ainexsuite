'use client';

import { ReactNode, useState } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import {
  X,
  Pin,
  PinOff,
  Archive,
  Palette,
  Share2,
  BellRing,
} from 'lucide-react';
import { ENTRY_COLORS, getEntryColorConfig } from '../../constants/entry-colors';
import type { EntryColor } from '@ainexsuite/types';

export interface EntryEditorShellProps {
  /** Whether the editor modal is open */
  isOpen: boolean;
  /** Callback to close the editor */
  onClose: () => void;
  /** Callback to save the entry (optional if content has own save) */
  onSave?: () => void;
  /** Whether save is in progress */
  isSaving?: boolean;
  /** Hide the footer entirely (useful when content has its own buttons) */
  hideFooter?: boolean;
  /** Entry color for theming */
  color?: EntryColor;
  /** Background image URL (full image, not thumbnail) */
  backgroundImageUrl?: string | null;
  /** CSS classes for the background overlay */
  backgroundOverlayClass?: string;
  /** Background brightness for adaptive text colors */
  backgroundBrightness?: 'light' | 'dark' | null;
  /** Callback when color changes */
  onColorChange?: (color: EntryColor) => void;
  /** Whether the entry is pinned */
  pinned?: boolean;
  /** Callback when pin state changes */
  onPinChange?: (pinned: boolean) => void;
  /** Whether the entry is archived */
  archived?: boolean;
  /** Callback when archive state changes */
  onArchiveChange?: (archived: boolean) => void;
  /** Share count to display (if sharing is enabled) */
  shareCount?: number;
  /** Callback when share button is clicked */
  onShareClick?: () => void;
  /** Whether share panel is open */
  isSharePanelOpen?: boolean;
  /** Whether reminder is enabled */
  reminderEnabled?: boolean;
  /** Callback when reminder button is clicked */
  onReminderClick?: () => void;
  /** Whether reminder panel is open */
  isReminderPanelOpen?: boolean;
  /** Main content of the editor */
  children: ReactNode;
  /** Additional toolbar actions (left side of footer) */
  toolbarActions?: ReactNode;
  /** Additional header actions (before pin button) */
  headerActions?: ReactNode;
  /** Title content to render in header (left side, same row as pin) */
  titleContent?: ReactNode;
  /** Content to show when labels/share panel is expanded in footer */
  footerExpandedContent?: ReactNode;
  /** Custom content for right side of footer (replaces default Cancel/Save) */
  footerRightContent?: ReactNode;
  /** Save button text */
  saveText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Hide the header actions (pin, close, etc) - useful when content has inline controls */
  hideHeaderActions?: boolean;
}

// Helper to get adaptive button classes based on background brightness
function getAdaptiveHeaderButtonClass(
  brightness: 'light' | 'dark' | null | undefined,
  isActive?: boolean
): string {
  if (brightness === 'dark') {
    return isActive
      ? 'bg-white/20 text-white'
      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white';
  }
  if (brightness === 'light') {
    return isActive
      ? 'bg-black/15 text-zinc-900'
      : 'bg-black/5 text-zinc-700 hover:bg-black/10 hover:text-zinc-900';
  }
  // No background - standard theme-aware
  return isActive
    ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200';
}

function getAdaptiveFooterClass(brightness: 'light' | 'dark' | null | undefined): string {
  if (brightness === 'dark') {
    return 'bg-black/30 backdrop-blur-sm border-white/10';
  }
  if (brightness === 'light') {
    return 'bg-white/50 backdrop-blur-sm border-black/10';
  }
  return ''; // Use colorConfig.footerClass for no background
}

function getAdaptiveToolbarButtonClass(
  brightness: 'light' | 'dark' | null | undefined,
  isActive?: boolean
): string {
  if (brightness === 'dark') {
    return isActive
      ? 'bg-white/25 text-white'
      : 'text-white/70 hover:text-white hover:bg-white/15';
  }
  if (brightness === 'light') {
    return isActive
      ? 'bg-black/15 text-zinc-900'
      : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/10';
  }
  // No background - standard theme-aware
  return isActive
    ? 'bg-[var(--color-primary)] text-white'
    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700';
}

export function EntryEditorShell({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  hideFooter = false,
  color = 'default',
  backgroundImageUrl,
  backgroundOverlayClass,
  backgroundBrightness,
  onColorChange,
  pinned = false,
  onPinChange,
  archived = false,
  onArchiveChange,
  shareCount,
  onShareClick,
  isSharePanelOpen = false,
  reminderEnabled = false,
  onReminderClick,
  isReminderPanelOpen = false,
  children,
  toolbarActions,
  headerActions,
  titleContent,
  footerExpandedContent,
  footerRightContent,
  saveText = 'Save',
  cancelText = 'Cancel',
  hideHeaderActions = false,
}: EntryEditorShellProps) {
  const [showPalette, setShowPalette] = useState(false);

  // Get color configuration
  const colorConfig = getEntryColorConfig(color);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6"
      onMouseDown={(e) => {
        // Only close if clicking directly on the backdrop, not when dragging from inside
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={clsx(
          'relative isolate w-full max-w-4xl h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] max-h-[900px] flex flex-col rounded-2xl border shadow-2xl transition-colors duration-200 overflow-hidden',
          !backgroundImageUrl && colorConfig.cardClass,
          'border-zinc-200 dark:border-zinc-800'
        )}
      >
        {/* Background image layer */}
        {backgroundImageUrl && (
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `url(${backgroundImageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay for text readability */}
            <div className={clsx(backgroundOverlayClass, 'z-10')} />
          </div>
        )}
        {/* Header row - title on left, actions on right */}
        <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-2 flex-shrink-0">
          {/* Title content slot */}
          {titleContent && (
            <div className="flex-1 min-w-0 min-h-[40px] flex items-center">
              {titleContent}
            </div>
          )}

          {/* Header actions - right side */}
          {!hideHeaderActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Reminder button */}
            {onReminderClick && (
              <button
                type="button"
                className={clsx(
                  'h-9 w-9 rounded-full flex items-center justify-center transition',
                  getAdaptiveHeaderButtonClass(backgroundBrightness, isReminderPanelOpen || reminderEnabled)
                )}
                onClick={onReminderClick}
                aria-label="Set reminder"
              >
                <BellRing
                  className={clsx('h-4 w-4', reminderEnabled && 'fill-current')}
                />
              </button>
            )}

            {/* Share button */}
            {onShareClick && (
              <button
                type="button"
                onClick={onShareClick}
                className={clsx(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  isSharePanelOpen
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                    : backgroundBrightness === 'dark'
                      ? 'border-white/30 text-white/80 hover:border-white/50 hover:text-white'
                      : backgroundBrightness === 'light'
                        ? 'border-black/20 text-zinc-700 hover:border-black/30 hover:text-zinc-900'
                        : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500'
                )}
                aria-expanded={isSharePanelOpen}
              >
                <Share2 className="h-3.5 w-3.5" />
                {shareCount ? `${shareCount} shared` : 'Share'}
              </button>
            )}

            {/* Additional header actions slot */}
            {headerActions}

            {/* Pin button */}
            {onPinChange && (
              <button
                type="button"
                onClick={() => onPinChange(!pinned)}
                className={clsx(
                  'h-9 w-9 rounded-full flex items-center justify-center transition',
                  getAdaptiveHeaderButtonClass(backgroundBrightness, pinned)
                )}
                aria-label={pinned ? 'Unpin' : 'Pin'}
              >
                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                'h-10 w-10 rounded-full flex items-center justify-center transition',
                getAdaptiveHeaderButtonClass(backgroundBrightness, false)
              )}
              aria-label="Close editor"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex flex-col gap-4 px-6 pb-6 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Bottom toolbar - conditionally rendered */}
        {!hideFooter && (
          <div
            className={clsx(
              'flex-shrink-0 mt-auto rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t transition-colors duration-200',
              backgroundBrightness
                ? getAdaptiveFooterClass(backgroundBrightness)
                : clsx('border-zinc-200 dark:border-zinc-700/50', colorConfig.footerClass)
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Left side - toolbar actions */}
              <div className="flex items-center gap-2">
                {/* Color picker */}
                {onColorChange && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPalette((prev) => !prev)}
                      className={clsx(
                        'h-9 w-9 rounded-full flex items-center justify-center transition',
                        getAdaptiveToolbarButtonClass(backgroundBrightness, showPalette)
                      )}
                      aria-label="Change color"
                    >
                      <Palette className="h-4 w-4" />
                    </button>
                    {showPalette && (
                      <div className="absolute bottom-12 left-1/2 z-30 flex flex-row flex-nowrap items-center -translate-x-1/2 gap-2 rounded-2xl p-3 shadow-2xl backdrop-blur-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                        {ENTRY_COLORS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              onColorChange(option.id);
                              setShowPalette(false);
                            }}
                            className={clsx(
                              'inline-flex shrink-0 h-8 w-8 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]',
                              option.swatchClass,
                              option.id === color && 'ring-2 ring-[var(--color-primary)]'
                            )}
                            aria-label={`Set color ${option.label}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Archive button */}
                {onArchiveChange && (
                  <button
                    type="button"
                    className={clsx(
                      'h-9 w-9 rounded-full flex items-center justify-center transition',
                      getAdaptiveToolbarButtonClass(backgroundBrightness, archived)
                    )}
                    onClick={() => onArchiveChange(!archived)}
                    aria-label={archived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                )}

                {/* Additional toolbar actions slot */}
                {toolbarActions}
              </div>

              {/* Right side - Custom content or Cancel/Save buttons */}
              {footerRightContent ? (
                footerRightContent
              ) : onSave ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={clsx(
                      "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                      backgroundBrightness === 'dark'
                        ? 'border-white/30 text-white/80 hover:border-white/50 hover:text-white'
                        : backgroundBrightness === 'light'
                          ? 'border-black/20 text-zinc-700 hover:border-black/30 hover:text-zinc-900'
                          : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500'
                    )}
                    onClick={onClose}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    onClick={onSave}
                    className="rounded-full bg-[var(--color-primary)] px-5 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--color-primary)]/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-60"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving…' : saveText}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Expanded footer content (labels, etc.) */}
            {footerExpandedContent}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
