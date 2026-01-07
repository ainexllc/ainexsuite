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
  /** Square-cropped icon URL for circular avatars (TopNav, etc.) */
  iconURL?: string;
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
    journal?: { approved: boolean; approvedAt: Timestamp };
    todo?: { approved: boolean; approvedAt: Timestamp };
    health?: { approved: boolean; approvedAt: Timestamp };
    album?: { approved: boolean; approvedAt: Timestamp };
    habits?: { approved: boolean; approvedAt: Timestamp };
    hub?: { approved: boolean; approvedAt: Timestamp };
    fit?: { approved: boolean; approvedAt: Timestamp };
    suite?: { approved: boolean; approvedAt: Timestamp };
  };

  // Legacy apps field (kept for backward compatibility)
  apps: {
    notes: boolean;
    journal: boolean;
    todo: boolean;
    health: boolean;
    album: boolean;
    habits: boolean;
    hub: boolean;
    fit: boolean;
    project?: boolean;
    workflow?: boolean;
    calendar?: boolean;
  };

  // Suite upsell tracking
  appsUsed: {
    notes?: Timestamp;
    journal?: Timestamp;
    todo?: Timestamp;
    health?: Timestamp;
    album?: Timestamp;
    habits?: Timestamp;
    hub?: Timestamp;
    fit?: Timestamp;
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

  // Animated Avatar (AI-generated video)
  animatedAvatarURL?: string;        // Video URL in Firebase Storage
  animatedAvatarPath?: string;       // Storage path for cleanup
  animatedAvatarPosterURL?: string;  // Poster frame for loading state
  animatedAvatarPosterPath?: string; // Poster storage path
  animatedAvatarAction?: string;     // Action used (wave, wink, thumbsup, etc.)
  animatedAvatarStyle?: string;      // Legacy: Animation style (kept for backwards compatibility)
  animatedAvatarUpdatedAt?: Timestamp;
  useAnimatedAvatar?: boolean;       // Toggle preference
}

export type CreateUserInput = Omit<User, 'uid' | 'createdAt' | 'lastLoginAt'>;

export type UpdateUserInput = Partial<Omit<User, 'uid' | 'email' | 'createdAt'>>;
