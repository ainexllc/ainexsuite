'use client';

import { AlertCircle, FileText, Calendar, Pill } from 'lucide-react';

interface TimelineItem {
  id: string;
  type: 'symptom' | 'lab' | 'appointment' | 'medication';
  date: string;
  title: string;
  description?: string;
}

interface MedicalTimelineProps {
  items: TimelineItem[];
  onItemClick?: (item: TimelineItem) => void;
}

const typeConfig = {
  symptom: {
    icon: AlertCircle,
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500',
  },
  lab: {
    icon: FileText,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-500',
  },
  appointment: {
    icon: Calendar,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500',
  },
  medication: {
    icon: Pill,
    color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500',
  },
};

export function MedicalTimeline({ items, onItemClick }: MedicalTimelineProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const groupedByDate = items.reduce<Record<string, TimelineItem[]>>((acc, item) => {
    const dateKey = item.date.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (items.length === 0) {
    return (
      <div className="p-6 text-center text-ink-500">
        <p>No medical events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey}>
          <div className="sticky top-0 bg-surface-base py-2 z-10">
            <h4 className="text-sm font-medium text-ink-500">{formatDate(dateKey)}</h4>
          </div>
          <div className="relative pl-6 space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-outline-subtle" />

            {groupedByDate[dateKey].map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className={`relative flex gap-3 ${onItemClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onItemClick?.(item)}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center ${config.color}`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 p-3 bg-surface-elevated border-l-2 ${config.borderColor} rounded-r-lg hover:bg-surface-subtle transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink-900">{item.title}</span>
                      <span className="text-xs text-ink-400 capitalize">{item.type}</span>
                    </div>
                    {item.description && (
                      <p className="text-sm text-ink-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
