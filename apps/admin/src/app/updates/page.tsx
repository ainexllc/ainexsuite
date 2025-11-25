'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  limit 
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Megaphone,
  Zap,
  Wrench
} from 'lucide-react';
import { clsx } from 'clsx';

interface UpdateItem {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix' | 'announcement';
  date: any;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<UpdateItem['type']>('feature');

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'system_updates'), 
        orderBy('date', 'desc'),
        limit(50) // Show more in admin than in sidebar
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UpdateItem[];
      setUpdates(data);
    } catch (error) {
      console.error("Error fetching updates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      await addDoc(collection(db, 'system_updates'), {
        title,
        description,
        type,
        date: serverTimestamp()
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setType('feature');
      setIsCreating(false);
      
      // Refresh list
      fetchUpdates();
    } catch (error) {
      console.error("Error creating update:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return;
    
    try {
      await deleteDoc(doc(db, 'system_updates', id));
      setUpdates(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error("Error deleting update:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Sparkles className="h-4 w-4 text-purple-400" />;
      case 'improvement': return <Zap className="h-4 w-4 text-blue-400" />;
      case 'fix': return <Wrench className="h-4 w-4 text-orange-400" />;
      default: return <Megaphone className="h-4 w-4 text-green-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'improvement': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'fix': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default: return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">System Updates</h1>
          <p className="text-zinc-400">Manage &quot;What&apos;s New&quot; items shown in the user sidebar.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          {isCreating ? 'Cancel' : <><Plus className="h-4 w-4" /> New Update</>}
        </button>
      </div>

      {isCreating && (
        <div className="p-6 rounded-xl bg-zinc-900 border border-white/10 animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-semibold text-white mb-4">Create New Update</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Pulse Dashboard 2.0"
                  className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="feature">New Feature (Purple)</option>
                  <option value="improvement">Improvement (Blue)</option>
                  <option value="fix">Fix (Orange)</option>
                  <option value="announcement">Announcement (Green)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Description (Short)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Customizable widgets & layouts"
                className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                Publish Update
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <p className="text-zinc-500">Loading updates...</p>
        ) : updates.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-white/5 border-dashed">
            <p className="text-zinc-500">No updates published yet.</p>
          </div>
        ) : (
          updates.map((update) => (
            <div 
              key={update.id}
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={clsx("p-2 rounded-lg border", getTypeColor(update.type))}>
                  {getTypeIcon(update.type)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{update.title}</h3>
                  <p className="text-sm text-zinc-500">{update.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {update.date?.toDate ? update.date.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(update.id)}
                  className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete Update"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
