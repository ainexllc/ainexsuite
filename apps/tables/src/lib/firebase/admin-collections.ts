import { getAdminFirestore } from "@ainexsuite/auth/server";
import {
  labelCollectionPath,
  tableCollectionPath,
  tableDocPath,
  preferenceDocPath,
  reminderCollectionPath,
} from "@/lib/firebase/collections";

export function adminNoteCollection(userId: string) {
  return getAdminFirestore().collection(tableCollectionPath(userId));
}

export function adminLabelCollection(userId: string) {
  return getAdminFirestore().collection(labelCollectionPath(userId));
}

export function adminReminderCollection(userId: string) {
  return getAdminFirestore().collection(reminderCollectionPath(userId));
}

export function adminTableDoc(userId: string, tableId: string) {
  return getAdminFirestore().doc(tableDocPath(userId, tableId));
}

export function adminPreferenceDoc(userId: string) {
  return getAdminFirestore().doc(preferenceDocPath(userId));
}
