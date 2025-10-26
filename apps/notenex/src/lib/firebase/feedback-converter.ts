import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Feedback, FeedbackDoc, FeedbackInput } from "@/lib/types/feedback";

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate() : new Date();
}

export const feedbackConverter: FirestoreDataConverter<Feedback> = {
  toFirestore(feedback: Feedback) {
    const { id: _id, createdAt, ...rest } = feedback;
    void _id;

    return {
      ...rest,
      createdAt: createdAt ? Timestamp.fromDate(createdAt) : serverTimestamp(),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as FeedbackDoc;
    return {
      id: snapshot.id,
      userId: data.userId ?? null,
      authorName: data.authorName ?? null,
      authorEmail: data.authorEmail ?? null,
      message: data.message ?? "",
      createdAt: toDate(data.createdAt),
    };
  },
};

export function createFeedbackPayload(input: FeedbackInput) {
  return {
    userId: input.userId ?? null,
    authorName: input.authorName ?? null,
    authorEmail: input.authorEmail ?? null,
    message: input.message,
    createdAt: serverTimestamp(),
  };
}
