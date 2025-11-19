'use client';

import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
    <Card className="relative w-full overflow-hidden border-theme-border bg-theme-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-theme-text">On this day</h3>
          <p className="mt-1 text-sm text-theme-text-muted">
            {yearDiff > 0 ? `${yearDiff} year${yearDiff > 1 ? 's' : ''} ago` : 'In the past'}
          </p>
        </div>
        <History className="h-6 w-6 text-[#f97316]/70" />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-theme-text-muted">
            {new Date(entry.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="mt-1 text-base font-semibold text-theme-text line-clamp-1">
            {entry.title || 'Untitled entry'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-theme-text-muted line-clamp-3">
            {plainText(entry.content).slice(0, 150)}...
          </p>
        </div>
        
        <Link
          href={`/workspace/${entry.id}/view`}
          className="inline-flex items-center gap-2 rounded-full border border-theme-border px-4 py-2 text-xs font-semibold text-theme-text transition hover:border-[#f97316]/70 hover:text-[#f97316]"
        >
          Read memory
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
