'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { Space, SpaceRole } from '@ainexsuite/types';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent } from '../modal';
import { Button } from '../buttons/button';
import { SpaceCard } from './space-card';
import { cn } from '../../lib/utils';

type TabType = 'all' | 'owned' | 'shared';

export interface SpaceHubItem {
  id: string;
  name: string;
  type: Space['type'];
  color?: Space['color'];
  icon?: Space['icon'];
  isGlobal?: boolean;
  hiddenInApps?: string[];
  memberCount: number;
  userRole: SpaceRole;
  itemCount?: number;
  createdAt?: Date;
  isDefault?: boolean;
}

export interface SpacesHubModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** List of spaces */
  spaces: SpaceHubItem[];
  /** Currently selected space ID */
  currentSpaceId?: string | null;
  /** Current user's ID */
  currentUserId: string;
  /** Callback when a space is selected */
  onSelectSpace?: (spaceId: string) => void;
  /** Callback when create space is clicked */
  onCreateSpace?: () => void;
  /** Callback when space settings is clicked */
  onSpaceSettings?: (spaceId: string) => void;
  /** App name for context */
  appName?: string;
}

/**
 * SpacesHubModal - Central modal for managing all spaces
 */
export function SpacesHubModal({
  isOpen,
  onClose,
  spaces,
  currentSpaceId,
  currentUserId: _currentUserId,
  onSelectSpace,
  onCreateSpace,
  onSpaceSettings,
  appName,
}: SpacesHubModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter spaces based on tab and search
  const filteredSpaces = useMemo(() => {
    let filtered = spaces;

    // Filter by tab
    switch (activeTab) {
      case 'owned':
        filtered = filtered.filter((s) => s.userRole === 'admin');
        break;
      case 'shared':
        filtered = filtered.filter((s) => s.memberCount > 1 && s.userRole !== 'admin');
        break;
      default:
        break;
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(query) ||
        s.type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [spaces, activeTab, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => ({
    all: spaces.length,
    owned: spaces.filter((s) => s.userRole === 'admin').length,
    shared: spaces.filter((s) => s.memberCount > 1 && s.userRole !== 'admin').length,
  }), [spaces]);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'all', label: 'All Spaces', count: counts.all },
    { id: 'owned', label: 'My Spaces', count: counts.owned },
    { id: 'shared', label: 'Shared', count: counts.shared },
  ];

  const handleSpaceClick = (spaceId: string) => {
    onSelectSpace?.(spaceId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center justify-between w-full pr-8">
          <div>
            <ModalTitle>Spaces</ModalTitle>
            <ModalDescription>
              {appName ? `Manage your ${appName} spaces` : 'Manage your spaces and collaborations'}
            </ModalDescription>
          </div>
          {onCreateSpace && (
            <Button onClick={onCreateSpace} size="sm">
              <Plus className="h-4 w-4" />
              Create Space
            </Button>
          )}
        </div>
      </ModalHeader>

      <ModalContent className="p-0">
        {/* Search and Tabs */}
        <div className="px-6 pt-2 pb-4 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search spaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-0 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                {tab.label}
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)]/20'
                    : 'bg-zinc-200 dark:bg-zinc-700'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Space List */}
        <div className="px-6 py-4 max-h-[400px] overflow-y-auto space-y-3">
          {filteredSpaces.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {searchQuery
                  ? 'No spaces found matching your search'
                  : activeTab === 'shared'
                    ? "You haven't been added to any shared spaces yet"
                    : 'No spaces yet'}
              </p>
              {!searchQuery && activeTab !== 'shared' && onCreateSpace && (
                <Button onClick={onCreateSpace} variant="ghost" size="sm" className="mt-2">
                  <Plus className="h-4 w-4" />
                  Create your first space
                </Button>
              )}
            </div>
          ) : (
            filteredSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                id={space.id}
                name={space.name}
                type={space.type}
                color={space.color}
                icon={space.icon}
                isGlobal={space.isGlobal}
                memberCount={space.memberCount}
                userRole={space.userRole}
                itemCount={space.itemCount}
                createdAt={space.createdAt}
                isSelected={space.id === currentSpaceId}
                isDefault={space.isDefault}
                onClick={() => handleSpaceClick(space.id)}
                onSettingsClick={
                  space.userRole === 'admin' && onSpaceSettings
                    ? () => onSpaceSettings(space.id)
                    : undefined
                }
              />
            ))
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}

export default SpacesHubModal;
