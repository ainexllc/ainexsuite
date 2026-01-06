import { collection, doc } from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import {
  workflowCollectionPath,
  workflowDocPath,
  labelCollectionPath,
  labelDocPath,
  preferenceDocPath,
  legacyWorkflowDocPath,
} from "@/lib/firebase/collections";

export function clientWorkflowCollection(userId: string) {
  return collection(db, workflowCollectionPath(userId));
}

export function clientWorkflowDoc(userId: string, workflowId: string) {
  return doc(db, workflowDocPath(userId, workflowId));
}

export function clientLabelCollection(userId: string) {
  return collection(db, labelCollectionPath(userId));
}

export function clientLabelDoc(userId: string, labelId: string) {
  return doc(db, labelDocPath(userId, labelId));
}

export function clientPreferenceDoc(userId: string) {
  return doc(db, preferenceDocPath(userId));
}

export function clientLegacyWorkflowDoc(userId: string) {
  return doc(db, legacyWorkflowDocPath(userId));
}
