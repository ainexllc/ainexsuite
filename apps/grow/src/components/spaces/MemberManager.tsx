'use client';

import { useState } from 'react';
import { Mail, Crown, UserMinus, UserPlus, X } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { Member } from '../../types/models';

interface MemberManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemberManager({ isOpen, onClose }: MemberManagerProps) {
  const { getCurrentSpace, updateSpace } = useGrowStore();
  const currentSpace = getCurrentSpace();
  const [inviteEmail, setInviteEmail] = useState('');

  if (!isOpen || !currentSpace) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Manage Members</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
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

                  <div className="flex items-center gap-2">
                    {/* Role Toggle (Mock) */}
                    {member.role !== 'admin' && (
                      <button 
                        onClick={() => handleRoleChange(member.uid, 'admin')}
                        className="p-1.5 text-white/30 hover:text-amber-400 transition-colors"
                        title="Make Admin"
                      >
                        <Crown className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleRemoveMember(member.uid)}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                      title="Remove Member"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
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
