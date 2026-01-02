'use client';

import { FileText, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { LabResult } from '@ainexsuite/types';

interface LabResultCardProps {
  result: LabResult;
  onEdit?: (result: LabResult) => void;
  onDelete?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  blood: 'Blood Test',
  metabolic: 'Metabolic Panel',
  lipid: 'Lipid Panel',
  thyroid: 'Thyroid',
  vitamin: 'Vitamins',
  hormone: 'Hormones',
  other: 'Other',
};

export function LabResultCard({ result, onEdit, onDelete }: LabResultCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getValueStatus = (value: number, min?: number, max?: number) => {
    if (min !== undefined && value < min) return 'low';
    if (max !== undefined && value > max) return 'high';
    return 'normal';
  };

  const statusColors = {
    low: 'text-blue-600 dark:text-blue-400',
    high: 'text-red-600 dark:text-red-400',
    normal: 'text-green-600 dark:text-green-400',
  };

  return (
    <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h4 className="font-semibold text-ink-900">{result.testName}</h4>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <span>{categoryLabels[result.category] || result.category}</span>
              <span>•</span>
              <span>{formatDate(result.date)}</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-surface-subtle transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-ink-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 py-1 bg-surface-elevated border border-outline-subtle rounded-lg shadow-lg z-20 min-w-[120px]">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(result);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-surface-subtle"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(result.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-surface-subtle"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Values */}
      <div className="space-y-2">
        {(expanded ? result.values : result.values.slice(0, 3)).map((item, index) => {
          const status = getValueStatus(item.value, item.referenceRange?.min, item.referenceRange?.max);
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="text-ink-600">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className={`font-medium ${statusColors[status]}`}>
                  {item.value} {item.unit}
                </span>
                {item.referenceRange && (
                  <span className="text-ink-400 text-xs">
                    ({item.referenceRange.min} - {item.referenceRange.max})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {result.values.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-emerald-600 hover:text-emerald-700"
        >
          {expanded ? 'Show less' : `Show ${result.values.length - 3} more`}
        </button>
      )}

      {/* Notes */}
      {result.notes && (
        <p className="mt-3 text-sm text-ink-500 italic border-t border-outline-subtle pt-2">
          {result.notes}
        </p>
      )}
    </div>
  );
}
