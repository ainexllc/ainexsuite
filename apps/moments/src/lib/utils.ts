import { auth } from '@ainexsuite/firebase';

export function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }
  return user.uid;
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
