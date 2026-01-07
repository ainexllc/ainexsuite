import { collection, doc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client-app";
import {
  labelCollectionPath,
  tableCollectionPath,
  tableDocPath,
  reminderCollectionPath,
  preferenceDocPath,
  filterPresetsCollectionPath,
  filterPresetDocPath,
} from "@/lib/firebase/collections";

export function clientTableCollection(userId: string) {
  return collection(getFirebaseFirestore(), tableCollectionPath(userId));
}

export function clientLabelCollection(userId: string) {
  return collection(getFirebaseFirestore(), labelCollectionPath(userId));
}

export function clientReminderCollection(userId: string) {
  return collection(getFirebaseFirestore(), reminderCollectionPath(userId));
}

export function clientTableDoc(userId: string, tableId: string) {
  return doc(getFirebaseFirestore(), tableDocPath(userId, tableId));
}

export function clientReminderDoc(userId: string, reminderId: string) {
  return doc(getFirebaseFirestore(), `${reminderCollectionPath(userId)}/${reminderId}`);
}

export function clientPreferenceDoc(userId: string) {
  return doc(getFirebaseFirestore(), preferenceDocPath(userId));
}

export function clientFilterPresetsCollection(userId: string) {
  return collection(getFirebaseFirestore(), filterPresetsCollectionPath(userId));
}

export function clientFilterPresetDoc(userId: string, presetId: string) {
  return doc(getFirebaseFirestore(), filterPresetDocPath(userId, presetId));
}
