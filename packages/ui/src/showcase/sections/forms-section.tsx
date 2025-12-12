'use client';

import { useState } from 'react';
import { FormField } from '../../components/forms/form-field';
import { TagInput } from '../../components/forms/tag-input';
import { SearchInput } from '../../components/search/search-input';
import { ActiveFilterChips, FilterChip } from '../../components/filters/active-filter-chips';

export function FormsSection() {
  const [tags, setTags] = useState<string[]>(['React', 'TypeScript', 'Tailwind']);
  const [inlineTags, setInlineTags] = useState<string[]>(['Next.js', 'Firebase']);
  const [chipsTags, setChipsTags] = useState<string[]>(['UI', 'Components']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChips, setFilterChips] = useState<FilterChip[]>([
    { id: '1', label: 'High Priority', type: 'label' },
    { id: '2', label: 'Blue', type: 'color', colorValue: '#3b82f6' },
    { id: '3', label: 'Last 7 days', type: 'date' },
    { id: '4', label: 'Notes', type: 'noteType' },
  ]);

  const handleRemoveChip = (chipId: string) => {
    setFilterChips(prev => prev.filter(chip => chip.id !== chipId));
  };

  const handleClearAllChips = () => {
    setFilterChips([]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">TagInput - Default</h4>
        <div className="max-w-2xl">
          <TagInput
            value={tags}
            onChange={setTags}
            placeholder="Add tags..."
            suggestions={[
              'React',
              'TypeScript',
              'JavaScript',
              'Tailwind',
              'Next.js',
              'Firebase',
              'Node.js',
              'CSS',
            ]}
            allowCustom={true}
            maxTags={10}
            showCount={true}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">TagInput - Variants</h4>
        <div className="space-y-4 max-w-2xl">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Default Variant</p>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder="Default variant..."
              variant="default"
              size="md"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Inline Variant</p>
            <TagInput
              value={inlineTags}
              onChange={setInlineTags}
              placeholder="Inline variant..."
              variant="inline"
              size="md"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Chips Variant</p>
            <TagInput
              value={chipsTags}
              onChange={setChipsTags}
              placeholder="Chips variant..."
              variant="chips"
              size="md"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">TagInput - Sizes</h4>
        <div className="space-y-4 max-w-2xl">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Small</p>
            <TagInput
              value={['Small', 'Tags']}
              onChange={() => {}}
              placeholder="Small size..."
              size="sm"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Medium</p>
            <TagInput
              value={['Medium', 'Tags']}
              onChange={() => {}}
              placeholder="Medium size..."
              size="md"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Large</p>
            <TagInput
              value={['Large', 'Tags']}
              onChange={() => {}}
              placeholder="Large size..."
              size="lg"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">SearchInput</h4>
        <div className="space-y-4 max-w-2xl">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Default</p>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search..."
              variant="default"
              size="md"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Filled</p>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search notes..."
              variant="filled"
              size="md"
              shortcutHint="⌘K"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Ghost</p>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search everywhere..."
              variant="ghost"
              size="md"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Glass</p>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search with glass effect..."
              variant="glass"
              size="md"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">ActiveFilterChips</h4>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Filter Chips</p>
            <ActiveFilterChips
              chips={filterChips}
              onRemove={handleRemoveChip}
              onClearAll={handleClearAllChips}
            />
          </div>
          {filterChips.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              All filters cleared. Refresh the page to reset.
            </p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">FormField</h4>
        <div className="space-y-4 max-w-md">
          <FormField label="Email" required>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface-elevated text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </FormField>
          <FormField label="Password" error="Password must be at least 8 characters">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-3 py-2 rounded-lg border border-danger bg-surface-elevated text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-danger/20 focus:border-danger"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
