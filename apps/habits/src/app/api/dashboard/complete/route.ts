import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';

interface CompletionRequest {
  spaceId: string;
  token: string;
  habitId: string;
  memberId: string;
  date: string;
}

// POST - Add a completion
export async function POST(request: NextRequest) {
  try {
    const body: CompletionRequest = await request.json();
    const { spaceId, token, habitId, memberId, date } = body;

    // Validate required fields
    if (!spaceId || !token || !habitId || !memberId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dashboard token
    const spaceDoc = await adminDb.collection('spaces').doc(spaceId).get();
    if (!spaceDoc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const spaceData = spaceDoc.data();
    if (spaceData?.dashboardToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // Verify member is part of the space
    if (!spaceData?.memberUids?.includes(memberId)) {
      return NextResponse.json(
        { error: 'Member not found in space' },
        { status: 403 }
      );
    }

    // Create completion record
    const completionId = `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const completion = {
      id: completionId,
      habitId,
      spaceId,
      userId: memberId,
      date,
      completedAt: new Date().toISOString(),
    };

    await adminDb.collection('completions').doc(completionId).set(completion);

    return NextResponse.json({ success: true, completionId });
  } catch (error) {
    console.error('Error creating completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a completion
export async function DELETE(request: NextRequest) {
  try {
    const body: CompletionRequest = await request.json();
    const { spaceId, token, habitId, memberId, date } = body;

    // Validate required fields
    if (!spaceId || !token || !habitId || !memberId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate dashboard token
    const spaceDoc = await adminDb.collection('spaces').doc(spaceId).get();
    if (!spaceDoc.exists) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    const spaceData = spaceDoc.data();
    if (spaceData?.dashboardToken !== token) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // Find and delete the completion
    const completionsQuery = await adminDb
      .collection('completions')
      .where('habitId', '==', habitId)
      .where('userId', '==', memberId)
      .where('date', '==', date)
      .limit(1)
      .get();

    if (completionsQuery.empty) {
      return NextResponse.json(
        { error: 'Completion not found' },
        { status: 404 }
      );
    }

    await completionsQuery.docs[0].ref.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
