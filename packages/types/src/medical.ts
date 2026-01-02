/**
 * Symptoms & Medical Tracking Types
 * For Health app medical history management
 */

// ===== SYMPTOM TYPES =====

export type SymptomSeverity = 1 | 2 | 3 | 4 | 5; // 1=mild, 5=severe

export type SymptomCategory =
  | 'pain'
  | 'digestive'
  | 'respiratory'
  | 'neurological'
  | 'skin'
  | 'mental'
  | 'fatigue'
  | 'cardiovascular'
  | 'musculoskeletal'
  | 'other';

export interface SymptomEntry {
  id: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  symptom: string; // e.g., "Headache", "Nausea"
  category: SymptomCategory;
  severity: SymptomSeverity;
  duration?: number; // minutes
  location?: string; // body location if applicable
  triggers?: string[]; // suspected triggers
  notes?: string;

  // Correlations (auto-detected or user-specified)
  relatedMealId?: string;
  relatedMedicationId?: string;

  createdAt: string;
  updatedAt: string;
}

export type CreateSymptomInput = Omit<SymptomEntry, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSymptomInput = Partial<Omit<SymptomEntry, 'id' | 'ownerId' | 'createdAt'>>;

// ===== COMMON SYMPTOM PRESETS =====

export interface SymptomPreset {
  name: string;
  category: SymptomCategory;
  icon: string;
}

export const SYMPTOM_PRESETS: SymptomPreset[] = [
  // Pain
  { name: 'Headache', category: 'pain', icon: 'brain' },
  { name: 'Migraine', category: 'pain', icon: 'brain' },
  { name: 'Back pain', category: 'pain', icon: 'activity' },
  { name: 'Joint pain', category: 'pain', icon: 'bone' },
  { name: 'Muscle pain', category: 'pain', icon: 'dumbbell' },
  { name: 'Chest pain', category: 'pain', icon: 'heart' },

  // Digestive
  { name: 'Nausea', category: 'digestive', icon: 'frown' },
  { name: 'Bloating', category: 'digestive', icon: 'circle' },
  { name: 'Heartburn', category: 'digestive', icon: 'flame' },
  { name: 'Stomach ache', category: 'digestive', icon: 'frown' },
  { name: 'Diarrhea', category: 'digestive', icon: 'droplets' },
  { name: 'Constipation', category: 'digestive', icon: 'minus' },

  // Respiratory
  { name: 'Cough', category: 'respiratory', icon: 'wind' },
  { name: 'Shortness of breath', category: 'respiratory', icon: 'wind' },
  { name: 'Congestion', category: 'respiratory', icon: 'droplet' },
  { name: 'Sore throat', category: 'respiratory', icon: 'mic-off' },

  // Neurological
  { name: 'Dizziness', category: 'neurological', icon: 'loader' },
  { name: 'Numbness', category: 'neurological', icon: 'hand' },
  { name: 'Brain fog', category: 'neurological', icon: 'cloud' },

  // Mental
  { name: 'Anxiety', category: 'mental', icon: 'alert-circle' },
  { name: 'Insomnia', category: 'mental', icon: 'moon' },
  { name: 'Depression', category: 'mental', icon: 'cloud-rain' },
  { name: 'Stress', category: 'mental', icon: 'zap' },

  // Fatigue
  { name: 'Fatigue', category: 'fatigue', icon: 'battery-low' },
  { name: 'Low energy', category: 'fatigue', icon: 'battery' },
  { name: 'Drowsiness', category: 'fatigue', icon: 'moon' },

  // Other
  { name: 'Fever', category: 'other', icon: 'thermometer' },
  { name: 'Chills', category: 'other', icon: 'snowflake' },
  { name: 'Sweating', category: 'other', icon: 'droplets' },
  { name: 'Rash', category: 'skin', icon: 'circle-dot' },
  { name: 'Itching', category: 'skin', icon: 'hand' },
];

// ===== LAB RESULTS =====

export type LabCategory =
  | 'blood'
  | 'urine'
  | 'metabolic'
  | 'lipid'
  | 'thyroid'
  | 'vitamin'
  | 'hormone'
  | 'liver'
  | 'kidney'
  | 'other';

export type LabValueStatus = 'normal' | 'low' | 'high' | 'critical';

export interface LabResultValue {
  name: string; // e.g., "Glucose", "Cholesterol"
  value: number;
  unit: string; // e.g., "mg/dL", "mmol/L"
  referenceRange?: {
    min: number;
    max: number;
  };
  status?: LabValueStatus;
}

export interface LabResult {
  id: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  category: LabCategory;
  testName: string; // e.g., "Complete Blood Count", "Lipid Panel"
  provider?: string; // Lab or doctor name
  values: LabResultValue[];
  notes?: string;
  attachment?: string; // PDF/image URL
  createdAt: string;
  updatedAt: string;
}

export type CreateLabResultInput = Omit<LabResult, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLabResultInput = Partial<Omit<LabResult, 'id' | 'ownerId' | 'createdAt'>>;

// ===== LAB TEST PRESETS =====

export interface LabTestPreset {
  name: string;
  category: LabCategory;
  commonValues: string[];
}

export const LAB_TEST_PRESETS: LabTestPreset[] = [
  {
    name: 'Complete Blood Count (CBC)',
    category: 'blood',
    commonValues: ['WBC', 'RBC', 'Hemoglobin', 'Hematocrit', 'Platelets'],
  },
  {
    name: 'Basic Metabolic Panel',
    category: 'metabolic',
    commonValues: ['Glucose', 'BUN', 'Creatinine', 'Sodium', 'Potassium', 'Chloride', 'CO2'],
  },
  {
    name: 'Lipid Panel',
    category: 'lipid',
    commonValues: ['Total Cholesterol', 'LDL', 'HDL', 'Triglycerides'],
  },
  {
    name: 'Thyroid Panel',
    category: 'thyroid',
    commonValues: ['TSH', 'T3', 'T4', 'Free T4'],
  },
  {
    name: 'Vitamin Panel',
    category: 'vitamin',
    commonValues: ['Vitamin D', 'Vitamin B12', 'Folate', 'Iron', 'Ferritin'],
  },
  {
    name: 'Liver Function',
    category: 'liver',
    commonValues: ['ALT', 'AST', 'Bilirubin', 'Albumin', 'ALP'],
  },
  {
    name: 'A1C',
    category: 'metabolic',
    commonValues: ['HbA1c'],
  },
];

// ===== APPOINTMENTS =====

export type AppointmentType =
  | 'checkup'
  | 'specialist'
  | 'followup'
  | 'lab'
  | 'procedure'
  | 'imaging'
  | 'therapy'
  | 'dental'
  | 'vision'
  | 'other';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed' | 'rescheduled';

export interface Appointment {
  id: string;
  ownerId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: AppointmentType;
  provider: string; // Doctor/facility name
  specialty?: string; // e.g., "Cardiology", "Dermatology"
  location?: string;
  address?: string;
  phone?: string;
  reason: string;
  status: AppointmentStatus;

  // Post-appointment notes
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  notes?: string;

  // Reminders
  reminderEnabled: boolean;
  reminderMinutesBefore?: number;

  createdAt: string;
  updatedAt: string;
}

export type CreateAppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAppointmentInput = Partial<Omit<Appointment, 'id' | 'ownerId' | 'createdAt'>>;

// ===== SYMPTOM PATTERNS/INSIGHTS =====

export interface SymptomPattern {
  symptom: string;
  category: SymptomCategory;
  occurrences: number;
  averageSeverity: number;
  commonTriggers: string[];
  commonTimes: string[]; // time ranges when symptom commonly occurs
  correlatedMedications: string[];
  correlatedFoods: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface MedicalSummary {
  recentSymptoms: SymptomEntry[];
  symptomPatterns: SymptomPattern[];
  upcomingAppointments: Appointment[];
  recentLabResults: LabResult[];
  activeSymptomCount: number; // symptoms in last 7 days
  nextAppointment?: Appointment;
  lastLabDate?: string;
}

// ===== MEDICAL TIMELINE =====

export type MedicalTimelineEventType = 'symptom' | 'lab' | 'appointment' | 'medication';

export interface MedicalTimelineEvent {
  id: string;
  type: MedicalTimelineEventType;
  date: string;
  time?: string;
  title: string;
  description?: string;
  data: SymptomEntry | LabResult | Appointment;
}
