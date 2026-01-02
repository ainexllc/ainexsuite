/**
 * CSV Generator
 * Export health data to CSV format
 */

import type { HealthMetric, Meal, SymptomEntry, LabResult, Appointment } from '@ainexsuite/types';

// ===== TYPES =====

export interface CSVExportOptions {
  filename?: string;
  includeHeaders?: boolean;
}

// ===== HELPERS =====

/**
 * Escape CSV cell value
 */
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers: (keyof T)[],
  headerLabels?: string[]
): string {
  const rows: string[] = [];

  // Add header row
  if (headerLabels) {
    rows.push(headerLabels.map(escapeCSV).join(','));
  } else {
    rows.push(headers.map((h) => escapeCSV(String(h))).join(','));
  }

  // Add data rows
  for (const item of data) {
    const row = headers.map((h) => escapeCSV(item[h] as string | number | null));
    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * Trigger CSV download in browser
 */
function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ===== EXPORT FUNCTIONS =====

/**
 * Export health metrics to CSV
 */
export function exportHealthMetricsToCSV(
  metrics: HealthMetric[],
  options: CSVExportOptions = {}
): void {
  const filename = options.filename || `health-metrics-${new Date().toISOString().split('T')[0]}.csv`;

  // Flatten blood pressure
  const data = metrics.map((m) => ({
    date: m.date,
    weight: m.weight,
    sleep: m.sleep,
    water: m.water,
    exercise: m.exercise,
    mood: m.mood,
    energy: m.energy,
    heartRate: m.heartRate,
    bloodPressureSystolic: m.bloodPressure?.systolic ?? null,
    bloodPressureDiastolic: m.bloodPressure?.diastolic ?? null,
    notes: m.notes,
  }));

  const headers: (keyof (typeof data)[0])[] = [
    'date',
    'weight',
    'sleep',
    'water',
    'exercise',
    'mood',
    'energy',
    'heartRate',
    'bloodPressureSystolic',
    'bloodPressureDiastolic',
    'notes',
  ];

  const headerLabels = [
    'Date',
    'Weight',
    'Sleep (hours)',
    'Water (glasses)',
    'Exercise (min)',
    'Mood',
    'Energy (1-10)',
    'Heart Rate (bpm)',
    'Blood Pressure Systolic',
    'Blood Pressure Diastolic',
    'Notes',
  ];

  const csv = arrayToCSV(data, headers, headerLabels);
  downloadCSV(csv, filename);
}

/**
 * Export meals to CSV
 */
export function exportMealsToCSV(
  meals: Meal[],
  options: CSVExportOptions = {}
): void {
  const filename = options.filename || `meals-${new Date().toISOString().split('T')[0]}.csv`;

  const data = meals.map((m) => ({
    date: m.date,
    time: m.time,
    type: m.type,
    foodCount: m.foods.length,
    calories: m.totalNutrition.calories,
    protein: m.totalNutrition.protein,
    carbs: m.totalNutrition.carbs,
    fat: m.totalNutrition.fat,
    fiber: m.totalNutrition.fiber ?? '',
    notes: m.notes ?? '',
  }));

  const headers: (keyof (typeof data)[0])[] = [
    'date',
    'time',
    'type',
    'foodCount',
    'calories',
    'protein',
    'carbs',
    'fat',
    'fiber',
    'notes',
  ];

  const headerLabels = [
    'Date',
    'Time',
    'Meal Type',
    'Food Count',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Fiber (g)',
    'Notes',
  ];

  const csv = arrayToCSV(data, headers, headerLabels);
  downloadCSV(csv, filename);
}

/**
 * Export symptoms to CSV
 */
export function exportSymptomsToCSV(
  symptoms: SymptomEntry[],
  options: CSVExportOptions = {}
): void {
  const filename = options.filename || `symptoms-${new Date().toISOString().split('T')[0]}.csv`;

  const data = symptoms.map((s) => ({
    date: s.date,
    time: s.time,
    symptom: s.symptom,
    category: s.category,
    severity: s.severity,
    duration: s.duration ?? '',
    location: s.location ?? '',
    triggers: s.triggers?.join('; ') ?? '',
    notes: s.notes ?? '',
  }));

  const headers: (keyof (typeof data)[0])[] = [
    'date',
    'time',
    'symptom',
    'category',
    'severity',
    'duration',
    'location',
    'triggers',
    'notes',
  ];

  const headerLabels = [
    'Date',
    'Time',
    'Symptom',
    'Category',
    'Severity (1-5)',
    'Duration (min)',
    'Location',
    'Triggers',
    'Notes',
  ];

  const csv = arrayToCSV(data, headers, headerLabels);
  downloadCSV(csv, filename);
}

/**
 * Export lab results to CSV
 */
export function exportLabResultsToCSV(
  labResults: LabResult[],
  options: CSVExportOptions = {}
): void {
  const filename = options.filename || `lab-results-${new Date().toISOString().split('T')[0]}.csv`;

  // Flatten lab results - one row per value
  const data: Record<string, unknown>[] = [];

  for (const lab of labResults) {
    for (const value of lab.values) {
      data.push({
        date: lab.date,
        testName: lab.testName,
        category: lab.category,
        provider: lab.provider ?? '',
        valueName: value.name,
        value: value.value,
        unit: value.unit,
        refMin: value.referenceRange?.min ?? '',
        refMax: value.referenceRange?.max ?? '',
        status: value.status ?? '',
      });
    }
  }

  const headers = [
    'date',
    'testName',
    'category',
    'provider',
    'valueName',
    'value',
    'unit',
    'refMin',
    'refMax',
    'status',
  ] as (keyof (typeof data)[0])[];

  const headerLabels = [
    'Date',
    'Test Name',
    'Category',
    'Provider',
    'Value Name',
    'Value',
    'Unit',
    'Reference Min',
    'Reference Max',
    'Status',
  ];

  const csv = arrayToCSV(data as Record<string, unknown>[], headers, headerLabels);
  downloadCSV(csv, filename);
}

/**
 * Export appointments to CSV
 */
export function exportAppointmentsToCSV(
  appointments: Appointment[],
  options: CSVExportOptions = {}
): void {
  const filename = options.filename || `appointments-${new Date().toISOString().split('T')[0]}.csv`;

  const data = appointments.map((a) => ({
    date: a.date,
    time: a.time,
    type: a.type,
    provider: a.provider,
    specialty: a.specialty ?? '',
    location: a.location ?? '',
    reason: a.reason,
    status: a.status,
    diagnosis: a.diagnosis ?? '',
    notes: a.notes ?? '',
  }));

  const headers: (keyof (typeof data)[0])[] = [
    'date',
    'time',
    'type',
    'provider',
    'specialty',
    'location',
    'reason',
    'status',
    'diagnosis',
    'notes',
  ];

  const headerLabels = [
    'Date',
    'Time',
    'Type',
    'Provider',
    'Specialty',
    'Location',
    'Reason',
    'Status',
    'Diagnosis',
    'Notes',
  ];

  const csv = arrayToCSV(data, headers, headerLabels);
  downloadCSV(csv, filename);
}

/**
 * Export all health data to a single CSV
 */
export function exportAllHealthDataToCSV(
  metrics: HealthMetric[],
  options: CSVExportOptions = {}
): void {
  exportHealthMetricsToCSV(metrics, options);
}
