import { collection, doc } from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import {
  subscriptionCollectionPath,
  subscriptionDocPath,
  labelCollectionPath,
} from "./collections";

export function clientSubscriptionCollection(userId: string) {
  return collection(db, subscriptionCollectionPath(userId));
}

export function clientSubscriptionDoc(userId: string, subscriptionId: string) {
  return doc(db, subscriptionDocPath(userId, subscriptionId));
}

export function clientLabelCollection(userId: string) {
  return collection(db, labelCollectionPath(userId));
}
