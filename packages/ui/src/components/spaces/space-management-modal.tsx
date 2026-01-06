'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Heart,
  Briefcase,
  Sparkles,
  ArrowLeft,
  Check,
  Plus,
  Settings,
  Trash2,
  LogOut,
  Pencil,
} from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../modal';
import { Button } from '../buttons/button';
import { Input, FormField } from '../forms';
import { ConfirmationDialog } from '../confirmation-dialog';
import { cn } from '../../lib/utils';

/** Available apps for visibility configuration */
const AVAILABLE_APPS = [
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'journal', label: 'Journal', icon: '📔' },
  { id: 'todo', label: 'Todo', icon: '✓' },
  { id: 'health', label: 'Health', icon: '❤️' },
  { id: 'fit', label: 'Fit', icon: '💪' },
  { id: 'album', label: 'Moments', icon: '📷' },
  { id: 'habits', label: 'Habits', icon: '🌱' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'projects', label: 'Projects', icon: '📊' },
  { id: 'subs', label: 'Subs', icon: '💰' },
] as const;

/** Global predefined space types that users can join/leave */
const GLOBAL_SPACE_TYPES = [
  {
    type: 'family' as SpaceType,
    label: 'Family',
    description: 'Share with family members',
    icon: Users,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    type: 'couple' as SpaceType,
    label: 'Couple',
    description: 'Share with your partner',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  {
    type: 'squad' as SpaceType,
    label: 'Team',
    description: 'Team collaboration',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    type: 'work' as SpaceType,
    label: 'Group',
    description: 'General group space',
    icon: Briefcase,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
] as const;

export interface UserSpace {
  id: string;
  name: string;
  type: SpaceType;
  isGlobal?: boolean;
  hiddenInApps?: string[];
  isOwner: boolean;
}

export interface SpaceManagementModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Current user's spaces (to show which global spaces they've joined) */
  userSpaces: UserSpace[];
  /** Callback when user joins a global space */
  onJoinGlobalSpace: (type: SpaceType, hiddenInApps: string[]) => Promise<void>;
  /** Callback when user leaves a global space */
  onLeaveGlobalSpace: (spaceId: string) => Promise<void>;
  /** Callback when user creates a custom space */
  onCreateCustomSpace: (name: string, hiddenInApps: string[]) => Promise<void>;
  /** Callback when user renames a custom space */
  onRenameCustomSpace?: (spaceId: string, name: string) => Promise<void>;
  /** Callback when user deletes a custom space */
  onDeleteCustomSpace?: (spaceId: string) => Promise<void>;
  /** Callback when user updates space visibility */
  onUpdateSpaceVisibility?: (spaceId: string, hiddenInApps: string[]) => Promise<void>;
}

type ModalView = 'main' | 'global' | 'custom' | 'manage-custom';

/**
 * SpaceManagementModal - Modal for managing spaces
 * Users can join/leave global spaces or create/manage custom spaces
 */
export function SpaceManagementModal({
  isOpen,
  onClose,
  userSpaces,
  onJoinGlobalSpace,
  onLeaveGlobalSpace,
  onCreateCustomSpace,
  onRenameCustomSpace,
  onDeleteCustomSpace,
  onUpdateSpaceVisibility: _onUpdateSpaceVisibility,
}: SpaceManagementModalProps) {
  const [view, setView] = useState<ModalView>('main');
  const [selectedGlobalType, setSelectedGlobalType] = useState<SpaceType | null>(null);
  const [hiddenInApps, setHiddenInApps] = useState<string[]>([]);
  const [customSpaceName, setCustomSpaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSpace, setEditingSpace] = useState<UserSpace | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState<UserSpace | null>(null);
  const [spaceToLeave, setSpaceToLeave] = useState<UserSpace | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setView('main');
      setSelectedGlobalType(null);
      setHiddenInApps([]);
      setCustomSpaceName('');
      setEditingSpace(null);
    }
  }, [isOpen]);

  // Get user's joined global spaces by type
  const joinedGlobalSpaces = useMemo(() => {
    const map: Record<SpaceType, UserSpace | undefined> = {} as Record<SpaceType, UserSpace | undefined>;
    userSpaces.forEach((space) => {
      if (space.isGlobal) {
        map[space.type] = space;
      }
    });
    return map;
  }, [userSpaces]);

  // Get user's custom spaces (non-global)
  const customSpaces = useMemo(() => {
    return userSpaces.filter((s) => !s.isGlobal && s.type !== 'personal');
  }, [userSpaces]);

  const handleJoinGlobalSpace = async () => {
    if (!selectedGlobalType) return;

    setIsSubmitting(true);
    try {
      await onJoinGlobalSpace(selectedGlobalType, hiddenInApps);
      setView('main');
      setSelectedGlobalType(null);
      setHiddenInApps([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveGlobalSpace = async (space: UserSpace) => {
    setIsSubmitting(true);
    try {
      await onLeaveGlobalSpace(space.id);
      setShowLeaveConfirm(false);
      setSpaceToLeave(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCustomSpace = async () => {
    if (!customSpaceName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateCustomSpace(customSpaceName.trim(), hiddenInApps);
      setView('main');
      setCustomSpaceName('');
      setHiddenInApps([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRenameSpace = async () => {
    if (!editingSpace || !onRenameCustomSpace) return;

    setIsSubmitting(true);
    try {
      await onRenameCustomSpace(editingSpace.id, editingSpace.name);
      setEditingSpace(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpace = async () => {
    if (!spaceToDelete || !onDeleteCustomSpace) return;

    setIsSubmitting(true);
    try {
      await onDeleteCustomSpace(spaceToDelete.id);
      setShowDeleteConfirm(false);
      setSpaceToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMainView = () => (
    <>
      <ModalHeader onClose={onClose}>
        <div>
          <ModalTitle>Manage Spaces</ModalTitle>
          <ModalDescription>
            Join shared spaces or create your own
          </ModalDescription>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {/* Option Cards */}
        <button
          onClick={() => setView('global')}
          className="w-full p-5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)] bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--color-primary)] transition-colors">
                Join a Global Space
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Family, Couple, Team, Group
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                Predefined shared spaces for collaboration
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setView('custom')}
          className="w-full p-5 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 hover:border-[var(--color-primary)] dark:hover:border-[var(--color-primary)] bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-violet-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--color-primary)] transition-colors">
                Create Custom Space
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Create your own shared space
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                With a custom name and app visibility
              </p>
            </div>
          </div>
        </button>

        {/* My Custom Spaces */}
        {customSpaces.length > 0 && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                My Custom Spaces
              </h4>
              <button
                onClick={() => setView('manage-custom')}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Manage all
              </button>
            </div>
            <div className="space-y-2">
              {customSpaces.slice(0, 3).map((space) => (
                <div
                  key={space.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                    </div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {space.name}
                    </span>
                  </div>
                  {space.isOwner && (
                    <button
                      onClick={() => {
                        setEditingSpace(space);
                        setView('manage-custom');
                      }}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </ModalContent>
    </>
  );

  const renderGlobalView = () => (
    <>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setView('main');
              setSelectedGlobalType(null);
              setHiddenInApps([]);
            }}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-500" />
          </button>
          <div>
            <ModalTitle>Join a Global Space</ModalTitle>
            <ModalDescription>
              {selectedGlobalType ? 'Configure app visibility' : 'Select a space type to join'}
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        {!selectedGlobalType ? (
          // Space Type Selection
          <div className="grid grid-cols-2 gap-3">
            {GLOBAL_SPACE_TYPES.map((spaceType) => {
              const Icon = spaceType.icon;
              const joinedSpace = joinedGlobalSpaces[spaceType.type];
              const isJoined = !!joinedSpace;

              return (
                <button
                  key={spaceType.type}
                  onClick={() => {
                    if (isJoined) {
                      setSpaceToLeave(joinedSpace);
                      setShowLeaveConfirm(true);
                    } else {
                      setSelectedGlobalType(spaceType.type);
                    }
                  }}
                  className={cn(
                    'relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all',
                    isJoined
                      ? `${spaceType.bgColor} ${spaceType.borderColor}`
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900 hover:shadow-md'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center',
                    isJoined ? spaceType.bgColor : 'bg-zinc-100 dark:bg-zinc-800'
                  )}>
                    <Icon className={cn('h-6 w-6', spaceType.color)} />
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'text-sm font-semibold',
                      isJoined ? spaceType.color : 'text-zinc-900 dark:text-zinc-100'
                    )}>
                      {spaceType.label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {spaceType.description}
                    </div>
                  </div>
                  {isJoined && (
                    <div className={cn(
                      'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
                      spaceType.bgColor
                    )}>
                      <Check className={cn('h-4 w-4', spaceType.color)} />
                    </div>
                  )}
                  <div className={cn(
                    'text-xs font-medium mt-1 px-2 py-0.5 rounded-full',
                    isJoined
                      ? `${spaceType.bgColor} ${spaceType.color}`
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  )}>
                    {isJoined ? 'Leave' : 'Join'}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          // App Visibility Configuration
          <>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Choose which apps should show this space:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AVAILABLE_APPS.map((app) => {
                  const isVisible = !hiddenInApps.includes(app.id);
                  return (
                    <label
                      key={app.id}
                      className={cn(
                        'flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all',
                        isVisible
                          ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
                          : 'bg-zinc-100 dark:bg-zinc-800 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setHiddenInApps(hiddenInApps.filter(id => id !== app.id));
                          } else {
                            setHiddenInApps([...hiddenInApps, app.id]);
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-zinc-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />
                      <span className="text-sm">{app.icon}</span>
                      <span className={cn(
                        'text-xs font-medium',
                        isVisible ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'
                      )}>
                        {app.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </ModalContent>

      {selectedGlobalType && (
        <ModalFooter>
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedGlobalType(null);
              setHiddenInApps([]);
            }}
          >
            Back
          </Button>
          <Button onClick={handleJoinGlobalSpace} disabled={isSubmitting}>
            <Plus className="h-4 w-4" />
            Join {GLOBAL_SPACE_TYPES.find(t => t.type === selectedGlobalType)?.label}
          </Button>
        </ModalFooter>
      )}
    </>
  );

  const renderCustomView = () => (
    <>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setView('main');
              setCustomSpaceName('');
              setHiddenInApps([]);
            }}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-500" />
          </button>
          <div>
            <ModalTitle>Create Custom Space</ModalTitle>
            <ModalDescription>
              Create your own shared space with a custom name
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-4">
        <FormField label="Space Name" required>
          <Input
            type="text"
            value={customSpaceName}
            onChange={(e) => setCustomSpaceName(e.target.value)}
            placeholder="e.g., Book Club, Roommates, Study Group"
            autoFocus
          />
        </FormField>

        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Choose which apps should show this space:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AVAILABLE_APPS.map((app) => {
              const isVisible = !hiddenInApps.includes(app.id);
              return (
                <label
                  key={app.id}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all',
                    isVisible
                      ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30'
                      : 'bg-zinc-100 dark:bg-zinc-800 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-600'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHiddenInApps(hiddenInApps.filter(id => id !== app.id));
                      } else {
                        setHiddenInApps([...hiddenInApps, app.id]);
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-zinc-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm">{app.icon}</span>
                  <span className={cn(
                    'text-xs font-medium',
                    isVisible ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400'
                  )}>
                    {app.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        <Button
          variant="ghost"
          onClick={() => {
            setView('main');
            setCustomSpaceName('');
            setHiddenInApps([]);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreateCustomSpace}
          disabled={!customSpaceName.trim() || isSubmitting}
        >
          <Plus className="h-4 w-4" />
          Create Space
        </Button>
      </ModalFooter>
    </>
  );

  const renderManageCustomView = () => (
    <>
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setView('main');
              setEditingSpace(null);
            }}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-500" />
          </button>
          <div>
            <ModalTitle>My Custom Spaces</ModalTitle>
            <ModalDescription>
              Manage your custom spaces
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-3">
        {customSpaces.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No custom spaces yet
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setView('custom')}
            >
              <Plus className="h-4 w-4" />
              Create one
            </Button>
          </div>
        ) : (
          customSpaces.map((space) => (
            <div
              key={space.id}
              className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              {editingSpace?.id === space.id ? (
                // Editing mode
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={editingSpace.name}
                    onChange={(e) => setEditingSpace({ ...editingSpace, name: e.target.value })}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSpace(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleRenameSpace}
                      disabled={!editingSpace.name.trim() || isSubmitting}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {space.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {space.isOwner ? 'Owner' : 'Member'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {space.isOwner && onRenameCustomSpace && (
                      <button
                        onClick={() => setEditingSpace(space)}
                        className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Rename"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {space.isOwner && onDeleteCustomSpace ? (
                      <button
                        onClick={() => {
                          setSpaceToDelete(space);
                          setShowDeleteConfirm(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSpaceToLeave(space);
                          setShowLeaveConfirm(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-amber-500 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Leave"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </ModalContent>

      <ModalFooter>
        <Button variant="ghost" onClick={() => setView('main')}>
          Back
        </Button>
        <Button onClick={() => setView('custom')}>
          <Plus className="h-4 w-4" />
          Create New
        </Button>
      </ModalFooter>
    </>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        {view === 'main' && renderMainView()}
        {view === 'global' && renderGlobalView()}
        {view === 'custom' && renderCustomView()}
        {view === 'manage-custom' && renderManageCustomView()}
      </Modal>

      {/* Leave Confirmation */}
      <ConfirmationDialog
        isOpen={showLeaveConfirm}
        onClose={() => {
          setShowLeaveConfirm(false);
          setSpaceToLeave(null);
        }}
        onConfirm={() => spaceToLeave && handleLeaveGlobalSpace(spaceToLeave)}
        title="Leave this space?"
        description={`You will no longer have access to "${spaceToLeave?.name}" and its content.`}
        confirmText="Leave Space"
        cancelText="Stay"
        variant="warning"
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSpaceToDelete(null);
        }}
        onConfirm={handleDeleteSpace}
        title="Delete this space?"
        description={`This will permanently delete "${spaceToDelete?.name}" and all its content. This action cannot be undone.`}
        confirmText="Delete Space"
        cancelText="Keep Space"
        variant="danger"
      />
    </>
  );
}

export default SpaceManagementModal;
