'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp, 
  where, 
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { 
  Search, 
  MoreVertical, 
  Shield, 
  ShieldOff, 
  UserX, 
  CheckCircle, 
  Loader2,
  Calendar
} from 'lucide-react';
import type { User } from '@ainexsuite/types';
import { clsx } from 'clsx';

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
      console.error('Error fetching users:', error);
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
      console.error('Error updating user role:', error);
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users by name, email, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-sm text-zinc-500">
          Showing {filteredUsers.length} of {users.length} loaded users
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => {
                const joinedDate = user.createdAt instanceof Timestamp 
                  ? user.createdAt.toDate().toLocaleDateString() 
                  : 'Unknown';

                return (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                          {user.photoURL ? (
                            <img className="h-10 w-10 object-cover" src={user.photoURL} alt="" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-zinc-500">
                              {user.displayName?.[0] || user.email?.[0]}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{user.displayName || 'Unnamed User'}</div>
                          <div className="text-sm text-zinc-500">{user.email}</div>
                          <div className="text-xs text-zinc-600 font-mono mt-0.5">{user.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-white/10">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {joinedDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePromoteAdmin(user.uid, user.role)}
                          disabled={actionLoading === user.uid}
                          className={clsx(
                            "p-2 rounded-lg transition-colors",
                            user.role === 'admin' 
                              ? "text-zinc-500 hover:bg-red-500/10 hover:text-red-400" 
                              : "text-zinc-500 hover:bg-indigo-500/10 hover:text-indigo-400"
                          )}
                          title={user.role === 'admin' ? "Remove Admin" : "Promote to Admin"}
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
