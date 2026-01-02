'use client';

import { AlertCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { SymptomEntry } from '@ainexsuite/types';

interface SymptomCardProps {
  symptom: SymptomEntry;
  onEdit?: (symptom: SymptomEntry) => void;
  onDelete?: (id: string) => void;
}

const severityColors: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Mild' },
  2: { bg: 'bg-lime-100 dark:bg-lime-900/30', text: 'text-lime-700 dark:text-lime-400', label: 'Minor' },
  3: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: 'Moderate' },
  4: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', label: 'Severe' },
  5: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Very Severe' },
};

const categoryLabels: Record<string, string> = {
  pain: 'Pain',
  digestive: 'Digestive',
  respiratory: 'Respiratory',
  neurological: 'Neurological',
  skin: 'Skin',
  fatigue: 'Fatigue',
  mental: 'Mental Health',
  other: 'Other',
};

export function SymptomCard({ symptom, onEdit, onDelete }: SymptomCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const severity = severityColors[symptom.severity];

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-4 bg-surface-elevated border border-outline-subtle rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${severity.bg}`}>
            <AlertCircle className={`w-4 h-4 ${severity.text}`} />
          </div>
          <div>
            <h4 className="font-semibold text-ink-900">{symptom.symptom}</h4>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <span>{categoryLabels[symptom.category] || symptom.category}</span>
              <span>•</span>
              <span>{formatTime(symptom.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severity.bg} ${severity.text}`}>
            {severity.label}
          </span>

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
                        onEdit(symptom);
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
                        onDelete(symptom.id);
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
      </div>

      {/* Severity Bar */}
      <div className="mb-3">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1.5 flex-1 rounded-full ${
                level <= symptom.severity
                  ? level <= 2
                    ? 'bg-green-500'
                    : level <= 3
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                  : 'bg-surface-subtle'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Triggers */}
      {symptom.triggers && symptom.triggers.length > 0 && (
        <div className="mb-2">
          <span className="text-xs text-ink-500">Triggers: </span>
          <span className="text-sm text-ink-700">{symptom.triggers.join(', ')}</span>
        </div>
      )}

      {/* Notes */}
      {symptom.notes && (
        <p className="text-sm text-ink-600 italic">{symptom.notes}</p>
      )}
    </div>
  );
}
