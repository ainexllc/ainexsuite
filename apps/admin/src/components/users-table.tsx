'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import {
  Search,
  Shield,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import type { User } from '@ainexsuite/types';
import { clsx } from 'clsx';
import Image from 'next/image';

interface AdminUser extends User {
  role?: 'admin' | 'user';
}

export function UsersTable() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const fetchedUsers = snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as AdminUser));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromoteAdmin = async (uid: string, currentRole?: string) => {
    if (!confirm(`Are you sure you want to ${currentRole === 'admin' ? 'remove admin rights from' : 'promote'} this user?`)) return;
    
    setActionLoading(uid);
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', uid), {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      alert('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uid.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 glass-card p-4 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
        <div className="text-xs font-medium text-muted-foreground bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
          {filteredUsers.length} Users
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-medium text-muted-foreground">User</th>
                <th className="px-6 py-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-muted-foreground">Apps</th>
                <th className="px-6 py-4 text-xs font-medium text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-xs font-medium text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-xs font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                let joinedDate = '-';
                const createdAt = user.createdAt as unknown;
                
                if (createdAt instanceof Timestamp) {
                  joinedDate = createdAt.toDate().toLocaleDateString();
                } else if (typeof createdAt === 'number') {
                  joinedDate = new Date(createdAt).toLocaleDateString();
                }

                const status = user.subscriptionStatus || 'inactive';
                const statusColor: Record<string, string> = {
                  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  trial: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  expired: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  inactive: 'text-muted-foreground bg-muted/10 border-border/50'
                };
                
                const colorClass = statusColor[status] || statusColor.inactive;

                return (
                  <tr key={user.uid} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-surface-elevated overflow-hidden border border-white/5">
                          {user.photoURL ? (
                            <Image className="h-full w-full object-cover" src={user.photoURL} alt={user.displayName || ''} width={32} height={32} unoptimized />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs font-medium">
                              {(user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">{user.displayName || 'Unnamed'}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", colorClass)}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.subscribedApps?.length ? (
                        <div className="flex gap-1">
                          {user.subscribedApps.slice(0, 2).map(app => (
                            <span key={app} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/5 text-muted-foreground border border-white/5 uppercase">
                              {app.substring(0, 3)}
                            </span>
                          ))}
                          {user.subscribedApps.length > 2 && (
                            <span className="text-[10px] text-muted-foreground self-center">+{user.subscribedApps.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400">
                          <Shield className="h-3.5 w-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {joinedDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handlePromoteAdmin(user.uid, user.role)}
                        disabled={actionLoading === user.uid}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground/90 hover:bg-white/5 transition-colors"
                        title={user.role === 'admin' ? "Revoke Admin" : "Make Admin"}
                      >
                        {actionLoading === user.uid ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}