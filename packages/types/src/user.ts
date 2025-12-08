import type { Timestamp, UserPreferences } from './common';
import type { SearchableApp } from './search';

// User types for authentication and account management
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'past_due' | 'canceled';
export type SubscriptionTier = 'trial' | 'single-app' | 'three-apps' | 'pro' | 'premium';
export type AccountType = 'single-app' | 'multi-app' | 'suite';
export type DomainPreference = 'subdomain' | 'standalone';

export type UserRole = 'admin' | 'user';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role?: UserRole;
  preferences: UserPreferences;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;

  // App-scoped authentication
  // The app user signed up with (e.g., "journey", "notes", "suite")
  primaryApp?: SearchableApp | 'suite';

  // NEW: Account type detection (auto-calculated)
  accountType?: AccountType; // 'single-app' | 'multi-app' | 'suite'
  preferredDomain?: DomainPreference; // 'subdomain' | 'standalone'

  // NEW: Simplified app access control
  // Array of app slugs user is eligible to access
  // Source of truth for app activation
  appsEligible: string[];  // e.g. ['notes', 'journey', 'todo']

  // Which apps user has approved to use (SSO permissions)
  // DEPRECATED: Use appsEligible instead. Kept for backward compatibility.
  // User grants permission when accessing a new app
  appPermissions: {
    notes?: { approved: boolean; approvedAt: Timestamp };
    journey?: { approved: boolean; approvedAt: Timestamp };
    todo?: { approved: boolean; approvedAt: Timestamp };
    health?: { approved: boolean; approvedAt: Timestamp };
    moments?: { approved: boolean; approvedAt: Timestamp };
    grow?: { approved: boolean; approvedAt: Timestamp };
    pulse?: { approved: boolean; approvedAt: Timestamp };
    fit?: { approved: boolean; approvedAt: Timestamp };
    smarthub?: { approved: boolean; approvedAt: Timestamp };
    suite?: { approved: boolean; approvedAt: Timestamp };
  };

  // Legacy apps field (kept for backward compatibility)
  apps: {
    notes: boolean;
    journey: boolean;
    todo: boolean;
    health: boolean;
    moments: boolean;
    grow: boolean;
    pulse: boolean;
    fit: boolean;
    project?: boolean;
    workflow?: boolean;
    calendar?: boolean;
    smarthub?: boolean;
  };

  // Suite upsell tracking
  appsUsed: {
    notes?: Timestamp;
    journey?: Timestamp;
    todo?: Timestamp;
    health?: Timestamp;
    moments?: Timestamp;
    grow?: Timestamp;
    pulse?: Timestamp;
    fit?: Timestamp;
    smarthub?: Timestamp;
  };

  // Subscription & Trial
  trialStartDate?: Timestamp;
  trialEndDate?: Timestamp; // Auto-calculated (trialStartDate + 30 days)
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier?: SubscriptionTier; // 'trial' | 'single-app' | 'three-apps' | 'pro' | 'premium'
  subscriptionExpiresAt?: Timestamp;
  suiteAccess: boolean; // true = has suite access, false = needs suite subscription

  // Per-app subscription tracking
  subscribedApps?: string[]; // Array of app slugs user is subscribed to (e.g., ['notes', 'journal'])

  // Stripe Integration
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;

  // Usage Tracking
  currentMonthUsage?: {
    queries: number;        // Number of AI queries used
    tokens: number;         // Total tokens consumed
    cost: number;           // Total cost in USD
    lastReset: Timestamp;   // Last time usage was reset
  };
  monthlyQueryLimit?: number; // Based on subscription tier
}

export type CreateUserInput = Omit<User, 'uid' | 'createdAt' | 'lastLoginAt'>;

export type UpdateUserInput = Partial<Omit<User, 'uid' | 'email' | 'createdAt'>>;
