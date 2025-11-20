import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, query, where, collection } from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';

/**
 * POST /api/auth/detect-account
 * Detect if an account already exists with the given email
 */
type DetectAccountRequest = {
  email: string;
};

type DetectAccountResponse = {
  account?: {
    email: string;
    displayName: string;
    photoURL?: string;
    primaryApp: string;
    hasAppAccess: boolean;
  } | null;
};

export async function POST(request: NextRequest): Promise<NextResponse<DetectAccountResponse>> {
  try {
    const { email } = (await request.json()) as DetectAccountRequest;

    if (!email) {
      return NextResponse.json(
        { account: null },
        { status: 400 }
      );
    }

    // For development, return null (no account detection)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { account: null },
        { status: 200 }
      );
    }

    // Production: Query Firestore for user with this email
    try {
      // Initialize Firebase if not already done
      const apps = getApps();
      const app = apps.length > 0 ? apps[0] : initializeApp(JSON.parse(process.env.FIREBASE_CONFIG || '{}'));

      const db = getFirestore(app);
      const usersRef = collection(db, 'users');
      query(usersRef, where('email', '==', email));

      // Note: This would need server-side implementation with proper auth
      // For now, return null - this should be implemented via Cloud Function
      return NextResponse.json(
        { account: null },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { account: null },
        { status: 200 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { account: null },
      { status: 500 }
    );
  }
}
