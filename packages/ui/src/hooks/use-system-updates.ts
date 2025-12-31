'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

export interface SystemUpdate {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix' | 'announcement';
  status?: 'draft' | 'published';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  date: any; // Firestore Timestamp
}

export function useSystemUpdates(initialLimit = 7) {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchUpdates = useCallback(async (isInitial = true) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let q = query(
        collection(db, 'system_updates'),
        where('status', '==', 'published'), // Only show published updates
        orderBy('date', 'desc'),
        limit(initialLimit)
      );

      if (!isInitial && lastDoc) {
        q = query(
          collection(db, 'system_updates'),
          where('status', '==', 'published'),
          orderBy('date', 'desc'),
          startAfter(lastDoc),
          limit(initialLimit)
        );
      }

      const snapshot = await getDocs(q);
      
      const newUpdates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SystemUpdate[];

      if (snapshot.docs.length < initialLimit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }

      if (isInitial) {
        setUpdates(newUpdates);
      } else {
        setUpdates(prev => [...prev, ...newUpdates]);
      }
    } catch (error) {
      console.error("Failed to fetch system updates:", error);
      if (isInitial) {
        // Fallback to mock data if fetch fails (e.g. permissions or offline)
        // Only on initial load
        setUpdates([
            { 
              id: 'mock1', 
              title: 'Pulse Dashboard 2.0', 
              description: 'Custom widgets & drag-and-drop', 
              type: 'feature', 
              date: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 48) } 
            },
            { 
              id: 'mock2', 
              title: 'Smart Notes AI', 
              description: 'Auto-summaries and insights', 
              type: 'improvement', 
              date: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) } 
            },
            { 
              id: 'mock3', 
              title: 'Global Search', 
              description: 'Find anything across apps', 
              type: 'feature', 
              date: { toDate: () => new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) } 
            }
          ]);
          setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [initialLimit, lastDoc]);

  useEffect(() => {
    fetchUpdates(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const loadMore = () => {
    if (!loadingMore && hasMore) {
        fetchUpdates(false);
    }
  };

  return { updates, loading, loadingMore, hasMore, loadMore };
}
