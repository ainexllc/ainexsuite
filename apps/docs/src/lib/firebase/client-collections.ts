import { collection, doc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client-app";
import {
  labelCollectionPath,
  docCollectionPath,
  docDocPath,
  reminderCollectionPath,
  preferenceDocPath,
  filterPresetsCollectionPath,
  filterPresetDocPath,
} from "@/lib/firebase/collections";

export function clientDocCollection(userId: string) {
  return collection(getFirebaseFirestore(), docCollectionPath(userId));
}

export function clientLabelCollection(userId: string) {
  return collection(getFirebaseFirestore(), labelCollectionPath(userId));
}

export function clientReminderCollection(userId: string) {
  return collection(getFirebaseFirestore(), reminderCollectionPath(userId));
}

export function clientDocDoc(userId: string, docId: string) {
  return doc(getFirebaseFirestore(), docDocPath(userId, docId));
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
