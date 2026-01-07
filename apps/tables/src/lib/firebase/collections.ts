export function userDocPath(userId: string) {
  return `users/${userId}`;
}

export function tableCollectionPath(userId: string) {
  return `${userDocPath(userId)}/tables`;
}

export function labelCollectionPath(userId: string) {
  return `${userDocPath(userId)}/labels`;
}

export function reminderCollectionPath(userId: string) {
  return `${userDocPath(userId)}/reminders`;
}

export function tableDocPath(userId: string, tableId: string) {
  return `${tableCollectionPath(userId)}/${tableId}`;
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
