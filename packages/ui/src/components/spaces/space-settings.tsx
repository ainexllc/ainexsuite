'use client';

import { useState } from 'react';
import {
  User,
  Users,
  Briefcase,
  Heart,
  Home,
  Star,
  Folder,
  Sparkles,
  Globe,
  Trash2,
  Save,
  Mail,
  Plus,
  X,
  Crown,
  Shield,
  Eye,
  Clock,
  Baby,
  UserPlus,
} from 'lucide-react';
import type { SpaceType, SpaceColor, SpaceIcon, SpaceRole, SpaceMember, ChildMember, SpaceInvitation } from '@ainexsuite/types';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../modal';
import { Button } from '../buttons/button';
import { Input, FormField } from '../forms';
import { ConfirmationDialog } from '../confirmation-dialog';
import { cn } from '../../lib/utils';

/** Member limits per space type (null = unlimited) */
const SPACE_MEMBER_LIMITS: Record<SpaceType, number | null> = {
  personal: 1,
  couple: 2,
  family: null,
  work: null,
  buddy: 2,
  squad: null,
  project: null,
};

/** Space types that support child members */
const CHILD_MEMBER_SPACE_TYPES: SpaceType[] = ['family'];

export interface SpaceSettingsProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Space data */
  space: {
    id: string;
    name: string;
    type: SpaceType;
    color?: SpaceColor;
    icon?: SpaceIcon;
    isGlobal?: boolean;
    members: SpaceMember[];
    childMembers?: ChildMember[];
    pendingInviteCount?: number;
  };
  /** Pending invitations for this space */
  pendingInvitations?: SpaceInvitation[];
  /** Current user's ID */
  currentUserId: string;
  /** Callback when settings are saved */
  onSave?: (data: {
    name: string;
    color?: SpaceColor;
    icon?: SpaceIcon;
  }) => Promise<void>;
  /** Callback when space is deleted */
  onDelete?: () => Promise<void>;
  /** Callback when a member is invited */
  onInviteMember?: (email: string, role: SpaceRole) => Promise<void>;
  /** Callback when a member's role is changed */
  onChangeMemberRole?: (memberId: string, role: SpaceRole) => Promise<void>;
  /** Callback when a member is removed */
  onRemoveMember?: (memberId: string) => Promise<void>;
  /** Callback when an invitation is canceled */
  onCancelInvitation?: (invitationId: string) => Promise<void>;
  /** Callback to add a child member */
  onAddChild?: () => void;
  /** Callback to edit a child member */
  onEditChild?: (child: ChildMember) => void;
  /** Callback to remove a child member */
  onRemoveChild?: (childId: string) => Promise<void>;
  /** Whether user can edit this space */
  canEdit?: boolean;
  /** Whether user can delete this space */
  canDelete?: boolean;
}

const SPACE_TYPE_ICONS: Record<SpaceType, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Users,
  squad: Users,
  project: Folder,
};

const SPACE_ICON_MAP: Record<SpaceIcon, typeof User> = {
  user: User,
  users: Users,
  home: Home,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  folder: Folder,
  sparkles: Sparkles,
  globe: Globe,
};

const SPACE_COLORS: { value: SpaceColor; label: string; class: string }[] = [
  { value: 'default', label: 'Default', class: 'bg-zinc-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { value: 'gray', label: 'Gray', class: 'bg-zinc-400' },
];

const SPACE_ICONS: { value: SpaceIcon; label: string }[] = [
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

const ROLE_ICONS: Record<SpaceRole, typeof Crown> = {
  admin: Crown,
  member: Shield,
  viewer: Eye,
};

/**
 * SpaceSettings - Modal for editing space settings and managing members
 */
export function SpaceSettings({
  isOpen,
  onClose,
  space,
  pendingInvitations = [],
  currentUserId,
  onSave,
  onDelete,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onCancelInvitation,
  onAddChild,
  onEditChild,
  onRemoveChild,
  canEdit = true,
  canDelete = true,
}: SpaceSettingsProps) {
  const [name, setName] = useState(space.name);
  const [color, setColor] = useState<SpaceColor>(space.color || 'default');
  const [icon, setIcon] = useState<SpaceIcon | undefined>(space.icon);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [, setIsDeleting] = useState(false);

  // Member invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<SpaceRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const currentUserRole = space.members.find((m) => m.uid === currentUserId)?.role;
  const isAdmin = currentUserRole === 'admin';
  const TypeIcon = SPACE_TYPE_ICONS[space.type];

  // Calculate member limits
  const memberLimit = SPACE_MEMBER_LIMITS[space.type];
  const currentMemberCount = space.members.length;
  const pendingCount = pendingInvitations.length || space.pendingInviteCount || 0;
  const totalCount = currentMemberCount + pendingCount;
  const canInviteMore = memberLimit === null || totalCount < memberLimit;
  const supportsChildMembers = CHILD_MEMBER_SPACE_TYPES.includes(space.type);
  const childMembers = space.childMembers || [];

  const handleSave = async () => {
    if (!name.trim() || !onSave) return;

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        color: color !== 'default' ? color : undefined,
        icon,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@') || !onInviteMember) return;

    setIsInviting(true);
    try {
      await onInviteMember(email, inviteRole);
      setInviteEmail('');
      setInviteRole('member');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalHeader onClose={onClose}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <TypeIcon className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <ModalTitle>Space Settings</ModalTitle>
              <ModalDescription>{space.name}</ModalDescription>
            </div>
          </div>
        </ModalHeader>

        <ModalContent className="space-y-6">
          {/* Basic Info */}
          {canEdit && (
            <>
              <FormField label="Space Name">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Space name"
                />
              </FormField>

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPACE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        c.class,
                        color === c.value
                          ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] ring-offset-white dark:ring-offset-zinc-900'
                          : 'hover:scale-110'
                      )}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPACE_ICONS.map((i) => {
                    const IconComp = SPACE_ICON_MAP[i.value];
                    const isSelected = icon === i.value;
                    return (
                      <button
                        key={i.value}
                        type="button"
                        onClick={() => setIcon(i.value)}
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                          isSelected
                            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        )}
                        title={i.label}
                      >
                        <IconComp className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Global badge */}
          {space.isGlobal && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-600 dark:text-blue-400">
                This is a global space accessible from all apps
              </span>
            </div>
          )}

          {/* Members Section */}
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Members
                </label>
                {memberLimit !== null && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {totalCount} / {memberLimit} {pendingCount > 0 && `(${pendingCount} pending)`}
                  </p>
                )}
              </div>
              {isAdmin && onInviteMember && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {/* Parent should open InviteMemberModal */}}
                  disabled={!canInviteMore}
                >
                  <UserPlus className="h-4 w-4" />
                  Invite
                </Button>
              )}
            </div>

            {/* Member limit warning */}
            {memberLimit !== null && !canInviteMore && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm mb-4">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span>
                  This {space.type} space has reached its maximum of {memberLimit} members.
                </span>
              </div>
            )}

            {/* Invite member (for admins) */}
            {isAdmin && onInviteMember && canInviteMore && (
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Invite by email..."
                    className="pl-9"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInvite();
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
                <Button
                  type="button"
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-zinc-500 mb-2">
                  Pending Invitations
                </label>
                <div className="space-y-2">
                  {pendingInvitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {invitation.email}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <span className="capitalize">{invitation.role}</span>
                            <span>•</span>
                            <span>
                              Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isAdmin && onCancelInvitation && (
                        <button
                          onClick={() => onCancelInvitation(invitation.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                          title="Cancel invitation"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members list */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {space.members.map((member) => {
                const RoleIcon = ROLE_ICONS[member.role];
                const isCurrentUser = member.uid === currentUserId;
                const canModify = isAdmin && !isCurrentUser;

                return (
                  <div
                    key={member.uid}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-3">
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={member.displayName || 'Member'}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                          <User className="h-4 w-4 text-zinc-500" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {member.displayName || member.email || 'Unknown'}
                          {isCurrentUser && (
                            <span className="text-xs text-zinc-500">(you)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <RoleIcon className="h-3 w-3" />
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </div>
                    </div>

                    {canModify && (
                      <div className="flex items-center gap-2">
                        {onChangeMemberRole && (
                          <select
                            value={member.role}
                            onChange={(e) => onChangeMemberRole(member.uid, e.target.value as SpaceRole)}
                            className="h-8 px-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        )}
                        {onRemoveMember && (
                          <button
                            onClick={() => onRemoveMember(member.uid)}
                            className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                            title="Remove member"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Child Members Section (Family spaces only) */}
          {supportsChildMembers && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Child Members
                  </label>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Children don&apos;t need their own account
                  </p>
                </div>
                {isAdmin && onAddChild && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onAddChild}
                  >
                    <Baby className="h-4 w-4" />
                    Add Child
                  </Button>
                )}
              </div>

              {childMembers.length === 0 ? (
                <div className="text-center py-6 text-sm text-zinc-500">
                  No child members yet
                </div>
              ) : (
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {childMembers.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-pink-500/5 border border-pink-500/10"
                    >
                      <div className="flex items-center gap-3">
                        {child.photoURL ? (
                          <img
                            src={child.photoURL}
                            alt={child.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                            <Baby className="h-4 w-4 text-pink-500" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {child.displayName}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            {child.relationship && (
                              <>
                                <span className="capitalize">{child.relationship}</span>
                                <span>•</span>
                              </>
                            )}
                            <Eye className="h-3 w-3" />
                            <span>Viewer</span>
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          {onEditChild && (
                            <button
                              onClick={() => onEditChild(child)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                              title="Edit child"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                          )}
                          {onRemoveChild && (
                            <button
                              onClick={() => onRemoveChild(child.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                              title="Remove child"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Danger Zone */}
          {canDelete && onDelete && (
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <label className="block text-sm font-medium text-red-500 mb-3">
                Danger Zone
              </label>
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete Space
              </Button>
              <p className="text-xs text-zinc-500 mt-2">
                This will permanently delete this space and all its content.
              </p>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {canEdit && onSave && (
            <Button onClick={handleSave} disabled={!name.trim() || isSaving}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          )}
        </ModalFooter>
      </Modal>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete this space?"
        description={`This will permanently delete "${space.name}" and all its content. This action cannot be undone.`}
        confirmText="Delete Space"
        cancelText="Keep Space"
        variant="danger"
      />
    </>
  );
}

export default SpaceSettings;
