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

export function getSkillLevelLabel(level: number): {
  label: string;
  color: string;
} {
  if (level >= 80) return { label: 'Master', color: 'master' };
  if (level >= 60) return { label: 'Expert', color: 'expert' };
  if (level >= 40) return { label: 'Advanced', color: 'advanced' };
  if (level >= 20) return { label: 'Intermediate', color: 'intermediate' };
  return { label: 'Beginner', color: 'beginner' };
}
