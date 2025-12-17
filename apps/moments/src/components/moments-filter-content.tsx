'use client';

import { useState } from 'react';
import { Tag, Smile, Users, Calendar } from 'lucide-react';

interface MomentsFilters {
  tags?: string[];
  moods?: string[];
  people?: string[];
  dateRange?: { start: string | null; end: string | null };
  datePreset?: string;
}

interface MomentsFilterContentProps {
  filters: MomentsFilters;
  onFiltersChange: (filters: MomentsFilters) => void;
  availableTags: string[];
  availableMoods: string[];
  availablePeople: string[];
}

const MOOD_OPTIONS = [
  { value: 'Happy', emoji: '😊', label: 'Happy' },
  { value: 'Loved', emoji: '🥰', label: 'Loved' },
  { value: 'Excited', emoji: '🎉', label: 'Excited' },
  { value: 'Chill', emoji: '😌', label: 'Chill' },
  { value: 'Sad', emoji: '😔', label: 'Sad' },
  { value: 'Tired', emoji: '😴', label: 'Tired' },
];

const DATE_PRESETS = [
  { value: 'today', label: 'Today' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

export function MomentsFilterContent({
  filters,
  onFiltersChange,
  availableTags,
  availableMoods,
  availablePeople,
}: MomentsFilterContentProps) {
  const [activeTab, setActiveTab] = useState<'mood' | 'tags' | 'people' | 'date'>('mood');

  const toggleTag = (tag: string) => {
    const current = filters.tags || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onFiltersChange({ ...filters, tags: updated });
  };

  const toggleMood = (mood: string) => {
    const current = filters.moods || [];
    const updated = current.includes(mood)
      ? current.filter((m) => m !== mood)
      : [...current, mood];
    onFiltersChange({ ...filters, moods: updated });
  };

  const togglePerson = (person: string) => {
    const current = filters.people || [];
    const updated = current.includes(person)
      ? current.filter((p) => p !== person)
      : [...current, person];
    onFiltersChange({ ...filters, people: updated });
  };

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let start: string | null = null;
    let end: string | null = today.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        start = end;
        break;
      case 'this-week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        start = weekStart.toISOString().split('T')[0];
        break;
      }
      case 'this-month': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        start = monthStart.toISOString().split('T')[0];
        break;
      }
      case 'this-year': {
        const yearStart = new Date(today.getFullYear(), 0, 1);
        start = yearStart.toISOString().split('T')[0];
        break;
      }
      case 'custom':
        // Keep existing or clear
        start = filters.dateRange?.start || null;
        end = filters.dateRange?.end || null;
        break;
    }

    onFiltersChange({
      ...filters,
      dateRange: { start, end },
      datePreset: preset,
    });
  };

  const tabs = [
    { id: 'mood' as const, icon: Smile, label: 'Mood' },
    { id: 'tags' as const, icon: Tag, label: 'Tags' },
    { id: 'people' as const, icon: Users, label: 'People' },
    { id: 'date' as const, icon: Calendar, label: 'Date' },
  ];

  return (
    <div className="w-72 p-4 space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-surface-base rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mood Tab */}
      {activeTab === 'mood' && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted">Filter by mood</p>
          <div className="grid grid-cols-3 gap-2">
            {MOOD_OPTIONS.map((mood) => {
              const isActive = filters.moods?.includes(mood.value);
              const isAvailable = availableMoods.includes(mood.value);
              return (
                <button
                  key={mood.value}
                  onClick={() => toggleMood(mood.value)}
                  disabled={!isAvailable && !isActive}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-pink-500/20 ring-1 ring-pink-500'
                      : isAvailable
                      ? 'bg-surface-elevated hover:bg-surface-hover'
                      : 'bg-surface-base text-text-muted opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags Tab */}
      {activeTab === 'tags' && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted">Filter by tags</p>
          {availableTags.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">No tags available</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {availableTags.map((tag) => {
                const isActive = filters.tags?.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-pink-500 text-white'
                        : 'bg-surface-elevated text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* People Tab */}
      {activeTab === 'people' && (
        <div className="space-y-2">
          <p className="text-xs text-text-muted">Filter by people</p>
          {availablePeople.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">No people tagged yet</p>
          ) : (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {availablePeople.map((person) => {
                const isActive = filters.people?.includes(person);
                return (
                  <button
                    key={person}
                    onClick={() => togglePerson(person)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-pink-500 text-white'
                        : 'bg-surface-elevated text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    {person}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Date Tab */}
      {activeTab === 'date' && (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Filter by date</p>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => {
              const isActive = filters.datePreset === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => handleDatePreset(preset.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-pink-500 text-white'
                      : 'bg-surface-elevated text-text-muted hover:bg-surface-hover'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range */}
          {filters.datePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="text-xs text-text-muted block mb-1">From</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: e.target.value || null,
                        end: filters.dateRange?.end || null,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-surface-elevated border border-outline-subtle text-sm text-text-primary"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted block mb-1">To</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        start: filters.dateRange?.start || null,
                        end: e.target.value || null,
                      },
                    })
                  }
                  className="w-full px-2 py-1.5 rounded-lg bg-surface-elevated border border-outline-subtle text-sm text-text-primary"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
