import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  FieldValue,
  Timestamp,
} from "firebase-admin/firestore";
import { adminNoteDoc } from "@/lib/firebase/admin-collections";
import { getUserFromHeaders } from "@/lib/auth/server-verify";
import { getAdminAuth } from "@/lib/firebase/admin-app";

const sharePayloadSchema = z.object({
  email: z.string().email(),
  role: z.enum(["viewer", "editor"]).default("viewer"),
});

const removePayloadSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const segments = request.nextUrl.pathname.split("/");
  const noteId = segments[3];
  if (!noteId) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = sharePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { email, role } = parsed.data;
  const noteRef = adminNoteDoc(user.uid, noteId);
  const snapshot = await noteRef.get();

  if (!snapshot.exists) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const noteData = snapshot.data();
  if (!noteData) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const auth = getAdminAuth();
  const collaboratorRecord = await auth
    .getUserByEmail(email)
    .catch(() => null);

  if (!collaboratorRecord) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (collaboratorRecord.uid === user.uid) {
    return NextResponse.json({ error: "You already own this note" }, { status: 400 });
  }

  const sharedWith: Array<{ email: string; role: string; invitedAt: Timestamp; userId?: string }> =
    noteData.sharedWith ?? [];
  const alreadyShared = sharedWith.some((entry) => entry.email === email);

  if (alreadyShared) {
    return NextResponse.json({ error: "Collaborator already added" }, { status: 409 });
  }

  await noteRef.update({
    sharedWith: FieldValue.arrayUnion({
      email,
      role,
      userId: collaboratorRecord.uid,
      invitedAt: FieldValue.serverTimestamp(),
    }),
    sharedWithUserIds: FieldValue.arrayUnion(collaboratorRecord.uid),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({
    collaborator: {
      email,
      role,
      userId: collaboratorRecord.uid,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const user = await getUserFromHeaders(request.headers);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const segments = request.nextUrl.pathname.split("/");
  const noteId = segments[3];
  if (!noteId) {
    return NextResponse.json({ error: "Invalid note" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = removePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { email } = parsed.data;
  const noteRef = adminNoteDoc(user.uid, noteId);
  const snapshot = await noteRef.get();

  if (!snapshot.exists) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const noteData = snapshot.data();
  if (!noteData) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const sharedWith: Array<{ email: string; role: string; invitedAt: Timestamp }> =
    noteData.sharedWith ?? [];
  const collaboratorRecord = sharedWith.find((entry) => entry.email === email);

  if (!collaboratorRecord) {
    return NextResponse.json({ error: "Collaborator not found" }, { status: 404 });
  }

  const auth = getAdminAuth();
  const collaboratorUser = await auth
    .getUserByEmail(email)
    .catch(() => null);

  const collaboratorUserId =
    collaboratorUser?.uid ?? (collaboratorRecord as { userId?: string }).userId ?? null;

  const remainingCollaborators = sharedWith
    .filter((entry) => entry.email !== email)
      .map((entry) => ({
        email: entry.email,
        role: entry.role,
        userId: (entry as { userId?: string }).userId ?? "",
        invitedAt: entry.invitedAt,
      }));

  const remainingIds = collaboratorUserId
    ? (noteData.sharedWithUserIds ?? []).filter((id: string) => id !== collaboratorUserId)
    : noteData.sharedWithUserIds ?? [];

  await noteRef.update({
    sharedWith: remainingCollaborators,
    sharedWithUserIds: remainingIds,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ success: true });
}
