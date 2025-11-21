import type { Timestamp } from './common';
import type { SubscriptionStatus, SubscriptionTier } from './user';

// Re-export for convenience
export type { SubscriptionStatus, SubscriptionTier };

/**
 * Monthly usage tracking
 */
export interface MonthlyUsage {
  queries: number;        // Number of AI queries used
  tokens: number;         // Total tokens consumed
  cost: number;           // Total cost in USD
  lastReset: Timestamp;   // Last time usage was reset (start of month)
}

/**
 * Subscription interface - stored in Firestore subscriptions collection
 */
export interface Subscription {
  userId: string;

  // Subscription status
  status: SubscriptionStatus;
  tier: SubscriptionTier;

  // Stripe integration
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;

  // Trial dates
  trialStartDate?: Timestamp;
  trialEndDate?: Timestamp;

  // Subscription dates
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  cancelAt?: Timestamp;
  canceledAt?: Timestamp;

  // Per-app subscription tracking
  // Array of app slugs user has access to (e.g., ['notes', 'journey', 'todo'])
  // Source of truth for app-level access control
  subscribedApps: string[];

  // Usage tracking
  currentMonthUsage: MonthlyUsage;
  monthlyQueryLimit: number;  // Based on tier

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Stripe webhook event types
 */
export type StripeWebhookEvent =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'customer.created'
  | 'customer.updated';

/**
 * Stripe webhook payload
 */
export interface StripeWebhookPayload {
  id: string;
  object: string;
  type: StripeWebhookEvent;
  created: number;
  data: {
    object: Record<string, unknown>;
  };
}

/**
 * Subscription plan configuration
 */
export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;              // Monthly price in USD
  yearlyPrice?: number;       // Yearly price in USD
  stripePriceId: string;      // Stripe price ID (monthly)
  stripeYearlyPriceId?: string; // Stripe price ID (yearly)
  queryLimit: number;         // Monthly query limit
  appCount?: number;          // Number of apps included (1 for single-app, 3 for three-apps, 8 for pro/premium)
  allowedApps?: string[];     // Specific apps allowed (empty = all 8 apps)
  features: string[];         // List of features
}

/**
 * Stripe product configuration
 * Maps subscription tiers to Stripe product IDs and prices
 */
export const STRIPE_PRODUCTS = {
  'single-app': {
    productId: 'prod_TSZfPaoma0SjJn',
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_SINGLE_APP_PRICE_ID || '',
    price: 2.99,
  },
  'three-apps': {
    productId: 'prod_TSZfYyEMgPZ9N4',
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_THREE_APPS_PRICE_ID || '',
    price: 5.99,
  },
  pro: {
    productId: 'prod_TSZaHygYbs8rg8',
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    price: 7.99,
  },
  premium: {
    productId: 'prod_TSZdkZ0lPw1l3d',
    monthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || '',
    price: 14.99,
  },
} as const;

/**
 * Default subscription plans with pricing and limits
 * Tiers:
 * - trial: 30-day free trial (all 8 apps, 200 queries/month)
 * - single-app: $2.99/month for 1 app (200 queries/month)
 * - three-apps: $5.99/month for 3 apps (500 queries/month)
 * - pro: $7.99/month for all 8 apps (2,000 queries/month)
 * - premium: $14.99/month for all 8 apps (10,000+ queries/month)
 */
export const DEFAULT_SUBSCRIPTION_PLANS: Record<SubscriptionTier, Omit<SubscriptionPlan, 'stripePriceId' | 'stripeYearlyPriceId'>> = {
  trial: {
    tier: 'trial',
    name: 'Free Trial',
    description: 'Try all features risk-free for 30 days. No credit card required.',
    price: 0,
    queryLimit: 200,
    appCount: 8,
    features: [
      'Access to all 8 apps',
      '200 AI queries per month',
      'Basic AI insights',
      'Web access',
      'Community support',
      'Data export',
      '30 days free, then upgrade or cancel',
    ],
  },
  'single-app': {
    tier: 'single-app',
    name: 'Single App',
    description: 'Perfect for focused users who want one app.',
    price: 2.99,
    queryLimit: 200,
    appCount: 1,
    features: [
      'Access to 1 app of your choice',
      '200 AI queries per month',
      'Basic AI insights',
      'Web access',
      'Community support',
      'Data export',
      'Cancel anytime',
    ],
  },
  'three-apps': {
    tier: 'three-apps',
    name: '3-App Bundle',
    description: 'Access to 3 apps of your choice.',
    price: 5.99,
    queryLimit: 500,
    appCount: 3,
    features: [
      'Access to 3 apps of your choice',
      '500 AI queries per month',
      'Basic AI insights',
      'Web access',
      'Community support',
      'Data export',
      'Cancel anytime',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    description: 'Perfect for personal growth enthusiasts.',
    price: 7.99,
    queryLimit: 2000,
    appCount: 8,
    features: [
      'Access to all 8 apps',
      '2,000 AI queries per month',
      'Advanced AI insights',
      'Priority support',
      'Unlimited data retention',
      'Data export (CSV, JSON, PDF)',
      'Custom themes',
      'Cancel anytime',
    ],
  },
  premium: {
    tier: 'premium',
    name: 'Premium',
    description: 'For power users who demand unlimited possibilities.',
    price: 14.99,
    queryLimit: 10000,
    appCount: 8,
    features: [
      'Access to all 8 apps',
      '10,000+ AI queries per month',
      'Advanced pattern detection',
      'Personalized recommendations',
      'Dedicated support',
      'Priority feature requests',
      'Early access to new features',
      'Cancel anytime',
    ],
  },
};

/**
 * Subscription creation input
 */
export type CreateSubscriptionInput = Omit<
  Subscription,
  'createdAt' | 'updatedAt' | 'currentMonthUsage'
>;

/**
 * Subscription update input
 */
export type UpdateSubscriptionInput = Partial<
  Omit<Subscription, 'createdAt' | 'updatedAt'>
>;

/**
 * API Request/Response types for Stripe operations
 */

// Checkout Session
export interface CheckoutSessionRequest {
  priceId: string;
  tier: SubscriptionTier;
  selectedApps?: string[];  // Apps selected by user (for single-app and three-apps tiers)
}

export interface CheckoutSessionResponse {
  sessionId: string;
}

// Customer Portal
export interface PortalSessionRequest {
  userId: string;
}

export interface PortalSessionResponse {
  url: string;
}

// Webhook Event Storage
export interface WebhookEvent {
  id: string;                    // Stripe event ID
  type: string;                  // Event type (e.g., "customer.subscription.created")
  data: Record<string, unknown>; // Event data
  processed: boolean;            // Processing status
  error?: string;                // Error message if processing failed
  createdAt: Timestamp;          // When webhook was received
  processedAt?: Timestamp;       // When webhook was processed
}
