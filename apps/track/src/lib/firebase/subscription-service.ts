import {
  addDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { clientSubscriptionCollection, clientSubscriptionDoc } from "./client-collections";
import { subscriptionConverter, createSubscriptionPayload } from "./subscription-converter";
import type { SubscriptionItem } from "../../types";

export function subscribeToSubscriptions(
  userId: string,
  handler: (subscriptions: SubscriptionItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const q = query(
    clientSubscriptionCollection(userId).withConverter(subscriptionConverter),
    where("archived", "==", false),
    orderBy("pinned", "desc"),
    orderBy("nextPaymentDate", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const subscriptions = snapshot.docs.map((doc) => doc.data());
      handler(subscriptions);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

export async function createSubscription(
  userId: string,
  input: Partial<SubscriptionItem>
) {
  const payload = createSubscriptionPayload(userId, input);
  const docRef = await addDoc(clientSubscriptionCollection(userId), payload);
  return docRef.id;
}

export async function updateSubscription(
  userId: string,
  subscriptionId: string,
  updates: Partial<SubscriptionItem>
) {
  const ref = clientSubscriptionDoc(userId, subscriptionId);
  
  // Convert dates to Timestamps for Firestore update
  // We can't use the converter easily for partial updates, so we map manually
  const payload: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  // Remove fields that shouldn't be updated directly or need transformation
  delete payload.id;
  delete payload.userId;
  delete payload.createdAt;

  if (updates.startDate) {
    payload.startDate = new Date(updates.startDate);
  }
  if (updates.nextPaymentDate) {
    payload.nextPaymentDate = new Date(updates.nextPaymentDate);
  }

  await updateDoc(ref, payload);
}

export async function deleteSubscription(userId: string, subscriptionId: string) {
  await deleteDoc(clientSubscriptionDoc(userId, subscriptionId));
}

export async function togglePinSubscription(userId: string, subscriptionId: string, pinned: boolean) {
  await updateDoc(clientSubscriptionDoc(userId, subscriptionId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
}
