'use client';

import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import type { JournalEntry } from '@ainexsuite/types';
import { plainText } from '@/lib/utils/text';

interface OnThisDayCardProps {
  entries: JournalEntry[];
}

export function OnThisDayCard({ entries }: OnThisDayCardProps) {
  if (!entries.length) return null;

  // Take the oldest entry for "On This Day" usually implies looking back
  const entry = entries[0];
  const yearDiff = new Date().getFullYear() - new Date(entry.date).getFullYear();

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">On this day</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {yearDiff > 0 ? `${yearDiff} year${yearDiff > 1 ? 's' : ''} ago` : 'In the past'}
          </p>
        </div>
        <History className="h-6 w-6 text-primary opacity-70" />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="mt-1 text-base font-semibold text-foreground line-clamp-1">
            {entry.title || 'Untitled entry'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {plainText(entry.content).slice(0, 150)}...
          </p>
        </div>

        <Link
          href={`/workspace/${entry.id}/view`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
        >
          Read memory
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
