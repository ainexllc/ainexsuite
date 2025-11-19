import type { Timestamp } from './common';

export type FeedbackDoc = {
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  appId: string;
  path: string;
  createdAt: Timestamp;
  status: 'new' | 'read' | 'archived';
};

export type Feedback = {
  id: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  appId: string;
  path: string;
  createdAt: Date;
  status: 'new' | 'read' | 'archived';
};

export type FeedbackInput = {
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  appId: string;
  path: string;
};
