# SearchInput Examples

Real-world usage examples from AinexSuite apps.

## Table of Contents

- [Notes App - Basic Search](#notes-app---basic-search)
- [Universal Search - Debounced with Loading](#universal-search---debounced-with-loading)
- [Keyboard Shortcut Modal](#keyboard-shortcut-modal)
- [Filter Search](#filter-search)
- [Multi-App Search](#multi-app-search)

## Notes App - Basic Search

Simple search input for filtering notes locally.

```tsx
// apps/notes/src/components/layout/search-input.tsx
"use client";

import { SearchInput as SharedSearchInput } from "@ainexsuite/ui/components";

type SearchInputProps = {
  placeholder?: string;
  onFocus?: () => void;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchInput({
  placeholder = "Search notes",
  onFocus,
  value = "",
  onChange,
}: SearchInputProps) {
  return (
    <SharedSearchInput
      value={value}
      onChange={(newValue) => onChange?.(newValue)}
      onFocus={onFocus}
      placeholder={placeholder}
      shortcutHint="⌘K"
      variant="filled"
      size="md"
      className="max-w-xl"
    />
  );
}
```

**Usage:**
```tsx
function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search your notes..."
      />
      <NotesList notes={filteredNotes} />
    </div>
  );
}
```

## Universal Search - Debounced with Loading

Search across multiple apps with API calls.

```tsx
// apps/main/src/components/search-panel.tsx
import { SearchInput } from '@ainexsuite/ui/components';
import { useState } from 'react';

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDebouncedSearch = async (value: string) => {
    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search across all apps
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: value })
      });
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SearchInput
        value={query}
        onChange={setQuery}
        onDebouncedChange={handleDebouncedSearch}
        debounceDelay={300}
        placeholder="Search across all apps..."
        shortcutHint="⌘K"
        loading={loading}
        variant="glass"
        size="lg"
        className="max-w-2xl mx-auto"
      />
      <SearchResults results={results} loading={loading} />
    </div>
  );
}
```

## Keyboard Shortcut Modal

Open search modal with keyboard shortcut.

```tsx
import { SearchInput } from '@ainexsuite/ui/components';
import { useEffect, useState } from 'react';

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Listen for ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search..."
          variant="ghost"
          size="lg"
          autoFocus
          className="border-b"
        />
        <div className="p-4">
          {/* Search results */}
        </div>
      </div>
    </div>
  );
}
```

## Filter Search

Search with real-time filtering and clear functionality.

```tsx
import { SearchInput } from '@ainexsuite/ui/components';
import { useState } from 'react';

export function TaskFilter() {
  const [filter, setFilter] = useState('');

  const handleClear = () => {
    setFilter('');
    // Optionally reset other filters
  };

  return (
    <SearchInput
      value={filter}
      onChange={setFilter}
      onClear={handleClear}
      placeholder="Filter tasks..."
      size="sm"
      variant="filled"
    />
  );
}
```

## Multi-App Search

Search with app-specific filtering.

```tsx
import { SearchInput } from '@ainexsuite/ui/components';
import { useState } from 'react';

type App = 'notes' | 'todo' | 'journey' | 'all';

export function MultiAppSearch() {
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<App>('all');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value: string) => {
    if (value.length < 2) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/search/${selectedApp}?q=${value}`);
      const results = await response.json();
      // Handle results...
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* App selector */}
      <div className="flex gap-2">
        <button onClick={() => setSelectedApp('all')}>All Apps</button>
        <button onClick={() => setSelectedApp('notes')}>Notes</button>
        <button onClick={() => setSelectedApp('todo')}>Todo</button>
        <button onClick={() => setSelectedApp('journey')}>Journey</button>
      </div>

      {/* Search input */}
      <SearchInput
        value={query}
        onChange={setQuery}
        onDebouncedChange={handleSearch}
        debounceDelay={400}
        placeholder={`Search ${selectedApp === 'all' ? 'all apps' : selectedApp}...`}
        loading={loading}
        variant="filled"
        size="md"
      />
    </div>
  );
}
```

## Programmatic Focus

Control focus programmatically with ref.

```tsx
import { SearchInput } from '@ainexsuite/ui/components';
import { useRef, useState } from 'react';

export function ControlledSearch() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocusSearch = () => {
    // Note: SearchInput doesn't expose ref yet
    // Use autoFocus prop or modal approach instead
  };

  return (
    <div>
      <button onClick={() => setQuery('')}>
        Clear and Focus
      </button>
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search..."
        variant="filled"
      />
    </div>
  );
}
```

## Size Comparison

```tsx
import { SearchInput } from '@ainexsuite/ui/components';

export function SizeComparison() {
  return (
    <div className="space-y-4">
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Small size"
        size="sm"
        variant="filled"
      />
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Medium size (default)"
        size="md"
        variant="filled"
      />
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Large size"
        size="lg"
        variant="filled"
      />
    </div>
  );
}
```

## Variant Comparison

```tsx
import { SearchInput } from '@ainexsuite/ui/components';

export function VariantComparison() {
  return (
    <div className="space-y-4">
      {/* Default - for dark backgrounds */}
      <div className="bg-gray-900 p-4 rounded">
        <SearchInput
          value=""
          onChange={() => {}}
          placeholder="Default variant"
          variant="default"
        />
      </div>

      {/* Filled - solid background */}
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Filled variant"
        variant="filled"
      />

      {/* Ghost - minimal */}
      <SearchInput
        value=""
        onChange={() => {}}
        placeholder="Ghost variant"
        variant="ghost"
      />

      {/* Glass - glassmorphism */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded">
        <SearchInput
          value=""
          onChange={() => {}}
          placeholder="Glass variant"
          variant="glass"
        />
      </div>
    </div>
  );
}
```

## Custom Styling

```tsx
import { SearchInput } from '@ainexsuite/ui/components';

export function CustomStyled() {
  return (
    <SearchInput
      value=""
      onChange={() => {}}
      placeholder="Custom styled..."
      variant="filled"
      className="
        max-w-md
        shadow-lg
        hover:shadow-xl
        transition-shadow
        border-2
        border-blue-500
      "
    />
  );
}
```
