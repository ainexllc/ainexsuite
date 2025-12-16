import { NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';

/**
 * Bootstrap admin role for the first admin user.
 * This endpoint should be disabled or removed after initial setup.
 *
 * POST /api/bootstrap-admin
 * Body: { uid: string, secret: string }
 */
export async function POST(request: Request) {
  try {
    const { uid, secret } = await request.json();

    // Simple secret check - change this or use env variable
    const BOOTSTRAP_SECRET = process.env.ADMIN_BOOTSTRAP_SECRET || 'ainex-bootstrap-2024';

    if (secret !== BOOTSTRAP_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }

    if (!uid) {
      return NextResponse.json({ error: 'UID is required' }, { status: 400 });
    }

    // Use Admin SDK to bypass Firestore rules
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.set({ role: 'admin' }, { merge: true });

    return NextResponse.json({
      success: true,
      message: `User ${uid} is now an admin`
    });
  } catch (error) {
    console.error('Bootstrap admin error:', error);
    return NextResponse.json(
      { error: 'Failed to set admin role' },
      { status: 500 }
    );
  }
}
