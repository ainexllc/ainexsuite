"use client";

import { SearchInput as SharedSearchInput } from "@ainexsuite/ui/components";

type SearchInputProps = {
  placeholder?: string;
  onFocus?: () => void;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchInput({
  placeholder = "Search docs",
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
