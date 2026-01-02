'use client';

import { useState } from 'react';
import { Mail, Crown, UserMinus, UserPlus, X, Send, Loader2, Check } from 'lucide-react';
import { useSpaces } from '../providers/spaces-provider';
import { useAuth } from '@ainexsuite/auth';
import { clsx } from 'clsx';

interface SpaceMember {
  uid: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
}

type SpaceMemberRole = 'admin' | 'member' | 'viewer';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type InviteTab = 'quick' | 'email';

export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  const { user } = useAuth();
  const { currentSpaceId, spaces, updateSpace } = useSpaces();
  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  // Quick add state
  const [quickName, setQuickName] = useState('');

  // Email invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // UI state
  const [inviteTab, setInviteTab] = useState<InviteTab>('quick');

  if (!isOpen || !currentSpace || !user) return null;

  // Handle personal space - show message to select a shared space
  if (currentSpace.type === 'personal' || currentSpace.id === 'personal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Manage Members</h3>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-6 w-6 text-cyan-500" />
            </div>
            <h4 className="text-white font-medium mb-2">Select a Shared Space</h4>
            <p className="text-sm text-white/60 mb-4">
              To manage members, first select a family or shared space from the dropdown.
              Personal events can&apos;t be shared with others.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = currentSpace.members?.some(
    (m: SpaceMember) => m.uid === user.uid && m.role === 'admin'
  ) ?? false;

  // Quick add member (no email needed - for household members)
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;

    const newMember: SpaceMember = {
      uid: `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      displayName: quickName.trim(),
      role: 'member',
      joinedAt: new Date().toISOString(),
    };

    updateSpace(currentSpace.id, {
      members: [...(currentSpace.members || []), newMember],
      memberUids: [...(currentSpace.memberUids || []), newMember.uid],
    });

    setQuickName('');
  };

  // Email invite (sends real invite)
  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviteSending(true);
    setInviteError(null);
    setInviteSuccess(false);

    try {
      // Use the main app's invite API
      const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
      const response = await fetch(`${mainAppUrl}/api/spaces/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: currentSpace.id,
          spaceName: currentSpace.name,
          spaceType: currentSpace.type,
          spaceCollection: 'spaces',
          inviteeEmail: inviteEmail.trim(),
          inviterName: user.displayName || 'Someone',
          inviterId: user.uid,
          appName: 'Calendar',
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
    if (confirm('Remove this member?')) {
      updateSpace(currentSpace.id, {
        members: (currentSpace.members || []).filter((m: SpaceMember) => m.uid !== uid),
        memberUids: (currentSpace.memberUids || []).filter((id: string) => id !== uid),
      });
    }
  };

  const handleRoleChange = (uid: string, newRole: SpaceMemberRole) => {
    updateSpace(currentSpace.id, {
      members: (currentSpace.members || []).map((m: SpaceMember) =>
        m.uid === uid ? { ...m, role: newRole } : m
      ),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">Manage Members</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          {/* Add Member Section */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">
                Add Member
              </label>

              {/* Tab Switcher */}
              <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-3">
                <button
                  onClick={() => setInviteTab('quick')}
                  className={clsx(
                    'flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    inviteTab === 'quick'
                      ? 'bg-cyan-500 text-white'
                      : 'text-white/50 hover:text-white'
                  )}
                >
                  <UserPlus className="h-3.5 w-3.5 inline mr-1.5" />
                  Quick Add
                </button>
                <button
                  onClick={() => setInviteTab('email')}
                  className={clsx(
                    'flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                    inviteTab === 'email'
                      ? 'bg-cyan-500 text-white'
                      : 'text-white/50 hover:text-white'
                  )}
                >
                  <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                  Email Invite
                </button>
              </div>

              {/* Quick Add Form */}
              {inviteTab === 'quick' && (
                <form onSubmit={handleQuickAdd} className="space-y-3">
                  <input
                    type="text"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    placeholder="Member name"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
                    required
                  />

                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
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
              {inviteTab === 'email' && (
                <form onSubmit={handleEmailInvite} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inviteSending}
                    className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
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
                    <p className="text-xs text-red-400 text-center">
                      {inviteError}
                    </p>
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
              Current Members ({currentSpace.members?.length || 0})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {(currentSpace.members || []).map((member: SpaceMember) => (
                <div
                  key={member.uid}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.displayName}</p>
                      <p className="text-xs text-white/50 capitalize">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Role Toggle */}
                    {member.role !== 'admin' && isAdmin && (
                      <button
                        onClick={() => handleRoleChange(member.uid, 'admin')}
                        className="p-1.5 text-white/30 hover:text-cyan-400 transition-colors"
                        title="Make Admin"
                      >
                        <Crown className="h-4 w-4" />
                      </button>
                    )}

                    {/* Remove Member */}
                    {isAdmin && member.uid !== user.uid && (
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
        </div>
      </div>
    </div>
  );
}
