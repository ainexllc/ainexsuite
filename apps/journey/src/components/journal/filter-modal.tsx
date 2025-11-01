'use client';

import { useState, useEffect } from 'react';
import { X, Filter, Tag, Activity, Users, Hash, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@ainexsuite/types';

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-800/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f97316]/20 rounded-lg">
              <Filter className="w-5 h-5 text-[#f97316]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Filter Entries
              </h2>
              <p className="text-sm text-white/60">
                {selectedTags.length > 0
                  ? `${selectedTags.length} filter${selectedTags.length > 1 ? 's' : ''} active`
                  : 'Select tags to filter your journal entries'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/60 hover:text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-zinc-900/50 border-b border-white/10">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              activeTab === 'all'
                ? "bg-[#f97316] text-white shadow-lg shadow-[#f97316]/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            <Tag className="w-4 h-4" />
            All Tags
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
              {allTags.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('activities')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              activeTab === 'activities'
                ? "bg-[#f97316] text-white shadow-lg shadow-[#f97316]/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className="w-4 h-4" />
            Activities
          </button>

          <button
            onClick={() => setActiveTab('people')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              activeTab === 'people'
                ? "bg-[#f97316] text-white shadow-lg shadow-[#f97316]/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            <Users className="w-4 h-4" />
            People
          </button>

          <button
            onClick={() => setActiveTab('other')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              activeTab === 'other'
                ? "bg-[#f97316] text-white shadow-lg shadow-[#f97316]/20"
                : "text-white/70 hover:text-white hover:bg-white/5"
            )}
          >
            <Hash className="w-4 h-4" />
            Other
          </button>
        </div>

        {/* Tags Grid */}
        <div className="flex-1 overflow-y-auto p-6">
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={onClearAll}
            disabled={selectedTags.length === 0}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear all filters
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-white bg-[#f97316] hover:bg-[#ea580c] rounded-lg transition-colors shadow-lg shadow-[#f97316]/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
