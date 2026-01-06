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
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trash2,
  RefreshCw,
  Star,
  Inbox,
  Copy,
  Check,
  Bug,
  Lightbulb
} from 'lucide-react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface FeedbackDoc {
  id: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  type?: 'bug' | 'feature';
  appId: string;
  path: string;
  status: 'new' | 'read';
  promoted?: boolean;
  createdAt: Timestamp;
}

interface AIInsights {
  summary: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
  };

  const handleCopy = async (id: string, message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
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

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'feedback', itemToDelete));
      setItemToDelete(null);
    } catch (error) {
      console.error('Failed to delete feedback:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400 dark:text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/20">
            <MessageSquare className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Feedback Inbox
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Review and manage user feedback from all apps
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 overflow-hidden relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          {insightsLoading ? (
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Analyzing feedback...</span>
            </div>
          ) : insightsError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{insightsError}</p>
          ) : insights ? (
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1">
              {insights.summary}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No insights available</p>
          )}
          <button
            onClick={fetchInsights}
            disabled={insightsLoading}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all duration-200 shrink-0"
            title="Refresh Analysis"
          >
            <RefreshCw className={clsx("h-4 w-4", insightsLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
        <input
          type="text"
          placeholder="Search feedback..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
        />
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <Inbox className="h-12 w-12 text-zinc-400 dark:text-zinc-500 mx-auto mb-4" />
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">No feedback found</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          paginatedFeedback.map((item) => (
            <div
              key={item.id}
              className={clsx(
                "bg-white dark:bg-zinc-900 rounded-2xl border p-5 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md group",
                item.status === 'new'
                  ? "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5"
                  : "border-zinc-200 dark:border-zinc-800"
              )}
            >
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {/* Type badge */}
                    <span className={clsx(
                      "text-xs font-medium px-2 py-0.5 rounded-lg flex items-center gap-1",
                      item.type === 'feature'
                        ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                    )}>
                      {item.type === 'feature' ? (
                        <Lightbulb className="h-3 w-3" />
                      ) : (
                        <Bug className="h-3 w-3" />
                      )}
                      {item.type === 'feature' ? 'Feature' : 'Bug'}
                    </span>
                    {/* App badge */}
                    <span className={clsx(
                      "text-xs font-medium px-2 py-0.5 rounded-lg",
                      item.appId === 'admin' ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400" :
                      item.appId === 'notes' ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                      item.appId === 'journal' ? "bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400" :
                      "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}>
                      {item.appId}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.path}</span>
                    {item.status === 'new' && (
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                    )}
                  </div>

                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-3">
                    {item.message}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
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
                    onClick={() => handleCopy(item.id, item.message)}
                    className={clsx(
                      "p-2 rounded-xl transition-all duration-200",
                      copiedId === item.id
                        ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/20"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                    title={copiedId === item.id ? "Copied!" : "Copy feedback"}
                  >
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handlePromote(item.id, item.promoted)}
                    className={clsx(
                      "p-2 rounded-xl transition-all duration-200",
                      item.promoted
                        ? "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30"
                        : "text-zinc-400 dark:text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20"
                    )}
                    title={item.promoted ? "Remove from Great Ideas" : "Promote to Great Ideas"}
                  >
                    <Star className={clsx("h-4 w-4", item.promoted && "fill-current")} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-zinc-400 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200"
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
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredFeedback.length)} of {filteredFeedback.length}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full p-6 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Delete Feedback</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-zinc-700 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete this feedback item?
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-all duration-200 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
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