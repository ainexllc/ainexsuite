'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Pill,
} from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';
import type { Supplement, SupplementLog, SupplementTime } from '@ainexsuite/types';
import {
  subscribeToSupplements,
  subscribeToTodaysLogs,
  logSupplement,
  getSupplementsForTime,
  SUPPLEMENT_TIME_LABELS,
  SUPPLEMENT_TIME_ORDER,
} from '@/lib/supplement-service';

interface TimeSection {
  time: SupplementTime;
  supplements: Supplement[];
  logs: SupplementLog[];
}

export function DailyTracker() {
  const { user } = useAuth();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [logs, setLogs] = useState<SupplementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<SupplementTime>>(
    new Set(['morning', 'evening'])
  );
  const [loggingId, setLoggingId] = useState<string | null>(null);

  // Subscribe to real-time data
  useEffect(() => {
    if (!user?.uid) {
      setSupplements([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubSupplements = subscribeToSupplements(user.uid, (data) => {
      setSupplements(data.filter((s) => s.isActive));
      setLoading(false);
    });

    const unsubLogs = subscribeToTodaysLogs(user.uid, (data) => {
      setLogs(data);
    });

    return () => {
      unsubSupplements();
      unsubLogs();
    };
  }, [user?.uid]);

  // Build time sections
  const timeSections: TimeSection[] = SUPPLEMENT_TIME_ORDER
    .map((time) => ({
      time,
      supplements: getSupplementsForTime(supplements, time),
      logs: logs.filter((l) => l.time === time),
    }))
    .filter((section) => section.supplements.length > 0);

  const toggleSection = (time: SupplementTime) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(time)) {
        newSet.delete(time);
      } else {
        newSet.add(time);
      }
      return newSet;
    });
  };

  const handleLog = useCallback(
    async (
      supplement: Supplement,
      time: SupplementTime,
      status: 'taken' | 'skipped'
    ) => {
      if (!user?.uid || loggingId) return;

      setLoggingId(`${supplement.id}-${time}`);
      try {
        await logSupplement({
          supplementId: supplement.id,
          supplementName: supplement.name,
          date: new Date().toISOString().split('T')[0],
          time,
          status,
        });
      } catch (error) {
        console.error('Error logging supplement:', error);
      } finally {
        setLoggingId(null);
      }
    },
    [user?.uid, loggingId]
  );

  const getLogStatus = useCallback(
    (supplementId: string, time: SupplementTime) => {
      const log = logs.find(
        (l) => l.supplementId === supplementId && l.time === time
      );
      return log?.status;
    },
    [logs]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--app-primary))]" />
      </div>
    );
  }

  if (supplements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
        <Pill className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Active Supplements
        </h3>
        <p className="text-muted-foreground">
          Add supplements to start tracking your daily intake
        </p>
      </div>
    );
  }

  // Calculate progress
  const totalRequired = timeSections.reduce(
    (sum, section) => sum + section.supplements.length,
    0
  );
  const totalTaken = logs.filter((l) => l.status === 'taken').length;
  const progressPercent = totalRequired > 0 ? (totalTaken / totalRequired) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="p-4 bg-background/60 border border-border rounded-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Today&apos;s Progress
          </span>
          <span className="text-sm text-muted-foreground">
            {totalTaken}/{totalRequired} taken
          </span>
        </div>
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[hsl(var(--app-primary))] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Time Sections */}
      {timeSections.map((section) => {
        const isExpanded = expandedSections.has(section.time);
        const sectionTaken = section.logs.filter((l) => l.status === 'taken').length;
        const sectionTotal = section.supplements.length;

        return (
          <div
            key={section.time}
            className="bg-background/60 border border-border rounded-xl backdrop-blur-xl overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.time)}
              className="w-full flex items-center justify-between p-4 hover:bg-foreground/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {SUPPLEMENT_TIME_LABELS[section.time]}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm ${
                    sectionTaken === sectionTotal
                      ? 'text-emerald-500'
                      : 'text-muted-foreground'
                  }`}
                >
                  {sectionTaken}/{sectionTotal}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Supplements in Section */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {section.supplements.map((supplement) => {
                  const status = getLogStatus(supplement.id, section.time);
                  const isLogging = loggingId === `${supplement.id}-${section.time}`;

                  return (
                    <div
                      key={supplement.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        status === 'taken'
                          ? 'bg-emerald-50 dark:bg-emerald-900/20'
                          : status === 'skipped'
                          ? 'bg-foreground/5 opacity-60'
                          : 'bg-foreground/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Pill
                          className={`w-4 h-4 ${
                            status === 'taken'
                              ? 'text-emerald-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                        <div>
                          <span
                            className={`font-medium ${
                              status === 'skipped'
                                ? 'text-muted-foreground line-through'
                                : 'text-foreground'
                            }`}
                          >
                            {supplement.name}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {supplement.dosage}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!status ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleLog(supplement, section.time, 'taken')
                            }
                            disabled={isLogging}
                            className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleLog(supplement, section.time, 'skipped')
                            }
                            disabled={isLogging}
                            className="p-2 rounded-full bg-foreground/10 text-muted-foreground hover:bg-foreground/20 transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-sm ${
                            status === 'taken'
                              ? 'text-emerald-500'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {status === 'taken' ? 'Taken' : 'Skipped'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
