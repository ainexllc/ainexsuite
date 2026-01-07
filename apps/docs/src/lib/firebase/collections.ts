export function userDocPath(userId: string) {
  return `users/${userId}`;
}

export function docCollectionPath(userId: string) {
  return `${userDocPath(userId)}/docs`;
}

export function labelCollectionPath(userId: string) {
  return `${userDocPath(userId)}/labels`;
}

export function reminderCollectionPath(userId: string) {
  return `${userDocPath(userId)}/reminders`;
}

export function docDocPath(userId: string, docId: string) {
  return `${docCollectionPath(userId)}/${docId}`;
}

export function preferenceDocPath(userId: string) {
  return `${userDocPath(userId)}/preferences/default`;
}

export function filterPresetsCollectionPath(userId: string) {
  return `${userDocPath(userId)}/filterPresets`;
}

export function filterPresetDocPath(userId: string, presetId: string) {
  return `${filterPresetsCollectionPath(userId)}/${presetId}`;
}
