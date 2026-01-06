export function userDocPath(userId: string) {
  return `users/${userId}`;
}

export function workflowCollectionPath(userId: string) {
  return `${userDocPath(userId)}/workflows`;
}

export function workflowDocPath(userId: string, workflowId: string) {
  return `${workflowCollectionPath(userId)}/${workflowId}`;
}

export function labelCollectionPath(userId: string) {
  return `${userDocPath(userId)}/workflowLabels`;
}

export function labelDocPath(userId: string, labelId: string) {
  return `${labelCollectionPath(userId)}/${labelId}`;
}

export function preferenceDocPath(userId: string) {
  return `${userDocPath(userId)}/workflowPreferences/default`;
}

// Legacy path for migration
export function legacyWorkflowDocPath(userId: string) {
  return `workflows/${userId}`;
}

// Collection helpers object for convenience
export const WORKFLOW_COLLECTIONS = {
  workflows: (userId: string) => workflowCollectionPath(userId),
  workflow: (userId: string, workflowId: string) => workflowDocPath(userId, workflowId),
  labels: (userId: string) => labelCollectionPath(userId),
  label: (userId: string, labelId: string) => labelDocPath(userId, labelId),
  preferences: (userId: string) => preferenceDocPath(userId),
  legacy: (userId: string) => legacyWorkflowDocPath(userId),
};
