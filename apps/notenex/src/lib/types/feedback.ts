import type { Timestamp } from "firebase/firestore";

export type FeedbackDoc = {
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  createdAt: Timestamp;
};

export type Feedback = {
  id: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
  createdAt: Date;
};

export type FeedbackInput = {
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  message: string;
};
