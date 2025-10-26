import {
  addDoc,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from "firebase/firestore";
import { clientFeedbackCollection } from "@/lib/firebase/client-collections";
import {
  createFeedbackPayload,
  feedbackConverter,
} from "@/lib/firebase/feedback-converter";
import type { Feedback, FeedbackInput } from "@/lib/types/feedback";

export type FeedbackSubscriptionHandler = (entries: Feedback[]) => void;

const FEEDBACK_LIMIT = 100;

export function subscribeToFeedback(handler: FeedbackSubscriptionHandler): Unsubscribe {
  const feedbackRef = query(
    clientFeedbackCollection().withConverter(feedbackConverter),
    orderBy("createdAt", "desc"),
    limit(FEEDBACK_LIMIT),
  );

  return onSnapshot(feedbackRef, (snapshot) => {
    const feedback = snapshot.docs.map((docSnapshot) => docSnapshot.data());
    handler(feedback);
  });
}

export async function submitFeedback(input: FeedbackInput) {
  const payload = createFeedbackPayload(input);
  await addDoc(clientFeedbackCollection(), payload);
}

export async function deleteFeedback(feedbackId: string) {
  const feedbackRef = doc(clientFeedbackCollection(), feedbackId);
  await deleteDoc(feedbackRef);
}
