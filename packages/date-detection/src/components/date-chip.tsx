'use client';

import { Calendar, Check, Loader2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import type { DateChipProps } from '../types';
import { formatDateForChip } from '../lib/utils';
import { describeParsedDate } from '../lib/parser';

/**
 * A clickable chip/badge that displays a detected date
 * and allows adding it to the calendar.
 *
 * @example
 * ```tsx
 * <DateChip
 *   detectedDate={date}
 *   onClick={handleAddToCalendar}
 *   loading={isAdding}
 *   added={wasAdded}
 * />
 * ```
 */
export function DateChip({
  detectedDate,
  onClick,
  loading = false,
  added = false,
  className,
}: DateChipProps) {
  const formattedDate = formatDateForChip(detectedDate);
  const fullDescription = describeParsedDate(detectedDate);

  const handleClick = () => {
    if (!loading && !added && onClick) {
      onClick(detectedDate);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || added}
      title={added ? 'Added to calendar' : `Add "${fullDescription}" to calendar`}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
        'whitespace-nowrap flex-shrink-0',
        added
          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 cursor-default'
          : loading
          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 cursor-wait'
          : 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/30 hover:border-cyan-500/50 active:scale-95 cursor-pointer',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : added ? (
        <Check className="w-3 h-3" />
      ) : (
        <Calendar className="w-3 h-3" />
      )}
      <span>{formattedDate}</span>
      {!loading && !added && <Plus className="w-3 h-3 opacity-60" />}
    </button>
  );
}
