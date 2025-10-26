import type { Timestamp, UserPreferences } from './common';
import type { SearchableApp } from './search';

export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  preferences: UserPreferences;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;

  // App-scoped authentication
  // The app user signed up with (e.g., "journey", "notes", "suite")
  primaryApp?: SearchableApp | 'suite';

  // Which apps user has approved to use (SSO permissions)
  // User grants permission when accessing a new app
  appPermissions: {
    notes?: { approved: boolean; approvedAt: Timestamp };
    journey?: { approved: boolean; approvedAt: Timestamp };
    todo?: { approved: boolean; approvedAt: Timestamp };
    track?: { approved: boolean; approvedAt: Timestamp };
    moments?: { approved: boolean; approvedAt: Timestamp };
    grow?: { approved: boolean; approvedAt: Timestamp };
    pulse?: { approved: boolean; approvedAt: Timestamp };
    fit?: { approved: boolean; approvedAt: Timestamp };
    suite?: { approved: boolean; approvedAt: Timestamp };
  };

  // Legacy apps field (kept for backward compatibility)
  apps: {
    notes: boolean;
    journey: boolean;
    todo: boolean;
    track: boolean;
    moments: boolean;
    grow: boolean;
    pulse: boolean;
    fit: boolean;
  };

  // Suite upsell tracking
  appsUsed: {
    notes?: Timestamp;
    journey?: Timestamp;
    todo?: Timestamp;
    track?: Timestamp;
    moments?: Timestamp;
    grow?: Timestamp;
    pulse?: Timestamp;
    fit?: Timestamp;
  };

  trialStartDate?: Timestamp;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: Timestamp;
  suiteAccess: boolean; // true = has suite access, false = needs suite subscription
}

export type CreateUserInput = Omit<User, 'uid' | 'createdAt' | 'lastLoginAt'>;

export type UpdateUserInput = Partial<Omit<User, 'uid' | 'email' | 'createdAt'>>;
