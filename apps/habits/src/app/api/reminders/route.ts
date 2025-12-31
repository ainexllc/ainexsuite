import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';

// Helper to verify session and get user ID
async function getUserIdFromSession(request: NextRequest): Promise<string | null> {
  const sessionCookie = request.cookies.get('__session')?.value;
  if (!sessionCookie) return null;

  // Development: decode base64 session
  if (process.env.NODE_ENV === 'development') {
    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, 'base64').toString());
      return decoded.uid || null;
    } catch {
      return null;
    }
  }

  // Production: verify with Firebase Admin
  try {
    const { getAuth } = await import('firebase-admin/auth');
    const auth = getAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.uid;
  } catch {
    return null;
  }
}

// GET - List user's reminders
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const remindersSnapshot = await adminDb
      .collection('habitReminders')
      .where('userId', '==', userId)
      .get();

    const reminders = remindersSnapshot.docs.map(doc => doc.data());

    // Also get user preferences
    const prefsDoc = await adminDb
      .collection('userReminderPreferences')
      .doc(userId)
      .get();

    const preferences = prefsDoc.exists ? prefsDoc.data() : null;

    return NextResponse.json({ reminders, preferences });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update a reminder
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (type === 'reminder') {
      // Create/update habit reminder
      const { habitId, settings } = data;
      if (!habitId || !settings) {
        return NextResponse.json(
          { error: 'Missing habitId or settings' },
          { status: 400 }
        );
      }

      const reminderId = `reminder_${userId}_${habitId}`;
      const reminder = {
        id: reminderId,
        userId,
        habitId,
        ...settings,
        updatedAt: new Date().toISOString(),
      };

      await adminDb.collection('habitReminders').doc(reminderId).set(reminder, { merge: true });

      return NextResponse.json({ success: true, reminder });
    } else if (type === 'preferences') {
      // Update user preferences
      const preferences = {
        userId,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      await adminDb.collection('userReminderPreferences').doc(userId).set(preferences, { merge: true });

      return NextResponse.json({ success: true, preferences });
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Expected "reminder" or "preferences"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error saving reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a reminder
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdFromSession(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const habitId = searchParams.get('habitId');

    if (!habitId) {
      return NextResponse.json(
        { error: 'Missing habitId parameter' },
        { status: 400 }
      );
    }

    const reminderId = `reminder_${userId}_${habitId}`;
    await adminDb.collection('habitReminders').doc(reminderId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
