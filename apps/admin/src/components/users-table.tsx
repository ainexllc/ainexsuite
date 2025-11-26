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
  ShieldOff,
  Loader2,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import type { User } from '@ainexsuite/types';
import { clsx } from 'clsx';
import Image from 'next/image';

// Admin-specific user type with potential role field
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
      // Initial fetch - get most recent users
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
      // Ignore fetch error
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
      // Update local state
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      alert('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.uid.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="relative flex-1 max-w-md group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-focus-within:opacity-50 transition duration-500 blur-sm" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Search users by name, email, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/80 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/5">
          {filteredUsers.length} / {users.length} RECORDS
        </div>
      </div>

      {/* Table */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        <div className="relative overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] font-mono">User Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] font-mono">Subscription Tier</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] font-mono">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] font-mono">Apps</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] font-mono">Role</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] font-mono">Joined</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.15em] font-mono text-right">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                let joinedDate = 'Unknown';
                const createdAt = user.createdAt as unknown;
                
                if (createdAt instanceof Timestamp) {
                  joinedDate = createdAt.toDate().toLocaleDateString();
                } else if (typeof createdAt === 'number') {
                  joinedDate = new Date(createdAt).toLocaleDateString();
                }

                return (
                  <tr key={user.uid} className="group hover:bg-white/[0.03] transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity" />
                          <div className="h-10 w-10 relative flex-shrink-0 rounded-full bg-zinc-900 overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-colors">
                            {user.photoURL ? (
                              <Image className="h-10 w-10 object-cover" src={user.photoURL} alt={user.displayName || 'User avatar'} width={40} height={40} unoptimized />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-zinc-500 font-mono text-xs">
                                {user.displayName?.[0] || user.email?.[0]}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white group-hover:text-cyan-200 transition-colors">{user.displayName || 'Unnamed User'}</div>
                          <div className="text-xs text-zinc-500">{user.email}</div>
                          <div className="text-[10px] text-zinc-700 font-mono mt-1 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">ID: {user.uid.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-sm font-medium capitalize">
                          {user.subscriptionTier || 'Free Trial'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm shadow-[0_0_10px_rgba(0,0,0,0.2)]",
                        user.subscriptionStatus === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                          : user.subscriptionStatus === 'trial'
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                          : user.subscriptionStatus === 'expired'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      )}>
                        {user.subscriptionStatus === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />}
                        {user.subscriptionStatus || 'inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.subscribedApps && user.subscribedApps.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.subscribedApps.slice(0, 3).map((app) => (
                            <span key={app} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              {app.substring(0, 3).toUpperCase()}
                            </span>
                          ))}
                          {user.subscribedApps.length > 3 && (
                            <span className="text-[10px] text-zinc-600 self-center">+{user.subscribedApps.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 font-mono">ALL_ACCESS</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wide shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500 font-medium pl-2">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                      {joinedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handlePromoteAdmin(user.uid, user.role)}
                          disabled={actionLoading === user.uid}
                          className={clsx(
                            "p-2 rounded-lg transition-all duration-200 border border-transparent",
                            user.role === 'admin' 
                              ? "text-red-400 hover:bg-red-500/10 hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                              : "text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                          )}
                          title={user.role === 'admin' ? "Revoke Access" : "Grant Admin"}
                        >
                          {actionLoading === user.uid ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : user.role === 'admin' ? (
                            <ShieldOff className="h-4 w-4" />
                          ) : (
                            <Shield className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
