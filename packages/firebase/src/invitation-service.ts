/**
 * Invitation Service
 * Handles space invitation CRUD operations
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './client';
import type {
  SpaceInvitation,
  SpaceRole,
  SpaceType,
  SpaceMember,
} from '@ainexsuite/types';

const INVITATIONS_COLLECTION = 'spaceInvitations';
const INVITATION_EXPIRY_DAYS = 7;

/**
 * Generate a secure random token for invitation links
 */
function generateInviteToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Calculate expiration timestamp (7 days from now)
 */
function getExpirationTimestamp(): number {
  return Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

export interface CreateInvitationParams {
  spaceId: string;
  spaceName: string;
  spaceType: SpaceType;
  email: string;
  role: SpaceRole;
  inviter: {
    uid: string;
    displayName?: string | null;
    photoURL?: string | null;
  };
}

/**
 * Create a new space invitation
 */
export async function createInvitation(
  params: CreateInvitationParams
): Promise<SpaceInvitation> {
  const { spaceId, spaceName, spaceType, email, role, inviter } = params;

  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();

  const invitationData: Omit<SpaceInvitation, 'id'> = {
    spaceId,
    spaceName,
    spaceType,
    email: normalizedEmail,
    role,
    invitedBy: inviter.uid,
    invitedByName: inviter.displayName || undefined,
    invitedByPhoto: inviter.photoURL || undefined,
    invitedAt: now,
    expiresAt: getExpirationTimestamp(),
    token: generateInviteToken(),
    status: 'pending',
  };

  const docRef = await addDoc(
    collection(db, INVITATIONS_COLLECTION),
    invitationData
  );

  return {
    id: docRef.id,
    ...invitationData,
  };
}

/**
 * Get invitation by token (for email link acceptance)
 */
export async function getInvitationByToken(
  token: string
): Promise<SpaceInvitation | null> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('token', '==', token)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as SpaceInvitation;
}

/**
 * Get invitation by ID
 */
export async function getInvitationById(
  invitationId: string
): Promise<SpaceInvitation | null> {
  const docRef = doc(db, INVITATIONS_COLLECTION, invitationId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as SpaceInvitation;
}

/**
 * Get pending invitations for a user by email
 */
export async function getPendingInvitationsForEmail(
  email: string
): Promise<SpaceInvitation[]> {
  const normalizedEmail = email.toLowerCase().trim();

  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('email', '==', normalizedEmail),
    where('status', '==', 'pending'),
    orderBy('invitedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SpaceInvitation[];
}

/**
 * Get pending invitations for a user by UID (for in-app notifications)
 */
export async function getPendingInvitationsForUser(
  uid: string
): Promise<SpaceInvitation[]> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('inviteeUid', '==', uid),
    where('status', '==', 'pending'),
    orderBy('invitedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SpaceInvitation[];
}

/**
 * Get pending invitations for a space
 */
export async function getPendingInvitationsForSpace(
  spaceId: string
): Promise<SpaceInvitation[]> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('spaceId', '==', spaceId),
    where('status', '==', 'pending'),
    orderBy('invitedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SpaceInvitation[];
}

/**
 * Check if an email is already invited to a space
 */
export async function isEmailAlreadyInvited(
  spaceId: string,
  email: string
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();

  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('spaceId', '==', spaceId),
    where('email', '==', normalizedEmail),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Accept an invitation - adds user to space
 */
export async function acceptInvitation(
  invitationId: string,
  user: {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
  },
  spaceCollection: string = 'spaces'
): Promise<void> {
  const invitation = await getInvitationById(invitationId);
  if (!invitation) {
    throw new Error('Invitation not found');
  }

  if (invitation.status !== 'pending') {
    throw new Error(`Invitation is ${invitation.status}`);
  }

  if (invitation.expiresAt < Date.now()) {
    // Mark as expired
    await updateDoc(doc(db, INVITATIONS_COLLECTION, invitationId), {
      status: 'expired',
    });
    throw new Error('Invitation has expired');
  }

  // Add user to space
  const spaceRef = doc(db, spaceCollection, invitation.spaceId);
  const newMember: SpaceMember = {
    uid: user.uid,
    displayName: user.displayName || undefined,
    email: user.email || undefined,
    photoURL: user.photoURL || undefined,
    role: invitation.role,
    joinedAt: Date.now(),
    addedBy: invitation.invitedBy,
  };

  await updateDoc(spaceRef, {
    members: arrayUnion(newMember),
    memberUids: arrayUnion(user.uid),
  });

  // Update invitation status
  await updateDoc(doc(db, INVITATIONS_COLLECTION, invitationId), {
    status: 'accepted',
    respondedAt: Date.now(),
  });
}

/**
 * Decline an invitation
 */
export async function declineInvitation(invitationId: string): Promise<void> {
  await updateDoc(doc(db, INVITATIONS_COLLECTION, invitationId), {
    status: 'declined',
    respondedAt: Date.now(),
  });
}

/**
 * Cancel a pending invitation (by space admin)
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  await deleteDoc(doc(db, INVITATIONS_COLLECTION, invitationId));
}

/**
 * Resend an invitation (generates new token and expiry)
 */
export async function resendInvitation(
  invitationId: string
): Promise<SpaceInvitation> {
  const newToken = generateInviteToken();
  const newExpiry = getExpirationTimestamp();

  await updateDoc(doc(db, INVITATIONS_COLLECTION, invitationId), {
    token: newToken,
    expiresAt: newExpiry,
    status: 'pending',
    invitedAt: Date.now(),
  });

  const updated = await getInvitationById(invitationId);
  if (!updated) {
    throw new Error('Failed to resend invitation');
  }

  return updated;
}

/**
 * Link invitation to existing user (when they have an account)
 */
export async function linkInvitationToUser(
  invitationId: string,
  uid: string
): Promise<void> {
  await updateDoc(doc(db, INVITATIONS_COLLECTION, invitationId), {
    inviteeUid: uid,
  });
}

/**
 * Mark expired invitations (for cleanup job)
 */
export async function markExpiredInvitations(): Promise<number> {
  const now = Date.now();

  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('status', '==', 'pending'),
    where('expiresAt', '<', now)
  );

  const snapshot = await getDocs(q);
  let count = 0;

  for (const docSnap of snapshot.docs) {
    await updateDoc(doc(db, INVITATIONS_COLLECTION, docSnap.id), {
      status: 'expired',
    });
    count++;
  }

  return count;
}
