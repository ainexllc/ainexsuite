/**
 * Report Templates
 * Pre-defined templates for health reports
 */

import type { HealthMetric, HealthGoals, WellnessScore } from '@ainexsuite/types';
import { generateHealthReportPDF, type PDFReportOptions, type ReportData } from './pdf-generator';

// ===== TYPES =====

export type ReportType = 'weekly' | 'monthly' | 'custom';

export interface ReportTemplate {
  type: ReportType;
  title: string;
  description: string;
  defaultDays: number;
}

// ===== TEMPLATES =====

export const REPORT_TEMPLATES: Record<ReportType, ReportTemplate> = {
  weekly: {
    type: 'weekly',
    title: 'Weekly Health Summary',
    description: 'Overview of your health metrics for the past 7 days',
    defaultDays: 7,
  },
  monthly: {
    type: 'monthly',
    title: 'Monthly Health Report',
    description: 'Comprehensive health analysis for the past 30 days',
    defaultDays: 30,
  },
  custom: {
    type: 'custom',
    title: 'Custom Health Report',
    description: 'Health report for a custom date range',
    defaultDays: 14,
  },
};

// ===== GENERATION FUNCTIONS =====

/**
 * Generate a weekly health report
 */
export async function generateWeeklyReport(
  metrics: HealthMetric[],
  goals: HealthGoals,
  wellnessScore?: WellnessScore,
  insights?: string[]
): Promise<void> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);

  const filteredMetrics = metrics.filter((m) => {
    const date = new Date(m.date);
    return date >= start && date <= end;
  });

  const data: ReportData = {
    metrics: filteredMetrics,
    goals,
    wellnessScore,
    insights,
  };

  const options: PDFReportOptions = {
    title: REPORT_TEMPLATES.weekly.title,
    dateRange: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    },
    includeCharts: true,
    includeInsights: true,
    includeGoals: true,
  };

  await generateHealthReportPDF(data, options);
}

/**
 * Generate a monthly health report
 */
export async function generateMonthlyReport(
  metrics: HealthMetric[],
  goals: HealthGoals,
  wellnessScore?: WellnessScore,
  insights?: string[]
): Promise<void> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const filteredMetrics = metrics.filter((m) => {
    const date = new Date(m.date);
    return date >= start && date <= end;
  });

  const data: ReportData = {
    metrics: filteredMetrics,
    goals,
    wellnessScore,
    insights,
  };

  const options: PDFReportOptions = {
    title: REPORT_TEMPLATES.monthly.title,
    dateRange: {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    },
    includeCharts: true,
    includeInsights: true,
    includeGoals: true,
  };

  await generateHealthReportPDF(data, options);
}

/**
 * Generate a custom date range report
 */
export async function generateCustomReport(
  metrics: HealthMetric[],
  goals: HealthGoals,
  startDate: string,
  endDate: string,
  wellnessScore?: WellnessScore,
  insights?: string[]
): Promise<void> {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const filteredMetrics = metrics.filter((m) => {
    const date = new Date(m.date);
    return date >= start && date <= end;
  });

  const data: ReportData = {
    metrics: filteredMetrics,
    goals,
    wellnessScore,
    insights,
  };

  const options: PDFReportOptions = {
    title: `Health Report`,
    dateRange: { start: startDate, end: endDate },
    includeCharts: true,
    includeInsights: true,
    includeGoals: true,
  };

  await generateHealthReportPDF(data, options);
}

// ===== DATE HELPERS =====

/**
 * Get start and end dates for a report type
 */
export function getReportDateRange(type: ReportType): { start: string; end: string } {
  const end = new Date();
  const start = new Date();

  const days = REPORT_TEMPLATES[type].defaultDays;
  start.setDate(start.getDate() - days);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

/**
 * Get formatted date range string
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  };

  // Add year if different from current year
  if (startDate.getFullYear() !== new Date().getFullYear()) {
    formatOptions.year = 'numeric';
  }

  const startStr = startDate.toLocaleDateString('en-US', formatOptions);
  const endStr = endDate.toLocaleDateString('en-US', { ...formatOptions, year: 'numeric' });

  return `${startStr} - ${endStr}`;
}

/**
 * Calculate days in a date range
 */
export function getDaysInRange(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
