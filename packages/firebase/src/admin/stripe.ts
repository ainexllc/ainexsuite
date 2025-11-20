/**
 * Server-side Stripe utilities
 * Used in API routes, Cloud Functions, and server components
 */

import Stripe from 'stripe';
import type {
  SubscriptionStatus,
  SubscriptionTier,
  MonthlyUsage,
} from '@ainexsuite/types';

let stripeInstance: Stripe | null = null;

/**
 * Initialize and get the Stripe server instance
 * @returns Stripe instance
 */
export function getStripeServer(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        'Missing STRIPE_SECRET_KEY environment variable. Please add it to your .env file.'
      );
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true,
    });
  }

  return stripeInstance;
}

/**
 * Create a Stripe customer
 * @param email - Customer email
 * @param name - Customer name
 * @param metadata - Additional metadata
 * @returns Stripe customer object
 */
export async function createStripeCustomer(
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  const stripe = getStripeServer();

  return await stripe.customers.create({
    email,
    name,
    metadata: {
      ...metadata,
      source: 'ainexsuite',
    },
  });
}

/**
 * Get a Stripe customer by ID
 * @param customerId - Stripe customer ID
 * @returns Stripe customer object or null
 */
export async function getStripeCustomer(
  customerId: string
): Promise<Stripe.Customer | null> {
  const stripe = getStripeServer();

  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer.deleted ? null : (customer as Stripe.Customer);
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    return null;
  }
}

/**
 * Create a checkout session for subscription
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID
 * @param successUrl - Redirect URL on success
 * @param cancelUrl - Redirect URL on cancel
 * @returns Checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeServer();

  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });
}

/**
 * Create a billing portal session
 * @param customerId - Stripe customer ID
 * @param returnUrl - Return URL after portal session
 * @returns Portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripeServer();

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Get subscription by ID
 * @param subscriptionId - Stripe subscription ID
 * @returns Subscription object or null
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripeServer();

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    return null;
  }
}

/**
 * Cancel a subscription
 * @param subscriptionId - Stripe subscription ID
 * @param immediately - Cancel immediately or at period end
 * @returns Updated subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately = false
): Promise<Stripe.Subscription> {
  const stripe = getStripeServer();

  if (immediately) {
    return await stripe.subscriptions.cancel(subscriptionId);
  } else {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  }
}

/**
 * Map Stripe subscription status to our SubscriptionStatus type
 * @param stripeStatus - Stripe subscription status
 * @returns Our SubscriptionStatus
 */
export function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'past_due':
      return 'past_due';
    case 'canceled':
    case 'unpaid':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'expired';
    case 'trialing':
      return 'trial';
    default:
      return 'expired';
  }
}

/**
 * Get subscription tier from Stripe price ID
 * @param priceId - Stripe price ID
 * @returns SubscriptionTier
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier {
  // This should be configured based on your actual Stripe price IDs
  const proPriceIds = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_YEARLY_PRICE_ID,
  ];

  const premiumPriceIds = [
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID,
  ];

  if (proPriceIds.includes(priceId)) {
    return 'pro';
  } else if (premiumPriceIds.includes(priceId)) {
    return 'premium';
  }

  return 'trial';
}

/**
 * Initialize monthly usage for a new period
 * @returns New MonthlyUsage object
 */
export function initializeMonthlyUsage(): MonthlyUsage {
  return {
    queries: 0,
    tokens: 0,
    cost: 0,
    lastReset: Date.now(),
  };
}

/**
 * Check if usage should be reset (new month)
 * @param lastReset - Last reset timestamp
 * @returns True if should reset
 */
export function shouldResetUsage(lastReset: Date): boolean {
  const now = new Date();
  const lastResetDate = new Date(lastReset);

  return (
    now.getMonth() !== lastResetDate.getMonth() ||
    now.getFullYear() !== lastResetDate.getFullYear()
  );
}

/**
 * Get query limit based on subscription tier
 * @param tier - Subscription tier
 * @returns Monthly query limit
 */
export function getQueryLimit(tier: SubscriptionTier): number {
  switch (tier) {
    case 'trial':
      return 100; // 100 queries per month for trial
    case 'pro':
      return 1000; // 1000 queries per month for pro
    case 'premium':
      return 10000; // 10000 queries per month for premium
    default:
      return 0;
  }
}

/**
 * Reset the Stripe instance (useful for testing)
 */
export function resetStripeServer(): void {
  stripeInstance = null;
}
