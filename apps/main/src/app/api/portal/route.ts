/**
 * Customer Portal API Route
 * Creates a Stripe billing portal session for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripeServer } from '@ainexsuite/firebase/admin/stripe';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { PortalSessionResponse } from '@ainexsuite/types';

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

    // Get user's Stripe customer ID from Firestore
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
    const stripeCustomerId = userData?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    // Create billing portal session
    const stripe = getStripeServer();
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${DOMAIN}/dashboard/settings`,
    });

    // Return portal URL
    const response: PortalSessionResponse = {
      url: session.url,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Portal session creation error:', error);

    // Return user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create portal session';

    return NextResponse.json(
      {
        error: 'Failed to create billing portal session',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
