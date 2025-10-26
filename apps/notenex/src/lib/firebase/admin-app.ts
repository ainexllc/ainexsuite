import { auth as adminAuth, db as adminDb, storage as adminStorage } from "@ainexsuite/firebase/admin";

export function getAdminAuth() {
  return adminAuth;
}

export function getAdminFirestore() {
  return adminDb;
}

export function getAdminStorage() {
  return adminStorage;
}
