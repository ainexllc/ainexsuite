export type BillingCycle = 'monthly' | 'yearly' | 'weekly';
export type SubscriptionStatus = 'active' | 'cancelled' | 'paused';
export type SubscriptionColor = 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'cyan' | 'orange';

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
  // Required - 'personal' for personal content, or actual space ID
  spaceId: string;
  createdAt: string;
  updatedAt: string;
  
  // Standardized fields
  color: SubscriptionColor;
  labelIds: string[];
  pinned: boolean;
  archived: boolean;
}

export type ViewType = 'list' | 'grid' | 'calendar' | 'analytics';

export type SortField = 'cost' | 'name' | 'nextPaymentDate' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface SubscriptionFilter {
  category?: string;
  billingCycle?: BillingCycle;
  minCost?: number;
  maxCost?: number;
  status?: SubscriptionStatus;
  labelIds?: string[];
}