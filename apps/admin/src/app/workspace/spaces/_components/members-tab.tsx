'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Users,
  Mail,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Shield,
  Eye,
  User,
  X,
} from 'lucide-react';
import type { SpaceRole, SpaceType } from '@ainexsuite/types';
import Image from 'next/image';

interface MemberData {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  spaces: Array<{
    spaceId: string;
    spaceName: string;
    spaceType: SpaceType;
    app: string;
    role: SpaceRole;
    joinedAt: number;
  }>;
  firstJoined: number;
}

interface PendingInvitation {
  id: string;
  email: string;
  spaceId: string;
  spaceName: string;
  spaceType: SpaceType;
  app: string;
  role: SpaceRole;
  invitedAt: number;
  invitedBy: string;
  expiresAt: number;
}

interface MembersTabProps {
  members: MemberData[];
  pendingInvitations: PendingInvitation[];
  onViewMember: (member: MemberData) => void;
}

const ROLE_COLORS: Record<SpaceRole, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  member: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  viewer: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
};

export function MembersTab({
  members,
  pendingInvitations,
  onViewMember,
}: MembersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showPendingSection, setShowPendingSection] = useState(true);

  // Filter members
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(
      (member) =>
        member.displayName?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Filter pending invitations
  const filteredInvitations = useMemo(() => {
    if (!searchQuery) return pendingInvitations;
    const query = searchQuery.toLowerCase();
    return pendingInvitations.filter(
      (invite) =>
        invite.email.toLowerCase().includes(query) ||
        invite.spaceName.toLowerCase().includes(query)
    );
  }, [pendingInvitations, searchQuery]);

  // Get role summary for a member
  const getRoleSummary = (member: MemberData) => {
    const roles: Record<SpaceRole, number> = { admin: 0, member: 0, viewer: 0 };
    member.spaces.forEach((space) => {
      roles[space.role]++;
    });
    const parts: string[] = [];
    if (roles.admin > 0) parts.push(`${roles.admin} admin`);
    if (roles.member > 0) parts.push(`${roles.member} member`);
    if (roles.viewer > 0) parts.push(`${roles.viewer} viewer`);
    return parts.join(', ') || 'No roles';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt: number) => Date.now() > expiresAt;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 bg-surface-elevated/50 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{members.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Pending Invites</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingInvitations.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Shield className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Admins</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {members.filter((m) => m.spaces.some((s) => s.role === 'admin')).length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Spaces/User</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {members.length > 0
              ? (members.reduce((acc, m) => acc + m.spaces.length, 0) / members.length).toFixed(1)
              : '0'}
          </p>
        </div>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div className="glass-card rounded-xl overflow-hidden">
          <button
            onClick={() => setShowPendingSection(!showPendingSection)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-foreground/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-amber-400" />
              <span className="font-medium text-foreground">
                Pending Invitations ({filteredInvitations.length})
              </span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                showPendingSection ? '' : '-rotate-90'
              }`}
            />
          </button>
          {showPendingSection && (
            <div className="border-t border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-surface-elevated/30">
                      <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Email</th>
                      <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Space</th>
                      <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Role</th>
                      <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Invited</th>
                      <th className="px-6 py-3 text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInvitations.map((invite) => {
                      const expired = isExpired(invite.expiresAt);
                      const roleColors = ROLE_COLORS[invite.role];
                      return (
                        <tr key={invite.id} className="hover:bg-foreground/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span className="text-sm text-foreground">{invite.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-foreground">{invite.spaceName}</p>
                              <p className="text-xs text-muted-foreground capitalize">{invite.app}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}
                            >
                              {invite.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {formatDate(invite.invitedAt)}
                          </td>
                          <td className="px-6 py-4">
                            {expired ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                <X className="h-3 w-3" />
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <Clock className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            All Members ({filteredMembers.length})
          </h3>
        </div>
        <div className="divide-y divide-border">
          {filteredMembers.map((member) => {
            const isExpanded = expandedMember === member.uid;
            return (
              <div key={member.uid}>
                {/* Member Row */}
                <div
                  className="flex items-center gap-4 px-6 py-4 hover:bg-foreground/[0.02] transition-colors cursor-pointer"
                  onClick={() => setExpandedMember(isExpanded ? null : member.uid)}
                >
                  {/* Expand Icon */}
                  <ChevronRight
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />

                  {/* Avatar */}
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

                  {/* Name & Email */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {member.displayName || 'Unnamed User'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                  </div>

                  {/* Spaces Count */}
                  <div className="flex items-center gap-1.5 text-sm text-foreground/80">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {member.spaces.length} spaces
                  </div>

                  {/* Role Summary */}
                  <div className="hidden md:block text-sm text-muted-foreground w-40">
                    {getRoleSummary(member)}
                  </div>

                  {/* Joined Date */}
                  <div className="hidden lg:block text-sm text-muted-foreground w-28">
                    {formatDate(member.firstJoined)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewMember(member);
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Spaces List */}
                {isExpanded && (
                  <div className="bg-surface-elevated/30 border-t border-border">
                    <div className="px-6 py-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Member of {member.spaces.length} spaces
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {member.spaces.map((space, index) => {
                          const roleColors = ROLE_COLORS[space.role];
                          return (
                            <div
                              key={`${space.spaceId}-${index}`}
                              className="flex items-center justify-between p-3 bg-surface-elevated/50 border border-border rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {space.spaceName}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {space.app} - {space.spaceType}
                                </p>
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border capitalize ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}
                              >
                                {space.role}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredMembers.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">No members found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
