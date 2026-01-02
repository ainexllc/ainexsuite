/**
 * PDF Generator
 * Generate health reports as PDF using jsPDF and html2canvas
 */

import type { HealthMetric, HealthGoals, WellnessScore } from '@ainexsuite/types';
import { getWeeklyAverages, getTrendDirection } from '../analytics-utils';
import { getGoalsSummary } from '../goals-service';

// ===== TYPES =====

export interface PDFReportOptions {
  title?: string;
  dateRange: { start: string; end: string };
  includeCharts?: boolean;
  includeInsights?: boolean;
  includeGoals?: boolean;
}

export interface ReportData {
  metrics: HealthMetric[];
  goals: HealthGoals;
  wellnessScore?: WellnessScore;
  insights?: string[];
}

// ===== PDF GENERATION =====

/**
 * Generate a health report PDF
 */
export async function generateHealthReportPDF(
  data: ReportData,
  options: PDFReportOptions
): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ===== HEADER =====
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title || 'Health Report', margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(
    `${formatDate(options.dateRange.start)} - ${formatDate(options.dateRange.end)}`,
    margin,
    y
  );
  y += 5;

  doc.text(`Generated: ${formatDate(new Date().toISOString().split('T')[0])}`, margin, y);
  y += 15;

  // Reset text color
  doc.setTextColor(0);

  // ===== SUMMARY STATS =====
  const weeklyAvg = getWeeklyAverages(data.metrics);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, y);
  y += 8;

  // Stats grid
  const stats = [
    { label: 'Avg Sleep', value: weeklyAvg.sleep ? `${weeklyAvg.sleep.toFixed(1)} hrs` : 'N/A' },
    { label: 'Avg Water', value: weeklyAvg.water ? `${weeklyAvg.water.toFixed(1)} glasses` : 'N/A' },
    { label: 'Avg Exercise', value: weeklyAvg.exercise ? `${weeklyAvg.exercise.toFixed(0)} min` : 'N/A' },
    { label: 'Avg Energy', value: weeklyAvg.energy ? `${weeklyAvg.energy.toFixed(1)}/10` : 'N/A' },
    { label: 'Days Logged', value: `${weeklyAvg.daysLogged} days` },
  ];

  if (weeklyAvg.weight) {
    stats.unshift({ label: 'Avg Weight', value: `${weeklyAvg.weight.toFixed(1)} kg` });
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const colWidth = contentWidth / 3;
  let col = 0;
  let statY = y;

  for (const stat of stats) {
    const x = margin + col * colWidth;
    drawStatBox(doc, x, statY, colWidth - 5, stat.label, stat.value);
    col++;
    if (col >= 3) {
      col = 0;
      statY += 20;
    }
  }

  y = statY + (col > 0 ? 25 : 5);

  // ===== TRENDS =====
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Trends', margin, y);
  y += 8;

  const trends = [
    { metric: 'Weight', trend: getTrendDirection(data.metrics, 'weight') },
    { metric: 'Sleep', trend: getTrendDirection(data.metrics, 'sleep') },
    { metric: 'Water', trend: getTrendDirection(data.metrics, 'water') },
    { metric: 'Exercise', trend: getTrendDirection(data.metrics, 'exercise') },
    { metric: 'Energy', trend: getTrendDirection(data.metrics, 'energy') },
  ];

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  for (const t of trends) {
    const trendSymbol = t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '→';
    const trendColor = t.trend === 'up' ? [34, 197, 94] : t.trend === 'down' ? [239, 68, 68] : [100, 100, 100];

    doc.setTextColor(0);
    doc.text(`${t.metric}: `, margin, y);

    doc.setTextColor(...(trendColor as [number, number, number]));
    doc.text(`${trendSymbol} ${t.trend}`, margin + 30, y);

    y += 6;
  }

  doc.setTextColor(0);
  y += 10;

  // ===== GOALS =====
  if (options.includeGoals) {
    const goalsSummary = getGoalsSummary(data.metrics, data.goals);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Goals Progress', margin, y);
    y += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    for (const progress of goalsSummary.progress) {
      const percentage = Math.round(progress.percentage);
      doc.text(`${progress.label}: ${progress.current}/${progress.target} ${progress.unit} (${percentage}%)`, margin, y);

      // Progress bar
      drawProgressBar(doc, margin + 100, y - 3, 60, 4, progress.percentage / 100);

      y += 7;
    }

    doc.text(`Overall Streak: ${goalsSummary.totalStreak} days`, margin, y);
    y += 10;
  }

  // ===== WELLNESS SCORE =====
  if (data.wellnessScore) {
    y += 5;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Wellness Score', margin, y);
    y += 8;

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 197, 94);
    doc.text(`${data.wellnessScore.overall}`, margin, y);
    doc.setTextColor(100);
    doc.setFontSize(12);
    doc.text('/100', margin + 20, y);

    doc.setTextColor(0);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Health: ${data.wellnessScore.breakdown.health}%`, margin, y);
    doc.text(`Fitness: ${data.wellnessScore.breakdown.fitness}%`, margin + 40, y);
    doc.text(`Habits: ${data.wellnessScore.breakdown.habits}%`, margin + 80, y);
    y += 10;
  }

  // ===== INSIGHTS =====
  if (options.includeInsights && data.insights && data.insights.length > 0) {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Insights', margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    for (const insight of data.insights.slice(0, 5)) {
      const lines = doc.splitTextToSize(`• ${insight}`, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 3;
    }
  }

  // ===== FOOTER =====
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | AinexSuite Health`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `health-report-${options.dateRange.start}-to-${options.dateRange.end}.pdf`;
  doc.save(filename);
}

// ===== HELPER FUNCTIONS =====

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function drawStatBox(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string
): void {
  // Background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, width, 15, 2, 2, 'F');

  // Label
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(label, x + 3, y + 5);

  // Value
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text(value, x + 3, y + 12);

  doc.setFont('helvetica', 'normal');
}

function drawProgressBar(
  doc: InstanceType<typeof import('jspdf').jsPDF>,
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number
): void {
  // Background
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(x, y, width, height, 1, 1, 'F');

  // Progress
  const progressWidth = Math.min(width * progress, width);
  if (progressWidth > 0) {
    const color = progress >= 1 ? [34, 197, 94] : progress >= 0.5 ? [59, 130, 246] : [251, 191, 36];
    doc.setFillColor(...(color as [number, number, number]));
    doc.roundedRect(x, y, progressWidth, height, 1, 1, 'F');
  }
}

/**
 * Capture a chart element as image and add to PDF
 */
export async function captureChartForPDF(
  element: HTMLElement
): Promise<string | null> {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture chart:', error);
    return null;
  }
}
