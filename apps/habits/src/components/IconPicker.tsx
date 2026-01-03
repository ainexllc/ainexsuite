'use client';

import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { useGrowStore } from '../lib/store';
import { ICON_BUNDLES } from '../lib/bundles';
import { HABIT_CATEGORIES } from '../types/models';
import { cn } from '../lib/utils';

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (icon: string) => void;
}

export function IconPicker({ isOpen, onClose, onSelect }: IconPickerProps) {
  const [tab, setTab] = useState<'emoji' | 'bundles'>('emoji');
  const [search, setSearch] = useState('');
  const { ownedBundles, loadOwnedBundles } = useGrowStore();

  // Load bundles on open
  if (isOpen) {
    loadOwnedBundles();
  }

  // Flat owned icons
  const ownedIcons = ownedBundles.reduce((acc, bundleId) => {
    const bundle = ICON_BUNDLES.find(b => b.id === bundleId);
    return bundle ? [...acc, ...bundle.icons] : acc;
  }, [] as string[]);

  // Filter
  const filteredEmoji = HABIT_CATEGORIES.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  const filteredBundles = ownedIcons.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const icons = tab === 'emoji' ? filteredEmoji.map(cat => cat.icon) : filteredBundles;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Choose Icon</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-700 px-6 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('emoji')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'emoji'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              )}
            >
              Emoji
            </button>
            <button
              onClick={() => setTab('bundles')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === 'bundles'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              )}
              disabled={ownedIcons.length === 0}
            >
              Bundles ({ownedIcons.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent"
            />
          </div>
        </div>

        {/* Icons Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-6 gap-3">
            {icons.slice(0, 48).map((icon, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelect(icon);
                  onClose();
                }}
                className="group relative p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors aspect-square flex items-center justify-center text-2xl cursor-pointer hover:scale-110 hover:shadow-md"
                title={icon}
              >
                <span className="text-2xl">{tab === 'emoji' ? icon : icon}</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all" />
              </button>
            ))}
          </div>
          {icons.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500 dark:text-zinc-400">
              <Search className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No icons found</p>
              <p className="text-sm">Try a different search or tab</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
