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
  doc
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { 
  MessageSquare, 
  Search, 
  CheckCircle2, 
  Archive, 
  Clock,
  Inbox
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
  createdAt: Timestamp;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleStatusUpdate = async (id: string, newStatus: 'read' | 'archived') => {
    try {
      await updateDoc(doc(db, 'feedback', id), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredFeedback = feedback.filter(item => {
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

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-purple-400" />
            Feedback Inbox
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Review and manage user feedback from all apps.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'new', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors",
                filter === f
                  ? "bg-purple-500 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-white/5 hover:text-white border border-white/10"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback List */}
      <div className="grid gap-4">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-white/10 border-dashed">
            <Inbox className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">No feedback found matching your filters.</p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div 
              key={item.id}
              className={clsx(
                "group relative bg-zinc-900 border rounded-xl p-5 transition-all hover:shadow-lg",
                item.status === 'new' 
                  ? "border-purple-500/50 bg-purple-500/5" 
                  : "border-white/10"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                      item.appId === 'admin' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                      item.appId === 'notes' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      item.appId === 'journey' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                      {item.appId}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono truncate max-w-[200px]">
                      {item.path}
                    </span>
                    {item.status === 'new' && (
                      <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                    )}
                  </div>
                  
                  <p className="text-white text-sm leading-relaxed">
                    {item.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                    <span className="font-medium text-zinc-400">
                      {item.authorEmail || 'Anonymous User'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.createdAt?.toDate().toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.status === 'new' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'read')}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                      title="Mark as Read"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  {item.status !== 'archived' && (
                    <button
                      onClick={() => handleStatusUpdate(item.id, 'archived')}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
