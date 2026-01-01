/**
 * Medication & Supplement Tracking Types
 * For Health app medicine management with Habits app integration
 */

// ===== MEDICATION TYPES =====

export type MedicationType = 'prescription' | 'otc' | 'supplement' | 'vitamin';

export type DoseFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'four_times_daily'
  | 'every_other_day'
  | 'weekly'
  | 'as_needed'
  | 'custom';

export type DoseTime = 'morning' | 'afternoon' | 'evening' | 'night' | 'with_food' | 'before_bed';

export interface MedicationSchedule {
  frequency: DoseFrequency;
  times: DoseTime[];
  customTimes?: string[]; // For custom schedules, e.g., ["08:00", "14:00", "20:00"]
  daysOfWeek?: number[]; // 0-6 for weekly/custom, Sunday = 0
  instructions?: string; // e.g., "Take with food", "Avoid grapefruit"
}

export interface RefillInfo {
  currentSupply: number; // Pills/doses remaining
  refillAt: number; // Remind when supply drops to this number
  lastRefillDate?: string;
  pharmacy?: string;
  prescriptionNumber?: string;
}

export interface Medication {
  id: string;
  ownerId: string;
  name: string;
  type: MedicationType;
  dosage: string; // e.g., "500mg", "2 tablets", "1 capsule"
  schedule: MedicationSchedule;
  refill?: RefillInfo;

  // Habits integration
  linkedHabitId?: string; // Auto-created habit for quick check-off
  createLinkedHabit: boolean; // Whether to create/sync with habits app

  // Display
  color?: string;
  icon?: string;
  notes?: string;

  // Status
  isActive: boolean;
  reminderEnabled: boolean;

  // Metadata
  createdAt: string;
  updatedAt: string;
  startDate?: string; // When started taking
  endDate?: string; // Prescription end date (if applicable)
}

// ===== MEDICATION LOG =====

export interface MedicationLog {
  id: string;
  medicationId: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: DoseTime | string; // Which dose this is for

  // Status
  taken: boolean;
  skipped: boolean;
  takenAt?: string; // ISO timestamp when actually taken
  skippedReason?: string;

  // Habits sync
  habitCompletionId?: string; // Link to habits completion for bi-directional sync
  source: 'health' | 'habits'; // Where the log originated

  // Notes
  notes?: string;
  sideEffects?: string;

  createdAt: string;
  updatedAt: string;
}

// ===== TODAY'S MEDICATION SCHEDULE =====

export interface TodayMedicationDose {
  medication: Medication;
  scheduledTime: DoseTime | string;
  displayTime: string; // Formatted time for display
  log?: MedicationLog;
  status: 'pending' | 'taken' | 'skipped' | 'overdue';
}

export interface TodayMedicationSchedule {
  date: string;
  doses: TodayMedicationDose[];
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

// ===== REFILL ALERTS =====

export interface RefillAlert {
  medication: Medication;
  currentSupply: number;
  daysRemaining: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

// ===== MEDICATION SUMMARY =====

export interface MedicationSummary {
  totalMedications: number;
  activeCount: number;
  todayDoses: number;
  completedToday: number;
  refillAlerts: RefillAlert[];
  adherenceRate7Day: number; // Last 7 days
  adherenceRate30Day: number; // Last 30 days
}

// ===== HABIT LINK CONFIG =====

export interface MedicationHabitLink {
  medicationId: string;
  habitId: string;
  syncEnabled: boolean;
  lastSyncAt?: string;
}
