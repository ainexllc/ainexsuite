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
  /** Content to show when labels/share panel is expanded in footer */
  footerExpandedContent?: ReactNode;
  /** Custom content for right side of footer (replaces default Cancel/Save) */
  footerRightContent?: ReactNode;
  /** Save button text */
  saveText?: string;
  /** Cancel button text */
  cancelText?: string;
}

export function EntryEditorShell({
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  hideFooter = false,
  color = 'default',
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
  footerExpandedContent,
  footerRightContent,
  saveText = 'Save',
  cancelText = 'Cancel',
}: EntryEditorShellProps) {
  const [showPalette, setShowPalette] = useState(false);

  // Get color configuration
  const colorConfig = getEntryColorConfig(color);

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          'relative w-full max-w-4xl h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] max-h-[900px] flex flex-col rounded-2xl border shadow-2xl',
          colorConfig.cardClass,
          'border-zinc-200 dark:border-zinc-800'
        )}
      >
        {/* Header actions - right side */}
        <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
          {/* Reminder button */}
          {onReminderClick && (
            <button
              type="button"
              className={clsx(
                'h-9 w-9 rounded-full flex items-center justify-center transition',
                isReminderPanelOpen
                  ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                  : reminderEnabled
                    ? 'text-[var(--color-primary)]'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200'
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
                pinned
                  ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200'
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
            className="h-10 w-10 rounded-full flex items-center justify-center transition bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main content area - pt-16 to clear absolute header buttons, pb-6 for bottom breathing room */}
        <div className="flex flex-col gap-4 px-6 pt-16 pb-6 flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Bottom toolbar - conditionally rendered */}
        {!hideFooter && (
          <div
            className={clsx(
              'flex-shrink-0 mt-auto rounded-b-2xl px-4 sm:px-6 py-3 sm:py-4 border-t border-zinc-200 dark:border-zinc-700/50',
              colorConfig.footerClass
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
                        showPalette
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
                      archived
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700'
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
                    className="rounded-full border px-4 py-1.5 text-sm font-medium transition border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-500"
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
