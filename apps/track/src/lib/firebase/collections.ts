export function userDocPath(userId: string) {
  return `users/${userId}`;
}

export function subscriptionCollectionPath(userId: string) {
  return `${userDocPath(userId)}/subscriptions`;
}

export function subscriptionDocPath(userId: string, subscriptionId: string) {
  return `${subscriptionCollectionPath(userId)}/${subscriptionId}`;
}

export function labelCollectionPath(userId: string) {
  return `${userDocPath(userId)}/labels`;
}
