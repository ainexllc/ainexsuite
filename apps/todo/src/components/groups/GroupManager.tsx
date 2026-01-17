'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { ColorPickerDropdown } from '@ainexsuite/ui';
import type { EntryColor } from '@ainexsuite/types';

interface GroupManagerProps {
  onCreateGroup: (name: string, color?: EntryColor) => Promise<void>;
}

export function GroupManager({ onCreateGroup }: GroupManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState<EntryColor>('default');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreate = async () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return;

    setIsLoading(true);
    try {
      await onCreateGroup(trimmedName, selectedColor);
      setNewGroupName('');
      setSelectedColor('default');
      setIsCreating(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setNewGroupName('');
      setSelectedColor('default');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setNewGroupName('');
    setSelectedColor('default');
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <button
        type="button"
        onClick={() => setIsCreating(true)}
        className={clsx(
          'flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors',
          'text-xs font-medium text-zinc-500 dark:text-zinc-500',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-300',
          'border border-dashed border-zinc-300 dark:border-zinc-700'
        )}
      >
        <Plus className="h-3 w-3" />
        Add group
      </button>
    );
  }

  return (
    <div className="space-y-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
      {/* Name input row */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Group name..."
          className="flex-1 px-2.5 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-md outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-500"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={isLoading || !newGroupName.trim()}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            isLoading || !newGroupName.trim()
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
          )}
        >
          Create
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Color picker */}
      <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Color (optional)</p>
        <div className="max-w-fit">
          <ColorPickerDropdown
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
          />
        </div>
      </div>
    </div>
  );
}
