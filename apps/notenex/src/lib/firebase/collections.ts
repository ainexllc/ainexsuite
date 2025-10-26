export function userDocPath(userId: string) {
  return `users/${userId}`;
}

export function noteCollectionPath(userId: string) {
  return `${userDocPath(userId)}/notes`;
}

export function labelCollectionPath(userId: string) {
  return `${userDocPath(userId)}/labels`;
}

export function reminderCollectionPath(userId: string) {
  return `${userDocPath(userId)}/reminders`;
}

export function noteDocPath(userId: string, noteId: string) {
  return `${noteCollectionPath(userId)}/${noteId}`;
}

export function preferenceDocPath(userId: string) {
  return `${userDocPath(userId)}/preferences/default`;
}

export function feedbackCollectionPath() {
  return "feedback";
}
