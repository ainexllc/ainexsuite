'use client';

import { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Moon,
  Droplets,
  Activity,
  Heart,
  Brain,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useHealthMetrics } from '@/components/providers/health-metrics-provider';
import { usePreferences } from '@/components/providers/preferences-provider';
import {
  prepareWeightTrendData,
  prepareSleepPatternData,
  prepareWaterIntakeData,
  prepareExerciseData,
  prepareMoodEnergyData,
  prepareVitalsData,
  calculateMoodEnergyCorrelation,
  calculateSleepEnergyCorrelation,
} from '@/lib/analytics-utils';
import { WeightTrendChart } from './WeightTrendChart';
import { SleepPatternChart } from './SleepPatternChart';
import { WaterIntakeChart } from './WaterIntakeChart';
import { ExerciseTrackingChart } from './ExerciseTrackingChart';
import { MoodEnergyCorrelation } from './MoodEnergyCorrelation';
import { VitalsChart } from './VitalsChart';

// ===== TYPES =====

type TimeRange = 7 | 14 | 30 | 90;

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

// ===== COMPONENTS =====

function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-outline-subtle rounded-xl overflow-hidden bg-surface-elevated">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-subtle transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-ink-500">{icon}</span>
          <h3 className="font-semibold text-ink-900">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-ink-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-ink-400" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0 border-t border-outline-subtle">{children}</div>}
    </div>
  );
}

function TimeRangeSelector({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}) {
  const options: { value: TimeRange; label: string }[] = [
    { value: 7, label: '7 days' },
    { value: 14, label: '14 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
  ];

  return (
    <div className="flex gap-1 p-1 bg-surface-subtle rounded-lg">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            value === opt.value
              ? 'bg-surface-elevated text-ink-900 shadow-sm'
              : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ===== MAIN COMPONENT =====

export function AnalyticsBoard() {
  const { metrics, loading } = useHealthMetrics();
  const { preferences } = usePreferences();
  const [timeRange, setTimeRange] = useState<TimeRange>(14);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (metrics.length === 0) return null;

    return {
      weight: prepareWeightTrendData(metrics, timeRange, preferences.targetWeight),
      sleep: prepareSleepPatternData(metrics, timeRange, preferences.sleepGoal ?? 8),
      water: prepareWaterIntakeData(metrics, preferences.dailyWaterGoal ?? 8, timeRange),
      exercise: prepareExerciseData(metrics, timeRange),
      moodEnergy: prepareMoodEnergyData(metrics, timeRange),
      vitals: prepareVitalsData(metrics, timeRange),
    };
  }, [metrics, timeRange, preferences]);

  // Calculate correlations
  const correlations = useMemo(() => {
    return {
      moodEnergy: calculateMoodEnergyCorrelation(metrics),
      sleepEnergy: calculateSleepEnergyCorrelation(metrics),
    };
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart3 className="w-12 h-12 text-ink-300 mb-4" />
        <h3 className="text-lg font-semibold text-ink-900 mb-2">No Data Yet</h3>
        <p className="text-ink-500 max-w-md">
          Start logging your health metrics to see analytics and trends here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink-900">Health Analytics</h2>
          <p className="text-sm text-ink-500">
            Track your progress and discover patterns
          </p>
        </div>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight */}
        {chartData?.weight && chartData.weight.length > 0 && (
          <CollapsibleSection
            title="Weight Trend"
            icon={<TrendingUp className="w-5 h-5" />}
          >
            <WeightTrendChart
              data={chartData.weight}
              targetWeight={preferences.targetWeight}
            />
          </CollapsibleSection>
        )}

        {/* Sleep */}
        {chartData?.sleep && chartData.sleep.length > 0 && (
          <CollapsibleSection
            title="Sleep Patterns"
            icon={<Moon className="w-5 h-5" />}
          >
            <SleepPatternChart data={chartData.sleep} />
          </CollapsibleSection>
        )}

        {/* Water */}
        {chartData?.water && chartData.water.length > 0 && (
          <CollapsibleSection
            title="Hydration"
            icon={<Droplets className="w-5 h-5" />}
          >
            <WaterIntakeChart data={chartData.water} />
          </CollapsibleSection>
        )}

        {/* Exercise */}
        {chartData?.exercise && chartData.exercise.length > 0 && (
          <CollapsibleSection
            title="Exercise"
            icon={<Activity className="w-5 h-5" />}
          >
            <ExerciseTrackingChart data={chartData.exercise} />
          </CollapsibleSection>
        )}

        {/* Vitals */}
        {chartData?.vitals && chartData.vitals.length > 0 && (
          <CollapsibleSection
            title="Vitals"
            icon={<Heart className="w-5 h-5" />}
          >
            <VitalsChart data={chartData.vitals} />
          </CollapsibleSection>
        )}

        {/* Mood/Energy Correlation */}
        {chartData?.moodEnergy && chartData.moodEnergy.length > 2 && (
          <CollapsibleSection
            title="Mood & Energy"
            icon={<Brain className="w-5 h-5" />}
          >
            <MoodEnergyCorrelation
              data={chartData.moodEnergy}
              correlation={correlations.moodEnergy}
              sleepCorrelation={correlations.sleepEnergy}
            />
          </CollapsibleSection>
        )}
      </div>

      {/* Insights Footer */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
        <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
          Quick Insights
        </h4>
        <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
          {correlations.moodEnergy.strength !== 'none' && (
            <li>
              Mood and energy show a {correlations.moodEnergy.strength}{' '}
              {correlations.moodEnergy.direction} correlation
            </li>
          )}
          {correlations.sleepEnergy.strength !== 'none' && (
            <li>
              Sleep and energy show a {correlations.sleepEnergy.strength}{' '}
              {correlations.sleepEnergy.direction} correlation
            </li>
          )}
          {chartData?.sleep && chartData.sleep.length > 0 && (
            <li>
              {chartData.sleep.filter((d) => d.goalMet).length} of {chartData.sleep.length} days met
              your sleep goal
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
