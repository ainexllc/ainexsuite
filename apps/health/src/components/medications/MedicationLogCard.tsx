'use client';

import { useState } from 'react';
import {
  Check,
  X,
  ChevronRight,
  MoreHorizontal,
  Undo2,
} from 'lucide-react';
import { logMedicationDose } from '@/lib/medication-service';
import type { TodayMedicationDose } from '@ainexsuite/types';

interface MedicationLogCardProps {
  dose: TodayMedicationDose;
  onUpdate: () => void;
  onEdit?: (medicationId: string) => void;
}

export function MedicationLogCard({
  dose,
  onUpdate,
  onEdit,
}: MedicationLogCardProps) {
  const [loading, setLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { medication, scheduledTime, displayTime, status } = dose;
  const color = medication.color || '#ef4444';

  async function handleTake() {
    setLoading(true);
    try {
      await logMedicationDose(medication.id, scheduledTime, true);
      onUpdate();
    } catch (error) {
      console.error('Failed to log dose:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSkip(reason?: string) {
    setLoading(true);
    try {
      await logMedicationDose(medication.id, scheduledTime, false, {
        skippedReason: reason,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to skip dose:', error);
    } finally {
      setLoading(false);
      setShowActions(false);
    }
  }

  async function handleUndo() {
    // Re-log as not taken to undo
    setLoading(true);
    try {
      await logMedicationDose(medication.id, scheduledTime, false);
      onUpdate();
    } catch (error) {
      console.error('Failed to undo:', error);
    } finally {
      setLoading(false);
    }
  }

  const statusStyles = {
    pending: 'border-outline-subtle bg-surface-elevated',
    taken: 'border-emerald-200 bg-emerald-50',
    skipped: 'border-ink-200 bg-ink-50',
    overdue: 'border-red-200 bg-red-50',
  };

  return (
    <div
      className={`relative rounded-lg border p-2.5 sm:p-3 transition-all ${statusStyles[status]} ${
        loading ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Color indicator */}
        <div
          className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <span className="text-lg sm:text-xl">💊</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-medium text-sm text-ink-900 truncate">{medication.name}</h4>
            {status === 'overdue' && (
              <span className="text-[10px] font-medium text-red-600 bg-red-100 px-1.5 py-px rounded-full shrink-0">
                Overdue
              </span>
            )}
          </div>
          <p className="text-xs text-ink-500 truncate">
            {medication.dosage} • {displayTime}
          </p>
          {medication.schedule.instructions && (
            <p className="text-[11px] text-ink-400 truncate">
              {medication.schedule.instructions}
            </p>
          )}
        </div>

        {/* Status / Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {status === 'pending' || status === 'overdue' ? (
            <>
              <button
                onClick={handleTake}
                disabled={loading}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowActions(!showActions)}
                className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-ink-100 text-ink-600 flex items-center justify-center hover:bg-ink-200 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </>
          ) : status === 'taken' ? (
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 text-emerald-600">
                <Check className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">Taken</span>
              </div>
              <button
                onClick={handleUndo}
                className="h-7 w-7 rounded-full hover:bg-ink-100 flex items-center justify-center text-ink-400 hover:text-ink-600 transition-colors"
                title="Undo"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-ink-400">
                <X className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">Skipped</span>
              </div>
              <button
                onClick={handleTake}
                className="h-7 px-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium hover:bg-emerald-200 transition-colors"
              >
                Take
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actions dropdown */}
      {showActions && (
        <div className="absolute right-2.5 sm:right-3 top-full mt-1 z-10 bg-surface-elevated rounded-lg border border-outline-subtle shadow-lg py-0.5 min-w-[140px]">
          <button
            onClick={() => handleSkip('Not needed')}
            className="w-full px-3 py-1.5 text-left text-xs text-ink-700 hover:bg-ink-50 transition-colors"
          >
            Skip - Not needed
          </button>
          <button
            onClick={() => handleSkip('Side effects')}
            className="w-full px-3 py-1.5 text-left text-xs text-ink-700 hover:bg-ink-50 transition-colors"
          >
            Skip - Side effects
          </button>
          <button
            onClick={() => handleSkip('Ran out')}
            className="w-full px-3 py-1.5 text-left text-xs text-ink-700 hover:bg-ink-50 transition-colors"
          >
            Skip - Ran out
          </button>
          <button
            onClick={() => handleSkip()}
            className="w-full px-3 py-1.5 text-left text-xs text-ink-700 hover:bg-ink-50 transition-colors"
          >
            Skip - Other
          </button>
          <div className="border-t border-outline-subtle my-0.5" />
          <button
            onClick={() => {
              setShowActions(false);
              onEdit?.(medication.id);
            }}
            className="w-full px-3 py-1.5 text-left text-xs text-ink-700 hover:bg-ink-50 transition-colors flex items-center gap-1.5"
          >
            Edit Medication
            <ChevronRight className="h-3.5 w-3.5 ml-auto" />
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
}
