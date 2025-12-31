'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { DocumentSnapshot } from 'firebase/firestore';
import { getUserJournalEntries } from '@/lib/firebase/firestore';
import type { JournalEntry } from '@ainexsuite/types';

const BATCH_SIZE = 20;

interface UseInfiniteEntriesOptions {
  userId: string | undefined;
  spaceId: string | undefined;
  enabled?: boolean;
}

interface UseInfiniteEntriesResult {
  entries: JournalEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteEntries({
  userId,
  spaceId,
  enabled = true,
}: UseInfiniteEntriesOptions): UseInfiniteEntriesResult {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Initial load
  const loadInitial = useCallback(async () => {
    if (!userId || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      lastDocRef.current = null;

      const { entries: fetchedEntries, lastDoc } = await getUserJournalEntries(userId, {
        limit: BATCH_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        spaceId,
      });

      setEntries(fetchedEntries);
      lastDocRef.current = lastDoc;
      setHasMore(fetchedEntries.length === BATCH_SIZE);
    } catch (err) {
      console.error('Failed to load journal entries:', err);
      setError('Failed to load journal entries. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, spaceId, enabled]);

  // Load more entries
  const loadMore = useCallback(async () => {
    if (!userId || !hasMore || loadingRef.current || !lastDocRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setIsLoadingMore(true);

      const { entries: fetchedEntries, lastDoc } = await getUserJournalEntries(userId, {
        limit: BATCH_SIZE,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        spaceId,
        startAfter: lastDocRef.current,
      });

      setEntries(prev => [...prev, ...fetchedEntries]);
      lastDocRef.current = lastDoc;
      setHasMore(fetchedEntries.length === BATCH_SIZE);
    } catch (err) {
      console.error('Failed to load more entries:', err);
      // Don't set error state for load more failures, just log
    } finally {
      setIsLoadingMore(false);
      loadingRef.current = false;
    }
  }, [userId, spaceId, hasMore]);

  // Refresh entries (reload from start)
  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  // Initial load effect
  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Start loading before sentinel is visible
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, isLoading, loadMore, enabled]);

  return {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    sentinelRef,
  };
}
