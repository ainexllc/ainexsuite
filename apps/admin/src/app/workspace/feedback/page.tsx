'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Archive,
  Clock,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  RefreshCw,
  Star
} from 'lucide-react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface FeedbackDoc {
  id: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  appId: string;
  path: string;
  status: 'new' | 'read' | 'archived';
  promoted?: boolean;
  createdAt: Timestamp;
}

interface AIInsights {
  summary: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);

      const feedbackItems = feedback.slice(0, 20).map(item => ({
        message: item.message,
        appId: item.appId
      }));

      const response = await fetch('/api/feedback/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch insights');
      }

      setInsights(data.insights);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
      setInsightsError(error instanceof Error ? error.message : 'Failed to fetch insights');
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'feedback'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FeedbackDoc));
      setFeedback(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (feedback.length > 0 && !insights && !insightsLoading) {
      fetchInsights();
    }
  }, [feedback]);

  const handleStatusUpdate = async (id: string, newStatus: 'read' | 'archived') => {
    try {
      await updateDoc(doc(db, 'feedback', id), {
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to update feedback status:', error);
    }
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handlePromote = async (id: string, currentPromoted?: boolean) => {
    try {
      await updateDoc(doc(db, 'feedback', id), {
        promoted: !currentPromoted
      });
    } catch (error) {
      console.error('Failed to toggle promote status:', error);
    }
  };

  const filteredFeedback = feedback.filter(item => {
    // "all" shows everything except archived
    if (filter === 'all' && item.status === 'archived') return false;
    if (filter === 'new' && item.status !== 'new') return false;
    if (filter === 'archived' && item.status !== 'archived') return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.message.toLowerCase().includes(query) ||
        item.authorEmail?.toLowerCase().includes(query) ||
        item.appId.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFeedback = filteredFeedback.slice(startIndex, endIndex);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredFeedback.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredFeedback.map(item => item.id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.size > 0) {
      setItemToDelete('bulk');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      if (itemToDelete === 'bulk') {
        // Delete all selected items
        const deletePromises = Array.from(selectedItems).map(id =>
          deleteDoc(doc(db, 'feedback', id))
        );
        await Promise.all(deletePromises);
        setSelectedItems(new Set());
      } else {
        await deleteDoc(doc(db, 'feedback', itemToDelete));
      }
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-400" />
            Feedback Inbox
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and manage user feedback from all apps.
          </p>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="glass-panel rounded-xl p-4 overflow-hidden relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          {insightsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing feedback...</span>
            </div>
          ) : insightsError ? (
            <p className="text-sm text-red-400">{insightsError}</p>
          ) : insights ? (
            <p className="text-sm text-foreground/90 leading-relaxed flex-1">
              {insights.summary}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No insights available</p>
          )}
          <button
            onClick={fetchInsights}
            disabled={insightsLoading}
            className="p-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-lg transition-colors shrink-0"
            title="Refresh Analysis"
          >
            <RefreshCw className={clsx("h-4 w-4", insightsLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="glass-card rounded-lg p-1 flex gap-1 w-fit">
          {(['all', 'new', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setSelectedItems(new Set()); }}
              className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium capitalize transition-all",
                filter === f
                  ? "bg-surface-elevated text-white shadow-sm"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
            <span className="text-sm text-muted-foreground">{selectedItems.size} selected</span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}

        <div className="relative flex-1 max-w-md ml-auto flex gap-2">
          <div className="flex items-center justify-center px-3">
             <input
                type="checkbox"
                checked={filteredFeedback.length > 0 && selectedItems.size === filteredFeedback.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
             />
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-elevated/50 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No feedback found</p>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          paginatedFeedback.map((item) => (
            <div 
              key={item.id}
              className={clsx(
                "glass-card rounded-xl p-5 transition-all hover:border-white/20 group flex gap-4 items-start",
                item.status === 'new' && "bg-indigo-500/5 border-indigo-500/20",
                selectedItems.has(item.id) && "bg-white/5 border-indigo-500/30"
              )}
            >
              <div className="pt-1">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50 cursor-pointer"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={clsx(
                      "text-xs font-medium px-2 py-0.5 rounded border",
                      item.appId === 'admin' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      item.appId === 'notes' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-muted/10 text-muted-foreground border-border/50"
                    )}>
                      {item.appId}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.path}</span>
                    {item.status === 'new' && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-foreground leading-relaxed mb-3">
                    {item.message}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.authorEmail || 'Anonymous'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end">
                  <button
                    onClick={() => handlePromote(item.id, item.promoted)}
                    className={clsx(
                      "p-2 rounded-lg transition-colors",
                      item.promoted 
                        ? "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20" 
                        : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10"
                    )}
                    title={item.promoted ? "Remove from Great Ideas" : "Promote to Great Ideas"}
                  >
                    <Star className={clsx("h-4 w-4", item.promoted && "fill-current")} />
                  </button>
                  {item.status === 'new' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'read')}
                      className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      title="Mark as Read"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleStatusUpdate(item.id, item.status === 'archived' ? 'read' : 'archived')}
                    className={clsx(
                      "p-2 rounded-lg transition-colors",
                      item.status === 'archived'
                        ? "text-indigo-400 hover:bg-indigo-500/10"
                        : "text-muted-foreground hover:bg-surface-elevated hover:text-white"
                    )}
                    title={item.status === 'archived' ? "Move to Inbox" : "Archive"}
                  >
                    {item.status === 'archived' ? <Inbox className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredFeedback.length > itemsPerPage && (
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredFeedback.length)} of {filteredFeedback.length}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 rounded-xl shadow-2xl border-red-500/20 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-500/10 text-red-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {itemToDelete === 'bulk' ? `Delete ${selectedItems.size} Items` : 'Delete Feedback'}
                </h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-foreground/90 text-sm mb-6 leading-relaxed">
              {itemToDelete === 'bulk' 
                ? `Are you sure you want to permanently delete these ${selectedItems.size} feedback items? They will be removed from all views and analytics.`
                : "Are you sure you want to permanently delete this feedback item? It will be removed from all views and analytics."
              }
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground/90 hover:text-white hover:bg-white/5 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 shadow-lg shadow-red-900/20"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}