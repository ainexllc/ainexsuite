import { NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Create a missing user document.
 * POST /api/users/create
 */
export async function POST(request: Request) {
  try {
    const { uid, email, displayName, photoURL } = await request.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'uid and email are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingDoc = await adminDb.collection('users').doc(uid).get();
    if (existingDoc.exists) {
      return NextResponse.json({ error: 'User already exists', user: existingDoc.data() }, { status: 409 });
    }

    const now = Date.now();
    const trialEndDate = now + (30 * 24 * 60 * 60 * 1000); // 30 days
    const allApps = ['notes', 'journal', 'todo', 'health', 'album', 'habits', 'display', 'fit', 'projects', 'workflow', 'calendar'];

    const user = {
      uid,
      email,
      displayName: displayName || email,
      photoURL: photoURL || '',
      createdAt: now,
      lastLoginAt: FieldValue.serverTimestamp(),
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        notifications: { email: true, push: true, inApp: true },
      },
      apps: allApps.reduce((acc, app) => ({ ...acc, [app]: true }), {}),
      appPermissions: {},
      appsUsed: {},
      appsEligible: allApps,
      trialStartDate: now,
      trialEndDate: trialEndDate,
      subscriptionStatus: 'trial',
      suiteAccess: true,
    };

    await adminDb.collection('users').doc(uid).set(user);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}
