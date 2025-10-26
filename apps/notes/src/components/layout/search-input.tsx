"use client";

import { Search } from "lucide-react";

type SearchInputProps = {
  placeholder?: string;
  onFocus?: () => void;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchInput({
  placeholder = "Search notes",
  onFocus,
  value,
  onChange,
}: SearchInputProps) {
  return (
    <label className="group flex w-full max-w-xl items-center gap-3 rounded-full border border-transparent bg-surface-muted px-5 py-2 text-sm text-muted shadow-inner transition-all duration-150 focus-within:border-outline-strong focus-within:bg-surface-elevated focus-within:shadow-lg">
      <Search className="h-4 w-4 text-ink-400 group-focus-within:text-ink-600" />
      <input
        type="search"
        onFocus={onFocus}
        value={value}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-ink-700 placeholder:text-ink-400 focus:outline-none"
        onChange={(event) => onChange?.(event.target.value)}
      />
      <span className="hidden items-center gap-1 rounded-full border border-outline-subtle bg-surface-elevated px-2 py-0.5 text-[11px] uppercase tracking-wide text-ink-400 transition group-hover:border-outline-strong group-hover:text-ink-600 lg:inline-flex">
        <kbd className="font-semibold">⌘</kbd>
        <span>K</span>
      </span>
    </label>
  );
}
