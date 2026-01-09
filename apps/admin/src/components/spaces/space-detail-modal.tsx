'use client';

import { useState } from 'react';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalContent,
  ModalFooter,
} from '@ainexsuite/ui';
import {
  User,
  Users,
  Heart,
  Briefcase,
  Folder,
  Sparkles,
  Pencil,
  Trash2,
  UserPlus,
  Save,
  Loader2,
} from 'lucide-react';
import type { SpaceType, SpaceRole } from '@ainexsuite/types';
import Image from 'next/image';

interface SpaceMemberData {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  role: SpaceRole;
  joinedAt: number;
}

interface SpaceData {
  id: string;
  app: string;
  name: string;
  type: SpaceType;
  description?: string;
  memberCount: number;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  lastActive?: string;
  ownerId?: string;
  members?: SpaceMemberData[];
}

interface SpaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: SpaceData | null;
  mode: 'view' | 'edit';
  onSave?: (updates: Partial<SpaceData>) => Promise<void>;
  onRemoveMember?: (spaceId: string, memberUid: string) => Promise<void>;
  onChangeMemberRole?: (spaceId: string, memberUid: string, newRole: SpaceRole) => Promise<void>;
  onAddMember?: (spaceId: string, email: string, role: SpaceRole) => Promise<void>;
}

const SPACE_TYPES: SpaceType[] = ['personal', 'family', 'work', 'couple', 'buddy', 'squad', 'project'];

const SPACE_TYPE_ICONS: Record<string, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Sparkles,
  squad: Users,
  project: Folder,
};

const SPACE_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  personal: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  family: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  work: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  couple: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  buddy: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  squad: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  project: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20' },
};

const ROLE_COLORS: Record<SpaceRole, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  member: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  viewer: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
};

export function SpaceDetailModal({
  isOpen,
  onClose,
  space,
  mode: initialMode,
  onSave,
  onRemoveMember,
  onChangeMemberRole,
  onAddMember,
}: SpaceDetailModalProps) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [editedName, setEditedName] = useState(space?.name || '');
  const [editedType, setEditedType] = useState<SpaceType>(space?.type || 'personal');
  const [editedDescription, setEditedDescription] = useState(space?.description || '');
  const [saving, setSaving] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<SpaceRole>('member');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reset form when space changes
  useState(() => {
    if (space) {
      setEditedName(space.name);
      setEditedType(space.type);
      setEditedDescription(space.description || '');
    }
    setMode(initialMode);
  });

  if (!space) return null;

  const Icon = SPACE_TYPE_ICONS[space.type] || User;
  const colors = SPACE_TYPE_COLORS[space.type] || SPACE_TYPE_COLORS.personal;

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave({
        name: editedName,
        type: editedType,
        description: editedDescription,
      });
      setMode('view');
    } catch (error) {
      console.error('Failed to save space:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (memberUid: string) => {
    if (!onRemoveMember || !confirm('Are you sure you want to remove this member?')) return;
    setActionLoading(memberUid);
    try {
      await onRemoveMember(space.id, memberUid);
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (memberUid: string, newRole: SpaceRole) => {
    if (!onChangeMemberRole) return;
    setActionLoading(memberUid);
    try {
      await onChangeMemberRole(space.id, memberUid, newRole);
    } catch (error) {
      console.error('Failed to change role:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddMember = async () => {
    if (!onAddMember || !newMemberEmail) return;
    setActionLoading('add');
    try {
      await onAddMember(space.id, newMemberEmail, newMemberRole);
      setNewMemberEmail('');
      setNewMemberRole('member');
      setShowAddMember(false);
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | number) => {
    const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${colors.bg} ${colors.border}`}>
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          <div>
            <ModalTitle>{mode === 'edit' ? 'Edit Space' : 'Space Details'}</ModalTitle>
            <ModalDescription>
              {space.app} - Created {formatDate(space.createdAt)}
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <ModalContent className="max-h-[60vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Folder className="h-4 w-4 text-muted-foreground" />
              Basic Information
            </h3>

            {mode === 'view' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-foreground font-medium">{space.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${colors.bg} ${colors.text} ${colors.border}`}
                  >
                    <Icon className="h-3 w-3" />
                    {space.type}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground/80 text-sm">
                    {space.description || 'No description'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Owner</p>
                  <p className="text-foreground/80">{space.createdByName || space.createdBy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">App</p>
                  <p className="text-foreground/80 capitalize">{space.app}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-elevated/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPACE_TYPES.map((type) => {
                      const TypeIcon = SPACE_TYPE_ICONS[type];
                      const typeColors = SPACE_TYPE_COLORS[type];
                      const isSelected = editedType === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setEditedType(type)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm capitalize transition-all ${
                            isSelected
                              ? `${typeColors.bg} ${typeColors.text} ${typeColors.border}`
                              : 'border-border text-muted-foreground hover:border-foreground/30'
                          }`}
                        >
                          <TypeIcon className="h-3.5 w-3.5" />
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-surface-elevated/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50 resize-none"
                    placeholder="Optional description..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Members Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Members ({space.members?.length || space.memberCount})
              </h3>
              {mode === 'edit' && onAddMember && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="p-4 bg-surface-elevated/50 border border-border rounded-lg space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full px-3 py-2 bg-background/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as SpaceRole)}
                    className="px-3 py-2 bg-background/20 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={!newMemberEmail || actionLoading === 'add'}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === 'add' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {space.members?.map((member) => {
                const roleColors = ROLE_COLORS[member.role];
                const isOwner = member.uid === space.ownerId;
                return (
                  <div
                    key={member.uid}
                    className="flex items-center gap-3 p-3 bg-surface-elevated/30 border border-border rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-full bg-surface-elevated overflow-hidden border border-border flex-shrink-0">
                      {member.photoURL ? (
                        <Image
                          src={member.photoURL}
                          alt={member.displayName || ''}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {member.displayName || 'Unnamed'}
                        </p>
                        {isOwner && (
                          <span className="text-xs text-amber-400 font-medium">Owner</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {mode === 'edit' && !isOwner ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.uid, e.target.value as SpaceRole)}
                          disabled={actionLoading === member.uid}
                          className={`px-2 py-1 rounded text-xs font-medium border ${roleColors.bg} ${roleColors.text} ${roleColors.border} focus:outline-none cursor-pointer`}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border capitalize ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}
                        >
                          {member.role}
                        </span>
                      )}
                      {mode === 'edit' && !isOwner && onRemoveMember && (
                        <button
                          onClick={() => handleRemoveMember(member.uid)}
                          disabled={actionLoading === member.uid}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          {actionLoading === member.uid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {(!space.members || space.members.length === 0) && (
                <p className="text-center text-muted-foreground py-4">No member details available</p>
              )}
            </div>
          </div>
        </div>
      </ModalContent>

      <ModalFooter>
        {mode === 'view' ? (
          <>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
            {onSave && (
              <button
                onClick={() => setMode('edit')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setMode('view');
                setEditedName(space.name);
                setEditedType(space.type);
                setEditedDescription(space.description || '');
              }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editedName}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
