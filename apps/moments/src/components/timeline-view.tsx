'use client';

import type { Moment } from '@ainexsuite/types';
import { groupMomentsByDate } from '@/lib/timeline-utils';
import { PhotoGrid } from './photo-grid';

interface TimelineViewProps {
  moments: Moment[];
  onDetail: (moment: Moment) => void;
  onEdit?: (moment: Moment) => void;
}

export function TimelineView({ moments, onDetail, onEdit }: TimelineViewProps) {
  const groups = groupMomentsByDate(moments);

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.id} className="space-y-4">
          <div className="sticky top-16 z-20 flex items-center gap-4 py-2 bg-surface-base/95 backdrop-blur-sm border-b border-transparent">
            <h3 className="text-xl font-bold text-text-primary">
              {group.title}
            </h3>
            <div className="h-px flex-1 bg-outline-subtle" />
            <span className="text-xs font-medium text-text-muted">
              {group.moments.length} photos
            </span>
          </div>
          
          <PhotoGrid
            moments={group.moments}
            onDetail={onDetail}
            onEdit={onEdit}
          />
        </section>
      ))}
    </div>
  );
}
