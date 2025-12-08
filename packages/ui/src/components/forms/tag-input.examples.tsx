'use client';

import * as React from 'react';
import { TagInput, Tag, TagList } from './tag-input';

/**
 * Tag Input Component Examples
 *
 * This file demonstrates the usage of TagInput, Tag, and TagList components
 */

// ============================================================================
// Example 1: Basic Tag Input
// ============================================================================

export function BasicTagInput() {
  const [tags, setTags] = React.useState<string[]>([]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Tag Input</h3>
      <TagInput
        value={tags}
        onChange={setTags}
        placeholder="Add tags..."
      />
      <p className="text-sm text-ink-500">
        Current tags: {tags.join(', ') || 'None'}
      </p>
    </div>
  );
}

// ============================================================================
// Example 2: Tag Input with Suggestions
// ============================================================================

export function TagInputWithSuggestions() {
  const [tags, setTags] = React.useState<string[]>([]);

  const suggestions = [
    'React',
    'TypeScript',
    'Next.js',
    'Tailwind',
    'Firebase',
    'Vercel',
    'JavaScript',
    'CSS',
    'HTML',
    'Node.js',
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">With Suggestions</h3>
      <TagInput
        value={tags}
        onChange={setTags}
        suggestions={suggestions}
        placeholder="Search technologies..."
      />
    </div>
  );
}

// ============================================================================
// Example 3: Tag Input with Async Search
// ============================================================================

export function TagInputWithAsyncSearch() {
  const [tags, setTags] = React.useState<string[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const allTags = [
      'React', 'TypeScript', 'Next.js', 'Tailwind', 'Firebase',
      'Vercel', 'JavaScript', 'CSS', 'HTML', 'Node.js', 'GraphQL',
      'REST API', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes',
    ];

    const filtered = allTags.filter((tag) =>
      tag.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Async Search</h3>
      <TagInput
        value={tags}
        onChange={setTags}
        suggestions={suggestions}
        onSuggestionsSearch={handleSearch}
        loading={loading}
        placeholder="Type to search..."
        debounceDelay={300}
      />
    </div>
  );
}

// ============================================================================
// Example 4: Tag Input with Max Tags
// ============================================================================

export function TagInputWithMaxTags() {
  const [tags, setTags] = React.useState<string[]>(['design', 'development']);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Max 5 Tags</h3>
      <TagInput
        value={tags}
        onChange={setTags}
        maxTags={5}
        showCount
        placeholder="Add up to 5 tags..."
      />
    </div>
  );
}

// ============================================================================
// Example 5: Tag Input - Suggestions Only (No Custom Tags)
// ============================================================================

export function TagInputSuggestionsOnly() {
  const [tags, setTags] = React.useState<string[]>([]);

  const categories = [
    'Work',
    'Personal',
    'Urgent',
    'Important',
    'Low Priority',
    'High Priority',
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Suggestions Only</h3>
      <TagInput
        value={tags}
        onChange={setTags}
        suggestions={categories}
        allowCustom={false}
        placeholder="Select from categories..."
      />
      <p className="text-xs text-ink-500">
        Custom tags are not allowed - select from suggestions only
      </p>
    </div>
  );
}

// ============================================================================
// Example 6: Tag Input Sizes
// ============================================================================

export function TagInputSizes() {
  const [tagsSmall, setTagsSmall] = React.useState(['small']);
  const [tagsMedium, setTagsMedium] = React.useState(['medium']);
  const [tagsLarge, setTagsLarge] = React.useState(['large']);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Size Variants</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium">Small</label>
        <TagInput
          value={tagsSmall}
          onChange={setTagsSmall}
          size="sm"
          placeholder="Small tags..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Medium (Default)</label>
        <TagInput
          value={tagsMedium}
          onChange={setTagsMedium}
          size="md"
          placeholder="Medium tags..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Large</label>
        <TagInput
          value={tagsLarge}
          onChange={setTagsLarge}
          size="lg"
          placeholder="Large tags..."
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 7: Individual Tag Components
// ============================================================================

export function IndividualTags() {
  const [tags, setTags] = React.useState([
    'default',
    'outline',
    'solid',
  ]);

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Tag Variants</h3>

      <div className="flex flex-wrap gap-3">
        <Tag
          label="Default Variant"
          variant="default"
          onRemove={() => removeTag('default')}
          removable={tags.includes('default')}
        />
        <Tag
          label="Outline Variant"
          variant="outline"
          onRemove={() => removeTag('outline')}
          removable={tags.includes('outline')}
        />
        <Tag
          label="Solid Variant"
          variant="solid"
          onRemove={() => removeTag('solid')}
          removable={tags.includes('solid')}
        />
        <Tag
          label="Non-removable"
          removable={false}
        />
        <Tag
          label="Disabled"
          disabled
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Tag Sizes</p>
        <div className="flex items-center gap-3">
          <Tag label="Small" size="sm" removable={false} />
          <Tag label="Medium" size="md" removable={false} />
          <Tag label="Large" size="lg" removable={false} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Example 8: Colored Tags
// ============================================================================

export function ColoredTags() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Colored Tags</h3>

      <div className="flex flex-wrap gap-2">
        <Tag label="Red" color="#ef4444" removable={false} />
        <Tag label="Orange" color="#f97316" removable={false} />
        <Tag label="Yellow" color="#eab308" removable={false} />
        <Tag label="Green" color="#22c55e" removable={false} />
        <Tag label="Blue" color="#3b82f6" removable={false} />
        <Tag label="Purple" color="#a855f7" removable={false} />
        <Tag label="Pink" color="#ec4899" removable={false} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Tag label="Red Solid" color="#ef4444" variant="solid" removable={false} />
        <Tag label="Orange Solid" color="#f97316" variant="solid" removable={false} />
        <Tag label="Green Solid" color="#22c55e" variant="solid" removable={false} />
        <Tag label="Blue Solid" color="#3b82f6" variant="solid" removable={false} />
      </div>
    </div>
  );
}

// ============================================================================
// Example 9: Tag List (Read-only Display)
// ============================================================================

export function TagListExample() {
  const tags = [
    'React',
    'TypeScript',
    'Next.js',
    'Tailwind',
    'Firebase',
    'Vercel',
    'Docker',
  ];

  const coloredTags = [
    { label: 'Work', color: '#3b82f6' },
    { label: 'Urgent', color: '#ef4444' },
    { label: 'Review', color: '#f97316' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Tag List (Read-only)</h3>

      <div className="space-y-2">
        <p className="text-sm font-medium">Basic Tag List</p>
        <TagList tags={tags} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">With Max Display (3 tags)</p>
        <TagList tags={tags} max={3} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Colored Tags</p>
        <TagList tags={coloredTags} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Empty State</p>
        <TagList tags={[]} showEmpty emptyText="No tags assigned" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Small Size</p>
        <TagList tags={tags.slice(0, 4)} size="sm" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Large Size</p>
        <TagList tags={tags.slice(0, 4)} size="lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Example 10: Clickable Tags in List
// ============================================================================

export function ClickableTagList() {
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

  const tags = ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Firebase'];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Clickable Tag List</h3>
      <TagList
        tags={tags}
        onTagClick={(tag) => setSelectedTag(tag)}
      />
      {selectedTag && (
        <p className="text-sm text-ink-600">
          Selected: <strong>{selectedTag}</strong>
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Example 11: Error State
// ============================================================================

export function TagInputErrorState() {
  const [tags, setTags] = React.useState<string[]>([]);
  const [hasError, setHasError] = React.useState(false);

  const handleChange = (newTags: string[]) => {
    setTags(newTags);
    // Example validation: require at least one tag
    setHasError(newTags.length === 0);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error State</h3>
      <TagInput
        value={tags}
        onChange={handleChange}
        error={hasError}
        placeholder="Add at least one tag..."
      />
      {hasError && (
        <p className="text-sm text-danger">
          At least one tag is required
        </p>
      )}
    </div>
  );
}

// ============================================================================
// Example 12: Disabled State
// ============================================================================

export function TagInputDisabled() {
  const tags = ['read-only', 'disabled', 'locked'];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Disabled State</h3>
      <TagInput
        value={tags}
        onChange={() => {}}
        disabled
        placeholder="This input is disabled"
      />
    </div>
  );
}

// ============================================================================
// Example 13: Case Sensitive Tags
// ============================================================================

export function TagInputCaseSensitive() {
  const [tags, setTags] = React.useState<string[]>([]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Case Sensitive</h3>
      <TagInput
        value={tags}
        onChange={setTags}
        caseSensitive
        placeholder="Tags are case-sensitive..."
      />
      <p className="text-xs text-ink-500">
        &quot;React&quot; and &quot;react&quot; are treated as different tags
      </p>
    </div>
  );
}

// ============================================================================
// All Examples Component
// ============================================================================

export function AllTagInputExamples() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tag Input Components</h1>
        <p className="text-ink-600">
          Comprehensive examples of TagInput, Tag, and TagList components
        </p>
      </div>

      <BasicTagInput />
      <TagInputWithSuggestions />
      <TagInputWithAsyncSearch />
      <TagInputWithMaxTags />
      <TagInputSuggestionsOnly />
      <TagInputSizes />
      <IndividualTags />
      <ColoredTags />
      <TagListExample />
      <ClickableTagList />
      <TagInputErrorState />
      <TagInputDisabled />
      <TagInputCaseSensitive />
    </div>
  );
}
