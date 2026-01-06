import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import type { NoteSpace, NoteSpaceDoc, NoteSpaceDraft, SpaceMember, SpaceType } from "@/lib/types/note";

// Use unified "spaces" collection to match the provider
const SPACES_COLLECTION = "spaces";

function convertToNoteSpace(id: string, data: NoteSpaceDoc): NoteSpace {
  return {
    id,
    name: data.name,
    type: data.type,
    members: data.members,
    memberUids: data.memberUids,
    createdAt: data.createdAt?.toDate() ?? new Date(),
    createdBy: data.createdBy,
  };
}

export async function getSpace(spaceId: string): Promise<NoteSpace | null> {
  const spaceRef = doc(db, SPACES_COLLECTION, spaceId);
  const snapshot = await getDoc(spaceRef);
  if (!snapshot.exists()) {
    return null;
  }
  return convertToNoteSpace(snapshot.id, snapshot.data() as NoteSpaceDoc);
}

export function subscribeToSpaces(
  userId: string,
  onData: (spaces: NoteSpace[]) => void,
  onError?: (error: Error) => void
): () => void {
  const spacesRef = collection(db, SPACES_COLLECTION);
  const q = query(
    spacesRef,
    where("memberUids", "array-contains", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const spaces = snapshot.docs.map((docSnap) =>
        convertToNoteSpace(docSnap.id, docSnap.data() as NoteSpaceDoc)
      );
      onData(spaces);
    },
    (error) => {
      console.error("Error subscribing to spaces:", error);
      onError?.(error);
    }
  );
}

export async function createSpace(
  userId: string,
  displayName: string,
  photoURL: string | undefined,
  input: { name: string; type: SpaceType }
): Promise<string> {
  const spacesRef = collection(db, SPACES_COLLECTION);

  const member: SpaceMember = {
    uid: userId,
    displayName: displayName || "Me",
    photoURL,
    role: "admin",
    joinedAt: new Date().toISOString(),
  };

  const spaceData: NoteSpaceDoc = {
    name: input.name,
    type: input.type,
    members: [member],
    memberUids: [userId],
    createdAt: Timestamp.now(),
    createdBy: userId,
  };

  const docRef = await addDoc(spacesRef, spaceData);
  return docRef.id;
}

export async function updateSpace(
  spaceId: string,
  updates: NoteSpaceDraft
): Promise<void> {
  const spaceRef = doc(db, SPACES_COLLECTION, spaceId);
  await updateDoc(spaceRef, updates);
}

export async function deleteSpace(spaceId: string): Promise<void> {
  const spaceRef = doc(db, SPACES_COLLECTION, spaceId);
  await deleteDoc(spaceRef);
}

export async function addMemberToSpace(
  spaceId: string,
  _member: SpaceMember
): Promise<void> {
  const spaceRef = doc(db, SPACES_COLLECTION, spaceId);
  // This would need arrayUnion in a real implementation
  // For now, we'll handle this in the provider
  await updateDoc(spaceRef, {
    // Note: In production, use arrayUnion for concurrent safety
  });
}
