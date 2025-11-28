"use client";

import React, { useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * SearchInput Component
 *
 * A unified, flexible search input component with keyboard shortcuts, loading states,
 * debouncing, and multiple styling variants. Supports glassmorphism and standard designs.
 *
 * @example
 * ```tsx
 * import { SearchInput } from '@ainexsuite/ui/components';
 *
 * // Basic usage with immediate onChange
 * function MyComponent() {
 *   const [query, setQuery] = useState('');
 *
 *   return (
 *     <SearchInput
 *       value={query}
 *       onChange={setQuery}
 *       placeholder="Search notes..."
 *       shortcutHint="⌘K"
 *       variant="filled"
 *       size="md"
 *     />
 *   );
 * }
 *
 * // Advanced usage with debouncing for expensive operations
 * function SearchComponent() {
 *   const [query, setQuery] = useState('');
 *   const [loading, setLoading] = useState(false);
 *
 *   const handleDebouncedSearch = async (value: string) => {
 *     if (value.length < 2) return;
 *
 *     setLoading(true);
 *     // Perform expensive search operation...
 *     await searchAPI(value);
 *     setLoading(false);
 *   };
 *
 *   return (
 *     <SearchInput
 *       value={query}
 *       onChange={setQuery}
 *       onDebouncedChange={handleDebouncedSearch}
 *       debounceDelay={300}
 *       placeholder="Search across all apps..."
 *       shortcutHint="⌘K"
 *       loading={loading}
 *       size="md"
 *       variant="glass"
 *     />
 *   );
 * }
 * ```
 */

export interface SearchInputProps {
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Debounced change handler - called after debounce delay */
  onDebouncedChange?: (value: string) => void;
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceDelay?: number;
  /** Search submit handler (Enter key or search button) */
  onSearch?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show keyboard shortcut hint (e.g., "⌘K") */
  shortcutHint?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Visual variant */
  variant?: "default" | "filled" | "ghost" | "glass";
  /** Show loading state */
  loading?: boolean;
  /** Clear button handler */
  onClear?: () => void;
  /** Focus handler */
  onFocus?: () => void;
  /** Blur handler */
  onBlur?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable the input */
  disabled?: boolean;
  /** Auto focus on mount */
  autoFocus?: boolean;
}

const sizeStyles = {
  sm: {
    container: "h-8 px-3 text-xs gap-2",
    icon: "h-3.5 w-3.5",
    shortcut: "text-[10px] px-1.5 py-0.5",
  },
  md: {
    container: "h-10 px-4 text-sm gap-3",
    icon: "h-4 w-4",
    shortcut: "text-[11px] px-2 py-0.5",
  },
  lg: {
    container: "h-12 px-5 text-base gap-3",
    icon: "h-5 w-5",
    shortcut: "text-xs px-2.5 py-1",
  },
};

const variantStyles = {
  default:
    "bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground hover:bg-muted/70 focus-within:bg-muted focus-within:border-border/80",
  filled:
    "bg-muted border border-transparent text-foreground placeholder:text-muted-foreground hover:bg-muted/80 focus-within:border-ring focus-within:bg-muted/80 focus-within:shadow-lg",
  ghost:
    "bg-transparent border border-border text-foreground placeholder:text-muted-foreground hover:border-border/80 focus-within:border-ring focus-within:bg-muted/50",
  glass:
    "bg-muted/30 backdrop-blur-md border border-border text-foreground placeholder:text-muted-foreground hover:bg-muted/50 hover:border-border/80 focus-within:bg-muted/60 focus-within:border-border shadow-inner",
};

const iconColorVariants = {
  default: "text-muted-foreground group-focus-within:text-foreground",
  filled: "text-muted-foreground group-focus-within:text-foreground",
  ghost: "text-muted-foreground group-focus-within:text-foreground",
  glass: "text-muted-foreground group-focus-within:text-foreground",
};

const inputColorVariants = {
  default: "text-foreground placeholder:text-muted-foreground",
  filled: "text-foreground placeholder:text-muted-foreground",
  ghost: "text-foreground placeholder:text-muted-foreground",
  glass: "text-foreground placeholder:text-muted-foreground",
};

const shortcutColorVariants = {
  default:
    "border-border bg-muted text-muted-foreground group-hover:border-border/80 group-hover:text-foreground",
  filled:
    "border-border bg-background text-muted-foreground group-hover:border-ring group-hover:text-foreground",
  ghost:
    "border-border bg-muted text-muted-foreground group-hover:border-ring group-hover:text-foreground",
  glass:
    "border-border bg-muted/50 backdrop-blur-sm text-muted-foreground group-hover:border-border/80 group-hover:text-foreground",
};

export function SearchInput({
  value,
  onChange,
  onDebouncedChange,
  debounceDelay = 300,
  onSearch,
  placeholder = "Search...",
  shortcutHint,
  size = "md",
  variant = "default",
  loading = false,
  onClear,
  onFocus,
  onBlur,
  className,
  disabled = false,
  autoFocus = false,
}: SearchInputProps) {
  const sizeStyle = sizeStyles[size];
  const variantStyle = variantStyles[variant];
  const iconColor = iconColorVariants[variant];
  const inputColor = inputColorVariants[variant];
  const shortcutColor = shortcutColorVariants[variant];

  // Debouncing logic
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (onDebouncedChange) {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onDebouncedChange(value);
      }, debounceDelay);

      // Cleanup on unmount or value change
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [value, onDebouncedChange, debounceDelay]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <label
      className={cn(
        "group flex w-full items-center rounded-full transition-all duration-150",
        sizeStyle.container,
        variantStyle,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Search Icon */}
      {loading ? (
        <Loader2
          className={cn(sizeStyle.icon, iconColor, "animate-spin")}
          aria-label="Loading"
        />
      ) : (
        <Search className={cn(sizeStyle.icon, iconColor)} aria-hidden />
      )}

      {/* Input */}
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled || loading}
        autoFocus={autoFocus}
        className={cn(
          "w-full bg-transparent focus:outline-none",
          inputColor,
          disabled && "cursor-not-allowed"
        )}
        aria-label={placeholder}
      />

      {/* Clear Button */}
      {value && !loading && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            "flex items-center justify-center rounded-full transition-colors shrink-0",
            sizeStyle.icon,
            iconColor,
            "hover:bg-muted",
            disabled && "cursor-not-allowed"
          )}
          aria-label="Clear search"
        >
          <X className={sizeStyle.icon} />
        </button>
      )}

      {/* Keyboard Shortcut Hint */}
      {shortcutHint && !value && !loading && (
        <span
          className={cn(
            "hidden items-center gap-1 rounded-full border uppercase tracking-wide transition shrink-0 lg:inline-flex",
            sizeStyle.shortcut,
            shortcutColor
          )}
        >
          <kbd className="font-semibold">{shortcutHint}</kbd>
        </span>
      )}
    </label>
  );
}
