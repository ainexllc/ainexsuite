'use client';

import { useState } from 'react';
import { Download, FileText, Table, X, Loader2, Check } from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import { useAuth } from '@ainexsuite/auth';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import { useGoals } from '@/providers/goals-provider';
import { exportHealthMetricsToCSV } from '@/lib/export/csv-generator';
import { generateHealthReportPDF } from '@/lib/export/pdf-generator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'pdf';
type ReportType = 'weekly' | 'monthly' | 'custom';

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { user } = useAuth();
  const { metrics } = useHealthMetrics();
  const { goals } = useGoals();
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    if (!user?.uid) return;

    setExporting(true);
    setSuccess(false);

    try {
      // Filter metrics by date range
      const filteredMetrics = metrics.filter((m) => {
        const date = m.date;
        return date >= startDate && date <= endDate;
      });

      if (format === 'csv') {
        exportHealthMetricsToCSV(filteredMetrics, {
          filename: `health-data-${startDate}-to-${endDate}.csv`,
        });
      } else {
        // PDF export
        await generateHealthReportPDF(
          {
            metrics: filteredMetrics,
            goals,
          },
          {
            title: reportType === 'weekly' ? 'Weekly Health Report' : reportType === 'monthly' ? 'Monthly Health Report' : 'Health Report',
            dateRange: { start: startDate, end: endDate },
            includeGoals: true,
            includeInsights: true,
          }
        );
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const setPresetDates = (type: ReportType) => {
    setReportType(type);
    const now = new Date();

    if (type === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(weekAgo.toISOString().split('T')[0]);
    } else if (type === 'monthly') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(monthAgo.toISOString().split('T')[0]);
    }
    setEndDate(now.toISOString().split('T')[0]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-ink-900">Export Health Data</h2>
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('csv')}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                format === 'csv'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-outline-subtle hover:border-outline-default'
              }`}
            >
              <Table className={`w-5 h-5 ${format === 'csv' ? 'text-emerald-600' : 'text-ink-500'}`} />
              <div className="text-left">
                <div className={`font-medium ${format === 'csv' ? 'text-emerald-700' : 'text-ink-700'}`}>
                  CSV
                </div>
                <div className="text-xs text-ink-500">Spreadsheet data</div>
              </div>
            </button>
            <button
              onClick={() => setFormat('pdf')}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                format === 'pdf'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-outline-subtle hover:border-outline-default'
              }`}
            >
              <FileText className={`w-5 h-5 ${format === 'pdf' ? 'text-emerald-600' : 'text-ink-500'}`} />
              <div className="text-left">
                <div className={`font-medium ${format === 'pdf' ? 'text-emerald-700' : 'text-ink-700'}`}>
                  PDF Report
                </div>
                <div className="text-xs text-ink-500">Formatted report</div>
              </div>
            </button>
          </div>
        </div>

        {/* Report Type (PDF only) */}
        {format === 'pdf' && (
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              Report Type
            </label>
            <div className="flex gap-2">
              {(['weekly', 'monthly', 'custom'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setPresetDates(type)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    reportType === type
                      ? 'bg-emerald-500 text-white'
                      : 'bg-surface-subtle text-ink-600 hover:bg-surface-elevated'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-ink-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-ink-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-outline-subtle rounded-lg bg-surface-elevated text-ink-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-surface-subtle rounded-xl">
          <h4 className="text-sm font-medium text-ink-700 mb-2">Export Preview</h4>
          <div className="text-sm text-ink-500 space-y-1">
            <p>Format: <span className="text-ink-700">{format.toUpperCase()}</span></p>
            {format === 'pdf' && (
              <p>Report: <span className="text-ink-700">{reportType.charAt(0).toUpperCase() + reportType.slice(1)}</span></p>
            )}
            <p>
              Period: <span className="text-ink-700">{new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}</span>
            </p>
            <p>
              Records: <span className="text-ink-700">{metrics.filter((m) => m.date >= startDate && m.date <= endDate).length} entries</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-outline-subtle rounded-lg text-ink-600 hover:bg-surface-subtle transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                Exported!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
