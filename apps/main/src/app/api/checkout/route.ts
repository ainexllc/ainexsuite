/**
 * Checkout Session API Route
 * Creates a Stripe checkout session for subscription signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer, createStripeCustomer } from '@ainexsuite/firebase/admin/stripe';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { CheckoutSessionRequest, CheckoutSessionResponse } from '@ainexsuite/types';

const DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    // Get the authorization token from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // Parse request body
    const body = await request.json() as CheckoutSessionRequest;
    const { priceId, tier, selectedApps } = body;

    if (!priceId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: priceId, tier' },
        { status: 400 }
      );
    }

    // For single-app and three-apps tiers, validate selected apps
    if ((tier === 'single-app' || tier === 'three-apps') && (!selectedApps || selectedApps.length === 0)) {
      return NextResponse.json(
        { error: `Tier ${tier} requires selected apps` },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const db = getFirestore();
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    let stripeCustomerId = userData?.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        userData?.email || decodedToken.email!,
        userData?.displayName,
        { userId }
      );
      stripeCustomerId = customer.id;

      // Save customer ID to user document
      await userRef.update({
        stripeCustomerId,
        updatedAt: Date.now()
      });
    }

    // Create checkout session with 30-day trial
    const stripe = getStripeServer();

    // Prepare metadata with selected apps if applicable
    const selectedAppsStr = selectedApps ? selectedApps.join(',') : '';

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          userId,
          tier,
          selectedApps: selectedAppsStr,
        },
      },
      metadata: {
        userId,
        tier,
        selectedApps: selectedAppsStr,
      },
      success_url: `${DOMAIN}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/pricing`,
      allow_promotion_codes: true,
    });

    // Return session ID for redirection
    const response: CheckoutSessionResponse = {
      sessionId: session.id,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Checkout session creation error:', error);

    // Return user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
