/**
 * Medical Service
 * CRUD operations for symptoms, lab results, and appointments
 */

import { db, auth } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import type {
  SymptomEntry,
  CreateSymptomInput,
  UpdateSymptomInput,
  LabResult,
  CreateLabResultInput,
  UpdateLabResultInput,
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  SymptomPattern,
  MedicalSummary,
  MedicalTimelineEvent,
} from '@ainexsuite/types';

// Collections
const SYMPTOMS_COLLECTION = 'symptoms';
const LAB_RESULTS_COLLECTION = 'lab_results';
const APPOINTMENTS_COLLECTION = 'appointments';

// ===== HELPERS =====

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getNowISOString(): string {
  return new Date().toISOString();
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// ===== SYMPTOM CRUD =====

/**
 * Get symptoms for a date range
 */
export async function getSymptomsByDateRange(
  startDate: string,
  endDate: string
): Promise<SymptomEntry[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const symptomsRef = collection(db, SYMPTOMS_COLLECTION);
    const q = query(
      symptomsRef,
      where('ownerId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SymptomEntry[];
  } catch (error) {
    console.error('Failed to fetch symptoms:', error);
    return [];
  }
}

/**
 * Get today's symptoms
 */
export async function getTodaySymptoms(): Promise<SymptomEntry[]> {
  const today = getTodayDateString();
  return getSymptomsByDateRange(today, today);
}

/**
 * Get recent symptoms (last 7 days)
 */
export async function getRecentSymptoms(): Promise<SymptomEntry[]> {
  const today = getTodayDateString();
  const weekAgo = getDateDaysAgo(7);
  return getSymptomsByDateRange(weekAgo, today);
}

/**
 * Get a single symptom by ID
 */
export async function getSymptomById(id: string): Promise<SymptomEntry | null> {
  try {
    const docRef = doc(db, SYMPTOMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as SymptomEntry;
  } catch (error) {
    console.error('Failed to fetch symptom:', error);
    return null;
  }
}

/**
 * Create a new symptom entry
 */
export async function createSymptom(
  data: Omit<CreateSymptomInput, 'ownerId'>
): Promise<SymptomEntry | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();
    const symptomData = {
      ...data,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, SYMPTOMS_COLLECTION), symptomData);
    return { id: docRef.id, ...symptomData } as SymptomEntry;
  } catch (error) {
    console.error('Failed to create symptom:', error);
    return null;
  }
}

/**
 * Update a symptom entry
 */
export async function updateSymptom(
  id: string,
  data: UpdateSymptomInput
): Promise<boolean> {
  try {
    const docRef = doc(db, SYMPTOMS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: getNowISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update symptom:', error);
    return false;
  }
}

/**
 * Delete a symptom entry
 */
export async function deleteSymptom(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, SYMPTOMS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Failed to delete symptom:', error);
    return false;
  }
}

// ===== SYMPTOM PATTERNS =====

/**
 * Analyze symptom patterns over time
 */
export async function getSymptomPatterns(days: number = 30): Promise<SymptomPattern[]> {
  const today = getTodayDateString();
  const startDate = getDateDaysAgo(days);
  const symptoms = await getSymptomsByDateRange(startDate, today);

  // Group by symptom name
  const groupedByName: Record<string, SymptomEntry[]> = {};
  for (const s of symptoms) {
    if (!groupedByName[s.symptom]) {
      groupedByName[s.symptom] = [];
    }
    groupedByName[s.symptom].push(s);
  }

  const patterns: SymptomPattern[] = [];

  for (const [symptomName, entries] of Object.entries(groupedByName)) {
    // Calculate average severity
    const avgSeverity =
      entries.reduce((sum, e) => sum + e.severity, 0) / entries.length;

    // Find common triggers
    const triggerCounts: Record<string, number> = {};
    for (const e of entries) {
      for (const trigger of e.triggers || []) {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      }
    }
    const commonTriggers = Object.entries(triggerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([trigger]) => trigger);

    // Find common times
    const timeCounts: Record<string, number> = {};
    for (const e of entries) {
      const hour = parseInt(e.time.split(':')[0]);
      let period = 'morning';
      if (hour >= 12 && hour < 17) period = 'afternoon';
      else if (hour >= 17 && hour < 21) period = 'evening';
      else if (hour >= 21 || hour < 6) period = 'night';
      timeCounts[period] = (timeCounts[period] || 0) + 1;
    }
    const commonTimes = Object.entries(timeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([time]) => time);

    // Determine trend (compare recent vs older occurrences)
    const midpoint = Math.floor(entries.length / 2);
    const recentCount = entries.slice(0, midpoint).length;
    const olderCount = entries.slice(midpoint).length;
    let trend: SymptomPattern['trend'] = 'stable';
    if (recentCount > olderCount * 1.2) trend = 'increasing';
    else if (recentCount < olderCount * 0.8) trend = 'decreasing';

    patterns.push({
      symptom: symptomName,
      category: entries[0].category,
      occurrences: entries.length,
      averageSeverity: Math.round(avgSeverity * 10) / 10,
      commonTriggers,
      commonTimes,
      correlatedMedications: [], // TODO: Cross-reference with medications
      correlatedFoods: [], // TODO: Cross-reference with meals
      trend,
    });
  }

  // Sort by occurrences
  patterns.sort((a, b) => b.occurrences - a.occurrences);

  return patterns;
}

// ===== LAB RESULTS CRUD =====

/**
 * Get all lab results
 */
export async function getLabResults(limitCount: number = 50): Promise<LabResult[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const labsRef = collection(db, LAB_RESULTS_COLLECTION);
    const q = query(
      labsRef,
      where('ownerId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LabResult[];
  } catch (error) {
    console.error('Failed to fetch lab results:', error);
    return [];
  }
}

/**
 * Get a single lab result by ID
 */
export async function getLabResultById(id: string): Promise<LabResult | null> {
  try {
    const docRef = doc(db, LAB_RESULTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as LabResult;
  } catch (error) {
    console.error('Failed to fetch lab result:', error);
    return null;
  }
}

/**
 * Create a new lab result
 */
export async function createLabResult(
  data: Omit<CreateLabResultInput, 'ownerId'>
): Promise<LabResult | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();
    const labData = {
      ...data,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, LAB_RESULTS_COLLECTION), labData);
    return { id: docRef.id, ...labData } as LabResult;
  } catch (error) {
    console.error('Failed to create lab result:', error);
    return null;
  }
}

/**
 * Update a lab result
 */
export async function updateLabResult(
  id: string,
  data: UpdateLabResultInput
): Promise<boolean> {
  try {
    const docRef = doc(db, LAB_RESULTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: getNowISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update lab result:', error);
    return false;
  }
}

/**
 * Delete a lab result
 */
export async function deleteLabResult(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, LAB_RESULTS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Failed to delete lab result:', error);
    return false;
  }
}

// ===== APPOINTMENTS CRUD =====

/**
 * Get all appointments
 */
export async function getAppointments(limitCount: number = 50): Promise<Appointment[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const apptRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(
      apptRef,
      where('ownerId', '==', userId),
      orderBy('date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
}

/**
 * Get upcoming appointments
 */
export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const today = getTodayDateString();

  try {
    const apptRef = collection(db, APPOINTMENTS_COLLECTION);
    const q = query(
      apptRef,
      where('ownerId', '==', userId),
      where('date', '>=', today),
      where('status', '==', 'scheduled'),
      orderBy('date', 'asc'),
      limit(10)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Appointment[];
  } catch (error) {
    console.error('Failed to fetch upcoming appointments:', error);
    return [];
  }
}

/**
 * Get a single appointment by ID
 */
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Appointment;
  } catch (error) {
    console.error('Failed to fetch appointment:', error);
    return null;
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  data: Omit<CreateAppointmentInput, 'ownerId'>
): Promise<Appointment | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = getNowISOString();
    const apptData = {
      ...data,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, APPOINTMENTS_COLLECTION), apptData);
    return { id: docRef.id, ...apptData } as Appointment;
  } catch (error) {
    console.error('Failed to create appointment:', error);
    return null;
  }
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  id: string,
  data: UpdateAppointmentInput
): Promise<boolean> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: getNowISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update appointment:', error);
    return false;
  }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, APPOINTMENTS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Failed to delete appointment:', error);
    return false;
  }
}

// ===== MEDICAL SUMMARY =====

/**
 * Get overall medical summary
 */
export async function getMedicalSummary(): Promise<MedicalSummary> {
  const [recentSymptoms, symptomPatterns, upcomingAppointments, recentLabResults] =
    await Promise.all([
      getRecentSymptoms(),
      getSymptomPatterns(30),
      getUpcomingAppointments(),
      getLabResults(5),
    ]);

  const nextAppointment = upcomingAppointments[0] ?? undefined;
  const lastLabDate = recentLabResults[0]?.date ?? undefined;

  return {
    recentSymptoms,
    symptomPatterns,
    upcomingAppointments,
    recentLabResults,
    activeSymptomCount: recentSymptoms.length,
    nextAppointment,
    lastLabDate,
  };
}

// ===== MEDICAL TIMELINE =====

/**
 * Get medical timeline events
 */
export async function getMedicalTimeline(
  days: number = 90
): Promise<MedicalTimelineEvent[]> {
  const today = getTodayDateString();
  const startDate = getDateDaysAgo(days);

  const [symptoms, labs, appointments] = await Promise.all([
    getSymptomsByDateRange(startDate, today),
    getLabResults(50),
    getAppointments(50),
  ]);

  const events: MedicalTimelineEvent[] = [];

  // Add symptoms
  for (const s of symptoms) {
    events.push({
      id: s.id,
      type: 'symptom',
      date: s.date,
      time: s.time,
      title: s.symptom,
      description: `Severity: ${s.severity}/5`,
      data: s,
    });
  }

  // Add labs
  for (const l of labs) {
    if (l.date >= startDate) {
      events.push({
        id: l.id,
        type: 'lab',
        date: l.date,
        title: l.testName,
        description: `${l.values.length} values recorded`,
        data: l,
      });
    }
  }

  // Add appointments
  for (const a of appointments) {
    if (a.date >= startDate) {
      events.push({
        id: a.id,
        type: 'appointment',
        date: a.date,
        time: a.time,
        title: `${a.type}: ${a.provider}`,
        description: a.reason,
        data: a,
      });
    }
  }

  // Sort by date (most recent first)
  events.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return (b.time || '').localeCompare(a.time || '');
  });

  return events;
}
