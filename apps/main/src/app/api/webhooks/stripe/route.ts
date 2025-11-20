/**
 * Stripe Webhook Handler
 * Processes Stripe events with idempotency and atomic updates
 */

/* eslint-disable no-console */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripeServer, mapStripeStatus, getTierFromPriceId } from '@ainexsuite/firebase/admin/stripe';
import { getFirestore } from 'firebase-admin/firestore';
import Stripe from 'stripe';
import type { WebhookEvent, Subscription } from '@ainexsuite/types';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'wh_test_secret';

/**
 * POST endpoint for Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const stripe = getStripeServer();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET!);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check for idempotency - skip if already processed
    const db = getFirestore();
    const webhookRef = db.collection('webhook_events').doc(event.id);
    const webhookDoc = await webhookRef.get();

    if (webhookDoc.exists) {
      console.log(`Webhook ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true });
    }

    // Log webhook event for idempotency
    const webhookEvent: WebhookEvent = {
      id: event.id,
      type: event.type,
      data: event.data.object as unknown as Record<string, unknown>,
      processed: false,
      createdAt: Date.now(),
    };

    await webhookRef.set(webhookEvent);

    // Process the webhook event
    try {
      await processWebhookEvent(event);

      // Mark as processed
      await webhookRef.update({
        processed: true,
        processedAt: Date.now(),
      });

      console.log(`Successfully processed webhook: ${event.type} (${event.id})`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error processing webhook ${event.id}:`, error);

      // Log error but don't mark as processed
      await webhookRef.update({
        error: errorMessage,
      });

      // Return 500 so Stripe retries
      return NextResponse.json(
        { error: 'Webhook processing failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Process webhook event with atomic Firestore updates
 */
async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  const db = getFirestore();

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription, db);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription, db);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice, db);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice, db);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle subscription creation/update with atomic transaction
 */
async function handleSubscriptionChange(
  stripeSubscription: Stripe.Subscription,
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const userId = stripeSubscription.metadata.userId;

  if (!userId) {
    throw new Error('Missing userId in subscription metadata');
  }

  const tier = getTierFromPriceId(stripeSubscription.items.data[0]?.price.id || '');
  const status = mapStripeStatus(stripeSubscription.status);

  // Extract selected apps from metadata (comma-separated string)
  const selectedAppsStr = stripeSubscription.metadata.selectedApps || '';
  const subscribedApps = selectedAppsStr ? selectedAppsStr.split(',').filter(Boolean) : [];

  // Use transaction for atomic update
  await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const subscriptionRef = db.collection('subscriptions').doc(userId);

    const subscriptionData: Partial<Subscription> = {
      userId,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: stripeSubscription.items.data[0]?.price.id || '',
      status,
      tier,
      subscribedApps,
      currentPeriodStart: stripeSubscription.current_period_start * 1000,
      currentPeriodEnd: stripeSubscription.current_period_end * 1000,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      updatedAt: Date.now(),
    };

    // Add trial dates if in trial
    if (stripeSubscription.trial_start && stripeSubscription.trial_end) {
      subscriptionData.trialStartDate = stripeSubscription.trial_start * 1000;
      subscriptionData.trialEndDate = stripeSubscription.trial_end * 1000;
    }

    // Add cancel dates if applicable
    if (stripeSubscription.canceled_at) {
      subscriptionData.canceledAt = stripeSubscription.canceled_at * 1000;
    }
    if (stripeSubscription.cancel_at) {
      subscriptionData.cancelAt = stripeSubscription.cancel_at * 1000;
    }

    // Check if subscription exists
    const subscriptionDoc = await transaction.get(subscriptionRef);

    if (subscriptionDoc.exists) {
      // Update existing subscription
      transaction.update(subscriptionRef, subscriptionData);
    } else {
      // Create new subscription with initialized usage
      transaction.set(subscriptionRef, {
        ...subscriptionData,
        currentMonthUsage: {
          queries: 0,
          tokens: 0,
          cost: 0,
          lastReset: Date.now(),
        },
        monthlyQueryLimit: getQueryLimit(tier),
        createdAt: Date.now(),
      });
    }

    // Update user document
    const userUpdate: Record<string, unknown> = {
      subscriptionStatus: status,
      subscriptionTier: tier,
      stripeCustomerId: stripeSubscription.customer,
      stripeSubscriptionId: stripeSubscription.id,
      subscriptionExpiresAt: stripeSubscription.current_period_end * 1000,
      updatedAt: Date.now(),
    };

    // Add subscribedApps if this is a single-app or three-apps tier
    if (subscribedApps.length > 0) {
      userUpdate.subscribedApps = subscribedApps;
    }

    transaction.update(userRef, userUpdate);
  });

  console.log(`Subscription ${stripeSubscription.status} for user ${userId}`);
}

/**
 * Handle subscription deletion with atomic transaction
 */
async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription,
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const userId = stripeSubscription.metadata.userId;

  if (!userId) {
    throw new Error('Missing userId in subscription metadata');
  }

  // Use transaction for atomic update
  await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userId);
    const subscriptionRef = db.collection('subscriptions').doc(userId);

    // Update subscription status
    transaction.update(subscriptionRef, {
      status: 'expired',
      canceledAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update user document
    transaction.update(userRef, {
      subscriptionStatus: 'expired',
      updatedAt: Date.now(),
    });
  });

  console.log(`Subscription deleted for user ${userId}`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('Invoice not associated with subscription, skipping');
    return;
  }

  // Get subscription to find userId
  const stripe = getStripeServer();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  console.log(`Payment succeeded for user ${userId}: ${invoice.amount_paid / 100} ${invoice.currency}`);

  // Update user's last payment date
  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    lastPaymentDate: Date.now(),
    lastPaymentAmount: invoice.amount_paid / 100,
    updatedAt: Date.now(),
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  db: FirebaseFirestore.Firestore
): Promise<void> {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    console.log('Invoice not associated with subscription, skipping');
    return;
  }

  // Get subscription to find userId
  const stripe = getStripeServer();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error('Missing userId in subscription metadata');
    return;
  }

  console.log(`Payment failed for user ${userId}`);

  // Update subscription status
  const subscriptionRef = db.collection('subscriptions').doc(userId);
  await subscriptionRef.update({
    status: 'past_due',
    updatedAt: Date.now(),
  });

  // Update user document
  const userRef = db.collection('users').doc(userId);
  await userRef.update({
    subscriptionStatus: 'past_due',
    updatedAt: Date.now(),
  });
}

/**
 * Get query limit based on tier
 */
function getQueryLimit(tier: string): number {
  switch (tier) {
    case 'trial':
      return 100;
    case 'pro':
      return 1000;
    case 'premium':
      return 10000;
    default:
      return 0;
  }
}
