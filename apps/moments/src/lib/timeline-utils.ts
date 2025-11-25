import type { Moment } from '@ainexsuite/types';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';

export interface TimelineGroup {
  id: string;
  title: string;
  date: number;
  moments: Moment[];
}

export function groupMomentsByDate(moments: Moment[]): TimelineGroup[] {
  const groups: TimelineGroup[] = [];
  
  if (moments.length === 0) return groups;

  // Sort moments by date descending (newest first)
  const sorted = [...moments].sort((a, b) => b.date - a.date);

  let currentGroup: TimelineGroup | null = null;

  sorted.forEach((moment) => {
    const momentDate = new Date(moment.date);
    let groupTitle = '';

    if (isToday(momentDate)) {
      groupTitle = 'Today';
    } else if (isYesterday(momentDate)) {
      groupTitle = 'Yesterday';
    } else {
      groupTitle = format(momentDate, 'MMMM d, yyyy');
    }

    // If grouping by just date string
    // Check if we can add to current group
    if (currentGroup && isSameDay(new Date(currentGroup.date), momentDate)) {
      currentGroup.moments.push(moment);
    } else {
      // Start new group
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        id: format(momentDate, 'yyyy-MM-dd'),
        title: groupTitle,
        date: moment.date,
        moments: [moment]
      };
    }
  });

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}
