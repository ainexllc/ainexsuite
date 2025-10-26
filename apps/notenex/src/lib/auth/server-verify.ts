import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth } from "@/lib/firebase/admin-app";

export async function verifyIdToken(
  idToken: string,
): Promise<DecodedIdToken | null> {
  try {
    return await getAdminAuth().verifyIdToken(idToken, true);
  } catch (error) {
    console.error("Failed to verify Firebase ID token", error);
    return null;
  }
}

export async function getUserFromHeaders(
  headers: Headers,
): Promise<DecodedIdToken | null> {
  const authorization = headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.replace("Bearer ", "").trim();

  if (!token) {
    return null;
  }

  return verifyIdToken(token);
}
