'use client';

import { useState } from 'react';
import { Mail, Crown, UserMinus, UserPlus, X, Baby, User, Monitor, Link, Copy, Check, RefreshCw } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';
import { Member, MemberAgeGroup, HabitCreationPolicy } from '../../types/models';
import { isSpaceAdmin } from '../../lib/permissions';
import { cn } from '../../lib/utils';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  const { user } = useAuth();
  const { getCurrentSpace, updateSpace } = useGrowStore();
  const currentSpace = getCurrentSpace();
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentSpace || !user) return null;

  const canManage = isSpaceAdmin(currentSpace, user.uid);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock invite logic
    const newMember: Member = {
      uid: `user_${Date.now()}`, // Mock ID
      displayName: inviteEmail.split('@')[0],
      role: 'member',
      joinedAt: new Date().toISOString(),
    };
    
    updateSpace(currentSpace.id, {
      members: [...currentSpace.members, newMember]
    });
    setInviteEmail('');
  };

  const handleRemoveMember = (uid: string) => {
    if (confirm('Remove this member?')) {
      updateSpace(currentSpace.id, {
        members: currentSpace.members.filter((m: Member) => m.uid !== uid)
      });
    }
  };

  const handleRoleChange = (uid: string, newRole: Member['role']) => {
    updateSpace(currentSpace.id, {
      members: currentSpace.members.map((m: Member) =>
        m.uid === uid ? { ...m, role: newRole } : m
      )
    });
  };

  // Toggle adult/child status (for family spaces)
  const handleAgeGroupChange = (uid: string) => {
    const member = currentSpace.members.find((m: Member) => m.uid === uid);
    const newAgeGroup: MemberAgeGroup = member?.ageGroup === 'child' ? 'adult' : 'child';

    updateSpace(currentSpace.id, {
      members: currentSpace.members.map((m: Member) =>
        m.uid === uid ? { ...m, ageGroup: newAgeGroup } : m
      )
    });
  };

  // Change habit creation policy (for squad spaces)
  const handlePolicyChange = (policy: HabitCreationPolicy) => {
    updateSpace(currentSpace.id, {
      habitCreationPolicy: policy
    });
  };

  // Generate a dashboard token
  const generateDashboardToken = () => {
    const token = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
    updateSpace(currentSpace.id, {
      dashboardToken: token
    });
  };

  // Get the full dashboard URL
  const getDashboardUrl = () => {
    if (!currentSpace.dashboardToken) return null;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/workspace/family-dashboard?spaceId=${currentSpace.id}&token=${currentSpace.dashboardToken}`;
  };

  // Copy dashboard link to clipboard
  const copyDashboardLink = async () => {
    const url = getDashboardUrl();
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          {/* Invite Section */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              Invite New Member
            </label>
            <form onSubmit={handleInvite} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </button>
            </form>
          </div>

          {/* Members List */}
          <div>
            <h4 className="text-xs font-medium text-white/70 mb-3">
              Current Members ({currentSpace.members.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {currentSpace.members.map((member: Member) => (
                <div 
                  key={member.uid} 
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"
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
                    {/* Adult/Child Toggle (Family spaces only) */}
                    {currentSpace.type === 'family' && canManage && (
                      <button
                        onClick={() => handleAgeGroupChange(member.uid)}
                        className={cn(
                          'p-1.5 transition-colors',
                          member.ageGroup === 'child'
                            ? 'text-pink-400'
                            : 'text-white/30 hover:text-blue-400'
                        )}
                        title={member.ageGroup === 'child' ? 'Child (tap to make adult)' : 'Adult (tap to make child)'}
                      >
                        {member.ageGroup === 'child' ? (
                          <Baby className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    {/* Role Toggle */}
                    {member.role !== 'admin' && canManage && (
                      <button
                        onClick={() => handleRoleChange(member.uid, 'admin')}
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

          {/* Squad Permission Policy (Squad spaces only) */}
          {currentSpace.type === 'squad' && canManage && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs font-medium text-white/70 mb-3">
                Habit Creation Policy
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePolicyChange('admin_only')}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    (currentSpace.habitCreationPolicy || 'admin_only') === 'admin_only'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  )}
                >
                  Admins Only
                </button>
                <button
                  onClick={() => handlePolicyChange('anyone')}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    currentSpace.habitCreationPolicy === 'anyone'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  )}
                >
                  All Members
                </button>
              </div>
              <p className="text-xs text-white/40 mt-2">
                {(currentSpace.habitCreationPolicy || 'admin_only') === 'admin_only'
                  ? 'Only admins can create new habits'
                  : 'Any member can create new habits'}
              </p>
            </div>
          )}

          {/* Family space info */}
          {currentSpace.type === 'family' && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                <User className="h-3 w-3 inline mr-1" />
                Adults can create habits.
                <Baby className="h-3 w-3 inline mx-1" />
                Children can only complete habits assigned to them.
              </p>
            </div>
          )}

          {/* Family Dashboard Link (Family spaces only) */}
          {currentSpace.type === 'family' && canManage && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Monitor className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-medium text-white/70">
                  Family Dashboard
                </h4>
              </div>
              <p className="text-xs text-white/40 mb-3">
                Get a shareable link for a wall-mounted touchscreen display. Anyone with this link can complete habits.
              </p>

              {currentSpace.dashboardToken ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                    <Link className="h-4 w-4 text-white/40 flex-shrink-0" />
                    <span className="text-xs text-white/60 truncate flex-1">
                      {getDashboardUrl()?.slice(0, 50)}...
                    </span>
                    <button
                      onClick={copyDashboardLink}
                      className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                      title="Copy link"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-white/60" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={generateDashboardToken}
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Generate new link (invalidates old link)
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateDashboardToken}
                  className="w-full px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Monitor className="h-4 w-4" />
                  Generate Dashboard Link
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
