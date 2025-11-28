'use client';

import { useState } from 'react';
import { Tag, Activity, Users, Hash, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@ainexsuite/types';
import { FilterModal as SharedFilterModal, type FilterTab } from '@ainexsuite/ui';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onClearAll: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  entries,
  selectedTags,
  onTagSelect,
  onClearAll
}: FilterModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'activities' | 'people' | 'other'>('all');

  // Extract all unique tags with counts
  const tagCounts = entries.reduce((acc, entry) => {
    entry.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const allTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  // Categorize tags
  const categorizedTags = {
    activities: ['workout', 'running', 'meditation', 'yoga', 'reading', 'cooking', 'travel', 'work', 'study'],
    people: ['family', 'friends', 'partner', 'colleagues', 'parents', 'siblings'],
    moods: ['happy', 'sad', 'anxious', 'excited', 'calm', 'stressed', 'grateful'],
  };

  const getTagsForCategory = (category: string) => {
    if (category === 'all') return allTags;

    const categoryKeywords = categorizedTags[category as keyof typeof categorizedTags] || [];
    return allTags.filter(({ tag }) =>
      categoryKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    );
  };

  const getOtherTags = () => {
    const allCategoryKeywords = [
      ...categorizedTags.activities,
      ...categorizedTags.people,
      ...categorizedTags.moods
    ];
    return allTags.filter(({ tag }) =>
      !allCategoryKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    );
  };

  const displayTags = activeTab === 'other'
    ? getOtherTags()
    : getTagsForCategory(activeTab);

  // Define tabs for the shared FilterModal
  const tabs: FilterTab[] = [
    {
      id: 'all',
      label: 'All Tags',
      icon: Tag,
      count: allTags.length,
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Activity,
    },
    {
      id: 'people',
      label: 'People',
      icon: Users,
    },
    {
      id: 'other',
      label: 'Other',
      icon: Hash,
    },
  ];

  return (
    <SharedFilterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Entries"
      description={
        selectedTags.length > 0
          ? `${selectedTags.length} filter${selectedTags.length > 1 ? 's' : ''} active`
          : 'Select tags to filter your journal entries'
      }
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
      onApply={onClose}
      onReset={onClearAll}
      resetLabel="Clear all filters"
      disableReset={selectedTags.length === 0}
      accentColor="#f97316"
    >
      {displayTags.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          No tags in this category
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {displayTags.map(({ tag, count }) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-lg border-2 transition-all",
                  isSelected
                    ? "border-[#f97316] bg-[#f97316]/20 text-[#f97316]"
                    : "border-white/10 hover:border-white/20 text-white/80 hover:text-white"
                )}
              >
                <span className="flex items-center gap-2">
                  {isSelected && <Check className="w-3 h-3" />}
                  <span className="font-medium text-sm">{tag}</span>
                </span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  isSelected
                    ? "bg-[#f97316]/30 text-[#f97316]"
                    : "bg-white/10 text-white/60"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </SharedFilterModal>
  );
}
