import {
  type FirestoreDataConverter,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { SubscriptionItem, SubscriptionColor } from "../../types";

function toDate(value?: Timestamp | null) {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();
}

export const subscriptionConverter: FirestoreDataConverter<SubscriptionItem> = {
  toFirestore(subscription: SubscriptionItem) {
    const {
      id: _id,
      createdAt,
      updatedAt,
      startDate,
      nextPaymentDate,
      spaceId, // Destructure to ensure order or handling if needed, though ...rest covers it if it's just a field
      ...rest
    } = subscription;
    void _id;

    return {
      ...rest,
      spaceId: spaceId || null, // Ensure explicit null if undefined
      startDate: Timestamp.fromDate(new Date(startDate)),
      nextPaymentDate: Timestamp.fromDate(new Date(nextPaymentDate)),
      createdAt: createdAt ? Timestamp.fromDate(new Date(createdAt)) : serverTimestamp(),
      updatedAt: updatedAt ? Timestamp.fromDate(new Date(updatedAt)) : serverTimestamp(),
    };
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      name: data.name,
      cost: data.cost,
      currency: data.currency,
      billingCycle: data.billingCycle,
      startDate: toDate(data.startDate),
      nextPaymentDate: toDate(data.nextPaymentDate),
      category: data.category,
      logoUrl: data.logoUrl,
      status: data.status,
      description: data.description,
      userId: data.userId,
      spaceId: data.spaceId ?? undefined,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      color: (data.color ?? "default") as SubscriptionColor,
      labelIds: data.labelIds ?? [],
      pinned: Boolean(data.pinned),
      archived: Boolean(data.archived),
    };
  },
};

export function createSubscriptionPayload(
  userId: string,
  overrides: Partial<SubscriptionItem>
) {
  const now = serverTimestamp();

  return {
    userId,
    spaceId: overrides.spaceId ?? null,
    name: overrides.name ?? "New Subscription",
    cost: overrides.cost ?? 0,
    currency: overrides.currency ?? "USD",
    billingCycle: overrides.billingCycle ?? "monthly",
    startDate: overrides.startDate ? Timestamp.fromDate(new Date(overrides.startDate)) : now,
    nextPaymentDate: overrides.nextPaymentDate ? Timestamp.fromDate(new Date(overrides.nextPaymentDate)) : now,
    category: overrides.category ?? "Uncategorized",
    status: overrides.status ?? "active",
    description: overrides.description ?? "",
    color: overrides.color ?? "default",
    labelIds: overrides.labelIds ?? [],
    pinned: overrides.pinned ?? false,
    archived: overrides.archived ?? false,
    createdAt: now,
    updatedAt: now,
    logoUrl: overrides.logoUrl ?? null,
  };
}
