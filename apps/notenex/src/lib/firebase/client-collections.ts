import { collection, doc } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client-app";
import {
  labelCollectionPath,
  noteCollectionPath,
  noteDocPath,
  reminderCollectionPath,
  preferenceDocPath,
  feedbackCollectionPath,
} from "@/lib/firebase/collections";

export function clientNoteCollection(userId: string) {
  return collection(getFirebaseFirestore(), noteCollectionPath(userId));
}

export function clientLabelCollection(userId: string) {
  return collection(getFirebaseFirestore(), labelCollectionPath(userId));
}

export function clientReminderCollection(userId: string) {
  return collection(getFirebaseFirestore(), reminderCollectionPath(userId));
}

export function clientNoteDoc(userId: string, noteId: string) {
  return doc(getFirebaseFirestore(), noteDocPath(userId, noteId));
}

export function clientReminderDoc(userId: string, reminderId: string) {
  return doc(getFirebaseFirestore(), `${reminderCollectionPath(userId)}/${reminderId}`);
}

export function clientPreferenceDoc(userId: string) {
  return doc(getFirebaseFirestore(), preferenceDocPath(userId));
}

export function clientFeedbackCollection() {
  return collection(getFirebaseFirestore(), feedbackCollectionPath());
}
