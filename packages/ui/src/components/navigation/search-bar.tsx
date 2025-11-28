import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * SearchBar Component
 *
 * A reusable search bar component with an integrated clear button.
 * Features a glassmorphic design with hover effects and proper accessibility.
 *
 * @example
 * ```tsx
 * import { SearchBar } from '@ainexsuite/ui/components';
 *
 * function MyComponent() {
 *   const [query, setQuery] = useState('');
 *
 *   return (
 *     <SearchBar
 *       value={query}
 *       onChange={setQuery}
 *       placeholder="Search apps and activities..."
 *       onClear={() => setQuery('')}
 *     />
 *   );
 * }
 * ```
 */

export interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Optional callback when clear button is clicked */
  onClear?: () => void;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Callback when input receives focus */
  onFocus?: () => void;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  onFocus,
}: SearchBarProps) {
  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  return (
    <div
      className={`mx-4 flex flex-1 items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 shadow-sm transition hover:bg-foreground/10 max-w-2xl h-9 ${className}`}
    >
      <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
      {value && (
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground/70 shrink-0"
          aria-label="Clear search"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
