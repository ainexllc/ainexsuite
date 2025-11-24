'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

export interface SystemUpdate {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'improvement' | 'fix' | 'announcement';
  date: any; // Firestore Timestamp
}

export function useSystemUpdates() {
  const [updates, setUpdates] = useState<SystemUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        // We use a simple fetch here instead of real-time subscription for the sidebar
        // to minimize reads, as updates don't happen every second.
        const q = query(
          collection(db, 'system_updates'),
          orderBy('date', 'desc'),
          limit(3)
        );
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SystemUpdate[];
        
        setUpdates(data);
      } catch (error) {
        console.error("Failed to fetch system updates:", error);
        // Fallback to mock data if fetch fails (e.g. permissions or offline)
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
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  return { updates, loading };
}
