'use client';

import { useState } from 'react';
import {
  Mail,
  Crown,
  UserMinus,
  UserPlus,
  X,
  User,
  Send,
  Loader2,
  Check,
} from 'lucide-react';

/**
 * Generic member type for space members
 */
export interface MemberManagerMember {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt?: string | number;
}

/**
 * Generic space type for member manager
 */
export interface MemberManagerSpace {
  id: string;
  name: string;
  type: string;
  members: MemberManagerMember[];
  memberUids: string[];
  ownerId?: string;
}

/**
 * Props for the MemberManager component
 */
export interface MemberManagerProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Current space being managed */
  currentSpace: MemberManagerSpace | null;
  /** Current user */
  user: { uid: string; displayName?: string | null; photoURL?: string | null } | null;
  /** Update space function from useSpaces */
  updateSpace: (spaceId: string, updates: Record<string, unknown>) => Promise<void>;
  /** App identifier for display */
  appId: string;
  /** Display name for the app */
  appName: string;
  /** App accent color (Tailwind color class) */
  appColor?: string;
  /** Enable quick add for household members (default: true) */
  enableQuickAdd?: boolean;
  /** Enable email invite (default: true) */
  enableEmailInvite?: boolean;
  /** Custom invite API URL (default: '/api/spaces/invite') */
  inviteApiUrl?: string;
  /** Firestore collection name for spaces (default: 'spaces') */
  spaceCollection?: string;
  /** Custom permission check (default: checks if user is admin or owner) */
  canManage?: boolean;
  /** Additional content to render below the members list */
  children?: React.ReactNode;
}

/**
 * Shared MemberManager component for managing space members.
 *
 * This component provides:
 * - Quick add (for household members without email)
 * - Email invite (sends invitation via API)
 * - Member list with avatars and roles
 * - Role management (promote to admin)
 * - Remove member functionality
 *
 * @example
 * ```tsx
 * <MemberManager
 *   isOpen={showMemberManager}
 *   onClose={() => setShowMemberManager(false)}
 *   currentSpace={currentSpace}
 *   user={user}
 *   updateSpace={updateSpace}
 *   appId="notes"
 *   appName="Notes"
 *   appColor="bg-yellow-500"
 * />
 * ```
 */
export function MemberManager({
  isOpen,
  onClose,
  currentSpace,
  user,
  updateSpace,
  appId: _appId,
  appName: _appName,
  appColor = 'bg-indigo-500',
  enableQuickAdd = true,
  enableEmailInvite = true,
  inviteApiUrl = '/api/spaces/invite',
  spaceCollection = 'spaces',
  canManage: canManageOverride,
  children,
}: MemberManagerProps) {
  // Quick add state
  const [quickName, setQuickName] = useState('');

  // Email invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // UI state
  const [inviteTab, setInviteTab] = useState<'quick' | 'email'>(enableQuickAdd ? 'quick' : 'email');

  if (!isOpen || !currentSpace || !user) return null;

  // Permission check: user is admin or owner
  const isAdmin = currentSpace.members.some(
    (m) => m.uid === user.uid && m.role === 'admin'
  );
  const isOwner = currentSpace.ownerId === user.uid;
  const canManage = canManageOverride ?? (isAdmin || isOwner);

  // Check if this is the personal space (virtual, not stored in Firestore)
  const isPersonalSpace = currentSpace.id === 'personal';

  // Personal space view
  if (isPersonalSpace) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Personal Space</h3>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <User className="h-8 w-8 text-white/40" />
            </div>
            <h4 className="text-white font-medium mb-2">Your Personal Space</h4>
            <p className="text-sm text-white/50">
              This is your private space. Content here is only visible to you.
              To collaborate with others, create or join a shared space.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Quick add member (no email needed - for household members)
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newMember: MemberManagerMember = {
      uid: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      displayName: quickName.trim(),
      role: 'member',
      joinedAt: new Date().toISOString(),
    };

    updateSpace(currentSpace.id, {
      members: [...currentSpace.members, newMember],
      memberUids: [...currentSpace.memberUids, newMember.uid],
    });

    setQuickName('');
  };

  // Email invite (sends real invite using centralized invite system)
  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteSending(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      const response = await fetch(inviteApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          spaceId: currentSpace.id,
          spaceCollection,
          role: 'member',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteSuccess(true);
      setInviteEmail('');

      // Clear success message after 3 seconds
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Failed to send invite');
    } finally {
      setInviteSending(false);
    }
  };

  const handleRemoveMember = (uid: string) => {
    if (confirm('Remove this member from the space?')) {
      updateSpace(currentSpace.id, {
        members: currentSpace.members.filter((m) => m.uid !== uid),
        memberUids: currentSpace.memberUids.filter((id) => id !== uid),
      });
    }
  };

  const handlePromoteToAdmin = (uid: string) => {
    updateSpace(currentSpace.id, {
      members: currentSpace.members.map((m) =>
        m.uid === uid ? { ...m, role: 'admin' } : m
      ),
    });
  };

  const buttonColorClass = appColor.startsWith('bg-') ? appColor : `bg-${appColor}`;
  const buttonHoverClass = buttonColorClass.replace('bg-', 'hover:bg-').replace('500', '600');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Manage Members</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Add Member Section */}
          {canManage && (enableQuickAdd || enableEmailInvite) && (
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Add Member
              </label>

              {/* Tab Switcher (only if both enabled) */}
              {enableQuickAdd && enableEmailInvite && (
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-3">
                  <button
                    onClick={() => setInviteTab('quick')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      inviteTab === 'quick'
                        ? `${buttonColorClass} text-white`
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <UserPlus className="h-3.5 w-3.5 inline mr-1.5" />
                    Quick Add
                  </button>
                  <button
                    onClick={() => setInviteTab('email')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      inviteTab === 'email'
                        ? `${buttonColorClass} text-white`
                        : 'text-white/50 hover:text-white'
                    }`}
                  >
                    <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                    Email Invite
                  </button>
                </div>
              )}

              {/* Quick Add Form */}
              {enableQuickAdd && inviteTab === 'quick' && (
                <form onSubmit={handleQuickAdd} className="space-y-3">
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Member name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    className={`w-full px-4 py-2 ${buttonColorClass} ${buttonHoverClass} text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Member
                  </button>
                  <p className="text-xs text-white/40 text-center">
                    For household members who share this device
                  </p>
                </form>
              )}

              {/* Email Invite Form */}
              {enableEmailInvite && inviteTab === 'email' && (
                <form onSubmit={handleEmailInvite} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inviteSending}
                    className={`w-full px-4 py-2 ${buttonColorClass} ${buttonHoverClass} disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2`}
                  >
                    {inviteSending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Invite
                      </>
                    )}
                  </button>

                  {/* Success/Error Messages */}
                  {inviteSuccess && (
                    <p className="text-xs text-emerald-400 text-center flex items-center justify-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Invite sent successfully!
                    </p>
                  )}
                  {inviteError && (
                    <p className="text-xs text-red-400 text-center">{inviteError}</p>
                  )}

                  <p className="text-xs text-white/40 text-center">
                    They&apos;ll receive an email to join this space
                  </p>
                </form>
              )}
            </div>
          )}

          {/* Members List */}
          <div>
            <h4 className="text-xs font-medium text-white/60 mb-3">
              Current Members ({currentSpace.members.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {currentSpace.members.map((member) => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {member.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.photoURL}
                        alt={member.displayName || 'Member'}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                        {(member.displayName || 'M').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.displayName || member.email || 'Member'}
                      </p>
                      <p className="text-xs text-white/50 capitalize">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Promote to Admin */}
                    {member.role !== 'admin' && canManage && (
                      <button
                        onClick={() => handlePromoteToAdmin(member.uid)}
                        className="p-1.5 text-white/30 hover:text-amber-400 transition-colors"
                        title="Make Admin"
                      >
                        <Crown className="h-4 w-4" />
                      </button>
                    )}

                    {/* Remove Member */}
                    {canManage && member.uid !== user.uid && (
                      <button
                        onClick={() => handleRemoveMember(member.uid)}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                        title="Remove Member"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App-specific content (passed as children) */}
          {children}
        </div>
      </div>
    </div>
  );
}

export default MemberManager;
