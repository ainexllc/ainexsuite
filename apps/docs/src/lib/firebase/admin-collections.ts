import { getAdminFirestore } from "@ainexsuite/auth/server";
import {
  labelCollectionPath,
  docCollectionPath,
  docDocPath,
  preferenceDocPath,
  reminderCollectionPath,
} from "@/lib/firebase/collections";

export function adminNoteCollection(userId: string) {
  return getAdminFirestore().collection(docCollectionPath(userId));
}

export function adminLabelCollection(userId: string) {
  return getAdminFirestore().collection(labelCollectionPath(userId));
}

export function adminReminderCollection(userId: string) {
  return getAdminFirestore().collection(reminderCollectionPath(userId));
}

export function adminDocDoc(userId: string, docId: string) {
  return getAdminFirestore().doc(docDocPath(userId, docId));
}

export function adminPreferenceDoc(userId: string) {
  return getAdminFirestore().doc(preferenceDocPath(userId));
}
