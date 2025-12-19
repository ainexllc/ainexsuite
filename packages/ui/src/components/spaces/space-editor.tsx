'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, Users, Briefcase, Heart, Folder, Save, Globe, ArrowRight, ArrowLeft, Plus, X, Mail, Sparkles, Home, Star, Dumbbell, Check } from 'lucide-react';
import type { SpaceType, SpaceColor, SpaceRole, SpaceIcon } from '@ainexsuite/types';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../modal';
import { Button } from '../buttons/button';
import { Input, FormField } from '../forms';
import { cn } from '../../lib/utils';
import { useSpacesConfig, type SpaceTypeConfig } from '../../hooks/use-spaces-config';

/**
 * Configuration for a space type option in the editor
 */
export interface SpaceTypeOption {
  value: SpaceType;
  label: string;
  description: string;
}

export interface PendingMemberInvite {
  email: string;
  role: SpaceRole;
}

export interface SpaceEditorProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when user submits the form */
  onSubmit: (data: {
    name: string;
    type: SpaceType;
    isGlobal?: boolean;
    color?: SpaceColor;
    icon?: SpaceIcon;
    invites?: PendingMemberInvite[];
  }) => void | Promise<void>;
  /** Initial values for editing an existing space */
  initialValues?: { name: string; type: SpaceType; isGlobal?: boolean; color?: SpaceColor };
  /** Whether we're editing an existing space */
  isEditing?: boolean;
  /** Available space types (default: personal, family, work) */
  spaceTypes?: SpaceTypeOption[];
  /** Title for the modal */
  title?: string;
  /** Description for the modal */
  description?: string;
  /** Whether to show global space option */
  showGlobalOption?: boolean;
  /** Whether to show multi-step with member invites */
  showMemberInvites?: boolean;
}

const DEFAULT_SPACE_TYPES: SpaceTypeOption[] = [
  { value: 'personal', label: 'Personal', description: 'Your private space' },
  { value: 'family', label: 'Family', description: 'Share with family members' },
  { value: 'work', label: 'Work', description: 'Team projects and collaboration' },
  { value: 'couple', label: 'Couple', description: 'Share with your partner' },
  { value: 'buddy', label: 'Buddy', description: 'Accountability partner' },
  { value: 'squad', label: 'Team', description: 'Team collaboration' },
  { value: 'project', label: 'Project', description: 'Project-specific workspace' },
];

const SPACE_TYPE_ICONS: Record<SpaceType, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Sparkles,
  squad: Users,
  project: Folder,
};

// Icon mapping from string to component (for admin config)
const ICON_MAP: Record<string, typeof User> = {
  user: User,
  users: Users,
  heart: Heart,
  briefcase: Briefcase,
  dumbbell: Dumbbell,
  folder: Folder,
  sparkles: Sparkles,
  home: Home,
  star: Star,
  globe: Globe,
};

// Available icons for picker
const AVAILABLE_ICONS: { value: SpaceIcon; label: string }[] = [
  { value: 'user', label: 'User' },
  { value: 'users', label: 'Users' },
  { value: 'home', label: 'Home' },
  { value: 'briefcase', label: 'Briefcase' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
  { value: 'folder', label: 'Folder' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'globe', label: 'Globe' },
];

const SPACE_COLORS: { value: SpaceColor; label: string; class: string }[] = [
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'gray', label: 'Gray', class: 'bg-zinc-500' },
];

/**
 * Shared SpaceEditor component for creating/editing spaces.
 * Supports multi-step flow for creating new spaces with member invites.
 */
export function SpaceEditor({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEditing = false,
  spaceTypes,
  title,
  description,
  showGlobalOption = true,
  showMemberInvites = true,
}: SpaceEditorProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<SpaceType>('personal');
  const [isGlobal, setIsGlobal] = useState(false);
  const [color, setColor] = useState<SpaceColor>('default');
  const [icon, setIcon] = useState<SpaceIcon | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Member invites (step 2)
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<SpaceRole>('member');
  const [pendingInvites, setPendingInvites] = useState<PendingMemberInvite[]>([]);

  // Fetch admin config for space types
  const { spaceTypes: adminTypes } = useSpacesConfig();

  // Get full admin type configs (for colors/icons)
  const adminTypeMap = useMemo(() => {
    const map: Record<string, SpaceTypeConfig> = {};
    if (adminTypes) {
      adminTypes.forEach((t) => {
        map[t.id] = t;
      });
    }
    return map;
  }, [adminTypes]);

  // Convert admin types to SpaceTypeOption format, filtering to enabled only
  const effectiveSpaceTypes = useMemo(() => {
    // If prop provided, use that
    if (spaceTypes) return spaceTypes;

    // If admin types available, convert and filter
    if (adminTypes && adminTypes.length > 0) {
      const enabledTypes = adminTypes
        .filter((t) => t.enabled !== false)
        .map((t) => ({
          value: t.id as SpaceType,
          label: t.label,
          description: t.description,
        }));
      if (enabledTypes.length > 0) return enabledTypes;
    }

    // Fallback to defaults
    return DEFAULT_SPACE_TYPES;
  }, [spaceTypes, adminTypes]);

  // Get icon component for a type
  const getTypeIcon = (typeId: SpaceType) => {
    const adminConfig = adminTypeMap[typeId];
    if (adminConfig?.icon) {
      return ICON_MAP[adminConfig.icon] || SPACE_TYPE_ICONS[typeId] || User;
    }
    return SPACE_TYPE_ICONS[typeId] || User;
  };

  // Get admin styling for a type
  const getTypeStyle = (typeId: SpaceType) => {
    const adminConfig = adminTypeMap[typeId];
    if (adminConfig) {
      return {
        color: adminConfig.color,
        bgColor: adminConfig.bgColor,
        borderColor: adminConfig.borderColor,
      };
    }
    return null;
  };

  // Reset/load form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      if (initialValues) {
        setName(initialValues.name);
        setType(initialValues.type);
        setIsGlobal(initialValues.isGlobal || false);
        setColor(initialValues.color || 'default');
      } else {
        setName('');
        setType('personal');
        setIsGlobal(false);
        setColor('default');
        setIcon(undefined);
      }
      setPendingInvites([]);
      setInviteEmail('');
    }
  }, [isOpen, initialValues]);

  const canInviteMembers = type !== 'personal' && showMemberInvites && !isEditing;
  const totalSteps = canInviteMembers ? 2 : 1;

  const handleAddInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return;
    if (pendingInvites.some((i) => i.email === email)) return;

    setPendingInvites([...pendingInvites, { email, role: inviteRole }]);
    setInviteEmail('');
    setInviteRole('member');
  };

  const handleRemoveInvite = (email: string) => {
    setPendingInvites(pendingInvites.filter((i) => i.email !== email));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    // If on step 1 and can invite, go to step 2
    if (step === 1 && canInviteMembers) {
      handleNext();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        type,
        isGlobal: showGlobalOption ? isGlobal : undefined,
        color: color !== 'default' ? color : undefined,
        icon: icon,
        invites: pendingInvites.length > 0 ? pendingInvites : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = title || (isEditing ? 'Edit Space' : 'Create New Space');
  const modalDescription = description || (isEditing
    ? 'Update your space details'
    : step === 1
      ? 'Set up your new space'
      : 'Invite members to collaborate');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          <div>
            <ModalTitle>{modalTitle}</ModalTitle>
            <ModalDescription>{modalDescription}</ModalDescription>
          </div>
        </ModalHeader>

        <ModalContent className="space-y-6">
          {/* Step indicator */}
          {totalSteps > 1 && (
            <div className="flex items-center justify-center gap-2 pb-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i + 1 === step
                      ? 'w-8 bg-[var(--color-primary)]'
                      : i + 1 < step
                        ? 'w-4 bg-[var(--color-primary)]/50'
                        : 'w-4 bg-zinc-300 dark:bg-zinc-700'
                  )}
                />
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              {/* Space Name */}
              <FormField label="Space Name" required>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Home Projects, Work Team, Family"
                  autoFocus
                  required
                />
              </FormField>

              {/* Space Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  Space Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {effectiveSpaceTypes.map((spaceType) => {
                    const Icon = getTypeIcon(spaceType.value);
                    const isSelected = type === spaceType.value;
                    const typeStyle = getTypeStyle(spaceType.value);

                    return (
                      <button
                        key={spaceType.value}
                        type="button"
                        onClick={() => setType(spaceType.value)}
                        className={cn(
                          'relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 transition-all min-h-[120px]',
                          isSelected
                            ? 'shadow-lg'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900 hover:shadow-md'
                        )}
                        style={isSelected && typeStyle ? {
                          backgroundColor: typeStyle.bgColor,
                          borderColor: typeStyle.color,
                        } : undefined}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                            !isSelected && 'bg-zinc-100 dark:bg-zinc-800'
                          )}
                          style={typeStyle ? {
                            backgroundColor: isSelected ? `${typeStyle.color}20` : typeStyle.bgColor,
                            color: typeStyle.color,
                          } : undefined}
                        >
                          <Icon className={cn(
                            'h-5 w-5',
                            !typeStyle && (isSelected ? 'text-[var(--color-primary)]' : 'text-zinc-600 dark:text-zinc-400')
                          )} />
                        </div>
                        <div className="text-center flex-1 flex flex-col justify-center">
                          <div
                            className={cn(
                              'text-sm font-semibold',
                              !typeStyle && (isSelected ? 'text-[var(--color-primary)]' : 'text-zinc-900 dark:text-zinc-100')
                            )}
                            style={isSelected && typeStyle ? { color: typeStyle.color } : undefined}
                          >
                            {spaceType.label}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight line-clamp-2">
                            {spaceType.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                            style={typeStyle ? { backgroundColor: typeStyle.color } : { backgroundColor: 'var(--color-primary)' }}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customization Row: Color & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Color picker */}
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPACE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColor(c.value)}
                        className={cn(
                          'w-7 h-7 rounded-full transition-all',
                          c.class,
                          color === c.value
                            ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white ring-offset-white dark:ring-offset-zinc-900 scale-110'
                            : 'hover:scale-110'
                        )}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon picker */}
                <div>
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_ICONS.map((i) => {
                      const IconComp = ICON_MAP[i.value] || User;
                      const isSelected = icon === i.value;
                      return (
                        <button
                          key={i.value}
                          type="button"
                          onClick={() => setIcon(isSelected ? undefined : i.value)}
                          className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                            isSelected
                              ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          )}
                          title={i.label}
                        >
                          <IconComp className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Global space option */}
              {showGlobalOption && (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all">
                  <input
                    type="checkbox"
                    checked={isGlobal}
                    onChange={(e) => setIsGlobal(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      <Globe className="h-4 w-4 text-blue-500" />
                      Make this a global space
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Accessible from all apps in your workspace
                    </div>
                  </div>
                </label>
              )}
            </>
          )}

          {step === 2 && (
            <>
              {/* Invite members */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  Invite Members
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="pl-9"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddInvite();
                        }
                      }}
                    />
                  </div>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as SpaceRole)}
                    className="h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <Button type="button" onClick={handleAddInvite} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Pending invites */}
              {pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Pending Invites ({pendingInvites.length})
                  </label>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.email}
                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-zinc-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {invite.email}
                            </div>
                            <div className="text-xs text-zinc-500 capitalize">
                              {invite.role}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveInvite(invite.email)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingInvites.length === 0 && (
                <div className="text-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No members invited yet.
                  <br />
                  You can always invite members later.
                </div>
              )}
            </>
          )}
        </ModalContent>

        <ModalFooter>
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
          )}

          {step === 1 && canInviteMembers ? (
            <Button type="submit" disabled={!name.trim()}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              <Save className="h-4 w-4" />
              {isEditing ? 'Save Changes' : 'Create Space'}
            </Button>
          )}
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default SpaceEditor;
