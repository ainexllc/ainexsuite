'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface GroupManagerProps {
  onCreateGroup: (name: string) => Promise<void>;
}

export function GroupManager({ onCreateGroup }: GroupManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
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
      await onCreateGroup(trimmedName);
      setNewGroupName('');
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
      setIsCreating(false);
    }
  };

  if (!isCreating) {
    return (
      <button
        type="button"
        onClick={() => setIsCreating(true)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          'text-sm font-medium text-zinc-600 dark:text-zinc-400',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          'border border-dashed border-zinc-300 dark:border-zinc-700'
        )}
      >
        <Plus className="h-4 w-4" />
        Add group
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={newGroupName}
        onChange={(e) => setNewGroupName(e.target.value)}
        onBlur={() => {
          setNewGroupName('');
          setIsCreating(false);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Group name..."
        className="flex-1 px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
      />
      <button
        type="button"
        onClick={handleCreate}
        disabled={isLoading || !newGroupName.trim()}
        className={clsx(
          'px-3 py-2 text-sm font-medium rounded-lg transition-colors flex-shrink-0',
          isLoading || !newGroupName.trim()
            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
            : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
        )}
      >
        Create
      </button>
    </div>
  );
}
