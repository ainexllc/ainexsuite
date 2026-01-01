/**
 * Medication Service
 * CRUD operations for medications and logs with Habits app integration
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
  writeBatch,
} from 'firebase/firestore';
import type {
  Medication,
  MedicationLog,
  TodayMedicationSchedule,
  TodayMedicationDose,
  RefillAlert,
  MedicationSummary,
  DoseTime,
} from '@ainexsuite/types';

const MEDICATIONS_COLLECTION = 'medications';
const MEDICATION_LOGS_COLLECTION = 'medication_logs';
const HABITS_COLLECTION = 'habits';
const COMPLETIONS_COLLECTION = 'completions';

// ===== HELPERS =====

function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Convert dose time to display string
function getDoseTimeDisplay(time: DoseTime | string): string {
  const timeLabels: Record<DoseTime, string> = {
    morning: '8:00 AM',
    afternoon: '12:00 PM',
    evening: '6:00 PM',
    night: '9:00 PM',
    with_food: 'With meals',
    before_bed: '10:00 PM',
  };

  if (time in timeLabels) {
    return timeLabels[time as DoseTime];
  }

  // Custom time format (HH:mm)
  if (typeof time === 'string' && time.includes(':')) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  return time;
}

// Get dose time sort order
function getDoseTimeOrder(time: DoseTime | string): number {
  const order: Record<DoseTime, number> = {
    morning: 1,
    with_food: 2,
    afternoon: 3,
    evening: 4,
    night: 5,
    before_bed: 6,
  };

  if (time in order) {
    return order[time as DoseTime];
  }

  // Custom time - parse and convert to minutes for sorting
  if (typeof time === 'string' && time.includes(':')) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  return 999;
}

// Calculate days remaining for refill
function calculateDaysRemaining(medication: Medication): number {
  if (!medication.refill?.currentSupply) return Infinity;

  const dosesPerDay = medication.schedule.times.length;
  if (dosesPerDay === 0) return Infinity;

  return Math.floor(medication.refill.currentSupply / dosesPerDay);
}

// ===== MEDICATION CRUD =====

export async function getMedications(): Promise<Medication[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const medsRef = collection(db, MEDICATIONS_COLLECTION);
    const q = query(
      medsRef,
      where('ownerId', '==', userId),
      orderBy('name', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Medication[];
  } catch (error) {
    console.error('Failed to fetch medications:', error);
    return [];
  }
}

export async function getActiveMedications(): Promise<Medication[]> {
  const medications = await getMedications();
  return medications.filter((med) => med.isActive);
}

export async function getMedicationById(id: string): Promise<Medication | null> {
  try {
    const docRef = doc(db, MEDICATIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;

    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as Medication;
  } catch (error) {
    console.error('Failed to fetch medication:', error);
    return null;
  }
}

export async function createMedication(
  data: Omit<Medication, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>
): Promise<Medication | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    const now = new Date().toISOString();
    const medicationData = {
      ...data,
      ownerId: userId,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, MEDICATIONS_COLLECTION), medicationData);
    const medication = { id: docRef.id, ...medicationData } as Medication;

    // Create linked habit if requested
    if (data.createLinkedHabit) {
      const habitId = await createLinkedHabit(medication);
      if (habitId) {
        await updateDoc(docRef, { linkedHabitId: habitId });
        medication.linkedHabitId = habitId;
      }
    }

    return medication;
  } catch (error) {
    console.error('Failed to create medication:', error);
    return null;
  }
}

export async function updateMedication(
  id: string,
  data: Partial<Medication>
): Promise<boolean> {
  try {
    const docRef = doc(db, MEDICATIONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to update medication:', error);
    return false;
  }
}

export async function deleteMedication(id: string): Promise<boolean> {
  try {
    const medication = await getMedicationById(id);
    if (!medication) return false;

    const batch = writeBatch(db);

    // Delete the medication
    batch.delete(doc(db, MEDICATIONS_COLLECTION, id));

    // Delete all associated logs
    const logsRef = collection(db, MEDICATION_LOGS_COLLECTION);
    const logsQuery = query(logsRef, where('medicationId', '==', id));
    const logsSnapshot = await getDocs(logsQuery);
    logsSnapshot.docs.forEach((logDoc) => {
      batch.delete(logDoc.ref);
    });

    // Optionally delete linked habit (commented out - user may want to keep it)
    // if (medication.linkedHabitId) {
    //   batch.delete(doc(db, HABITS_COLLECTION, medication.linkedHabitId));
    // }

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Failed to delete medication:', error);
    return false;
  }
}

// ===== MEDICATION LOGS =====

export async function getTodayLogs(medicationId?: string): Promise<MedicationLog[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const today = getTodayDateString();

  try {
    const logsRef = collection(db, MEDICATION_LOGS_COLLECTION);
    let q;

    if (medicationId) {
      q = query(
        logsRef,
        where('ownerId', '==', userId),
        where('medicationId', '==', medicationId),
        where('date', '==', today)
      );
    } else {
      q = query(
        logsRef,
        where('ownerId', '==', userId),
        where('date', '==', today)
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MedicationLog[];
  } catch (error) {
    console.error('Failed to fetch today logs:', error);
    return [];
  }
}

export async function getLogsForDateRange(
  startDate: string,
  endDate: string
): Promise<MedicationLog[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const logsRef = collection(db, MEDICATION_LOGS_COLLECTION);
    const q = query(
      logsRef,
      where('ownerId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MedicationLog[];
  } catch (error) {
    console.error('Failed to fetch logs for date range:', error);
    return [];
  }
}

export async function logMedicationDose(
  medicationId: string,
  scheduledTime: DoseTime | string,
  taken: boolean,
  options?: {
    notes?: string;
    sideEffects?: string;
    skippedReason?: string;
  }
): Promise<MedicationLog | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  const today = getTodayDateString();
  const now = new Date().toISOString();

  try {
    // Check if log already exists for this dose
    const existingLogs = await getTodayLogs(medicationId);
    const existingLog = existingLogs.find(
      (log) => log.scheduledTime === scheduledTime
    );

    if (existingLog) {
      // Update existing log
      await updateDoc(doc(db, MEDICATION_LOGS_COLLECTION, existingLog.id), {
        taken,
        skipped: !taken,
        takenAt: taken ? now : null,
        skippedReason: options?.skippedReason,
        notes: options?.notes,
        sideEffects: options?.sideEffects,
        updatedAt: now,
      });

      return { ...existingLog, taken, takenAt: taken ? now : undefined };
    }

    // Create new log
    const logData: Omit<MedicationLog, 'id'> = {
      medicationId,
      ownerId: userId,
      date: today,
      scheduledTime,
      taken,
      skipped: !taken,
      takenAt: taken ? now : undefined,
      skippedReason: options?.skippedReason,
      notes: options?.notes,
      sideEffects: options?.sideEffects,
      source: 'health',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, MEDICATION_LOGS_COLLECTION), logData);
    const log = { id: docRef.id, ...logData } as MedicationLog;

    // Decrement supply if taken
    if (taken) {
      const medication = await getMedicationById(medicationId);
      if (medication?.refill?.currentSupply) {
        await updateMedication(medicationId, {
          refill: {
            ...medication.refill,
            currentSupply: medication.refill.currentSupply - 1,
          },
        });
      }

      // Sync to habits if linked
      if (medication?.linkedHabitId) {
        await syncToHabit(medication.linkedHabitId, log);
      }
    }

    return log;
  } catch (error) {
    console.error('Failed to log medication dose:', error);
    return null;
  }
}

// ===== TODAY'S SCHEDULE =====

export async function getTodaySchedule(): Promise<TodayMedicationSchedule> {
  const today = getTodayDateString();
  const medications = await getActiveMedications();
  const todayLogs = await getTodayLogs();

  const doses: TodayMedicationDose[] = [];

  for (const medication of medications) {
    for (const time of medication.schedule.times) {
      const log = todayLogs.find(
        (l) => l.medicationId === medication.id && l.scheduledTime === time
      );

      let status: TodayMedicationDose['status'] = 'pending';
      if (log?.taken) {
        status = 'taken';
      } else if (log?.skipped) {
        status = 'skipped';
      } else {
        // Check if overdue (past scheduled time)
        const now = new Date();
        const timeOrder = getDoseTimeOrder(time);
        const currentTimeOrder = now.getHours() * 60 + now.getMinutes();

        if (timeOrder < currentTimeOrder - 60) {
          // More than 1 hour past
          status = 'overdue';
        }
      }

      doses.push({
        medication,
        scheduledTime: time,
        displayTime: getDoseTimeDisplay(time),
        log,
        status,
      });
    }
  }

  // Sort by time
  doses.sort((a, b) => {
    return getDoseTimeOrder(a.scheduledTime) - getDoseTimeOrder(b.scheduledTime);
  });

  const completedCount = doses.filter((d) => d.status === 'taken').length;

  return {
    date: today,
    doses,
    completedCount,
    totalCount: doses.length,
    completionRate: doses.length > 0 ? completedCount / doses.length : 0,
  };
}

// ===== REFILL ALERTS =====

export async function getRefillAlerts(): Promise<RefillAlert[]> {
  const medications = await getActiveMedications();
  const alerts: RefillAlert[] = [];

  for (const medication of medications) {
    if (!medication.refill?.currentSupply) continue;

    const daysRemaining = calculateDaysRemaining(medication);
    const refillThreshold = medication.refill.refillAt || 7;

    if (daysRemaining <= refillThreshold) {
      let urgency: RefillAlert['urgency'] = 'low';
      if (daysRemaining <= 1) urgency = 'critical';
      else if (daysRemaining <= 3) urgency = 'high';
      else if (daysRemaining <= 5) urgency = 'medium';

      alerts.push({
        medication,
        currentSupply: medication.refill.currentSupply,
        daysRemaining,
        urgency,
      });
    }
  }

  // Sort by urgency (critical first)
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  alerts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return alerts;
}

// ===== SUMMARY =====

export async function getMedicationSummary(): Promise<MedicationSummary> {
  const medications = await getMedications();
  const activeMedications = medications.filter((m) => m.isActive);
  const schedule = await getTodaySchedule();
  const refillAlerts = await getRefillAlerts();

  // Calculate adherence rates
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const logs7Day = await getLogsForDateRange(
    sevenDaysAgo.toISOString().split('T')[0],
    getTodayDateString()
  );
  const logs30Day = await getLogsForDateRange(
    thirtyDaysAgo.toISOString().split('T')[0],
    getTodayDateString()
  );

  const takenCount7Day = logs7Day.filter((l) => l.taken).length;
  const takenCount30Day = logs30Day.filter((l) => l.taken).length;

  // Expected doses per day * days
  const dosesPerDay = activeMedications.reduce(
    (sum, m) => sum + m.schedule.times.length,
    0
  );
  const expected7Day = dosesPerDay * 7;
  const expected30Day = dosesPerDay * 30;

  return {
    totalMedications: medications.length,
    activeCount: activeMedications.length,
    todayDoses: schedule.totalCount,
    completedToday: schedule.completedCount,
    refillAlerts,
    adherenceRate7Day: expected7Day > 0 ? takenCount7Day / expected7Day : 1,
    adherenceRate30Day: expected30Day > 0 ? takenCount30Day / expected30Day : 1,
  };
}

// ===== HABITS INTEGRATION =====

async function createLinkedHabit(medication: Medication): Promise<string | null> {
  const userId = getCurrentUserId();
  if (!userId) return null;

  try {
    // Get user's personal space
    const spacesRef = collection(db, 'spaces');
    const spacesQuery = query(
      spacesRef,
      where('memberUids', 'array-contains', userId),
      where('type', '==', 'personal'),
      limit(1)
    );

    const spacesSnapshot = await getDocs(spacesQuery);
    if (spacesSnapshot.empty) {
      console.error('No personal space found for user');
      return null;
    }

    const spaceId = spacesSnapshot.docs[0].id;
    const now = new Date().toISOString();

    // Create the habit
    const habitData = {
      spaceId,
      title: `Take ${medication.name}`,
      description: `${medication.dosage} - ${medication.schedule.instructions || ''}`.trim(),
      schedule: {
        type: 'daily',
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      },
      assigneeIds: [userId],
      currentStreak: 0,
      bestStreak: 0,
      isFrozen: false,
      category: 'medicine',
      createdAt: now,
      createdBy: userId,
    };

    const habitRef = await addDoc(collection(db, HABITS_COLLECTION), habitData);
    return habitRef.id;
  } catch (error) {
    console.error('Failed to create linked habit:', error);
    return null;
  }
}

async function syncToHabit(
  habitId: string,
  medicationLog: MedicationLog
): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    // Check if completion already exists for today
    const completionsRef = collection(db, COMPLETIONS_COLLECTION);
    const existingQuery = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('userId', '==', userId),
      where('date', '==', medicationLog.date)
    );

    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      // Already completed today
      return;
    }

    // Get habit's space
    const habitDoc = await getDoc(doc(db, HABITS_COLLECTION, habitId));
    if (!habitDoc.exists()) return;

    const habitData = habitDoc.data();

    // Create completion
    const completionData = {
      habitId,
      spaceId: habitData.spaceId,
      userId,
      date: medicationLog.date,
      completedAt: medicationLog.takenAt || new Date().toISOString(),
      source: 'medication_auto',
      sourceMedicationId: medicationLog.medicationId,
    };

    await addDoc(collection(db, COMPLETIONS_COLLECTION), completionData);
  } catch (error) {
    console.error('Failed to sync to habit:', error);
  }
}

// Export utility functions
export { getDoseTimeDisplay, calculateDaysRemaining };
