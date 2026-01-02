import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@ainexsuite/auth/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { Space, ChildMember } from '@ainexsuite/types';

/**
 * POST /api/spaces/child-member
 *
 * Add a child member to a family space.
 * Child members don't need to sign up - they're managed by admins.
 *
 * Request Body:
 * {
 *   spaceId: string;
 *   spaceCollection: string; // e.g., 'noteSpaces', 'journalSpaces'
 *   displayName: string;
 *   photoURL?: string;
 *   birthDate?: string;
 *   relationship?: string;
 * }
 *
 * Response:
 * { success: true, childMember: ChildMember }
 * or
 * { error: string }
 */

function generateChildId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return 'child_' + Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: NextRequest) {
  try {
    const { spaceId, spaceCollection, displayName, photoURL, birthDate, relationship } =
      await request.json();

    // Validate required fields
    if (!spaceId || !spaceCollection || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields: spaceId, spaceCollection, displayName' },
        { status: 400 }
      );
    }

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Not logged in' },
        { status: 401 }
      );
    }

    // Verify session and get user
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userUid = decodedClaims.uid;

    if (!userUid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const adminDb = getAdminFirestore();

    // Get the space
    const spaceRef = adminDb.collection(spaceCollection).doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    const spaceData = spaceDoc.data() as Space;

    // Verify space type allows child members
    if (spaceData.type !== 'family') {
      return NextResponse.json(
        { error: 'Child members can only be added to family spaces' },
        { status: 400 }
      );
    }

    // Verify user is admin of the space
    const currentUserMember = spaceData.members?.find((m) => m.uid === userUid);
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can add child members' },
        { status: 403 }
      );
    }

    // Create child member
    const childMember: ChildMember = {
      id: generateChildId(),
      displayName: displayName.trim(),
      photoURL: photoURL || undefined,
      birthDate: birthDate || undefined,
      relationship: relationship || undefined,
      role: 'viewer',
      joinedAt: Date.now(),
      addedBy: userUid,
      isChild: true,
    };

    // Clean undefined values
    Object.keys(childMember).forEach((key) => {
      if (childMember[key as keyof ChildMember] === undefined) {
        delete childMember[key as keyof ChildMember];
      }
    });

    // Ensure isChild is always set
    childMember.isChild = true;

    // Add child member to space
    await spaceRef.update({
      childMembers: FieldValue.arrayUnion(childMember),
    });

    return NextResponse.json({
      success: true,
      childMember,
    });
  } catch (error) {
    console.error('Error adding child member:', error);
    return NextResponse.json(
      {
        error: 'Failed to add child member',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/spaces/child-member
 *
 * Update a child member.
 *
 * Request Body:
 * {
 *   spaceId: string;
 *   spaceCollection: string;
 *   childId: string;
 *   displayName?: string;
 *   photoURL?: string;
 *   birthDate?: string;
 *   relationship?: string;
 * }
 */
export async function PUT(request: NextRequest) {
  try {
    const { spaceId, spaceCollection, childId, displayName, photoURL, birthDate, relationship } =
      await request.json();

    // Validate required fields
    if (!spaceId || !spaceCollection || !childId) {
      return NextResponse.json(
        { error: 'Missing required fields: spaceId, spaceCollection, childId' },
        { status: 400 }
      );
    }

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Not logged in' },
        { status: 401 }
      );
    }

    // Verify session
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userUid = decodedClaims.uid;

    if (!userUid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const adminDb = getAdminFirestore();

    // Get the space
    const spaceRef = adminDb.collection(spaceCollection).doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    const spaceData = spaceDoc.data() as Space;

    // Verify user is admin
    const currentUserMember = spaceData.members?.find((m) => m.uid === userUid);
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update child members' },
        { status: 403 }
      );
    }

    // Find and update the child member
    const childMembers = spaceData.childMembers || [];
    const childIndex = childMembers.findIndex((c) => c.id === childId);

    if (childIndex === -1) {
      return NextResponse.json(
        { error: 'Child member not found' },
        { status: 404 }
      );
    }

    // Update fields
    const updatedChild = { ...childMembers[childIndex] };
    if (displayName !== undefined) updatedChild.displayName = displayName.trim();
    if (photoURL !== undefined) updatedChild.photoURL = photoURL || undefined;
    if (birthDate !== undefined) updatedChild.birthDate = birthDate || undefined;
    if (relationship !== undefined) updatedChild.relationship = relationship || undefined;

    // Replace in array
    const updatedChildMembers = [...childMembers];
    updatedChildMembers[childIndex] = updatedChild;

    await spaceRef.update({
      childMembers: updatedChildMembers,
    });

    return NextResponse.json({
      success: true,
      childMember: updatedChild,
    });
  } catch (error) {
    console.error('Error updating child member:', error);
    return NextResponse.json(
      {
        error: 'Failed to update child member',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/spaces/child-member
 *
 * Remove a child member.
 *
 * Query params:
 * - spaceId: string
 * - spaceCollection: string
 * - childId: string
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');
    const spaceCollection = searchParams.get('spaceCollection');
    const childId = searchParams.get('childId');

    if (!spaceId || !spaceCollection || !childId) {
      return NextResponse.json(
        { error: 'Missing required parameters: spaceId, spaceCollection, childId' },
        { status: 400 }
      );
    }

    // Get session cookie
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Not logged in' },
        { status: 401 }
      );
    }

    // Verify session
    const adminAuth = getAdminAuth();
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userUid = decodedClaims.uid;

    if (!userUid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const adminDb = getAdminFirestore();

    // Get the space
    const spaceRef = adminDb.collection(spaceCollection).doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    const spaceData = spaceDoc.data() as Space;

    // Verify user is admin
    const currentUserMember = spaceData.members?.find((m) => m.uid === userUid);
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can remove child members' },
        { status: 403 }
      );
    }

    // Find the child member
    const childMembers = spaceData.childMembers || [];
    const childToRemove = childMembers.find((c) => c.id === childId);

    if (!childToRemove) {
      return NextResponse.json(
        { error: 'Child member not found' },
        { status: 404 }
      );
    }

    // Remove from array
    await spaceRef.update({
      childMembers: FieldValue.arrayRemove(childToRemove),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing child member:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove child member',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
