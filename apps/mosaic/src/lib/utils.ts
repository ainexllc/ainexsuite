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

export function calculateBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'health-warning' };
  if (bmi < 25) return { label: 'Normal', color: 'health-good' };
  if (bmi < 30) return { label: 'Overweight', color: 'health-warning' };
  return { label: 'Obese', color: 'health-danger' };
}

export function getBloodPressureCategory(
  systolic: number,
  diastolic: number
): { label: string; color: string } {
  if (systolic >= 180 || diastolic >= 120)
    return { label: 'Hypertensive Crisis', color: 'health-danger' };
  if (systolic >= 140 || diastolic >= 90)
    return { label: 'High', color: 'health-danger' };
  if (systolic >= 130 || diastolic >= 80)
    return { label: 'Elevated', color: 'health-warning' };
  return { label: 'Normal', color: 'health-good' };
}
