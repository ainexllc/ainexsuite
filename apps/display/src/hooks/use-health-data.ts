'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

export type MoodType = 'great' | 'good' | 'okay' | 'low' | 'bad';

export interface HealthMetric {
  id: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  sleep: number | null; // hours
  water: number | null; // glasses
  exercise: number | null; // minutes
  mood: MoodType | null;
  energy: number | null; // 1-10 scale
  weight: number | null;
  heartRate: number | null;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  } | null;
  notes: string;
}

export interface HealthData {
  todayMetrics: HealthMetric | null;
  recentMetrics: HealthMetric[];
  isLoading: boolean;
  error: string | null;
  averages: {
    sleep: number;
    water: number;
    energy: number;
  };
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export function useHealthData(userId: string | undefined): HealthData {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Query recent health metrics (last 7 days)
    const metricsQuery = query(
      collection(db, 'health_metrics'),
      where('ownerId', '==', userId),
      orderBy('date', 'desc'),
      limit(7)
    );

    const unsubscribe = onSnapshot(
      metricsQuery,
      (snapshot) => {
        const metricsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as HealthMetric[];
        setMetrics(metricsData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching health metrics:', err);
        setError('Failed to load health data');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Find today's metrics
  const today = getTodayDateString();
  const todayMetrics = metrics.find(m => m.date === today) || null;

  // Calculate averages from recent data
  const calculateAverage = (key: keyof HealthMetric): number => {
    const values = metrics
      .map(m => m[key])
      .filter((v): v is number => typeof v === 'number');
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
  };

  const averages = {
    sleep: calculateAverage('sleep'),
    water: calculateAverage('water'),
    energy: calculateAverage('energy'),
  };

  return {
    todayMetrics,
    recentMetrics: metrics,
    isLoading,
    error,
    averages,
  };
}
