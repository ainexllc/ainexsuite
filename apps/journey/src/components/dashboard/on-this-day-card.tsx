'use client';

import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { ThemedPanel } from '@/components/dashboard/themed-panel';
import type { JournalEntry } from '@ainexsuite/types';
import { plainText } from '@/lib/utils/text';
import { DashboardTheme } from '@/lib/dashboard-themes';
import { cn } from '@/lib/utils';

interface OnThisDayCardProps {
  entries: JournalEntry[];
  theme?: DashboardTheme;
}

export function OnThisDayCard({ entries, theme }: OnThisDayCardProps) {
  if (!entries.length) return null;

  // Fallbacks if no theme provided (though it should be)
  const textPrimary = theme?.textPrimary || 'text-white';
  const textSecondary = theme?.textSecondary || 'text-white/60';
  const border = theme?.border || 'border-white/10';
  const bgHover = theme?.bgHover || 'hover:bg-white/10';
  const accent = theme?.accent || 'text-[#f97316]';

  // Take the oldest entry for "On This Day" usually implies looking back
  const entry = entries[0]; 
  const yearDiff = new Date().getFullYear() - new Date(entry.date).getFullYear();

  const ContentWrapper = theme ? ThemedPanel : 'div';
  const wrapperProps = theme ? { theme, className: "p-6" } : { className: "relative w-full overflow-hidden border border-white/10 bg-white/5 p-6 rounded-xl" };

  return (
    // @ts-expect-error - Dynamic component typing is tricky here, but safe
    <ContentWrapper {...wrapperProps}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className={cn("text-lg font-semibold", textPrimary)}>On this day</h3>
          <p className={cn("mt-1 text-sm", textSecondary)}>
            {yearDiff > 0 ? `${yearDiff} year${yearDiff > 1 ? 's' : ''} ago` : 'In the past'}
          </p>
        </div>
        <History className={cn("h-6 w-6 opacity-70", accent)} />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className={cn("text-xs uppercase tracking-wide", textSecondary)}>
            {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className={cn("mt-1 text-base font-semibold line-clamp-1", textPrimary)}>
            {entry.title || 'Untitled entry'}
          </p>
          <p className={cn("mt-2 text-sm leading-relaxed line-clamp-3", textSecondary)}>
            {plainText(entry.content).slice(0, 150)}...
          </p>
        </div>
        
        <Link
          href={`/workspace/${entry.id}/view`}
          className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition", border, textPrimary, bgHover)}
        >
          Read memory
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </ContentWrapper>
  );
}
