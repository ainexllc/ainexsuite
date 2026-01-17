import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth, getAdminFirestore } from '@ainexsuite/auth/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { SpaceInvitation, Space } from '@ainexsuite/types';
import { sendInvitationEmail, type EmailConfig } from '@ainexsuite/firebase';

/**
 * POST /api/spaces/invite
 *
 * Send an invitation to join a space.
 *
 * Request Body:
 * {
 *   spaceId: string;
 *   spaceCollection: string; // e.g., 'noteSpaces', 'journalSpaces'
 *   email: string;
 *   role: 'admin' | 'member' | 'viewer';
 * }
 *
 * Response:
 * { success: true, invitation: SpaceInvitation }
 * or
 * { error: string }
 */

const INVITATIONS_COLLECTION = 'spaceInvitations';
const INVITATION_EXPIRY_DAYS = 7;

const SPACE_MEMBER_LIMITS_MAP: Record<string, number | null> = {
  personal: 1,
  couple: 2,
  family: null,
  work: null,
  buddy: 2,
  squad: null,
  project: null,
};

function generateInviteToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getExpirationTimestamp(): number {
  return Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

export async function POST(request: NextRequest) {
  try {
    const { spaceId, spaceCollection, email, role } = await request.json();

    // Validate required fields
    if (!spaceId || !spaceCollection || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: spaceId, spaceCollection, email, role' },
        { status: 400 }
      );
    }

    // Validate email format
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'member', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, member, or viewer' },
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
    const inviterUid = decodedClaims.uid;

    if (!inviterUid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get inviter details
    const inviterRecord = await adminAuth.getUser(inviterUid);
    const inviterName = inviterRecord.displayName || inviterRecord.email;
    const inviterPhoto = inviterRecord.photoURL;

    // Get space document
    const adminDb = getAdminFirestore();
    const spaceRef = adminDb.collection(spaceCollection).doc(spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    const spaceData = spaceDoc.data() as Space;

    // Check if user is admin of the space
    const currentUserMember = spaceData.members?.find((m) => m.uid === inviterUid);
    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can invite members' },
        { status: 403 }
      );
    }

    // Check member limits
    const memberLimit = SPACE_MEMBER_LIMITS_MAP[spaceData.type];
    if (memberLimit !== null) {
      const currentMemberCount = spaceData.members?.length || 0;
      const pendingInviteCount = spaceData.pendingInviteCount || 0;

      if (currentMemberCount + pendingInviteCount >= memberLimit) {
        return NextResponse.json(
          {
            error: `This ${spaceData.type} space has reached its member limit of ${memberLimit}`,
          },
          { status: 400 }
        );
      }
    }

    // Check if email is already a member
    const existingMember = spaceData.members?.find(
      (m) => m.email?.toLowerCase() === normalizedEmail
    );
    if (existingMember) {
      return NextResponse.json(
        { error: 'This person is already a member of this space' },
        { status: 400 }
      );
    }

    // Check if already invited
    const existingInviteQuery = await adminDb
      .collection(INVITATIONS_COLLECTION)
      .where('spaceId', '==', spaceId)
      .where('email', '==', normalizedEmail)
      .where('status', '==', 'pending')
      .get();

    if (!existingInviteQuery.empty) {
      return NextResponse.json(
        { error: 'An invitation is already pending for this email' },
        { status: 400 }
      );
    }

    // Check if invitee has an existing account
    let inviteeUid: string | undefined;
    try {
      const inviteeUser = await adminAuth.getUserByEmail(normalizedEmail);
      inviteeUid = inviteeUser.uid;
    } catch {
      // User doesn't exist yet - that's fine
    }

    // Create the invitation
    const now = Date.now();
    const invitationData: Omit<SpaceInvitation, 'id'> = {
      spaceId,
      spaceName: spaceData.name,
      spaceType: spaceData.type,
      email: normalizedEmail,
      role,
      invitedBy: inviterUid,
      invitedByName: inviterName || undefined,
      invitedByPhoto: inviterPhoto || undefined,
      invitedAt: now,
      expiresAt: getExpirationTimestamp(),
      token: generateInviteToken(),
      status: 'pending',
      inviteeUid,
    };

    const invitationRef = await adminDb
      .collection(INVITATIONS_COLLECTION)
      .add(invitationData);

    // Update pending invite count on space
    await spaceRef.update({
      pendingInviteCount: FieldValue.increment(1),
    });

    // If invitee has an account, create in-app notification
    if (inviteeUid) {
      const notificationData = {
        type: 'space_invite',
        title: `Invitation to join ${spaceData.name}`,
        message: inviterName
          ? `${inviterName} invited you to join as ${role}`
          : `You've been invited to join as ${role}`,
        timestamp: now,
        read: false,
        icon: 'UserPlus',
        actionUrl: `/spaces/invitations/${invitationRef.id}`,
        actionLabel: 'View Invitation',
        metadata: {
          invitationId: invitationRef.id,
          spaceId,
          spaceName: spaceData.name,
          spaceType: spaceData.type,
          invitedBy: inviterUid,
          invitedByName: inviterName,
          invitedByPhoto: inviterPhoto,
          role,
          expiresAt: invitationData.expiresAt,
        },
      };

      await adminDb
        .collection('users')
        .doc(inviteeUid)
        .collection('notifications')
        .add(notificationData);
    }

    // Send email invitation via Resend
    let emailSent = false;
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@ainexspace.com';

    if (resendApiKey) {
      const emailConfig: EmailConfig = {
        apiKey: resendApiKey,
        fromEmail: resendFromEmail,
        fromName: 'AINexSpace',
      };

      // Build the accept URL
      const baseUrl = request.headers.get('origin') || 'https://www.ainexspace.com';
      const acceptUrl = `${baseUrl}/invite/accept?token=${invitationData.token}`;

      const emailResult = await sendInvitationEmail(emailConfig, normalizedEmail, {
        inviterName: inviterName || 'Someone',
        inviterPhoto: inviterPhoto || undefined,
        spaceName: spaceData.name,
        spaceType: spaceData.type,
        role,
        acceptUrl,
        expiresAt: invitationData.expiresAt,
      });

      emailSent = emailResult.success;

      if (!emailResult.success) {
        console.warn('Failed to send invitation email:', emailResult.error);
      }
    } else {
      console.warn('RESEND_API_KEY not configured, skipping email');
    }

    const invitation: SpaceInvitation = {
      id: invitationRef.id,
      ...invitationData,
    };

    return NextResponse.json({
      success: true,
      invitation,
      emailSent,
      hasExistingAccount: !!inviteeUid,
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      {
        error: 'Failed to send invitation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/spaces/invite
 *
 * Get pending invitations for a space.
 *
 * Query params:
 * - spaceId: string (required)
 *
 * Response:
 * { invitations: SpaceInvitation[] }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get('spaceId');

    if (!spaceId) {
      return NextResponse.json(
        { error: 'Missing spaceId parameter' },
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
    const uid = decodedClaims.uid;

    if (!uid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get pending invitations for the space
    const adminDb = getAdminFirestore();
    const invitationsQuery = await adminDb
      .collection(INVITATIONS_COLLECTION)
      .where('spaceId', '==', spaceId)
      .where('status', '==', 'pending')
      .orderBy('invitedAt', 'desc')
      .get();

    const invitations = invitationsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SpaceInvitation[];

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch invitations',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/spaces/invite
 *
 * Cancel a pending invitation.
 *
 * Query params:
 * - invitationId: string (required)
 * - spaceCollection: string (required)
 *
 * Response:
 * { success: true }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');
    const spaceCollection = searchParams.get('spaceCollection');

    if (!invitationId || !spaceCollection) {
      return NextResponse.json(
        { error: 'Missing invitationId or spaceCollection parameter' },
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
    const uid = decodedClaims.uid;

    if (!uid) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const adminDb = getAdminFirestore();

    // Get the invitation
    const invitationRef = adminDb.collection(INVITATIONS_COLLECTION).doc(invitationId);
    const invitationDoc = await invitationRef.get();

    if (!invitationDoc.exists) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const invitation = invitationDoc.data() as SpaceInvitation;

    // Verify user is admin of the space
    const spaceRef = adminDb.collection(spaceCollection).doc(invitation.spaceId);
    const spaceDoc = await spaceRef.get();

    if (!spaceDoc.exists) {
      return NextResponse.json(
        { error: 'Space not found' },
        { status: 404 }
      );
    }

    const spaceData = spaceDoc.data() as Space;
    const currentUserMember = spaceData.members?.find((m) => m.uid === uid);

    if (!currentUserMember || currentUserMember.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can cancel invitations' },
        { status: 403 }
      );
    }

    // Delete the invitation
    await invitationRef.delete();

    // Decrement pending invite count
    await spaceRef.update({
      pendingInviteCount: FieldValue.increment(-1),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling invitation:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel invitation',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
