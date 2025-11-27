'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
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
Wrench,
  Edit,
  X,
  Eye,
  Send,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';

interface UpdateItem {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix' | 'announcement';
  status: 'draft' | 'published';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any;
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');

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
        status: 'published', // Default for existing items without status
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

  // Filter updates based on active tab
  const filteredUpdates = updates.filter(update => {
    if (activeTab === 'all') return true;
    if (activeTab === 'published') return update.status === 'published';
    if (activeTab === 'drafts') return update.status === 'draft';
    return true;
  });

  // Only published updates for preview
  const publishedUpdates = updates.filter(u => u.status === 'published');

  // Counts for tabs
  const draftCount = updates.filter(u => u.status === 'draft').length;
  const publishedCount = updates.filter(u => u.status === 'published').length;

  const handleCreate = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    if (!title || !description) return;

    const status = saveAsDraft ? 'draft' : 'published';

    try {
      if (editingId) {
        // Update existing (preserve current status unless explicitly publishing)
        const existingUpdate = updates.find(u => u.id === editingId);
        await updateDoc(doc(db, 'system_updates', editingId), {
          title,
          description,
          type,
          // Only update status if we're publishing a draft
          ...(saveAsDraft ? {} : existingUpdate?.status === 'draft' ? { status: 'published' } : {})
        });
        setEditingId(null);
      } else {
        // Create new
        await addDoc(collection(db, 'system_updates'), {
          title,
          description,
          type,
          status,
          date: serverTimestamp()
        });
      }

      // Reset form
      setTitle('');
      setDescription('');
      setType('feature');
      setIsCreating(false);

      // Refresh list
      fetchUpdates();
    } catch (error) {
      console.error("Error saving update:", error);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateDoc(doc(db, 'system_updates', id), {
        status: 'published'
      });
      fetchUpdates();
    } catch (error) {
      console.error("Error publishing update:", error);
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await updateDoc(doc(db, 'system_updates', id), {
        status: 'draft'
      });
      fetchUpdates();
    } catch (error) {
      console.error("Error unpublishing update:", error);
    }
  };

  const handleEdit = (update: UpdateItem) => {
    setTitle(update.title);
    setDescription(update.description);
    setType(update.type);
    setEditingId(update.id);
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setTitle('');
    setDescription('');
    setType('feature');
    setEditingId(null);
    setIsCreating(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            System Updates
          </h1>
          <p className="text-zinc-400 text-sm">Manage &quot;What&apos;s New&quot; items shown across all apps.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors border border-white/5 text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={() => {
              if (isCreating && !editingId) {
                handleCancelEdit();
              } else {
                setIsCreating(!isCreating);
              }
            }}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
              isCreating && !editingId
                ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-white/10"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
            )}
          >
            {isCreating && !editingId ? (
              <>
                <X className="h-4 w-4" /> Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> New Update
              </>
            )}
          </button>
        </div>
      </div>

      {isCreating && (
        <div className="glass-card p-6 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Edit Update' : 'Create New Update'}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={(e) => handleCreate(e, false)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Pulse Dashboard 2.0"
                  className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  required
                  maxLength={60}
                />
                <p className="text-xs text-zinc-600 mt-1">{title.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                  Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as UpdateItem['type'])}
                  className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="feature">✨ New Feature</option>
                  <option value="improvement">⚡ Improvement</option>
                  <option value="fix">🔧 Bug Fix</option>
                  <option value="announcement">📢 Announcement</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of what's new or changed. Keep it concise and user-friendly."
                rows={3}
                className="w-full px-4 py-2.5 bg-black/20 border border-white/10 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                required
                maxLength={200}
              />
              <p className="text-xs text-zinc-600 mt-1">{description.length}/200 characters</p>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors border border-white/5 text-sm"
                >
                  Cancel
                </button>
              )}
              {!editingId && (
                <button
                  type="button"
                  onClick={(e) => handleCreate(e as unknown as React.FormEvent, true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white font-medium rounded-lg hover:bg-zinc-700 transition-colors border border-white/5 text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Save as Draft
                </button>
              )}
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 text-sm"
              >
                <Send className="h-4 w-4" />
                {editingId ? 'Save Changes' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showPreview && (
        <div className="glass-card p-6 rounded-xl">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Sidebar Preview
          </h3>
          <div className="space-y-3 max-w-md bg-zinc-950 p-4 rounded-lg border border-white/5">
            {publishedUpdates.slice(0, 5).map((update) => (
              <div key={update.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className={clsx("p-1.5 rounded-lg border flex-shrink-0", getTypeColor(update.type))}>
                  {getTypeIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white leading-snug">{update.title}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{update.description}</p>
                </div>
              </div>
            ))}
            {publishedUpdates.length === 0 && (
              <p className="text-xs text-zinc-600 text-center py-4">No published updates to preview yet</p>
            )}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === 'all'
              ? "bg-white/10 text-white shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          All ({updates.length})
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
            activeTab === 'published'
              ? "bg-emerald-500/20 text-emerald-400 shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Send className="h-3.5 w-3.5" />
          Published ({publishedCount})
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2",
            activeTab === 'drafts'
              ? "bg-amber-500/20 text-amber-400 shadow-sm"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Drafts ({draftCount})
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
             <div className="h-8 w-8 animate-spin text-zinc-500 border-2 border-current border-t-transparent rounded-full" />
          </div>
        ) : filteredUpdates.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <p className="text-zinc-500">
              {activeTab === 'drafts' ? 'No drafts yet.' : activeTab === 'published' ? 'No published updates yet.' : 'No updates yet.'}
            </p>
          </div>
        ) : (
          filteredUpdates.map((update) => (
            <div
              key={update.id}
              className={clsx(
                "glass-card rounded-xl p-5 transition-all group hover:border-white/20",
                editingId === update.id && "ring-2 ring-indigo-500/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={clsx("p-2.5 rounded-lg border flex-shrink-0", getTypeColor(update.type))}>
                  {getTypeIcon(update.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{update.title}</h3>
                    {update.status === 'draft' && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">{update.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span className={clsx(
                      "font-medium px-2 py-0.5 rounded-md border",
                      getTypeColor(update.type)
                    )}>
                      {update.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {update.date?.toDate ? update.date.toDate().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Just now'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {update.status === 'draft' ? (
                    <button
                      onClick={() => handlePublish(update.id)}
                      className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                      title="Publish Update"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnpublish(update.id)}
                      className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                      title="Unpublish Update"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(update)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit Update"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(update.id)}
                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Update"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
