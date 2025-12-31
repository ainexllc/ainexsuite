'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: string;
  spaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string; // ISO date
  assigneeIds: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface TasksData {
  tasks: Task[];
  todayTasks: Task[];
  overdueTasks: Task[];
  highPriorityTasks: Task[];
  completedToday: number;
  totalDueToday: number;
  isLoading: boolean;
  error: string | null;
  completeTask: (taskId: string) => Promise<void>;
}

// Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Check if a date is before today
function isOverdue(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  return dueDate < today;
}

// Check if a date is today
function isToday(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const today = getTodayDateString();
  return dateString.startsWith(today);
}

export function useTasksData(userId: string | undefined): TasksData {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Query tasks owned by user (filter done client-side to avoid != query issues)
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('ownerId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const tasksData = (snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Task[])
          .filter(task => task.status !== 'done');
        setTasks(tasksData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Filter tasks
  const todayTasks = tasks.filter(t => isToday(t.dueDate));
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'done');
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');

  // For completed today, we'd need a separate query - for now just use 0
  const completedToday = 0;
  const totalDueToday = todayTasks.length;

  // Complete a task
  const completeTask = useCallback(async (taskId: string) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: 'done',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error completing task:', err);
    }
  }, []);

  return {
    tasks,
    todayTasks,
    overdueTasks,
    highPriorityTasks,
    completedToday,
    totalDueToday,
    isLoading,
    error,
    completeTask,
  };
}
