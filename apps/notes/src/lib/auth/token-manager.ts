"use client";

import { getFirebaseAuth } from "@/lib/firebase/client-app";

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  const auth = await getFirebaseAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  return currentUser.getIdToken(forceRefresh);
}

export async function withAuthHeaders(
  init: RequestInit = {},
  forceRefresh = false,
): Promise<RequestInit> {
  const token = await getIdToken(forceRefresh);

  if (!token) {
    return init;
  }

  const headers = new Headers(init.headers ?? {});
  headers.set("Authorization", `Bearer ${token}`);

  return {
    ...init,
    headers,
  };
}
