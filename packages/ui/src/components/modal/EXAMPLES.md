# Modal Variants - Usage Examples

Complete examples demonstrating all three modal variants in real-world scenarios.

## FilterModal Example - Journal Entry Filtering

```tsx
'use client';

import { useState } from 'react';
import { FilterModal } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { Tag, Activity, Users, Hash, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { JournalEntry } from '@ainexsuite/types';

interface FilterState {
  tags: string[];
  dateRange: { start: Date | null; end: Date | null };
}

export function JournalFilterExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'activities' | 'people' | 'other'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { accentColor } = useAppColors();

  // Extract tags from entries
  const entries: JournalEntry[] = []; // Your entries here
  const tagCounts = entries.reduce((acc, entry) => {
    entry.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const allTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  // Filter tabs configuration
  const tabs = [
    { id: 'all', label: 'All Tags', icon: Tag, count: allTags.length },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'people', label: 'People', icon: Users },
    { id: 'other', label: 'Other', icon: Hash },
  ];

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApply = () => {
    // Apply filters to your data
    console.log('Applied filters:', selectedTags);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedTags([]);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Filters</button>

      <FilterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Filter Entries"
        description={
          selectedTags.length > 0
            ? `${selectedTags.length} filter${selectedTags.length > 1 ? 's' : ''} active`
            : 'Select tags to filter your journal entries'
        }
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as any)}
        onApply={handleApply}
        onReset={handleReset}
        disableReset={selectedTags.length === 0}
        accentColor={accentColor}
      >
        {/* Tags Grid */}
        {allTags.length === 0 ? (
          <div className="text-center py-8 text-ink-600 dark:text-white/60">
            No tags in this category
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allTags.map(({ tag, count }) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTagSelect(tag)}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-current text-current"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 text-ink-800 dark:text-white/80 hover:text-ink-900 dark:hover:text-white"
                  )}
                  style={isSelected ? { color: accentColor, borderColor: accentColor } : undefined}
                >
                  <span className="flex items-center gap-2">
                    {isSelected && <Check className="w-3 h-3" />}
                    <span className="font-medium text-sm">{tag}</span>
                  </span>
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      isSelected
                        ? "text-current opacity-70"
                        : "bg-black/10 dark:bg-white/10 text-ink-600 dark:text-white/60"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </FilterModal>
    </>
  );
}
```

---

## FormModal Example - Create/Edit Entry

```tsx
'use client';

import { useState } from 'react';
import { FormModal, Input, Textarea } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import type { JournalEntry } from '@ainexsuite/types';

interface EntryFormData {
  title: string;
  content: string;
  tags: string[];
}

export function CreateEntryExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<EntryFormData>({
    title: '',
    content: '',
    tags: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { accentColor } = useAppColors();

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);

    try {
      // Validate
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }

      // Save to database
      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save entry');
      }

      // Success - close modal and reset form
      setIsOpen(false);
      setFormData({ title: '', content: '', tags: [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Optionally confirm if form has changes
    if (formData.title || formData.content) {
      if (confirm('Discard changes?')) {
        setIsOpen(false);
        setFormData({ title: '', content: '', tags: [] });
        setError(null);
      }
    } else {
      setIsOpen(false);
    }
  };

  const isValid = formData.title.trim() && formData.content.trim();

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Create Entry</button>

      <FormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Journal Entry"
        description="Capture your thoughts and experiences"
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={isSaving}
        disableSave={!isValid}
        saveLabel="Create Entry"
        accentColor={accentColor}
        size="lg"
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter a title..."
            required
          />

          <Textarea
            label="Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="What's on your mind?"
            rows={8}
            required
          />

          <div>
            <label className="block text-sm font-medium text-ink-700 dark:text-white/80 mb-2">
              Tags
            </label>
            <Input
              value={formData.tags.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                })
              }
              placeholder="work, personal, ideas (comma-separated)"
            />
          </div>
        </form>
      </FormModal>
    </>
  );
}
```

---

## AlertModal Examples - All Types

### Success Alert

```tsx
'use client';

import { useState } from 'react';
import { AlertModal } from '@ainexsuite/ui';

export function SuccessAlertExample() {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveEntry = async () => {
    // ... save logic
    setShowSuccess(true);
  };

  return (
    <>
      <button onClick={handleSaveEntry}>Save Entry</button>

      <AlertModal
        isOpen={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        type="success"
        title="Entry Saved"
        message="Your journal entry has been saved successfully."
      />
    </>
  );
}
```

### Error Alert with Custom Content

```tsx
'use client';

import { useState } from 'react';
import { AlertModal } from '@ainexsuite/ui';
import { WifiOff } from 'lucide-react';

export function ErrorAlertExample() {
  const [error, setError] = useState<{ title: string; details: string } | null>(null);

  const handleSync = async () => {
    try {
      await syncData();
    } catch (err) {
      setError({
        title: 'Sync Failed',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  };

  return (
    <>
      <button onClick={handleSync}>Sync Data</button>

      <AlertModal
        isOpen={!!error}
        onDismiss={() => setError(null)}
        type="error"
        title={error?.title || ''}
        message={
          <div className="space-y-2">
            <p>{error?.details}</p>
            <p className="text-sm opacity-80">
              Please check your internet connection and try again.
            </p>
          </div>
        }
        icon={WifiOff}
        dismissLabel="Got it"
      />
    </>
  );
}
```

### Warning Alert

```tsx
'use client';

import { useState } from 'react';
import { AlertModal } from '@ainexsuite/ui';

export function WarningAlertExample() {
  const [showWarning, setShowWarning] = useState(false);

  const handleBulkDelete = () => {
    setShowWarning(true);
  };

  const proceedWithDelete = () => {
    setShowWarning(false);
    // Actually delete items
    console.log('Deleting items...');
  };

  return (
    <>
      <button onClick={handleBulkDelete}>Delete All</button>

      <AlertModal
        isOpen={showWarning}
        onDismiss={() => setShowWarning(false)}
        type="warning"
        title="Large Deletion"
        message="You are about to delete 50 items. This action cannot be undone."
        dismissLabel="Cancel"
      />
    </>
  );
}
```

### Info Alert

```tsx
'use client';

import { useState, useEffect } from 'react';
import { AlertModal } from '@ainexsuite/ui';

export function InfoAlertExample() {
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // Show info on first visit
    const hasSeenInfo = localStorage.getItem('hasSeenFeatureInfo');
    if (!hasSeenInfo) {
      setShowInfo(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenFeatureInfo', 'true');
    setShowInfo(false);
  };

  return (
    <AlertModal
      isOpen={showInfo}
      onDismiss={handleDismiss}
      type="info"
      title="New Feature Available"
      message={
        <div className="space-y-2">
          <p>We've added AI-powered insights to your journal entries!</p>
          <p className="text-sm opacity-80">
            Click the insights icon on any entry to see personalized analysis.
          </p>
        </div>
      }
      dismissLabel="Got it, thanks!"
    />
  );
}
```

---

## Combined Example - Full Workflow

```tsx
'use client';

import { useState } from 'react';
import { FilterModal, FormModal, AlertModal } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { Filter, Plus } from 'lucide-react';

export function JournalWorkflowExample() {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
  } | null>(null);
  const { accentColor } = useAppColors();

  const handleCreateEntry = async (data: any) => {
    try {
      await saveEntry(data);
      setShowCreateForm(false);
      setAlert({
        type: 'success',
        title: 'Entry Created',
        message: 'Your journal entry has been saved successfully.',
      });
    } catch (error) {
      setAlert({
        type: 'error',
        title: 'Save Failed',
        message: 'Unable to save your entry. Please try again.',
      });
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button onClick={() => setShowFilters(true)}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
        <button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Entry
        </button>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Entries"
        tabs={[/* ... */]}
        activeTab="all"
        onApply={() => {/* ... */}}
        onReset={() => {/* ... */}}
        accentColor={accentColor}
      >
        {/* Filter content */}
      </FilterModal>

      {/* Create Entry Form Modal */}
      <FormModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create Entry"
        onSave={() => handleCreateEntry({})}
        accentColor={accentColor}
      >
        {/* Form fields */}
      </FormModal>

      {/* Alert Modal */}
      <AlertModal
        isOpen={!!alert}
        onDismiss={() => setAlert(null)}
        type={alert?.type || 'info'}
        title={alert?.title || ''}
        message={alert?.message || ''}
      />
    </div>
  );
}

// Mock function
async function saveEntry(data: any) {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}
```

---

## Best Practices from Examples

1. **State Management**: Keep modal state in parent component
2. **Error Handling**: Show errors in FormModal content or use AlertModal
3. **Validation**: Disable save button until form is valid
4. **Loading States**: Use isLoading prop to prevent duplicate submissions
5. **User Feedback**: Always show AlertModal after important actions
6. **Cleanup**: Reset form data when modal closes
7. **Confirmation**: Ask before discarding unsaved changes
8. **Theme Integration**: Always use `useAppColors()` for accent color
