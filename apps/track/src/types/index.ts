export type BillingCycle = 'monthly' | 'yearly' | 'weekly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';

export interface SubscriptionItem {
  id: string;
  name: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string; // ISO Date string
  nextPaymentDate: string; // ISO Date string
  category: string;
  logoUrl?: string;
  status: SubscriptionStatus;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewType = 'list' | 'calendar' | 'analytics';
