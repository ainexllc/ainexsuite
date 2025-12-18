'use client';

import type { Moment } from '@ainexsuite/types';
import { SectionHeader } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { groupMomentsByDate } from '@/lib/timeline-utils';
import { PhotoGrid } from './photo-grid';

type ViewMode = 'timeline' | 'masonry' | 'calendar';

interface TimelineViewProps {
  moments: Moment[];
  viewMode?: ViewMode;
  onDetail: (moment: Moment) => void;
  onEdit?: (moment: Moment) => void;
}

export function TimelineView({ moments, viewMode = 'timeline', onDetail, onEdit }: TimelineViewProps) {
  const groups = groupMomentsByDate(moments);
  const { primary: primaryColor } = useAppColors();

  // Masonry view: show all moments in a single grid without grouping
  if (viewMode === 'masonry') {
    return (
      <PhotoGrid
        moments={moments}
        onDetail={onDetail}
        onEdit={onEdit}
      />
    );
  }

  // Timeline view: group by date with section headers
  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.id} className="space-y-4">
          <div className="sticky top-16 z-20 bg-surface-base/95 backdrop-blur-sm">
            <SectionHeader
              title={group.title}
              count={`${group.moments.length} photos`}
              variant="large"
              accentColor={primaryColor}
              divider
            />
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
