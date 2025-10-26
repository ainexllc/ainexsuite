import type { BaseDocument, Timestamp } from './common';

export interface LearningResource {
  type: 'article' | 'video' | 'course' | 'book' | 'tutorial';
  title: string;
  url: string;
  completed: boolean;
}

export interface LearningGoal extends BaseDocument {
  title: string;
  description: string;
  category: string;
  targetDate: Timestamp | null;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  resources: LearningResource[];
  skills: string[];
  active: boolean;
}

export type CreateLearningGoalInput = Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateLearningGoalInput = Partial<Omit<LearningGoal, 'id' | 'ownerId' | 'createdAt'>>;

export interface LearningSession {
  id: string;
  ownerId: string;
  goalId: string;
  duration: number; // minutes
  note: string;
  skillsPracticed: string[];
  date: Timestamp;
}

export type CreateLearningSessionInput = Omit<LearningSession, 'id' | 'date'>;

export interface SkillProgress {
  skill: string;
  level: number; // 0-100
  totalSessions: number;
  totalMinutes: number;
  lastPracticed: Timestamp;
}
